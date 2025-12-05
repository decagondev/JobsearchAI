/**
 * Pre-filled prompt templates for Job Coach quick actions
 * Used when users click quick action buttons on JobCard
 */

import type { Job } from '@/types/session'

/**
 * Generate a mock interview prompt for a specific job
 * 
 * @param job - Job object to prepare interview for
 * @returns Pre-filled prompt string for mock interview
 */
export function getMockInterviewPrompt(job: Job): string {
  return `I'd like to practice a mock interview for the ${job.title} position at ${job.company}. 

Please act as an interviewer and ask me questions based on the job requirements. After each question, give me feedback on my answer and suggest improvements.

${job.description ? `Here's the job description:\n${job.description.substring(0, 500)}${job.description.length > 500 ? '...' : ''}` : ''}

Let's start with the first question!`
}

/**
 * Generate a resume tailoring prompt for a specific job
 * 
 * @param job - Job object to tailor resume for
 * @returns Pre-filled prompt string for resume tailoring
 */
export function getTailorResumePrompt(job: Job): string {
  return `I want to tailor my resume for the ${job.title} position at ${job.company}.

${job.description ? `Here's the job description:\n${job.description.substring(0, 500)}${job.description.length > 500 ? '...' : ''}` : ''}

Please review my resume and suggest:
1. Which skills and experiences to emphasize
2. How to rephrase my current bullet points to better match the job requirements
3. Any keywords I should include
4. Sections I should add or modify

Give me specific, actionable suggestions I can implement right away.`
}

/**
 * Generate an explain job prompt for a specific job
 * 
 * @param job - Job object to explain
 * @returns Pre-filled prompt string for job explanation
 */
export function getExplainJobPrompt(job: Job): string {
  return `Can you help me understand this job posting better?

${job.description ? `Job Description:\n${job.description}` : `Job: ${job.title} at ${job.company}`}

Please explain:
1. What this role actually involves day-to-day
2. What skills and experience are most important
3. What level of seniority this position is targeting
4. How well this matches my background
5. What I should focus on if I want to apply

Be specific and help me understand if this is a good fit for me.`
}

/**
 * Generate a cover letter prompt for a specific job
 * 
 * @param job - Job object to generate cover letter for
 * @returns Pre-filled prompt string for cover letter generation
 */
export function getCoverLetterPrompt(job: Job): string {
  const supportingMaterials = job.supportingMaterials && job.supportingMaterials.length > 0
    ? job.supportingMaterials.map((material, index) => `${index + 1}. ${material.label}: ${material.url}`).join('\n')
    : null

  const customLinks = job.customLinks && job.customLinks.length > 0
    ? job.customLinks.map((link, index) => `${index + 1}. ${link.label}: ${link.url}`).join('\n')
    : null

  let additionalContext = ''
  if (supportingMaterials || customLinks) {
    additionalContext = '\n\nAdditional Context:\n'
    if (supportingMaterials) {
      additionalContext += `Supporting Materials I've prepared for this application:\n${supportingMaterials}\n\n`
      additionalContext += 'Please reference these materials in the cover letter where relevant, and include links to them.\n'
    }
    if (customLinks) {
      additionalContext += `Custom Links related to this application:\n${customLinks}\n\n`
      additionalContext += 'Please incorporate these links naturally into the cover letter where appropriate.\n'
    }
  }

  return `I need a personalized cover letter for the ${job.title} position at ${job.company}.

${job.description ? `Job Description:\n${job.description}` : `Job: ${job.title} at ${job.company}`}${additionalContext}

Please create a professional, personalized cover letter that:
1. Addresses the hiring manager (use a professional greeting)
2. Demonstrates my understanding of the role and company
3. Highlights my relevant skills, experience, and achievements from my resume
4. Shows how my background aligns with the job requirements
5. References specific aspects of the job description that match my experience
6. Incorporates any supporting materials or links I've provided above
7. Maintains a professional yet personable tone
8. Is concise (ideally one page when formatted)

Use my profile information, skills, and resume content to personalize the letter. Make it specific to this role and company - avoid generic templates. The cover letter should feel authentic and demonstrate genuine interest in this particular position.

Please format it as a ready-to-use cover letter that I can copy and paste.`
}

