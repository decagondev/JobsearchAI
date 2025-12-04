/**
 * Tests for useResumeUpload hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResumeUpload } from './useResumeUpload'
import { parseFile } from '@/lib/fileParser'
import { useOnboardingProgress } from './useOnboardingProgress'

// Mock dependencies
vi.mock('@/lib/fileParser', () => ({
  parseFile: vi.fn(),
}))

vi.mock('./useOnboardingProgress', () => ({
  useOnboardingProgress: vi.fn(),
}))

describe('useResumeUpload', () => {
  const mockUpdateResume = vi.fn()
  const mockFormData = { resumeRaw: null }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOnboardingProgress).mockReturnValue({
      updateResume: mockUpdateResume,
      formData: mockFormData,
    } as any)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useResumeUpload())

    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.resumeText).toBeNull()
  })

  it('should upload and parse PDF file', async () => {
    const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
    const mockParsed = {
      text: 'resume content',
      filename: 'resume.pdf',
      fileType: 'application/pdf',
    }

    vi.mocked(parseFile).mockResolvedValue(mockParsed as any)

    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResume(mockFile)
    })

    expect(parseFile).toHaveBeenCalledWith(mockFile)
    expect(mockUpdateResume).toHaveBeenCalledWith('resume content')
    expect(result.current.resumeText).toBe('resume content')
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should reject invalid file types', async () => {
    const mockFile = new File(['content'], 'document.doc', { type: 'application/msword' })

    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResume(mockFile)
    })

    expect(parseFile).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Please upload a PDF or TXT file')
  })

  it('should reject files that are too large', async () => {
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const mockFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' })

    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResume(mockFile)
    })

    expect(parseFile).not.toHaveBeenCalled()
    expect(result.current.error).toBe('File size must be less than 10MB')
  })

  it('should handle parsing errors', async () => {
    const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    const mockError = new Error('Failed to parse PDF')

    vi.mocked(parseFile).mockRejectedValue(mockError)

    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResume(mockFile)
    })

    expect(result.current.error).toBe('Failed to parse PDF')
    expect(result.current.isUploading).toBe(false)
  })

  it('should upload resume text directly', async () => {
    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResumeText('Resume text here')
    })

    expect(mockUpdateResume).toHaveBeenCalledWith('Resume text here')
    expect(result.current.resumeText).toBe('Resume text here')
    expect(result.current.isUploading).toBe(false)
  })

  it('should reject empty resume text', async () => {
    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResumeText('   ')
    })

    expect(mockUpdateResume).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Resume text cannot be empty')
  })

  it('should clear error', async () => {
    const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    const mockError = new Error('Test error')

    vi.mocked(parseFile).mockRejectedValue(mockError)

    const { result } = renderHook(() => useResumeUpload())

    await act(async () => {
      await result.current.uploadResume(mockFile)
    })

    expect(result.current.error).toBe('Test error')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})

