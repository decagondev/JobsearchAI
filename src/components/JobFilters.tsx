/**
 * JobFilters component for filtering and searching job matches
 * Provides search, status filter, favorite filter, and sort options
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import type { Job, ApplicationStatus } from '@/types/session'

export type SortOption = 'matchScore' | 'title' | 'company' | 'appliedDate'

export interface JobFiltersProps {
  jobs: Job[]
  onFilteredJobsChange: (filteredJobs: Job[]) => void
}

/**
 * JobFilters component
 * 
 * @param jobs - Array of all jobs to filter
 * @param onFilteredJobsChange - Callback when filtered jobs change
 * 
 * @example
 * ```tsx
 * <JobFilters jobs={allJobs} onFilteredJobsChange={setFilteredJobs} />
 * ```
 */
export function JobFilters({ jobs, onFilteredJobsChange }: JobFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [minMatch, setMinMatch] = useState(40)

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.summary?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((job) => {
        // Treat undefined/null as 'not_applied'
        const jobStatus = job.applicationStatus || 'not_applied'
        return jobStatus === statusFilter
      })
    }

    // Favorites filter
    if (favoritesOnly) {
      result = result.filter((job) => job.isFavorite === true)
    }

    // Match percentage filter
    if (minMatch > 0) {
      result = result.filter((job) => {
        const score = job.matchScore || 0
        return score >= minMatch
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.matchScore || 0) - (a.matchScore || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'company':
          return a.company.localeCompare(b.company)
        case 'appliedDate':
          const aDate = a.appliedDate ? new Date(a.appliedDate).getTime() : 0
          const bDate = b.appliedDate ? new Date(b.appliedDate).getTime() : 0
          return bDate - aDate
        default:
          return 0
      }
    })

    return result
  }, [jobs, searchQuery, statusFilter, favoritesOnly, sortBy, minMatch])

  // Notify parent of filtered jobs changes - use ref to prevent infinite loops
  const previousFilteredJobsRef = useRef<string>('')
  
  useEffect(() => {
    const currentIds = filteredJobs.map(j => j.id).sort().join(',')
    if (currentIds !== previousFilteredJobsRef.current) {
      previousFilteredJobsRef.current = currentIds
      onFilteredJobsChange(filteredJobs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setFavoritesOnly(false)
    setSortBy('matchScore')
    setMinMatch(40)
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || favoritesOnly || minMatch > 40

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={favoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            Favorites
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Status:</label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_applied">Not Applied</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matchScore">Match Score</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="appliedDate">Applied Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="min-match" className="text-sm text-muted-foreground whitespace-nowrap">
            Min Match:
          </label>
          <Input
            id="min-match"
            type="number"
            min={0}
            max={100}
            value={minMatch}
            onChange={(e) => {
              const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
              setMinMatch(value)
            }}
            className="w-20 h-8 text-sm"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        {/* Results count */}
        <div className="ml-auto">
          <Badge variant="secondary">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </Badge>
        </div>
      </div>
    </div>
  )
}

