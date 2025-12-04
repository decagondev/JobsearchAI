/**
 * React hook for accessing MemoryBank service
 * Provides a singleton instance of MemoryBank for use in components
 */

import { useMemo } from 'react'
import { memoryBank } from '@/lib/memoryBank'

/**
 * Hook to access the MemoryBank service instance
 * Returns the singleton MemoryBank instance for session management
 * 
 * @example
 * ```tsx
 * const memoryBank = useMemoryBank()
 * const session = await memoryBank.loadSession(userId)
 * ```
 */
export function useMemoryBank() {
  // Return the singleton instance
  // Using useMemo to ensure we always return the same instance
  return useMemo(() => memoryBank, [])
}

