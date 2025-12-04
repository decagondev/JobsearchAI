/**
 * JobList component for displaying a grid of job cards
 * Handles empty state and responsive grid layout
 */

import { Briefcase } from 'lucide-react'
import { JobCard } from './JobCard'
import { Button } from '@/components/ui/button'
import type { Job } from '@/types/session'

export interface JobListProps {
  jobs: Job[]
  onJobExpand?: (job: Job) => void
  onStartNewSearch?: () => void
}

/**
 * JobList component for displaying multiple job cards in a grid
 * 
 * @param jobs - Array of jobs to display
 * @param onJobExpand - Optional callback when a job card is expanded
 * @param onStartNewSearch - Optional callback for empty state action
 * 
 * @example
 * ```tsx
 * <JobList jobs={matchedJobs} onJobExpand={(job) => loadDetails(job)} />
 * ```
 */
export function JobList({ jobs, onJobExpand, onStartNewSearch }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          We couldn't find any jobs matching your criteria. Try adjusting your search preferences or start a new search.
        </p>
        {onStartNewSearch && (
          <Button onClick={onStartNewSearch} variant="default">
            Start New Search
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onExpand={() => {
            if (onJobExpand) {
              onJobExpand(job)
            }
          }}
        />
      ))}
    </div>
  )
}

