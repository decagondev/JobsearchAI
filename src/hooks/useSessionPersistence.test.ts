/**
 * Tests for useSessionPersistence hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSessionPersistence } from './useSessionPersistence'
import { memoryBank } from '@/lib/memoryBank'
import { vectorDB } from '@/lib/vectorDB'
import type { Session } from '@/types/session'

// Mock dependencies
vi.mock('@/lib/memoryBank', () => ({
  memoryBank: {
    loadSession: vi.fn(),
    updateSession: vi.fn(),
  },
}))

vi.mock('@/lib/vectorDB', () => ({
  vectorDB: {
    serialize: vi.fn(),
    deserialize: vi.fn(),
  },
}))

describe('useSessionPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should save session state', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      profile: { name: 'John Doe' },
      skills: ['TypeScript'],
      jobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(memoryBank.updateSession).mockResolvedValue(undefined)
    vi.mocked(vectorDB.serialize).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSessionPersistence())

    await result.current.saveSessionState('user_123')

    expect(memoryBank.loadSession).toHaveBeenCalledWith('user_123')
    expect(memoryBank.updateSession).toHaveBeenCalledWith('user_123', mockSession)
    expect(vectorDB.serialize).toHaveBeenCalled()
  })

  it('should restore session state', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      profile: { name: 'John Doe' },
      skills: ['TypeScript'],
      jobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.deserialize).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSessionPersistence())

    await result.current.restoreSessionState('user_123')

    expect(memoryBank.loadSession).toHaveBeenCalledWith('user_123')
    expect(vectorDB.deserialize).toHaveBeenCalled()
  })

  it('should handle missing session during restore', async () => {
    vi.mocked(memoryBank.loadSession).mockResolvedValue(undefined)
    vi.mocked(vectorDB.deserialize).mockResolvedValue(undefined)

    const { result } = renderHook(() => useSessionPersistence())

    // Should not throw
    await result.current.restoreSessionState('user_123')

    expect(memoryBank.loadSession).toHaveBeenCalledWith('user_123')
    // Should still try to deserialize vectors
    expect(vectorDB.deserialize).toHaveBeenCalled()
  })

  it('should handle errors during save gracefully', async () => {
    vi.mocked(memoryBank.loadSession).mockRejectedValue(new Error('Load failed'))

    const { result } = renderHook(() => useSessionPersistence())

    await expect(result.current.saveSessionState('user_123')).rejects.toThrow()
  })

  it('should handle errors during restore gracefully', async () => {
    vi.mocked(memoryBank.loadSession).mockRejectedValue(new Error('Load failed'))

    const { result } = renderHook(() => useSessionPersistence())

    // Should not throw (errors are caught and logged)
    await result.current.restoreSessionState('user_123')
  })
})

