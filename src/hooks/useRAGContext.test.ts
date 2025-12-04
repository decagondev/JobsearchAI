/**
 * Tests for useRAGContext hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRAGContext } from './useRAGContext'
import { memoryBank } from '@/lib/memoryBank'
import { vectorDB } from '@/lib/vectorDB'
import type { Session } from '@/types/session'

// Mock dependencies
vi.mock('@/lib/memoryBank', () => ({
  memoryBank: {
    loadSession: vi.fn(),
  },
}))

vi.mock('@/lib/vectorDB', () => ({
  vectorDB: {
    search: vi.fn(),
  },
}))

describe('useRAGContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build context with user profile, skills, and resume', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      profile: {
        name: 'John Doe',
        currentTitle: 'Software Engineer',
        yearsExperience: 5,
        techStack: ['TypeScript', 'React'],
      },
      skills: ['JavaScript', 'TypeScript', 'React'],
      resumeRaw: 'Experienced software engineer with 5 years of experience...',
      jobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.search).mockResolvedValue([])

    const { result } = renderHook(() => useRAGContext())

    const context = await result.current({
      userId: 'user_123',
      query: 'What jobs match my skills?',
    })

    expect(context).toContain('John Doe')
    expect(context).toContain('Software Engineer')
    expect(context).toContain('JavaScript')
    expect(context).toContain('TypeScript')
    expect(context).toContain('React')
    expect(context).toContain('Experienced software engineer')
  })

  it('should include relevant job information from vector search', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      profile: {},
      skills: [],
      jobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockSearchResults = [
      {
        text: 'Senior Software Engineer position at Tech Corp',
        score: 0.9,
        metadata: {
          type: 'job',
          jobId: 'job_1',
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
        },
      },
    ]

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.search).mockResolvedValue(mockSearchResults)

    const { result } = renderHook(() => useRAGContext())

    const context = await result.current({
      userId: 'user_123',
      query: 'What jobs are available?',
    })

    expect(context).toContain('Senior Software Engineer')
    expect(context).toContain('Tech Corp')
  })

  it('should filter by contextJobId when provided', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      profile: {},
      skills: [],
      jobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mockSearchResults = [
      {
        text: 'Job 1 description',
        score: 0.9,
        metadata: {
          type: 'job',
          jobId: 'job_1',
          title: 'Job 1',
          company: 'Company 1',
        },
      },
      {
        text: 'Job 2 description',
        score: 0.8,
        metadata: {
          type: 'job',
          jobId: 'job_2',
          title: 'Job 2',
          company: 'Company 2',
        },
      },
    ]

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.search).mockResolvedValue(mockSearchResults)

    const { result } = renderHook(() => useRAGContext())

    const context = await result.current({
      userId: 'user_123',
      query: 'Tell me about this job',
      contextJobId: 'job_1',
    })

    // Should only include job_1
    expect(context).toContain('Job 1')
    expect(context).toContain('Company 1')
    expect(context).not.toContain('Job 2')
    expect(context).not.toContain('Company 2')
  })

  it('should handle missing session gracefully', async () => {
    vi.mocked(memoryBank.loadSession).mockResolvedValue(undefined)

    const { result } = renderHook(() => useRAGContext())

    const context = await result.current({
      userId: 'user_123',
      query: 'What jobs match my skills?',
    })

    expect(context).toContain('No user session found')
  })

  it('should handle empty session data', async () => {
    const mockSession: Session = {
      userId: 'user_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(memoryBank.loadSession).mockResolvedValue(mockSession)
    vi.mocked(vectorDB.search).mockResolvedValue([])

    const { result } = renderHook(() => useRAGContext())

    const context = await result.current({
      userId: 'user_123',
      query: 'What jobs match my skills?',
    })

    // Should still return a context string (may be minimal)
    expect(typeof context).toBe('string')
  })
})

