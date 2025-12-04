/**
 * Hook for extracting skills, experience, and domains from resume text using Groq
 * Integrates with MemoryBank for persistence and vectorDB for embeddings
 */

import { useState, useCallback, useEffect } from 'react'
import { extractSkills, type SkillsExtractionResult } from '@/lib/groqClient'
import { useMemoryBank } from './useMemoryBank'
import { vectorDB } from '@/lib/vectorDB'

export interface UseExtractSkillsOptions {
  userId?: string | null
  autoRestore?: boolean
}

export interface UseExtractSkillsReturn {
  extract: (resumeText: string, userId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  result: SkillsExtractionResult | null
  isAlreadyExtracted: boolean
  clearError: () => void
}

/**
 * Hook for skills extraction functionality
 * Handles Groq API calls, MemoryBank persistence, and vectorDB embeddings
 * 
 * @param options - Options including userId for auto-restore
 * @example
 * ```tsx
 * const { extract, isLoading, error, isAlreadyExtracted } = useExtractSkills({ userId })
 * ```
 */
export function useExtractSkills(options: UseExtractSkillsOptions = {}): UseExtractSkillsReturn {
  const { userId, autoRestore = true } = options
  const memoryBank = useMemoryBank()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SkillsExtractionResult | null>(null)
  const [isAlreadyExtracted, setIsAlreadyExtracted] = useState(false)

  /**
   * Check if skills are already extracted for a given session
   */
  const checkIfExtracted = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const session = await memoryBank.loadSession(userId)
      return !!(session?.skills && session.skills.length > 0)
    } catch {
      return false
    }
  }, [memoryBank])

  /**
   * Extract skills from resume text
   */
  const extract = useCallback(async (resumeText: string, userId: string): Promise<void> => {
    if (!resumeText || resumeText.trim().length === 0) {
      setError('Resume text cannot be empty')
      return
    }

    // Check if skills are already extracted
    const alreadyExtracted = await checkIfExtracted(userId)
    if (alreadyExtracted) {
      setIsAlreadyExtracted(true)
      // Load existing data
      const session = await memoryBank.loadSession(userId)
      if (session?.skills) {
        setResult({
          skills: session.skills,
          seniority: (session.seniority as SkillsExtractionResult['seniority']) || 'mid',
          domains: session.domains || [],
          experience: session.profile?.yearsExperience || 0
        })
      }
      return
    }

    setIsLoading(true)
    setError(null)
    setIsAlreadyExtracted(false)

    try {
      // Call Groq API to extract skills
      const extractionResult = await extractSkills(resumeText)

      // Save to MemoryBank
      await memoryBank.updateSkillsData(
        userId,
        extractionResult.skills,
        extractionResult.seniority,
        extractionResult.domains
      )

      // Create embedding from combined skills + resume text for job matching
      const skillsText = extractionResult.skills.join(', ')
      const domainsText = extractionResult.domains.join(', ')
      const combinedText = `Skills: ${skillsText}. Domains: ${domainsText}. Experience: ${extractionResult.experience} years. Seniority: ${extractionResult.seniority}. Resume summary: ${resumeText.substring(0, 500)}`

      await vectorDB.addVector(combinedText, {
        type: 'user_profile',
        userId,
        skills: extractionResult.skills,
        seniority: extractionResult.seniority,
        domains: extractionResult.domains,
        experience: extractionResult.experience
      })

      setResult(extractionResult)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract skills from resume'
      setError(errorMessage)
      console.error('Skills extraction error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [memoryBank, checkIfExtracted])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Restore extraction result from session on mount
   */
  useEffect(() => {
    if (!autoRestore || !userId) return

    const restoreState = async () => {
      try {
        const alreadyExtracted = await checkIfExtracted(userId)
        if (alreadyExtracted) {
          setIsAlreadyExtracted(true)
          const session = await memoryBank.loadSession(userId)
          if (session?.skills) {
            setResult({
              skills: session.skills,
              seniority: (session.seniority as SkillsExtractionResult['seniority']) || 'mid',
              domains: session.domains || [],
              experience: session.profile?.yearsExperience || 0
            })
          }
        }
      } catch (err) {
        console.error('Failed to restore extraction state:', err)
        // Don't set error - this is a background restore operation
      }
    }

    restoreState()
  }, [userId, autoRestore, memoryBank, checkIfExtracted])

  return {
    extract,
    isLoading,
    error,
    result,
    isAlreadyExtracted,
    clearError,
  }
}

