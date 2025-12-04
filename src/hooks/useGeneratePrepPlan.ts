/**
 * Hook for generating job summaries and prep tasks using Groq
 * Integrates with TanStack Query for caching and MemoryBank for persistence
 */

import { useQuery } from '@tanstack/react-query'
import { generateJobSummaryAndTasks, type JobSummaryAndTasksResult } from '@/lib/groqClient'
import { useMemoryBank } from './useMemoryBank'
import { useOnboardingProgress } from './useOnboardingProgress'
import type { Job, UserProfile } from '@/types/session'

export interface UseGeneratePrepPlanOptions {
  job: Job
  enabled?: boolean
}

export interface UseGeneratePrepPlanReturn {
  summary: string | null
  tasks: JobSummaryAndTasksResult['tasks']
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for generating job summaries and prep tasks
 * Uses TanStack Query for caching and automatically saves to MemoryBank
 * 
 * @param options - Options including job and enabled flag
 * @returns Summary, tasks, loading state, and error handling
 * 
 * @example
 * ```tsx
 * const { summary, tasks, isLoading } = useGeneratePrepPlan({
 *   job: selectedJob,
 *   enabled: isExpanded
 * })
 * ```
 */
export function useGeneratePrepPlan(
  options: UseGeneratePrepPlanOptions
): UseGeneratePrepPlanReturn {
  const { job, enabled = true } = options
  const memoryBank = useMemoryBank()
  const { userId, formData } = useOnboardingProgress()

  // Build user profile from form data
  const userProfile: UserProfile | undefined = formData.step1 && formData.step2
    ? {
        name: formData.step1.name,
        currentTitle: formData.step1.currentTitle,
        yearsExperience: formData.step1.yearsExperience,
        targetSalary: formData.step1.targetSalary,
        remotePreference: formData.step2.remotePreference,
        preferredLocations: formData.step2.preferredLocations,
        techStack: formData.step2.techStack,
        roleKeywords: formData.step2.roleKeywords,
      }
    : undefined

  // Load skills from session
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useQuery<JobSummaryAndTasksResult>({
    queryKey: ['prepPlan', job.id, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required for prep plan generation')
      }

      // Check if job already has summary and tasks
      const session = await memoryBank.loadSession(userId)
      const existingJob = session?.jobs?.find((j) => j.id === job.id)

      if (existingJob?.summary && existingJob?.prepTasks && existingJob.prepTasks.length > 0) {
        // Return existing data
        return {
          summary: existingJob.summary,
          tasks: existingJob.prepTasks,
        }
      }

      // Load skills from session
      const skills = session?.skills || []

      // Generate new summary and tasks
      const generated = await generateJobSummaryAndTasks(job, userProfile, skills)

      // Save to job in MemoryBank
      const updatedJob: Job = {
        ...job,
        summary: generated.summary,
        prepTasks: generated.tasks,
      }

      // Update job in session
      if (session?.jobs) {
        const updatedJobs = session.jobs.map((j) =>
          j.id === job.id ? updatedJob : j
        )
        await memoryBank.updateJobs(userId, updatedJobs)
      } else {
        await memoryBank.addJob(userId, updatedJob)
      }

      return generated
    },
    enabled: enabled && !!userId && !!job.id,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - summaries don't change
    retry: 2,
  })

  return {
    summary: result?.summary || null,
    tasks: result?.tasks || [],
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch()
    },
  }
}

