/**
 * Prompt for generating job summaries and personalized prep tasks
 * Uses Groq to analyze jobs and create actionable preparation plans
 */

import type { Job, UserProfile, PrepTask } from '@/types/session'

/**
 * Generate system prompt for job analysis and task generation
 * 
 * @param job - Job object to analyze
 * @param userProfile - User's profile information
 * @param skills - Array of user's skills
 * @returns System prompt string
 */
export function getJobSummaryAndTasksPrompt(
  job: Job,
  userProfile?: UserProfile,
  skills: string[] = []
): string {
  const skillsList = skills.length > 0 ? skills.join(', ') : 'Not specified'
  const experience = userProfile?.yearsExperience ? `${userProfile.yearsExperience} years` : 'Not specified'
  const currentTitle = userProfile?.currentTitle || 'Not specified'
  const techStack = userProfile?.techStack && userProfile.techStack.length > 0
    ? userProfile.techStack.join(', ')
    : 'Not specified'

  return `You are an expert career coach and job preparation advisor. Your task is to analyze a job posting and create a personalized summary and actionable preparation plan for a job seeker.

Job Information:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description || 'No description provided'}

Job Seeker Profile:
- Current Title: ${currentTitle}
- Years of Experience: ${experience}
- Skills: ${skillsList}
- Tech Stack: ${techStack}

Your task:
1. Analyze the job posting and identify key requirements, responsibilities, and qualifications
2. Compare the job requirements with the job seeker's profile
3. Generate a concise summary (2-3 paragraphs) highlighting:
   - Why this job might be a good fit
   - Key requirements and how the candidate matches
   - Potential gaps or areas to highlight
   - Company/role insights if available
4. Create 3-5 specific, actionable preparation tasks that will help the candidate:
   - Prepare for the application
   - Prepare for interviews
   - Address any skill gaps
   - Stand out as a candidate

Each task should:
- Be specific and actionable (not vague like "practice coding")
- Have a clear priority (high, medium, or low)
- Include a brief description of what to do
- Be relevant to this specific job and the candidate's profile

Format your response as a JSON object with this exact structure:
{
  "summary": "Markdown-formatted summary (2-3 paragraphs)",
  "tasks": [
    {
      "id": "unique-task-id",
      "title": "Task title (specific and actionable)",
      "description": "Brief description of what to do",
      "priority": "high" | "medium" | "low",
      "completed": false
    }
  ]
}

Important:
- Use markdown formatting in the summary (bold, lists, etc.)
- Tasks must be specific to this job, not generic advice
- Prioritize tasks based on importance and urgency
- Make tasks achievable and relevant to the candidate's skill level
- Return ONLY valid JSON, no additional text or markdown code blocks`
}

/**
 * Generate user message for job analysis
 * 
 * @returns User message string
 */
export function getJobSummaryAndTasksUserMessage(): string {
  return `Please analyze this job posting and generate a personalized summary and preparation plan. Return your response as a JSON object matching the specified format.`
}

