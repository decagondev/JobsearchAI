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

export type ApplicationStatus = 'not_applied' | 'applied' | 'interviewing' | 'offer' | 'rejected'

export interface CustomLink {
  label: string
  url: string
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
  // New fields for job management
  isFavorite?: boolean
  applicationStatus?: ApplicationStatus
  notes?: string
  customLinks?: CustomLink[]
  supportingMaterials?: CustomLink[]
  appliedDate?: string
  updatedAt?: string
  // Job site tracking
  jobSite?: string
}

export type JobSitePreference = 'include' | 'exclude' | 'neutral'

export interface JobSiteSettings {
  [siteName: string]: JobSitePreference
}

export interface CustomJobSite {
  name: string
  domains: string[]
}

export interface UserSettings {
  jobSitePreferences?: JobSiteSettings
  customJobSites?: CustomJobSite[]
  createdAt?: string
  updatedAt?: string
}

export interface Session {
  userId: string
  profile?: UserProfile
  skills?: string[]
  seniority?: string
  domains?: string[]
  resumeRaw?: string
  jobs?: Job[]
  settings?: UserSettings
  createdAt: string
  updatedAt: string
}

