/**
 * Hook for generating cover letters using Groq
 * Integrates with TanStack Query for caching
 */

import { useQuery } from '@tanstack/react-query'
import { generateCoverLetter } from '@/lib/groqClient'
import { useMemoryBank } from './useMemoryBank'
import { useOnboardingProgress } from './useOnboardingProgress'
import type { Job, UserProfile } from '@/types/session'

export interface UseGenerateCoverLetterOptions {
  job: Job
  enabled?: boolean
  revisionInstruction?: string
}

export interface UseGenerateCoverLetterReturn {
  coverLetter: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for generating cover letters
 * Uses TanStack Query for caching
 * 
 * @param options - Options including job and enabled flag
 * @returns Cover letter text, loading state, and error handling
 * 
 * @example
 * ```tsx
 * const { coverLetter, isLoading } = useGenerateCoverLetter({
 *   job: selectedJob,
 *   enabled: isModalOpen
 * })
 * ```
 */
export function useGenerateCoverLetter(
  options: UseGenerateCoverLetterOptions
): UseGenerateCoverLetterReturn {
  const { job, enabled = true, revisionInstruction } = options
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

  const {
    data: coverLetter,
    isLoading,
    error,
    refetch,
  } = useQuery<string>({
    queryKey: ['coverLetter', job.id, userId, revisionInstruction || 'default'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required for cover letter generation')
      }

      // Load session to get skills and resume
      const session = await memoryBank.loadSession(userId)
      const skills = session?.skills || []
      const resumeText = session?.resumeRaw

      // Generate cover letter with optional revision instruction
      const letter = await generateCoverLetter(job, userProfile, skills, resumeText, revisionInstruction)

      return letter
    },
    enabled: enabled && !!userId && !!job.id,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - cover letters don't change unless job/user changes
    retry: 2,
  })

  return {
    coverLetter: coverLetter || null,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch()
    },
  }
}

