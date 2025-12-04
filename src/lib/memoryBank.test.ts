/**
 * Unit tests for MemoryBank service
 * Tests session CRUD operations with mocked IndexedDB
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { memoryBank } from './memoryBank'
import type { Session, Job } from '@/types/session'

// Mock the storage module
vi.mock('./storage', async () => {
  // In-memory store for testing
  const store = new Map<string, Session>()
  
  return {
    db: {
      save: async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
        if (storeName !== 'sessions') {
          throw new Error(`Unknown store: ${storeName}`)
        }
        const session = data as Session
        store.set(session.userId, session)
        return session.userId
      },
      get: async <T>(storeName: string, id: IDBValidKey): Promise<T | undefined> => {
        if (storeName !== 'sessions') {
          throw new Error(`Unknown store: ${storeName}`)
        }
        return store.get(id as string) as T | undefined
      },
      getAll: async <T>(storeName: string): Promise<T[]> => {
        if (storeName !== 'sessions') {
          throw new Error(`Unknown store: ${storeName}`)
        }
        return Array.from(store.values()) as T[]
      },
      delete: async (storeName: string, id: IDBValidKey): Promise<void> => {
        if (storeName !== 'sessions') {
          throw new Error(`Unknown store: ${storeName}`)
        }
        store.delete(id as string)
      },
      clear: async (storeName: string): Promise<void> => {
        if (storeName !== 'sessions') {
          throw new Error(`Unknown store: ${storeName}`)
        }
        store.clear()
      },
    },
  }
})

describe('MemoryBank', () => {
  beforeEach(async () => {
    // Clear all sessions before each test
    const allSessions = await memoryBank.getAllSessions()
    for (const session of allSessions) {
      await memoryBank.clearSession(session.userId)
    }
  })

  describe('saveSession', () => {
    it('should create a new session with generated userId', async () => {
      const sessionData: Partial<Session> = {
        profile: {
          name: 'Test User',
          currentTitle: 'Software Engineer',
        },
      }

      const userId = await memoryBank.saveSession(sessionData)
      
      expect(userId).toBeDefined()
      expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/)
      
      const saved = await memoryBank.loadSession(userId)
      expect(saved).toBeDefined()
      expect(saved?.profile?.name).toBe('Test User')
      expect(saved?.createdAt).toBeDefined()
      expect(saved?.updatedAt).toBeDefined()
    })

    it('should create a new session with provided userId', async () => {
      const userId = 'custom-user-id'
      const sessionData: Partial<Session> = {
        userId,
        profile: {
          name: 'Test User',
        },
      }

      const returnedUserId = await memoryBank.saveSession(sessionData)
      
      expect(returnedUserId).toBe(userId)
      
      const saved = await memoryBank.loadSession(userId)
      expect(saved?.userId).toBe(userId)
    })

    it('should update existing session when userId exists', async () => {
      const userId = 'test-user'
      const initialSession: Partial<Session> = {
        userId,
        profile: { name: 'Initial Name' },
      }

      await memoryBank.saveSession(initialSession)
      
      const updatedSession: Partial<Session> = {
        userId,
        profile: { name: 'Updated Name' },
      }

      await memoryBank.saveSession(updatedSession)
      
      const saved = await memoryBank.loadSession(userId)
      expect(saved?.profile?.name).toBe('Updated Name')
    })
  })

  describe('loadSession', () => {
    it('should load an existing session', async () => {
      const userId = 'test-user'
      const sessionData: Partial<Session> = {
        userId,
        profile: { name: 'Test User' },
        skills: ['TypeScript', 'React'],
      }

      await memoryBank.saveSession(sessionData)
      const loaded = await memoryBank.loadSession(userId)
      
      expect(loaded).toBeDefined()
      expect(loaded?.userId).toBe(userId)
      expect(loaded?.profile?.name).toBe('Test User')
      expect(loaded?.skills).toEqual(['TypeScript', 'React'])
    })

    it('should return undefined for non-existent session', async () => {
      const loaded = await memoryBank.loadSession('non-existent')
      expect(loaded).toBeUndefined()
    })
  })

  describe('updateSession', () => {
    it('should update an existing session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId, profile: { name: 'Original' } })
      
      await memoryBank.updateSession(userId, {
        profile: { name: 'Updated' },
        skills: ['New Skill'],
      })
      
      const updated = await memoryBank.loadSession(userId)
      expect(updated?.profile?.name).toBe('Updated')
      expect(updated?.skills).toEqual(['New Skill'])
      expect(updated?.updatedAt).toBeDefined()
    })

    it('should throw error when updating non-existent session', async () => {
      await expect(
        memoryBank.updateSession('non-existent', { profile: { name: 'Test' } })
      ).rejects.toThrow('not found')
    })

    it('should preserve userId when updating', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      await memoryBank.updateSession(userId, { userId: 'should-not-change' } as any)
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.userId).toBe(userId)
    })
  })

  describe('updateProfile', () => {
    it('should update profile in existing session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({
        userId,
        profile: { name: 'Original', currentTitle: 'Engineer' },
      })
      
      await memoryBank.updateProfile(userId, { name: 'Updated Name' })
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.profile?.name).toBe('Updated Name')
      expect(session?.profile?.currentTitle).toBe('Engineer') // Preserved
    })

    it('should create new session if profile update on non-existent session', async () => {
      const userId = 'new-user'
      await memoryBank.updateProfile(userId, { name: 'New User' })
      
      const session = await memoryBank.loadSession(userId)
      expect(session).toBeDefined()
      expect(session?.profile?.name).toBe('New User')
    })
  })

  describe('updateJobs', () => {
    it('should update jobs in session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      const jobs: Job[] = [
        {
          id: 'job1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          url: 'https://example.com/job1',
        },
      ]
      
      await memoryBank.updateJobs(userId, jobs)
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.jobs).toEqual(jobs)
    })
  })

  describe('addJob', () => {
    it('should add a new job to session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      const job: Job = {
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
      }
      
      await memoryBank.addJob(userId, job)
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.jobs).toHaveLength(1)
      expect(session?.jobs?.[0]).toEqual(job)
    })

    it('should update existing job if id matches', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      const job1: Job = {
        id: 'job1',
        title: 'Original Title',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
      }
      
      await memoryBank.addJob(userId, job1)
      
      const job2: Job = {
        id: 'job1',
        title: 'Updated Title',
        company: 'Tech Corp',
        url: 'https://example.com/job1',
      }
      
      await memoryBank.addJob(userId, job2)
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.jobs).toHaveLength(1)
      expect(session?.jobs?.[0].title).toBe('Updated Title')
    })
  })

  describe('updateSkills', () => {
    it('should update skills in session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      await memoryBank.updateSkills(userId, ['TypeScript', 'React'])
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.skills).toEqual(['TypeScript', 'React'])
    })
  })

  describe('updateResume', () => {
    it('should update resume raw text in session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      const resumeText = 'John Doe\nSoftware Engineer\n...'
      await memoryBank.updateResume(userId, resumeText)
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.resumeRaw).toBe(resumeText)
    })
  })

  describe('clearSession', () => {
    it('should delete a session', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      await memoryBank.clearSession(userId)
      
      const loaded = await memoryBank.loadSession(userId)
      expect(loaded).toBeUndefined()
    })

    it('should not throw when clearing non-existent session', async () => {
      await expect(memoryBank.clearSession('non-existent')).resolves.not.toThrow()
    })
  })

  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      await memoryBank.saveSession({ userId: 'user1', profile: { name: 'User 1' } })
      await memoryBank.saveSession({ userId: 'user2', profile: { name: 'User 2' } })
      
      const allSessions = await memoryBank.getAllSessions()
      expect(allSessions).toHaveLength(2)
      expect(allSessions.map(s => s.userId)).toContain('user1')
      expect(allSessions.map(s => s.userId)).toContain('user2')
    })

    it('should return empty array when no sessions exist', async () => {
      const allSessions = await memoryBank.getAllSessions()
      expect(allSessions).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle empty session data', async () => {
      const userId = await memoryBank.saveSession({})
      expect(userId).toBeDefined()
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.userId).toBe(userId)
      expect(session?.createdAt).toBeDefined()
    })

    it('should handle concurrent updates', async () => {
      const userId = 'test-user'
      await memoryBank.saveSession({ userId })
      
      // Simulate concurrent updates
      await Promise.all([
        memoryBank.updateProfile(userId, { name: 'Update 1' }),
        memoryBank.updateSkills(userId, ['Skill 1']),
      ])
      
      const session = await memoryBank.loadSession(userId)
      expect(session?.profile?.name).toBeDefined()
      expect(session?.skills).toBeDefined()
    })
  })
})

