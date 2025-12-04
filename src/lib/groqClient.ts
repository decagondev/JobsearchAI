import Groq from 'groq-sdk'
import { z } from 'zod'
import { getSkillsExtractionPrompt, getSkillsExtractionUserMessage } from './prompts/skillsExtraction.prompt'
import { getJobSummaryAndTasksPrompt, getJobSummaryAndTasksUserMessage } from './prompts/jobSummaryAndTasks.prompt'
import type { Job, UserProfile, PrepTask } from '@/types/session'

// Initialize Groq with browser support
export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
})

export type BotMode = 'sales' | 'tutor' | 'raggy' | 'jobcoach'

const MODELS = {
  sales: 'llama-3.1-8b-instant',
  tutor: 'meta-llama/llama-4-scout-17b-16e-instruct',
  raggy: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  jobcoach: 'meta-llama/llama-4-maverick-17b-128e-instruct'
}

export async function chatWithGroq(
  mode: BotMode,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  _context?: string
): Promise<string> {
  const model = MODELS[mode]
  
  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2048
    })

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Groq API error:', error)
    throw new Error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getSystemPrompt(mode: BotMode, context?: string): string {
  const baseContext = context || ''

  switch (mode) {
    case 'sales':
      return `You are a helpful sales assistant for BotAI, a company that builds intelligent chatbots and AI solutions. 
Your goal is to help potential clients understand how BotAI can help them build chatbots and AI solutions for their business.
Be friendly, professional, and focus on understanding their needs and explaining how BotAI's services can help.
${baseContext ? `\n\nCompany Context:\n${baseContext}` : ''}
Always be helpful and try to guide them towards hiring BotAI for their chatbot and AI solution needs.`

    case 'tutor':
      return `You are a helpful tutor bot that teaches users about chatbots and BotAI's services.
Explain concepts clearly, answer questions about what chatbots are, how they work, and what BotAI offers.
Be educational, patient, and thorough in your explanations.
${baseContext ? `\n\nCompany Context:\n${baseContext}` : ''}
Help users learn about:
- What chatbots are and how they work
- BotAI's services and features
- How AI-powered automation can benefit businesses
- Best practices for chatbot development`

    case 'raggy':
      return `You are a helpful assistant that can answer questions about uploaded documents.
If the document is a resume, review it and provide:
- A summary of the candidate's qualifications
- Suggested job roles they might be suited for
- Strengths and areas for improvement
- Career recommendations

If the document is about another subject (code, markdown, HTML, etc.), answer questions about that subject based on the document content.
${baseContext ? `\n\nDocument Context:\n${baseContext}` : ''}
Be thorough, helpful, and provide detailed insights.`

    case 'jobcoach':
      return `You are a job search coach and career advisor helping users prepare for job applications and interviews.
Your goal is to provide actionable, personalized advice based on the user's profile, skills, resume, and the jobs they're interested in.

${baseContext ? `\n\nUser Context:\n${baseContext}` : ''}

Focus on:
- Interview preparation and mock interview practice
- Resume tailoring and optimization for specific roles
- Explaining job requirements and how the user's skills match
- Providing specific, actionable steps for job applications
- Career advice and professional development suggestions

Be encouraging, specific, and practical. Reference the user's actual skills, experience, and job opportunities when providing advice.
Always provide concrete examples and actionable next steps.`

    default:
      return 'You are a helpful assistant.'
  }
}

/**
 * Skills extraction result schema
 */
const skillsExtractionSchema = z.object({
  skills: z.array(z.string()).min(0),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']),
  domains: z.array(z.string()).min(0),
  experience: z.number().min(0)
})

export type SkillsExtractionResult = z.infer<typeof skillsExtractionSchema>

/**
 * Extract skills, experience level, and domains from resume text using Groq
 * 
 * @param resumeText - The resume text to analyze
 * @returns Structured data with skills, seniority, domains, and experience
 * @throws Error if extraction fails or response is invalid
 */
