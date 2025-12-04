/**
 * Utilities for filtering and prioritizing jobs based on site preferences
 */

import type { Job, JobSiteSettings } from '@/types/session'

/**
 * Filter and prioritize jobs based on site preferences
 * 
 * @param jobs - Array of jobs to filter
 * @param preferences - Job site preferences (include/exclude/neutral)
 * @returns Filtered and prioritized array of jobs
 */
export function filterAndPrioritizeJobs(
  jobs: Job[],
  preferences: JobSiteSettings
): Job[] {
  if (!preferences || Object.keys(preferences).length === 0) {
    return jobs
  }

  // Separate jobs into included, excluded, and neutral
  const included: Job[] = []
  const excluded: Job[] = []
  const neutral: Job[] = []

  for (const job of jobs) {
    const siteName = job.jobSite || 'Unknown'
    const preference = preferences[siteName]

    if (preference === 'exclude') {
      excluded.push(job)
    } else if (preference === 'include') {
      included.push(job)
    } else {
      neutral.push(job)
    }
  }

  // Return: included first (prioritized), then neutral, excluded are filtered out
  return [...included, ...neutral]
}

/**
 * Check if a job should be included based on preferences
 */
export function shouldIncludeJob(job: Job, preferences: JobSiteSettings): boolean {
  if (!preferences || Object.keys(preferences).length === 0) {
    return true
  }

  const siteName = job.jobSite || 'Unknown'
  const preference = preferences[siteName]

  return preference !== 'exclude'
}

