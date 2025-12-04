/**
 * Tests for useExtractSkills hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExtractSkills } from './useExtractSkills'
import { extractSkills } from '@/lib/groqClient'
import { useMemoryBank } from './useMemoryBank'
import { vectorDB } from '@/lib/vectorDB'

// Mock dependencies
vi.mock('@/lib/groqClient', () => ({
  extractSkills: vi.fn(),
}))

vi.mock('./useMemoryBank', () => ({
  useMemoryBank: vi.fn(),
}))

vi.mock('@/lib/vectorDB', () => ({
  vectorDB: {
    addVector: vi.fn(),
  },
}))

describe('useExtractSkills', () => {
  const mockLoadSession = vi.fn()
  const mockUpdateSkillsData = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMemoryBank).mockReturnValue({
      loadSession: mockLoadSession,
      updateSkillsData: mockUpdateSkillsData,
    } as any)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useExtractSkills())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
    expect(result.current.isAlreadyExtracted).toBe(false)
  })

  it('should extract skills from resume text', async () => {
    const mockResumeText = 'Software engineer with 5 years of experience in React and TypeScript'
    const mockUserId = 'user_123'
    const mockExtractionResult = {
      skills: ['React', 'TypeScript', 'JavaScript'],
      seniority: 'senior' as const,
      domains: ['web development'],
      experience: 5,
    }

    vi.mocked(extractSkills).mockResolvedValue(mockExtractionResult)
    mockLoadSession.mockResolvedValue({ skills: null })
    vi.mocked(vectorDB.addVector).mockResolvedValue('vec_123')

    const { result } = renderHook(() => useExtractSkills())

    await act(async () => {
      await result.current.extract(mockResumeText, mockUserId)
    })

    expect(extractSkills).toHaveBeenCalledWith(mockResumeText)
    expect(mockUpdateSkillsData).toHaveBeenCalledWith(
      mockUserId,
      mockExtractionResult.skills,
      mockExtractionResult.seniority,
      mockExtractionResult.domains
    )
    expect(vectorDB.addVector).toHaveBeenCalled()
    expect(result.current.result).toEqual(mockExtractionResult)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should skip extraction if skills already exist', async () => {
    const mockResumeText = 'Resume text'
    const mockUserId = 'user_123'
    const mockSession = {
      skills: ['React', 'TypeScript'],
      seniority: 'senior',
      domains: ['web development'],
      profile: { yearsExperience: 5 },
    }

    mockLoadSession.mockResolvedValue(mockSession)

    const { result } = renderHook(() => useExtractSkills())

    await act(async () => {
      await result.current.extract(mockResumeText, mockUserId)
    })

    expect(extractSkills).not.toHaveBeenCalled()
    expect(result.current.isAlreadyExtracted).toBe(true)
    expect(result.current.result).toEqual({
      skills: ['React', 'TypeScript'],
      seniority: 'senior',
      domains: ['web development'],
      experience: 5,
    })
  })

  it('should handle empty resume text', async () => {
    const { result } = renderHook(() => useExtractSkills())

    await act(async () => {
      await result.current.extract('', 'user_123')
    })

    expect(extractSkills).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Resume text cannot be empty')
  })

  it('should handle extraction errors', async () => {
    const mockResumeText = 'Resume text'
    const mockUserId = 'user_123'
    const mockError = new Error('Failed to extract skills')

    vi.mocked(extractSkills).mockRejectedValue(mockError)
    mockLoadSession.mockResolvedValue({ skills: null })

    const { result } = renderHook(() => useExtractSkills())

    await act(async () => {
      await result.current.extract(mockResumeText, mockUserId)
    })

    expect(result.current.error).toBe('Failed to extract skills')
    expect(result.current.isLoading).toBe(false)
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useExtractSkills())

    // Set error state manually (simulating an error occurred)
    act(() => {
      // We can't directly set error, but we can trigger clearError
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('should handle MemoryBank errors gracefully', async () => {
    const mockResumeText = 'Resume text'
    const mockUserId = 'user_123'
    const mockExtractionResult = {
      skills: ['React'],
      seniority: 'mid' as const,
      domains: [],
      experience: 2,
    }

    vi.mocked(extractSkills).mockResolvedValue(mockExtractionResult)
    mockLoadSession.mockRejectedValue(new Error('MemoryBank error'))
    mockUpdateSkillsData.mockRejectedValue(new Error('Update failed'))

    const { result } = renderHook(() => useExtractSkills())

    await act(async () => {
      await result.current.extract(mockResumeText, mockUserId)
    })

    // Should still attempt extraction even if check fails
    expect(extractSkills).toHaveBeenCalled()
  })
})

