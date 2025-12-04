/**
 * MemoryBank service for managing user session data in IndexedDB
 * Provides typed CRUD operations for session persistence
 */

import { db } from './storage'
import type { Session, UserProfile, Job } from '@/types/session'

const SESSION_STORE = 'sessions'

/**
 * Generate a unique user ID for the session
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * MemoryBank service class for session management
 */
class MemoryBank {
  /**
   * Save a new session or update an existing one
   */
  async saveSession(session: Partial<Session>): Promise<string> {
    const now = new Date().toISOString()
    const userId = session.userId || generateUserId()

    const fullSession: Session = {
      userId,
      createdAt: session.createdAt || now,
      updatedAt: now,
      profile: session.profile,
      skills: session.skills,
      resumeRaw: session.resumeRaw,
      jobs: session.jobs,
    }

    try {
      // Check if session exists
      const existing = await db.get<Session>(SESSION_STORE, userId)
      
      if (existing) {
        // Update existing session
        await this.updateSession(userId, session)
        return userId
      } else {
        // Create new session
        await db.save(SESSION_STORE, fullSession)
        return userId
      }
    } catch (error) {
      console.error('MemoryBank saveSession error:', error)
      throw new Error(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Load a session by userId
   */
  async loadSession(userId: string): Promise<Session | undefined> {
    try {
      return await db.get<Session>(SESSION_STORE, userId)
    } catch (error) {
      console.error('MemoryBank loadSession error:', error)
      throw new Error(`Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update an existing session with partial data
   */
  async updateSession(userId: string, updates: Partial<Session>): Promise<void> {
    try {
      const existing = await db.get<Session>(SESSION_STORE, userId)
      
      if (!existing) {
        throw new Error(`Session with userId ${userId} not found`)
      }

      const updated: Session = {
        ...existing,
        ...updates,
        userId, // Ensure userId cannot be changed
        updatedAt: new Date().toISOString(),
      }

      // Use put for atomic update (inserts if not exists, updates if exists)
      await db.put(SESSION_STORE, updated)
    } catch (error) {
      console.error('MemoryBank updateSession error:', error)
      throw new Error(`Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update user profile in session
   */
  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const existing = await db.get<Session>(SESSION_STORE, userId)
    
    if (!existing) {
      // Create new session if it doesn't exist
      await this.saveSession({ userId, profile })
      return
    }

    const updatedProfile: UserProfile = {
      ...existing.profile,
      ...profile,
    }

    await this.updateSession(userId, { profile: updatedProfile })
  }

  /**
   * Add or update jobs in session
   */
  async updateJobs(userId: string, jobs: Job[]): Promise<void> {
    await this.updateSession(userId, { jobs })
  }

  /**
   * Add a single job to session
   */
  async addJob(userId: string, job: Job): Promise<void> {
    const existing = await db.get<Session>(SESSION_STORE, userId)
    const currentJobs = existing?.jobs || []
    
    // Check if job already exists (by id)
    const existingJobIndex = currentJobs.findIndex(j => j.id === job.id)
    
    if (existingJobIndex >= 0) {
      // Update existing job
      currentJobs[existingJobIndex] = job
    } else {
      // Add new job
      currentJobs.push(job)
    }

    await this.updateJobs(userId, currentJobs)
  }

  /**
   * Update skills in session
   */
  async updateSkills(userId: string, skills: string[]): Promise<void> {
    await this.updateSession(userId, { skills })
  }

  /**
   * Update resume raw text in session
   */
  async updateResume(userId: string, resumeRaw: string): Promise<void> {
    await this.updateSession(userId, { resumeRaw })
  }

  /**
   * Clear/delete a session
   */
  async clearSession(userId: string): Promise<void> {
    try {
      await db.delete(SESSION_STORE, userId)
    } catch (error) {
      console.error('MemoryBank clearSession error:', error)
      throw new Error(`Failed to clear session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all sessions (useful for debugging or admin purposes)
   */
  async getAllSessions(): Promise<Session[]> {
    try {
      return await db.getAll<Session>(SESSION_STORE)
    } catch (error) {
      console.error('MemoryBank getAllSessions error:', error)
      throw new Error(`Failed to get all sessions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const memoryBank = new MemoryBank()