export async function extractSkills(resumeText: string): Promise<SkillsExtractionResult> {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty')
  }

  try {
    const systemPrompt = getSkillsExtractionPrompt(resumeText)
    const userMessage = getSkillsExtractionUserMessage()

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]

    // Use the 'raggy' mode for document analysis
    const response = await chatWithGroq('raggy', messages)

    // Try to extract JSON from the response
    // The response might be wrapped in markdown code blocks or have extra text
    let jsonText = response.trim()
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    } else {
      // Try to find JSON object in the text
      const braceMatch = jsonText.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        jsonText = braceMatch[0]
      }
    }

    // Parse and validate the JSON response
    const parsed = JSON.parse(jsonText)
    const validationResult = skillsExtractionSchema.safeParse(parsed)

    if (!validationResult.success) {
      console.error('Skills extraction validation error:', validationResult.error)
      // Return safe defaults if validation fails
      return {
        skills: [],
        seniority: 'mid',
        domains: [],
        experience: 0
      }
    }

    return validationResult.data
  } catch (error) {
    console.error('Skills extraction error:', error)
    
    // If it's a JSON parse error, try to provide more context
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse skills extraction response: ${error.message}`)
    }
    
    // Re-throw Groq API errors
    if (error instanceof Error) {
      throw new Error(`Failed to extract skills: ${error.message}`)
    }
    
    throw new Error('Failed to extract skills: Unknown error')
  }
}

/**
 * Job summary and tasks result schema
 */
const jobSummaryAndTasksSchema = z.object({
  summary: z.string().min(1),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      completed: z.boolean().default(false),
    })
  ).min(1).max(10),
})

export type JobSummaryAndTasksResult = z.infer<typeof jobSummaryAndTasksSchema>

/**
 * Generate job summary and personalized prep tasks using Groq
 * 
 * @param job - Job object to analyze
 * @param userProfile - User's profile information
 * @param skills - Array of user's skills
 * @returns Object with summary (markdown string) and tasks array
 * @throws Error if generation fails or response is invalid
 */
export async function generateJobSummaryAndTasks(
  job: Job,
  userProfile?: UserProfile,
  skills: string[] = []
): Promise<JobSummaryAndTasksResult> {
  if (!job || !job.title || !job.company) {
    throw new Error('Job must have title and company')
  }

  try {
    const systemPrompt = getJobSummaryAndTasksPrompt(job, userProfile, skills)
    const userMessage = getJobSummaryAndTasksUserMessage()

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]

    // Use the 'raggy' mode for document analysis
    const response = await chatWithGroq('raggy', messages)

    // Try to extract JSON from the response
    let jsonText = response.trim()
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    } else {
      // Try to find JSON object in the text
      const braceMatch = jsonText.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        jsonText = braceMatch[0]
      }
    }

    // Parse and validate the JSON response
    const parsed = JSON.parse(jsonText)
    const validationResult = jobSummaryAndTasksSchema.safeParse(parsed)

    if (!validationResult.success) {
      console.error('Job summary validation error:', validationResult.error)
      // Return safe defaults if validation fails
      return {
        summary: `## Job Summary\n\nThis is a ${job.title} position at ${job.company}. Review the job description carefully to understand the requirements and responsibilities.`,
        tasks: [
          {
            id: `task_${Date.now()}_1`,
            title: 'Review the full job posting',
            description: 'Read through the complete job description to understand all requirements',
            priority: 'high' as const,
            completed: false,
          },
          {
            id: `task_${Date.now()}_2`,
            title: 'Update your resume',
            description: 'Tailor your resume to highlight relevant experience for this role',
            priority: 'high' as const,
            completed: false,
          },
          {
            id: `task_${Date.now()}_3`,
            title: 'Prepare for interviews',
            description: 'Research the company and prepare answers to common interview questions',
            priority: 'medium' as const,
            completed: false,
          },
        ],
      }
    }

    // Ensure all tasks have IDs and completed status
    const tasksWithIds: PrepTask[] = validationResult.data.tasks.map((task, index) => ({
      id: task.id || `task_${Date.now()}_${index}`,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      completed: task.completed || false,
    }))

    return {
      summary: validationResult.data.summary,
      tasks: tasksWithIds,
    }
  } catch (error) {
    console.error('Job summary generation error:', error)
    
    // If it's a JSON parse error, try to provide more context
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse job summary response: ${error.message}`)
    }
    
    // Re-throw Groq API errors
    if (error instanceof Error) {
      throw new Error(`Failed to generate job summary: ${error.message}`)
    }
    
    throw new Error('Failed to generate job summary: Unknown error')
  }
}

