/**
 * Tests for useOnboardingProgress hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useOnboardingProgress } from './useOnboardingProgress'
import { memoryBank } from '@/lib/memoryBank'
import { localStorage } from '@/lib/storage'

// Mock MemoryBank
vi.mock('@/lib/memoryBank', () => ({
  memoryBank: {
    saveSession: vi.fn(),
    loadSession: vi.fn(),
    updateProfile: vi.fn(),
    updateResume: vi.fn(),
    clearSession: vi.fn(),
  },
}))

// Mock localStorage
vi.mock('@/lib/storage', () => ({
  localStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(localStorage.get).mockReturnValue(null)
  })

  it('should initialize with step 1 and empty form data', () => {
    const { result } = renderHook(() => useOnboardingProgress())

    expect(result.current.currentStep).toBe(1)
    expect(result.current.formData).toEqual({})
    expect(result.current.userId).toBeNull()
  })

  it('should load existing session from localStorage', async () => {
    const mockUserId = 'user_123'
    const mockSession = {
      userId: mockUserId,
      profile: {
        name: 'John Doe',
        currentTitle: 'Engineer',
        yearsExperience: 5,
      },
      resumeRaw: 'Resume text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(localStorage.get).mockReturnValue(mockUserId)
    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession as any)

    const { result } = renderHook(() => useOnboardingProgress())

    await waitFor(() => {
      expect(result.current.userId).toBe(mockUserId)
    })

    expect(result.current.formData.step1?.name).toBe('John Doe')
    expect(result.current.formData.resumeRaw).toBe('Resume text')
  })

  it('should update form data and save to MemoryBank', async () => {
    const mockUserId = 'user_123'
    vi.mocked(memoryBank.saveSession).mockResolvedValue(mockUserId)

    const { result } = renderHook(() => useOnboardingProgress())

    await act(async () => {
      await result.current.updateFormData(1, {
        name: 'Jane Doe',
        currentTitle: 'Developer',
      })
    })

    expect(memoryBank.saveSession).toHaveBeenCalledWith({
      profile: expect.objectContaining({
        name: 'Jane Doe',
        currentTitle: 'Developer',
      }),
    })

    expect(result.current.formData.step1?.name).toBe('Jane Doe')
  })

  it('should update resume and save to MemoryBank', async () => {
    const mockUserId = 'user_123'
    vi.mocked(memoryBank.saveSession).mockResolvedValue(mockUserId)

    const { result } = renderHook(() => useOnboardingProgress())

    await act(async () => {
      await result.current.updateResume('Resume text here')
    })

    expect(memoryBank.saveSession).toHaveBeenCalledWith({
      resumeRaw: 'Resume text here',
    })

    expect(result.current.formData.resumeRaw).toBe('Resume text here')
  })

  it('should navigate to different steps', () => {
    const { result } = renderHook(() => useOnboardingProgress())

    act(() => {
      result.current.goToStep(3)
    })

    expect(result.current.currentStep).toBe(3)

    act(() => {
      result.current.goToStep(1)
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('should not navigate to invalid steps', () => {
    const { result } = renderHook(() => useOnboardingProgress())

    act(() => {
      result.current.goToStep(0)
    })
    expect(result.current.currentStep).toBe(1)

    act(() => {
      result.current.goToStep(5)
    })
    expect(result.current.currentStep).toBe(1)
  })

  it('should clear session data', async () => {
    const mockUserId = 'user_123'
    const mockSession = {
      userId: mockUserId,
      profile: { name: 'Test' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(localStorage.get).mockReturnValue(mockUserId)
    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession as any)

    const { result } = renderHook(() => useOnboardingProgress())

    // Wait for session to load
    await waitFor(() => {
      expect(result.current.userId).toBe(mockUserId)
    })

    await act(async () => {
      await result.current.clearSession()
    })

    expect(memoryBank.clearSession).toHaveBeenCalledWith(mockUserId)
    expect(localStorage.remove).toHaveBeenCalledWith('onboarding_session')
    expect(result.current.userId).toBeNull()
    expect(result.current.formData).toEqual({})
    expect(result.current.currentStep).toBe(1)
  })
})

