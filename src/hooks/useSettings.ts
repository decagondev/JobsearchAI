/**
 * Hook for managing user settings (job site preferences, etc.)
 * Handles persistence to MemoryBank
 */

import { useState, useCallback, useEffect } from 'react'
import { useMemoryBank } from './useMemoryBank'
import { useOnboardingProgress } from './useOnboardingProgress'
import type { UserSettings, JobSiteSettings, JobSitePreference, CustomJobSite } from '@/types/session'

export interface UseSettingsReturn {
  settings: UserSettings
  jobSitePreferences: JobSiteSettings
  customJobSites: CustomJobSite[]
  updateJobSitePreference: (siteName: string, preference: JobSitePreference) => Promise<void>
  resetJobSitePreferences: () => Promise<void>
  addCustomJobSite: (site: CustomJobSite) => Promise<void>
  removeCustomJobSite: (siteName: string) => Promise<void>
  isLoading: boolean
}

/**
 * Hook for managing user settings
 * 
 * @example
 * ```tsx
 * const { jobSitePreferences, updateJobSitePreference } = useSettings()
 * await updateJobSitePreference('Indeed', 'include')
 * ```
 */
export function useSettings(): UseSettingsReturn {
  const memoryBank = useMemoryBank()
  const { userId } = useOnboardingProgress()
  const [settings, setSettings] = useState<UserSettings>({})
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Load settings from MemoryBank
   */
  const loadSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      const session = await memoryBank.loadSession(userId)
      if (session?.settings) {
        setSettings(session.settings)
      } else {
        setSettings({})
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSettings({})
    } finally {
      setIsLoading(false)
    }
  }, [userId, memoryBank])

  /**
   * Save settings to MemoryBank
   */
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    if (!userId) return

    try {
      const session = await memoryBank.loadSession(userId)
      const updatedSettings: UserSettings = {
        ...newSettings,
        createdAt: settings.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      if (session) {
        await memoryBank.updateSession(userId, {
          settings: updatedSettings,
        })
      } else {
        // Create new session with settings
        await memoryBank.saveSession({
          userId,
          settings: updatedSettings,
        })
      }
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }, [userId, memoryBank, settings.createdAt])

  /**
   * Update job site preference
   */
  const updateJobSitePreference = useCallback(
    async (siteName: string, preference: JobSitePreference) => {
      const currentPreferences = settings.jobSitePreferences || {}
      
      // If preference is 'neutral', remove it from settings
      const updatedPreferences: JobSiteSettings = { ...currentPreferences }
      if (preference === 'neutral') {
        delete updatedPreferences[siteName]
      } else {
        updatedPreferences[siteName] = preference
      }

      const updatedSettings: UserSettings = {
        ...settings,
        jobSitePreferences: updatedPreferences,
      }

      await saveSettings(updatedSettings)
    },
    [settings, saveSettings]
  )

  /**
   * Reset all job site preferences
   */
  const resetJobSitePreferences = useCallback(async () => {
    const updatedSettings: UserSettings = {
      ...settings,
      jobSitePreferences: {},
    }
    await saveSettings(updatedSettings)
  }, [settings, saveSettings])

  /**
   * Add a custom job site
   */
  const addCustomJobSite = useCallback(
    async (site: CustomJobSite) => {
      const currentCustomSites = settings.customJobSites || []
      // Check if site with same name already exists
      if (currentCustomSites.some(s => s.name.toLowerCase() === site.name.toLowerCase())) {
        throw new Error(`Job site "${site.name}" already exists`)
      }
      const updatedSettings: UserSettings = {
        ...settings,
        customJobSites: [...currentCustomSites, site],
      }
      await saveSettings(updatedSettings)
    },
    [settings, saveSettings]
  )

  /**
   * Remove a custom job site
   */
  const removeCustomJobSite = useCallback(
    async (siteName: string) => {
      const currentCustomSites = settings.customJobSites || []
      const updatedSettings: UserSettings = {
        ...settings,
        customJobSites: currentCustomSites.filter(s => s.name !== siteName),
        // Also remove preference if it exists
        jobSitePreferences: Object.fromEntries(
          Object.entries(settings.jobSitePreferences || {}).filter(([name]) => name !== siteName)
        ),
      }
      await saveSettings(updatedSettings)
    },
    [settings, saveSettings]
  )

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    jobSitePreferences: settings.jobSitePreferences || {},
    customJobSites: settings.customJobSites || [],
    updateJobSitePreference,
    resetJobSitePreferences,
    addCustomJobSite,
    removeCustomJobSite,
    isLoading,
  }
}

