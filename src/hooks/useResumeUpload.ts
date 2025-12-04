/**
 * Hook for handling resume file upload and parsing
 * Integrates with fileParser and MemoryBank
 */

import { useState, useCallback } from 'react'
import { parseFile } from '@/lib/fileParser'
import { useOnboardingProgress } from './useOnboardingProgress'

export interface UseResumeUploadReturn {
  uploadResume: (file: File) => Promise<void>
  uploadResumeText: (text: string) => Promise<void>
  isUploading: boolean
  error: string | null
  resumeText: string | null
  clearError: () => void
}

/**
 * Hook for resume upload functionality
 * Handles file parsing and MemoryBank persistence
 * 
 * @example
 * ```tsx
 * const { uploadResume, isUploading, error } = useResumeUpload()
 * ```
 */
export function useResumeUpload(): UseResumeUploadReturn {
  const { updateResume, formData } = useOnboardingProgress()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(formData.resumeRaw || null)

  /**
   * Upload and parse a resume file
   */
  const uploadResume = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain']
    const validExtensions = ['.pdf', '.txt']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload a PDF or TXT file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Parse the file
      const parsed = await parseFile(file)
      
      if (!parsed.text || parsed.text.trim().length === 0) {
        setError('The file appears to be empty or could not be parsed')
        return
      }

      // Save to MemoryBank
      setResumeText(parsed.text)
      await updateResume(parsed.text)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume file'
      setError(errorMessage)
      console.error('Resume upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [updateResume])

  /**
   * Upload resume text directly (from textarea paste)
   */
  const uploadResumeText = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      setError('Resume text cannot be empty')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      setResumeText(text.trim())
      await updateResume(text.trim())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save resume text'
      setError(errorMessage)
      console.error('Resume text upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [updateResume])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadResume,
    uploadResumeText,
    isUploading,
    error,
    resumeText,
    clearError,
  }
}

