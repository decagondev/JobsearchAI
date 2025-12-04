/**
 * Hook for matching jobs to user profile using vector similarity
 * Generates user embedding from skills and resume, then finds similar jobs
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vectorDB } from '@/lib/vectorDB'
import { useMemoryBank } from './useMemoryBank'
import { useOnboardingProgress } from './useOnboardingProgress'
import type { Job } from '@/types/session'

export interface UseJobMatcherReturn {
  matchedJobs: Job[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for matching jobs to user profile using vector similarity
 * 
 * Generates a user embedding from skills and resume text, then uses vectorDB
 * to find similar jobs and rank them by match score.
 * 
 * @returns Matched jobs with scores, loading state, and error handling
 * 
 * @example
 * ```tsx
 * const { matchedJobs, isLoading, error } = useJobMatcher()
 * ```
 */
export function useJobMatcher(): UseJobMatcherReturn {
  const memoryBank = useMemoryBank()
  const { userId, formData } = useOnboardingProgress()
  const [restoredJobs, setRestoredJobs] = useState<Job[]>([])

  // Restore jobs from storage on mount
  useEffect(() => {
    if (!userId) return

    const loadStoredJobs = async () => {
      try {
        const session = await memoryBank.loadSession(userId)
        if (session?.jobs && session.jobs.length > 0) {
          setRestoredJobs(session.jobs)
        }
      } catch (error) {
        console.error('Failed to restore jobs from storage:', error)
      }
    }

    loadStoredJobs()
  }, [userId, memoryBank])

  // Use TanStack Query for job matching
  const {
    data: matchedJobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Job[]>({
    queryKey: ['jobMatcher', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required for job matching')
      }

      // Ensure vectorDB is deserialized
      await vectorDB.deserialize()

      // Load session to get jobs, skills, and resume
      const session = await memoryBank.loadSession(userId)
      const jobs = session?.jobs || []

      if (jobs.length === 0) {
        return []
      }

      // Generate user embedding text from skills and resume
      const parts: string[] = []
      
      // Add skills if available
      if (session?.skills && session.skills.length > 0) {
        parts.push(...session.skills)
      }
      
      // Add resume text if available
      if (session?.resumeRaw) {
        parts.push(session.resumeRaw)
      }
      
      // Add profile information from formData
      if (formData.step1?.currentTitle) {
        parts.push(formData.step1.currentTitle)
      }
      
      if (formData.step2?.techStack && formData.step2.techStack.length > 0) {
        parts.push(...formData.step2.techStack)
      }
      
      if (formData.step2?.roleKeywords && formData.step2.roleKeywords.length > 0) {
        parts.push(...formData.step2.roleKeywords)
      }
      
      const userEmbeddingText = parts.join(' ').trim()

      if (!userEmbeddingText || userEmbeddingText.length === 0) {
        // If no user data, return jobs without match scores
        return jobs
      }

      try {
        // Generate user embedding
        const userEmbedding = vectorDB.generateUserEmbedding(userEmbeddingText)

        // Find similar jobs
        const similarJobs = await vectorDB.findSimilarJobs(userEmbedding, jobs.length)

        // Create a map of jobId to match result
        const matchMap = new Map(
          similarJobs.map((match) => [match.jobId, match])
        )

        // Map results back to Job objects and update with match scores
        const matchedJobs: Job[] = jobs
          .map((job) => {
            const match = matchMap.get(job.id)
            return {
              ...job,
              matchScore: match?.score || job.matchScore || 0, // Preserve existing match score if no new match
            }
          })
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)) // Sort by score descending

        // Update jobs in MemoryBank with match scores
        if (matchedJobs.length > 0) {
          try {
            await memoryBank.updateJobs(userId, matchedJobs)
          } catch (error) {
            console.error('Failed to update jobs with match scores:', error)
            // Don't throw - matching was successful, just persistence failed
          }
        }

        return matchedJobs
      } catch (error) {
        console.error('Failed to match jobs, returning jobs without scores:', error)
        // If matching fails, return jobs without match scores rather than empty array
        return jobs.map(job => ({
          ...job,
          matchScore: job.matchScore || 0,
        }))
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - match scores don't change frequently
    retry: 2,
    placeholderData: restoredJobs.length > 0 ? restoredJobs : undefined,
  })

  // Return restored jobs if matched jobs are empty but we have restored jobs
  // This ensures jobs are shown immediately on page refresh
  const finalJobs = (matchedJobs.length === 0 && restoredJobs.length > 0)
    ? restoredJobs
    : matchedJobs

  return {
    matchedJobs: finalJobs,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch()
    },
  }
}

