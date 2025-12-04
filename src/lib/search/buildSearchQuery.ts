/**
 * Helper function to build optimized job search queries from user profile and skills
 * Combines role keywords, tech stack, location, and remote preference into a search query
 */

import type { UserProfile } from '@/types/session'

/**
 * Build an optimized search query for job search
 * 
 * @param profile - User profile with preferences and role keywords
 * @param skills - Array of extracted skills from resume
 * @returns Optimized search query string
 */
export function buildSearchQuery(profile: UserProfile | undefined, skills: string[]): string {
  const queryParts: string[] = []

  // Add role keywords if available
  if (profile?.roleKeywords && profile.roleKeywords.length > 0) {
    queryParts.push(...profile.roleKeywords)
  } else if (profile?.currentTitle) {
    // Use current title as fallback
    queryParts.push(profile.currentTitle)
  } else {
    // Default to software engineer if nothing specified
    queryParts.push('software engineer')
  }

  // Add "jobs" keyword
  queryParts.push('jobs')

  // Add remote preference
  if (profile?.remotePreference) {
    if (profile.remotePreference === 'remote') {
      queryParts.push('remote')
    } else if (profile.remotePreference === 'hybrid') {
      queryParts.push('hybrid')
    }
    // For 'onsite', we don't add anything specific
  }

  // Add top skills (limit to 5 most relevant)
  const topSkills = skills.slice(0, 5)
  if (topSkills.length > 0) {
    queryParts.push(...topSkills)
  } else if (profile?.techStack && profile.techStack.length > 0) {
    // Fallback to tech stack from profile
    queryParts.push(...profile.techStack.slice(0, 5))
  }

  // Add location if specified and not remote-only
  if (profile?.preferredLocations && profile.preferredLocations.length > 0 && profile.remotePreference !== 'remote') {
    // Add first location as it's most important
    queryParts.push(profile.preferredLocations[0])
  }

  // Join all parts with spaces
  return queryParts.join(' ')
}

