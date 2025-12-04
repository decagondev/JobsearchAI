/**
 * Hook for managing onboarding wizard progress and MemoryBank persistence
 * Handles step navigation, form data persistence, and session management
 */

import { useState, useEffect, useCallback } from 'react'
import { useMemoryBank } from './useMemoryBank'
import { localStorage } from '@/lib/storage'
import type { UserProfile } from '@/types/session'
import type { Step1BasicsData, Step2PreferencesData } from '@/schemas/onboarding'

const SESSION_KEY = 'onboarding_session'

export interface OnboardingFormData {
  step1?: Step1BasicsData
  step2?: Step2PreferencesData
  resumeRaw?: string
}

export interface UseOnboardingProgressReturn {
  currentStep: number
  formData: OnboardingFormData
  userId: string | null
  goToStep: (step: number) => void
  updateFormData: (step: number, data: Partial<Step1BasicsData | Step2PreferencesData>) => Promise<void>
  updateResume: (resumeText: string) => Promise<void>
  loadSession: () => Promise<void>
  clearSession: () => Promise<void>
}

/**
 * Hook to manage onboarding wizard state and persistence
 * 
 * @example
 * ```tsx
 * const { currentStep, formData, goToStep, updateFormData } = useOnboardingProgress()
 * ```
 */
export function useOnboardingProgress(): UseOnboardingProgressReturn {
  const memoryBank = useMemoryBank()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>({})
  const [userId, setUserId] = useState<string | null>(null)

  /**
   * Load existing session from MemoryBank
   */
  const loadSession = useCallback(async () => {
    try {
      // Try to get userId from localStorage first (for session continuity)
      const storedUserId = localStorage.get(SESSION_KEY)
      
      if (storedUserId) {
        const session = await memoryBank.loadSession(storedUserId)
        if (session) {
          setUserId(storedUserId)
          
          // Reconstruct form data from session
          const loadedData: OnboardingFormData = {}
          
          if (session.profile) {
            loadedData.step1 = {
              name: session.profile.name || '',
              currentTitle: session.profile.currentTitle,
              yearsExperience: session.profile.yearsExperience,
              targetSalary: session.profile.targetSalary,
            }
            
            loadedData.step2 = {
              remotePreference: session.profile.remotePreference,
              preferredLocations: session.profile.preferredLocations || [],
              techStack: session.profile.techStack || [],
              roleKeywords: session.profile.roleKeywords || [],
            }
          }
          
          if (session.resumeRaw) {
            loadedData.resumeRaw = session.resumeRaw
          }
          
          setFormData(loadedData)
          
          // Determine current step based on what data exists
          if (loadedData.resumeRaw) {
            setCurrentStep(4)
          } else if (loadedData.step2 && (loadedData.step2.remotePreference || loadedData.step2.preferredLocations.length > 0 || loadedData.step2.techStack.length > 0 || loadedData.step2.roleKeywords.length > 0)) {
            setCurrentStep(3)
          } else if (loadedData.step1?.name) {
            setCurrentStep(2)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding session:', error)
    }
  }, [memoryBank])

  /**
   * Update form data for a specific step and persist to MemoryBank
   */
  const updateFormData = useCallback(async (
    step: number,
    data: Partial<Step1BasicsData | Step2PreferencesData>
  ) => {
    try {
      const updatedData = { ...formData }
      
      if (step === 1) {
        updatedData.step1 = { ...updatedData.step1, ...data } as Step1BasicsData
      } else if (step === 2) {
        updatedData.step2 = { ...updatedData.step2, ...data } as Step2PreferencesData
      }
      
      setFormData(updatedData)
      
      // Persist to MemoryBank
      const profile: Partial<UserProfile> = {}
      
      if (updatedData.step1) {
        profile.name = updatedData.step1.name
        profile.currentTitle = updatedData.step1.currentTitle
        profile.yearsExperience = updatedData.step1.yearsExperience
        profile.targetSalary = updatedData.step1.targetSalary
      }
      
      if (updatedData.step2) {
        profile.remotePreference = updatedData.step2.remotePreference
        profile.preferredLocations = updatedData.step2.preferredLocations
        profile.techStack = updatedData.step2.techStack
        profile.roleKeywords = updatedData.step2.roleKeywords
      }
      
      let currentUserId = userId
      if (!currentUserId) {
        // Create new session
        currentUserId = await memoryBank.saveSession({ profile })
        setUserId(currentUserId)
        localStorage.set(SESSION_KEY, currentUserId)
      } else {
        // Update existing session
        await memoryBank.updateProfile(currentUserId, profile)
      }
    } catch (error) {
      console.error('Failed to update form data:', error)
      throw error
    }
  }, [formData, userId, memoryBank])

  /**
   * Update resume text and persist to MemoryBank
   */
  const updateResume = useCallback(async (resumeText: string) => {
    try {
      const updatedData = { ...formData, resumeRaw: resumeText }
      setFormData(updatedData)
      
      let currentUserId = userId
      if (!currentUserId) {
        // Create new session if it doesn't exist
        currentUserId = await memoryBank.saveSession({ resumeRaw: resumeText })
        setUserId(currentUserId)
        localStorage.set(SESSION_KEY, currentUserId)
      } else {
        // Update existing session
        await memoryBank.updateResume(currentUserId, resumeText)
      }
    } catch (error) {
      console.error('Failed to update resume:', error)
      throw error
    }
  }, [formData, userId, memoryBank])

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step)
    }
  }, [])

  /**
   * Clear session data
   */
  const clearSession = useCallback(async () => {
    try {
      if (userId) {
        await memoryBank.clearSession(userId)
      }
      localStorage.remove(SESSION_KEY)
      setUserId(null)
      setFormData({})
      setCurrentStep(1)
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }, [userId, memoryBank])

  // Load session on mount
  useEffect(() => {
    loadSession()
  }, [loadSession])

  return {
    currentStep,
    formData,
    userId,
    goToStep,
    updateFormData,
    updateResume,
    loadSession,
    clearSession,
  }
}

