/**
 * Job site utilities for extracting and managing job site information
 */

/**
 * Common job sites with their domain patterns
 */
export const JOB_SITES = [
  { name: 'Indeed', domains: ['indeed.com', 'indeed.co.uk', 'indeed.ca', 'indeed.com.au'] },
  { name: 'Reed', domains: ['reed.co.uk'] },
  { name: 'LinkedIn', domains: ['linkedin.com'] },
  { name: 'Glassdoor', domains: ['glassdoor.com', 'glassdoor.co.uk'] },
  { name: 'Monster', domains: ['monster.com', 'monster.co.uk'] },
  { name: 'Totaljobs', domains: ['totaljobs.com'] },
  { name: 'CV-Library', domains: ['cv-library.co.uk', 'cv-library.com'] },
  { name: 'Adzuna', domains: ['adzuna.co.uk', 'adzuna.com'] },
  { name: 'ZipRecruiter', domains: ['ziprecruiter.com', 'ziprecruiter.co.uk'] },
  { name: 'SimplyHired', domains: ['simplyhired.com'] },
  { name: 'CareerBuilder', domains: ['careerbuilder.com'] },
  { name: 'Dice', domains: ['dice.com'] },
  { name: 'Stack Overflow', domains: ['stackoverflow.com'] },
  { name: 'AngelList', domains: ['angel.co', 'wellfound.com'] },
  { name: 'Remote.co', domains: ['remote.co'] },
  { name: 'We Work Remotely', domains: ['weworkremotely.com'] },
] as const

export type JobSiteName = typeof JOB_SITES[number]['name']

/**
 * Extract job site name from URL
 * @param url - Job URL
 * @returns Job site name or 'Unknown' if not recognized
 */
export function extractJobSite(url: string): string {
  if (!url) return 'Unknown'
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Remove www. prefix
    const cleanHostname = hostname.replace(/^www\./, '')
    
    // Find matching site
    for (const site of JOB_SITES) {
      if (site.domains.some(domain => cleanHostname === domain || cleanHostname.endsWith(`.${domain}`))) {
        return site.name
      }
    }
    
    // If no match, return the domain name
    return cleanHostname.split('.')[0] || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

/**
 * Get all available job site names
 */
export function getAllJobSiteNames(): string[] {
  return JOB_SITES.map(site => site.name)
}

/**
 * Check if a URL belongs to a specific job site
 */
export function isJobFromSite(url: string, siteName: string): boolean {
  const extractedSite = extractJobSite(url)
  return extractedSite === siteName
}

