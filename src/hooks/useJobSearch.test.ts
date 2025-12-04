/**
 * Tests for useJobSearch hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJobSearch } from './useJobSearch'
import { tavilyClient } from '@/lib/search/tavilyClient'
import { buildSearchQuery } from '@/lib/search/buildSearchQuery'
import { vectorDB } from '@/lib/vectorDB'
import { useMemoryBank } from './useMemoryBank'

// Mock dependencies
vi.mock('@/lib/search/tavilyClient', () => ({
  tavilyClient: {
    searchJobs: vi.fn(),
  },
}))

vi.mock('@/lib/search/buildSearchQuery', () => ({
  buildSearchQuery: vi.fn(),
}))

vi.mock('@/lib/vectorDB', () => ({
  vectorDB: {
    embedJob: vi.fn(),
  },
}))

vi.mock('./useMemoryBank', () => ({
  useMemoryBank: vi.fn(),
}))

// Helper to create a test QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })
}

// Helper to wrap hook with QueryClientProvider
function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useJobSearch', () => {
  const mockLoadSession = vi.fn()
  const mockUpdateJobs = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMemoryBank).mockReturnValue({
      loadSession: mockLoadSession,
      updateJobs: mockUpdateJobs,
    } as any)
    vi.mocked(buildSearchQuery).mockReturnValue('software engineer jobs remote React TypeScript')
  })

  it('should initialize with empty state when disabled', () => {
    const { result } = renderHook(
      () => useJobSearch({ enabled: false }),
      { wrapper }
    )

    expect(result.current.jobs).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should search for jobs and return results', async () => {
    const mockJobs: any[] = [
      {
        id: 'job_1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
        description: 'React and TypeScript experience required',
        source: 'tavily',
      },
      {
        id: 'job_2',
        title: 'Frontend Developer',
        company: 'Startup Inc',
        url: 'https://example.com/job2',
        description: 'Remote position with React',
        source: 'tavily',
      },
    ]

    vi.mocked(tavilyClient.searchJobs).mockResolvedValue(mockJobs)
    vi.mocked(vectorDB.embedJob).mockResolvedValue('vec_1')

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: { name: 'Test User' },
          skills: ['React', 'TypeScript'],
          enabled: true,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(tavilyClient.searchJobs).toHaveBeenCalledWith(
      'software engineer jobs remote React TypeScript',
      10
    )
    expect(result.current.jobs).toHaveLength(2)
    expect(result.current.jobs[0].title).toBe('Senior Software Engineer')
  })

  it('should embed jobs in vectorDB', async () => {
    const mockJobs: any[] = [
      {
        id: 'job_1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
        description: 'React experience',
        source: 'tavily',
      },
    ]

    vi.mocked(tavilyClient.searchJobs).mockResolvedValue(mockJobs)
    vi.mocked(vectorDB.embedJob).mockResolvedValue('vec_1')

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: { name: 'Test User' },
          skills: ['React'],
          enabled: true,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(vectorDB.embedJob).toHaveBeenCalledWith({
      id: 'job_1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      description: 'React experience',
    })
  })

  it('should save jobs to MemoryBank when userId is provided', async () => {
    const mockJobs: any[] = [
      {
        id: 'job_1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
        source: 'tavily',
      },
    ]

    vi.mocked(tavilyClient.searchJobs).mockResolvedValue(mockJobs)
    vi.mocked(vectorDB.embedJob).mockResolvedValue('vec_1')
    mockLoadSession.mockResolvedValue({ jobs: [] })

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: { name: 'Test User' },
          skills: ['React'],
          userId: 'user_123',
          enabled: true,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockLoadSession).toHaveBeenCalledWith('user_123')
    expect(mockUpdateJobs).toHaveBeenCalled()
  })

  it('should handle search errors gracefully', async () => {
    const mockError = new Error('Tavily API error')
    vi.mocked(tavilyClient.searchJobs).mockRejectedValue(mockError)

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: { name: 'Test User' },
          skills: ['React'],
          enabled: true,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.jobs).toEqual([])
  })

  it('should not search when query is empty', () => {
    vi.mocked(buildSearchQuery).mockReturnValue('')

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: undefined,
          skills: [],
          enabled: true,
        }),
      { wrapper }
    )

    expect(tavilyClient.searchJobs).not.toHaveBeenCalled()
    expect(result.current.jobs).toEqual([])
  })

  it('should merge existing jobs with new search results', async () => {
    const existingJob: any = {
      id: 'job_existing',
      title: 'Existing Job',
      company: 'Old Corp',
      url: 'https://example.com/existing',
      source: 'tavily',
    }

    const newJob: any = {
      id: 'job_new',
      title: 'New Job',
      company: 'New Corp',
      url: 'https://example.com/new',
      source: 'tavily',
    }

    vi.mocked(tavilyClient.searchJobs).mockResolvedValue([newJob])
    vi.mocked(vectorDB.embedJob).mockResolvedValue('vec_1')
    mockLoadSession.mockResolvedValue({ jobs: [existingJob] })

    const { result } = renderHook(
      () =>
        useJobSearch({
          profile: { name: 'Test User' },
          skills: ['React'],
          userId: 'user_123',
          enabled: true,
        }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should update with both existing and new jobs
    expect(mockUpdateJobs).toHaveBeenCalled()
    const updateCall = mockUpdateJobs.mock.calls[0][1]
    expect(updateCall).toHaveLength(2) // Both jobs should be present
  })
})

