/**
 * Hook for job search using Tavily API
 * Integrates with TanStack Query for caching, vectorDB for embeddings, and MemoryBank for persistence
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tavilyClient } from '@/lib/search/tavilyClient'
import { buildSearchQuery } from '@/lib/search/buildSearchQuery'
import { vectorDB } from '@/lib/vectorDB'
import { useMemoryBank } from './useMemoryBank'
import type { UserProfile, Job } from '@/types/session'

export interface UseJobSearchOptions {
  profile?: UserProfile
  skills?: string[]
  userId?: string
  enabled?: boolean
  maxResults?: number
  restoreFromStorage?: boolean
}

export interface UseJobSearchReturn {
  jobs: Job[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for job search functionality
 * Uses TanStack Query for state management and caching
 * 
 * @param options - Search options including profile, skills, and userId
 * @returns Job search results with loading and error states
 * 
 * @example
 * ```tsx
 * const { jobs, isLoading, error } = useJobSearch({
 *   profile: userProfile,
 *   skills: extractedSkills,
 *   userId: currentUserId,
 *   enabled: true
 * })
 * ```
 */
export function useJobSearch(options: UseJobSearchOptions): UseJobSearchReturn {
  const { profile, skills = [], userId, enabled = true, maxResults = 10, restoreFromStorage = true } = options
  const memoryBank = useMemoryBank()
  const [restoredJobs, setRestoredJobs] = useState<Job[]>([])

  // Build search query from profile and skills
  const searchQuery = buildSearchQuery(profile, skills)

  // Restore jobs from storage on mount
  useEffect(() => {
    if (!restoreFromStorage || !userId) return

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
  }, [userId, restoreFromStorage, memoryBank])

  // Use TanStack Query for job search
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Job[]>({
    queryKey: ['jobSearch', searchQuery, maxResults, userId],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        // If no search query but we have userId, return stored jobs
        if (userId && restoreFromStorage) {
          try {
            const session = await memoryBank.loadSession(userId)
            return session?.jobs || []
          } catch {
            return []
          }
        }
        return []
      }

      // Search for jobs using Tavily
      const searchResults = await tavilyClient.searchJobs(searchQuery, maxResults)

      // Embed each job in vectorDB for similarity search
      const embeddingPromises = searchResults.map((job) =>
        vectorDB.embedJob({
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
        })
      )

      await Promise.all(embeddingPromises)

      // Save jobs to MemoryBank if userId is provided
      if (userId && searchResults.length > 0) {
        try {
          // Get existing jobs and merge with new ones
          const session = await memoryBank.loadSession(userId)
          const existingJobs = session?.jobs || []
          
          // Merge jobs, avoiding duplicates by ID
          const jobMap = new Map<string, Job>()
          existingJobs.forEach((job) => jobMap.set(job.id, job))
          searchResults.forEach((job) => jobMap.set(job.id, job))
          
          const allJobs = Array.from(jobMap.values())
          await memoryBank.updateJobs(userId, allJobs)
        } catch (error) {
          console.error('Failed to save jobs to MemoryBank:', error)
          // Don't throw - search was successful, just persistence failed
        }
      }

      return searchResults
    },
    enabled: enabled && !!searchQuery && searchQuery.trim().length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - jobs don't change that frequently
    retry: 2,
    placeholderData: restoredJobs.length > 0 ? restoredJobs : undefined,
  })

  // Return restored jobs if query is not enabled and we have restored jobs
  const finalJobs = (!enabled || !searchQuery || searchQuery.trim().length === 0) && restoredJobs.length > 0
    ? restoredJobs
    : jobs

  return {
    jobs: finalJobs,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch()
    },
  }
}

