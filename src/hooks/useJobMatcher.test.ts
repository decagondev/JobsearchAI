/**
 * Unit tests for useJobMatcher hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJobMatcher } from './useJobMatcher'
import { vectorDB } from '@/lib/vectorDB'
import { memoryBank } from '@/lib/memoryBank'
import type { Session, Job } from '@/types/session'

// Mock dependencies
vi.mock('@/lib/vectorDB', () => ({
  vectorDB: {
    generateUserEmbedding: vi.fn(),
    findSimilarJobs: vi.fn(),
  },
}))

vi.mock('@/lib/memoryBank', () => ({
  memoryBank: {
    loadSession: vi.fn(),
    updateJobs: vi.fn(),
  },
}))

vi.mock('./useMemoryBank', () => ({
  useMemoryBank: () => memoryBank,
}))

vi.mock('./useOnboardingProgress', () => ({
  useOnboardingProgress: () => ({
    userId: 'test-user-123',
    formData: {
      step1: {
        currentTitle: 'Software Engineer',
      },
      step2: {
        techStack: ['Python', 'JavaScript'],
        roleKeywords: ['developer', 'engineer'],
      },
    },
  }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useJobMatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when no jobs exist', async () => {
    const mockSession: Session = {
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobs: [],
      skills: ['Python', 'JavaScript'],
      resumeRaw: 'Software engineer with 5 years experience',
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.generateUserEmbedding).mockReturnValue(new Array(128).fill(0))
    vi.mocked(vectorDB.findSimilarJobs).mockResolvedValue([])

    const { result } = renderHook(() => useJobMatcher(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.matchedJobs).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should match jobs and return sorted by score', async () => {
    const mockJobs: Job[] = [
      {
        id: 'job1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
        description: 'Python, JavaScript, React',
      },
      {
        id: 'job2',
        title: 'Frontend Developer',
        company: 'Web Inc',
        url: 'https://example.com/job2',
        description: 'React, TypeScript',
      },
    ]

    const mockSession: Session = {
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobs: mockJobs,
      skills: ['Python', 'JavaScript', 'React'],
      resumeRaw: 'Software engineer with Python and JavaScript experience',
    }

    const mockMatches = [
      { jobId: 'job1', score: 85.5, metadata: { type: 'job', jobId: 'job1' } },
      { jobId: 'job2', score: 72.3, metadata: { type: 'job', jobId: 'job2' } },
    ]

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.generateUserEmbedding).mockReturnValue(new Array(128).fill(0))
    vi.mocked(vectorDB.findSimilarJobs).mockResolvedValue(mockMatches)
    vi.mocked(memoryBank.updateJobs).mockResolvedValue()

    const { result } = renderHook(() => useJobMatcher(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.matchedJobs).toHaveLength(2)
    expect(result.current.matchedJobs[0].id).toBe('job1')
    expect(result.current.matchedJobs[0].matchScore).toBe(85.5)
    expect(result.current.matchedJobs[1].id).toBe('job2')
    expect(result.current.matchedJobs[1].matchScore).toBe(72.3)
    expect(memoryBank.updateJobs).toHaveBeenCalledWith('test-user-123', expect.any(Array))
  })

  it('should filter out jobs with zero match score', async () => {
    const mockJobs: Job[] = [
      {
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
        description: 'Python, JavaScript',
      },
      {
        id: 'job2',
        title: 'Data Scientist',
        company: 'Data Co',
        url: 'https://example.com/job2',
        description: 'R, SQL, Statistics',
      },
    ]

    const mockSession: Session = {
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobs: mockJobs,
      skills: ['Python', 'JavaScript'],
      resumeRaw: 'Software engineer',
    }

    // Only job1 has a match
    const mockMatches = [
      { jobId: 'job1', score: 80.0, metadata: { type: 'job', jobId: 'job1' } },
    ]

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.generateUserEmbedding).mockReturnValue(new Array(128).fill(0))
    vi.mocked(vectorDB.findSimilarJobs).mockResolvedValue(mockMatches)
    vi.mocked(memoryBank.updateJobs).mockResolvedValue()

    const { result } = renderHook(() => useJobMatcher(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should only return job1, not job2
    expect(result.current.matchedJobs).toHaveLength(1)
    expect(result.current.matchedJobs[0].id).toBe('job1')
  })

  it('should handle errors gracefully', async () => {
    vi.mocked(memoryBank.loadSession).mockRejectedValue(new Error('Failed to load session'))

    const { result } = renderHook(() => useJobMatcher(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.matchedJobs).toEqual([])
  })

  it('should generate user embedding from skills, resume, and profile', async () => {
    const mockSession: Session = {
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobs: [],
      skills: ['Python', 'JavaScript'],
      resumeRaw: 'Software engineer with 5 years experience',
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.generateUserEmbedding).mockReturnValue(new Array(128).fill(0))
    vi.mocked(vectorDB.findSimilarJobs).mockResolvedValue([])

    renderHook(() => useJobMatcher(), { wrapper })

    await waitFor(() => {
      expect(vectorDB.generateUserEmbedding).toHaveBeenCalled()
    })

    // Check that the embedding text includes skills, resume, and profile data
    const callArgs = vi.mocked(vectorDB.generateUserEmbedding).mock.calls[0][0]
    expect(callArgs).toContain('Python')
    expect(callArgs).toContain('JavaScript')
    expect(callArgs).toContain('Software engineer with 5 years experience')
    expect(callArgs).toContain('Software Engineer') // from step1.currentTitle
  })
})

