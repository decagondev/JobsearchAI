/**
 * Type definitions for JobsearchAI session data
 */

export interface UserProfile {
  name?: string
  currentTitle?: string
  yearsExperience?: number
  targetSalary?: number
  preferredLocations?: string[]
  remotePreference?: 'remote' | 'onsite' | 'hybrid'
  techStack?: string[]
  roleKeywords?: string[]
}

export interface PrepTask {
  id: string
  title: string
  description?: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
}

export interface Job {
  id: string
  title: string
  company: string
  url: string
  description?: string
  matchScore?: number
  summary?: string
  prepTasks?: PrepTask[]
  createdAt?: string
  source?: 'tavily' | 'manual'
  rawData?: Record<string, any>
}

export interface Session {
  userId: string
  profile?: UserProfile
  skills?: string[]
  seniority?: string
  domains?: string[]
  resumeRaw?: string
  jobs?: Job[]
  createdAt: string
  updatedAt: string
}

