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

