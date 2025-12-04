/**
 * Dashboard page for displaying matched jobs
 * Uses useJobMatcher to rank and display jobs by similarity score
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, RefreshCw, RotateCw } from 'lucide-react'
import { useJobMatcher } from '@/hooks/useJobMatcher'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { useMemoryBank } from '@/hooks/useMemoryBank'
import { vectorDB } from '@/lib/vectorDB'
import { JobList } from '@/components/JobList'
import { JobFilters } from '@/components/JobFilters'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Job } from '@/types/session'

/**
 * Dashboard page component
 * Displays matched jobs with loading and error states
 */
export function Dashboard() {
  const navigate = useNavigate()
  const { matchedJobs, isLoading, error, refetch } = useJobMatcher()
  const { userId } = useOnboardingProgress()
  const memoryBank = useMemoryBank()
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(matchedJobs)
  const previousMatchedJobsRef = useRef<Job[]>([])

  // Update filtered jobs when matched jobs change (only if actually different)
  useEffect(() => {
    // Compare by length and IDs to avoid unnecessary updates
    const currentIds = matchedJobs.map(j => j.id).sort().join(',')
    const previousIds = previousMatchedJobsRef.current.map(j => j.id).sort().join(',')
    
    if (currentIds !== previousIds) {
      setFilteredJobs(matchedJobs)
      previousMatchedJobsRef.current = matchedJobs
    }
  }, [matchedJobs])

  // Memoize the callback to prevent infinite loops
  const handleFilteredJobsChange = useCallback((jobs: Job[]) => {
    setFilteredJobs(jobs)
  }, [])

  // Auto-embed jobs in vectorDB when Dashboard loads
  // Also ensure vectorDB is deserialized from storage
  useEffect(() => {
    const embedJobs = async () => {
      if (!userId) return

      try {
        // Ensure vectorDB is deserialized (restored from storage)
        await vectorDB.deserialize()

        // Load session to get jobs
        const session = await memoryBank.loadSession(userId)
        const jobs = session?.jobs || []

        if (jobs.length === 0) return

        // Get existing vectors to check which jobs are already embedded
        const existingVectors = await vectorDB.getAll()
        const embeddedJobIds = new Set(
          existingVectors
            .filter((v) => v.metadata?.type === 'job')
            .map((v) => v.metadata?.jobId as string)
            .filter(Boolean)
        )

        // Embed jobs that aren't already embedded
        const jobsToEmbed = jobs.filter((job) => !embeddedJobIds.has(job.id))

        if (jobsToEmbed.length > 0) {
          // Embed all jobs in parallel
          await Promise.all(
            jobsToEmbed.map((job) =>
              vectorDB.embedJob({
                id: job.id,
                title: job.title,
                company: job.company,
                description: job.description,
              })
            )
          )
        }
      } catch (error) {
        console.error('Failed to embed jobs in vectorDB:', error)
        // Don't throw - this is a background operation
      }
    }

    embedJobs()
  }, [userId, memoryBank])

  const handleStartNewSearch = () => {
    navigate('/onboarding/step1')
  }

  const handleRetry = () => {
    refetch()
  }

  const handleRefresh = async () => {
    // Force refetch to recalculate match scores
    await refetch()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Matches</h1>
            <p className="text-muted-foreground">
              Jobs ranked by how well they match your profile and skills
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0"
          >
            <RotateCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Matches
          </Button>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Matching jobs to your profile...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Jobs
              </CardTitle>
              <CardDescription>
                {error.message || 'Failed to load job matches. Please try again.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRetry} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            <JobFilters
              jobs={matchedJobs}
              onFilteredJobsChange={handleFilteredJobsChange}
            />
            <JobList
              jobs={filteredJobs}
              onStartNewSearch={handleStartNewSearch}
            />
          </>
        )}
      </div>
    </div>
  )
}

