/**
 * Hook for building job-specific RAG context
 * Abstracts RAG context building logic for job coach mode
 */

import { useCallback } from 'react'
import { useMemoryBank } from './useMemoryBank'
import { vectorDB } from '@/lib/vectorDB'

export interface BuildJobContextOptions {
  userId: string
  query: string
  contextJobId?: string
  topK?: number
}

/**
 * Hook for building RAG context for job coach mode
 * Returns a function to build context from user's session data
 * 
 * @example
 * ```tsx
 * const buildJobContext = useRAGContext()
 * const context = await buildJobContext({
 *   userId: 'user_123',
 *   query: 'How should I prepare for this interview?',
 *   contextJobId: 'job_456'
 * })
 * ```
 */
export function useRAGContext() {
  const memoryBank = useMemoryBank()

  const buildJobContext = useCallback(
    async (options: BuildJobContextOptions): Promise<string> => {
      const { userId, query, contextJobId, topK = 5 } = options

      try {
        // Load session from MemoryBank
        const session = await memoryBank.loadSession(userId)
        if (!session) {
          return 'No user session found. Please complete onboarding first.'
        }

        const contextParts: string[] = []

        // Build user profile summary
        const profileParts: string[] = []
        if (session.profile) {
          if (session.profile.name) {
            profileParts.push(`Name: ${session.profile.name}`)
          }
          if (session.profile.currentTitle) {
            profileParts.push(`Current Title: ${session.profile.currentTitle}`)
          }
          if (session.profile.yearsExperience !== undefined) {
            profileParts.push(`Years of Experience: ${session.profile.yearsExperience}`)
          }
          if (session.profile.techStack && session.profile.techStack.length > 0) {
            profileParts.push(`Tech Stack: ${session.profile.techStack.join(', ')}`)
          }
          if (session.profile.roleKeywords && session.profile.roleKeywords.length > 0) {
            profileParts.push(`Role Keywords: ${session.profile.roleKeywords.join(', ')}`)
          }
        }

        if (profileParts.length > 0) {
          contextParts.push('## User Profile\n' + profileParts.join('\n'))
        }

        // Add skills
        if (session.skills && session.skills.length > 0) {
          contextParts.push(`## Skills\n${session.skills.join(', ')}`)
        }

        // Add resume text (truncated if too long)
        if (session.resumeRaw) {
          const resumePreview = session.resumeRaw.length > 2000
            ? session.resumeRaw.substring(0, 2000) + '...'
            : session.resumeRaw
          contextParts.push(`## Resume\n${resumePreview}`)
        }

        // Search vectorDB for relevant job chunks
        const searchResults = await vectorDB.search(query, topK * 2) // Get more results to filter

        // Filter by jobId if contextJobId is provided
        let relevantJobs = searchResults
        if (contextJobId) {
          relevantJobs = searchResults.filter(
            (result) => result.metadata?.type === 'job' && result.metadata?.jobId === contextJobId
          )
          // If no results for specific job, fall back to all job results
          if (relevantJobs.length === 0) {
            relevantJobs = searchResults.filter((result) => result.metadata?.type === 'job')
          }
        } else {
          // Only include job-type results
          relevantJobs = searchResults.filter((result) => result.metadata?.type === 'job')
        }

        // Limit to topK results
        relevantJobs = relevantJobs.slice(0, topK)

        // Add relevant job information
        if (relevantJobs.length > 0) {
          const jobTexts = relevantJobs.map((result, index) => {
            const jobTitle = result.metadata?.title || 'Unknown Job'
            const jobCompany = result.metadata?.company || 'Unknown Company'
            return `### Job ${index + 1}: ${jobTitle} at ${jobCompany}\n${result.text}`
          })
          contextParts.push('## Relevant Job Opportunities\n' + jobTexts.join('\n\n'))
        } else if (session.jobs && session.jobs.length > 0) {
          // Fallback: include job summaries if no vector search results
          const jobSummaries = session.jobs
            .slice(0, 3)
            .map((job) => `${job.title} at ${job.company}${job.description ? `: ${job.description.substring(0, 200)}...` : ''}`)
          contextParts.push('## Available Jobs\n' + jobSummaries.join('\n\n'))
        }

        return contextParts.join('\n\n')
      } catch (error) {
        console.error('Error building job context:', error)
        return `Error loading context: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    },
    [memoryBank]
  )

  return buildJobContext
}

