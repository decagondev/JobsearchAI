/**
 * Tavily API client for job search
 * Uses Tavily REST API for web search functionality
 */

import { z } from 'zod'
import type { Job } from '@/types/session'
import { extractJobSite } from '@/lib/jobSites'

/**
 * Tavily API response schema
 */
const tavilyResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string().optional(),
  score: z.number().optional(),
  published_date: z.string().optional(),
})

const tavilyResponseSchema = z.object({
  results: z.array(tavilyResultSchema),
  query: z.string(),
  response_time: z.number().optional(),
})

type TavilyResult = z.infer<typeof tavilyResultSchema>

/**
 * Abstract interface for search providers (SOLID: Dependency Inversion)
 * Allows swapping search providers in the future
 */
export interface SearchProvider {
  searchJobs(query: string, maxResults?: number): Promise<Job[]>
}

/**
 * Tavily search client implementation
 * Singleton pattern for consistent API usage
 */
class TavilyClient implements SearchProvider {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVILY_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('VITE_TAVILY_API_KEY is not set. Job search will not work.')
    }
  }

  /**
   * Search for jobs using Tavily API
   * 
   * @param query - Search query string
   * @param maxResults - Maximum number of results to return (default: 10)
   * @returns Array of Job objects
   */
  async searchJobs(query: string, maxResults: number = 10): Promise<Job[]> {
    if (!this.apiKey) {
      throw new Error('Tavily API key is not configured. Please set VITE_TAVILY_API_KEY in your environment variables.')
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query.trim(),
          search_depth: 'basic',
          include_answer: false,
          include_images: false,
          include_raw_content: false,
          max_results: Math.min(maxResults, 20), // Limit to 20 for cost efficiency
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Tavily API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      // Validate response with Zod
      const validationResult = tavilyResponseSchema.safeParse(data)
      
      if (!validationResult.success) {
        console.error('Tavily response validation error:', validationResult.error)
        throw new Error('Invalid response format from Tavily API')
      }

      const validatedData = validationResult.data

      // Convert Tavily results to Job objects
      const jobs: Job[] = validatedData.results
        .slice(0, maxResults)
        .map((result: TavilyResult, index: number) => {
          // Extract company name from title or URL if possible
          const companyMatch = result.title.match(/(.+?)\s*[-–—]\s*(.+)/)
          const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company'
          const title = companyMatch ? companyMatch[2].trim() : result.title

          return {
            id: `job_${Date.now()}_${index}`,
            title: title || 'Job Listing',
            company: company,
            url: result.url,
            description: result.content || '',
            source: 'tavily' as const,
            jobSite: extractJobSite(result.url),
            createdAt: new Date().toISOString(),
            rawData: {
              score: result.score,
              published_date: result.published_date,
            },
          }
        })

      return jobs
    } catch (error) {
      console.error('Tavily search error:', error)
      
      if (error instanceof Error) {
        throw new Error(`Failed to search jobs: ${error.message}`)
      }
      
      throw new Error('Failed to search jobs: Unknown error')
    }
  }
}

// Export singleton instance
export const tavilyClient = new TavilyClient()

