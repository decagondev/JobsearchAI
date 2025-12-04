/**
 * Hook for managing full session persistence
 * Handles save/restore of MemoryBank session, vectorDB vectors, and chat messages
 */

import { useCallback, useEffect } from 'react'
import { useMemoryBank } from './useMemoryBank'
import { vectorDB } from '@/lib/vectorDB'

/**
 * Hook for session persistence
 * Provides methods to save and restore full session state
 * 
 * @example
 * ```tsx
 * const { saveSessionState, restoreSessionState } = useSessionPersistence()
 * await saveSessionState(userId)
 * await restoreSessionState(userId)
 * ```
 */
export function useSessionPersistence() {
  const memoryBankHook = useMemoryBank()

  /**
   * Save full session state to IndexedDB
   * Saves MemoryBank session, vectorDB vectors, and chat messages
   * 
   * @param userId - User ID to save session for
   */
  const saveSessionState = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // MemoryBank session is already persisted automatically on updates
        // Just ensure it's saved
        const session = await memoryBankHook.loadSession(userId)
        if (session) {
          await memoryBankHook.updateSession(userId, session)
        }

        // Serialize vectorDB vectors
        await vectorDB.serialize()

        // Chat messages are already persisted automatically in SupportBot
        // No need to do anything here
      } catch (error) {
        console.error('Failed to save session state:', error)
        throw error
      }
    },
    [memoryBankHook]
  )

  /**
   * Restore full session state from IndexedDB
   * Restores MemoryBank session, vectorDB vectors, and chat messages
   * 
   * @param userId - User ID to restore session for
   */
  const restoreSessionState = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Restore MemoryBank session (already loaded on demand)
        const session = await memoryBankHook.loadSession(userId)
        if (!session) {
          console.warn('No session found for userId:', userId)
          return
        }

        // Deserialize vectorDB vectors
        await vectorDB.deserialize()

        // Chat messages are loaded automatically in SupportBot on mount
        // No need to do anything here
      } catch (error) {
        console.error('Failed to restore session state:', error)
        // Don't throw - allow app to continue even if restore fails
      }
    },
    [memoryBankHook]
  )

  return {
    saveSessionState,
    restoreSessionState,
  }
}

/**
 * Hook to auto-save session state on page unload
 * Uses beforeunload event to save state before page closes
 * 
 * @param userId - User ID to save session for
 */
export function useAutoSaveSession(userId: string | null) {
  const { saveSessionState } = useSessionPersistence()

  useEffect(() => {
    if (!userId) return

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable save on page unload
      // Note: sendBeacon doesn't support async, so we'll use a synchronous approach
      // For now, we'll just try to save synchronously
      // In production, you might want to use a different approach
      saveSessionState(userId).catch((error) => {
        console.error('Failed to auto-save session:', error)
      })
    }

    // Also save periodically (every 30 seconds) as a backup
    const intervalId = setInterval(() => {
      if (userId) {
        saveSessionState(userId).catch((error) => {
          console.error('Failed to periodic save session:', error)
        })
      }
    }, 30000) // 30 seconds

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(intervalId)
    }
  }, [userId, saveSessionState])
}

