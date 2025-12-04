/**
 * Hook for managing individual job updates (favorites, status, notes, links)
 * Handles persistence to MemoryBank
 */

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemoryBank } from './useMemoryBank'
import { useOnboardingProgress } from './useOnboardingProgress'
import type { Job, ApplicationStatus, CustomLink } from '@/types/session'

export interface UseJobManagementReturn {
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>
  toggleFavorite: (jobId: string) => Promise<void>
  updateApplicationStatus: (jobId: string, status: ApplicationStatus) => Promise<void>
  updateNotes: (jobId: string, notes: string) => Promise<void>
  addCustomLink: (jobId: string, link: CustomLink) => Promise<void>
  removeCustomLink: (jobId: string, linkIndex: number) => Promise<void>
  addSupportingMaterial: (jobId: string, material: CustomLink) => Promise<void>
  removeSupportingMaterial: (jobId: string, materialIndex: number) => Promise<void>
}

/**
 * Hook for managing job updates
 * Provides methods to update job properties like favorites, status, notes, and links
 * 
 * @example
 * ```tsx
 * const { toggleFavorite, updateApplicationStatus } = useJobManagement()
 * await toggleFavorite(job.id)
 * await updateApplicationStatus(job.id, 'applied')
 * ```
 */
export function useJobManagement(): UseJobManagementReturn {
  const memoryBank = useMemoryBank()
  const { userId } = useOnboardingProgress()
  const queryClient = useQueryClient()

  /**
   * Update a job with partial data
   */
  const updateJob = useCallback(
    async (jobId: string, updates: Partial<Job>): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to update job')
      }

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const jobIndex = jobs.findIndex((j) => j.id === jobId)

        if (jobIndex === -1) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        const updatedJob: Job = {
          ...jobs[jobIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        jobs[jobIndex] = updatedJob
        await memoryBank.updateJobs(userId, jobs)
        
        // Update React Query cache directly instead of invalidating
        // This prevents infinite loops while keeping UI in sync
        // IMPORTANT: Preserve matchScore from existing cache data
        // Create new array and object references to ensure React detects changes
        queryClient.setQueryData<Job[]>(['jobMatcher', userId], (oldData) => {
          if (!oldData) return oldData
          const newData = oldData.map(j => {
            if (j.id === jobId) {
              // Create new object reference with updated data
              // Preserve matchScore and other computed fields from cache
              return {
                ...updatedJob,
                matchScore: j.matchScore ?? updatedJob.matchScore, // Preserve existing matchScore
              }
            }
            return j
          })
          // Return new array reference to ensure React detects the change
          return newData
        })
        
        queryClient.setQueryData<Job[]>(['jobSearch'], (oldData) => {
          if (!oldData) return oldData
          const newData = oldData.map(j => {
            if (j.id === jobId) {
              // Create new object reference with updated data
              // Preserve matchScore and other computed fields from cache
              return {
                ...updatedJob,
                matchScore: j.matchScore ?? updatedJob.matchScore, // Preserve existing matchScore
              }
            }
            return j
          })
          // Return new array reference to ensure React detects the change
          return newData
        })
      } catch (error) {
        console.error('Failed to update job:', error)
        throw error
      }
    },
    [userId, memoryBank, queryClient]
  )

  /**
   * Toggle favorite status of a job
   */
  const toggleFavorite = useCallback(
    async (jobId: string): Promise<void> => {
      if (!userId) return

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const job = jobs.find((j) => j.id === jobId)

        if (!job) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        await updateJob(jobId, { isFavorite: !job.isFavorite })
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        throw error
      }
    },
    [userId, memoryBank, updateJob]
  )

  /**
   * Update application status of a job
   */
  const updateApplicationStatus = useCallback(
    async (jobId: string, status: ApplicationStatus): Promise<void> => {
      const updates: Partial<Job> = {
        applicationStatus: status,
      }

      // Set applied date if status is 'applied' and not already set
      if (status === 'applied') {
        const session = await memoryBank.loadSession(userId!)
        const job = session?.jobs?.find((j) => j.id === jobId)
        if (!job?.appliedDate) {
          updates.appliedDate = new Date().toISOString()
        }
      }

      await updateJob(jobId, updates)
    },
    [updateJob, memoryBank, userId]
  )

  /**
   * Update notes for a job
   */
  const updateNotes = useCallback(
    async (jobId: string, notes: string): Promise<void> => {
      await updateJob(jobId, { notes })
    },
    [updateJob]
  )

  /**
   * Add a custom link to a job
   */
  const addCustomLink = useCallback(
    async (jobId: string, link: CustomLink): Promise<void> => {
      if (!userId) return

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const job = jobs.find((j) => j.id === jobId)

        if (!job) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        const customLinks = [...(job.customLinks || []), link]
        await updateJob(jobId, { customLinks })
      } catch (error) {
        console.error('Failed to add custom link:', error)
        throw error
      }
    },
    [userId, memoryBank, updateJob]
  )

  /**
   * Remove a custom link from a job
   */
  const removeCustomLink = useCallback(
    async (jobId: string, linkIndex: number): Promise<void> => {
      if (!userId) return

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const job = jobs.find((j) => j.id === jobId)

        if (!job) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        const customLinks = [...(job.customLinks || [])]
        customLinks.splice(linkIndex, 1)
        await updateJob(jobId, { customLinks })
      } catch (error) {
        console.error('Failed to remove custom link:', error)
        throw error
      }
    },
    [userId, memoryBank, updateJob]
  )

  /**
   * Add a supporting material link to a job
   */
  const addSupportingMaterial = useCallback(
    async (jobId: string, material: CustomLink): Promise<void> => {
      if (!userId) return

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const job = jobs.find((j) => j.id === jobId)

        if (!job) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        const supportingMaterials = [...(job.supportingMaterials || []), material]
        await updateJob(jobId, { supportingMaterials })
      } catch (error) {
        console.error('Failed to add supporting material:', error)
        throw error
      }
    },
    [userId, memoryBank, updateJob]
  )

  /**
   * Remove a supporting material from a job
   */
  const removeSupportingMaterial = useCallback(
    async (jobId: string, materialIndex: number): Promise<void> => {
      if (!userId) return

      try {
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []
        const job = jobs.find((j) => j.id === jobId)

        if (!job) {
          throw new Error(`Job with id ${jobId} not found`)
        }

        const supportingMaterials = [...(job.supportingMaterials || [])]
        supportingMaterials.splice(materialIndex, 1)
        await updateJob(jobId, { supportingMaterials })
      } catch (error) {
        console.error('Failed to remove supporting material:', error)
        throw error
      }
    },
    [userId, memoryBank, updateJob]
  )

  return {
    updateJob,
    toggleFavorite,
    updateApplicationStatus,
    updateNotes,
    addCustomLink,
    removeCustomLink,
    addSupportingMaterial,
    removeSupportingMaterial,
  }
}

