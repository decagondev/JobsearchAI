/**
 * JobCard component for displaying individual job listings
 * Shows match score, job details, and expandable accordion for more information
 */

import { useState } from 'react'
import { ExternalLink, Loader2, AlertCircle, MessageSquare, FileText, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from './MarkdownRenderer'
import { PrepChecklist } from './PrepChecklist'
import { useGeneratePrepPlan } from '@/hooks/useGeneratePrepPlan'
import { useSupportBot } from '@/contexts/SupportBotContext'
import { getMockInterviewPrompt, getTailorResumePrompt, getExplainJobPrompt } from '@/lib/prompts/jobCoachPrompts'
import type { Job } from '@/types/session'

export interface JobCardProps {
  job: Job
  onExpand?: () => void
}

/**
 * Get badge variant based on match score
 */
function getMatchScoreVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) {
    return 'default' // Green/high match
  } else if (score >= 60) {
    return 'secondary' // Yellow/medium match
  } else {
    return 'destructive' // Red/low match
  }
}

/**
 * Get badge color class based on match score
 */
function getMatchScoreColor(score: number): string {
  if (score >= 80) {
    return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50'
  } else if (score >= 60) {
    return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50'
  } else {
    return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50'
  }
}

/**
 * JobCard component for displaying job information
 * 
 * @param job - Job object to display
 * @param onExpand - Optional callback when accordion is expanded
 * 
 * @example
 * ```tsx
 * <JobCard job={job} onExpand={() => console.log('Expanded')} />
 * ```
 */
export function JobCard({ job, onExpand }: JobCardProps) {
  const matchScore = job.matchScore || 0
  const hasDescription = job.description && job.description.trim().length > 0
  const [isExpanded, setIsExpanded] = useState(false)
  const { openChat } = useSupportBot()

  // Lazy-load summary and tasks when accordion is expanded
  const {
    summary,
    tasks,
    isLoading: isGenerating,
    error: generationError,
  } = useGeneratePrepPlan({
    job,
    enabled: isExpanded && !job.summary, // Only generate if expanded and not already generated
  })

  // Use existing summary/tasks if available, otherwise use generated ones
  const displaySummary = job.summary || summary
  const displayTasks = job.prepTasks || tasks

  // Quick action handlers
  const handleMockInterview = () => {
    openChat('jobcoach', getMockInterviewPrompt(job), job.id)
  }

  const handleTailorResume = () => {
    openChat('jobcoach', getTailorResumePrompt(job), job.id)
  }

  const handleExplainJob = () => {
    openChat('jobcoach', getExplainJobPrompt(job), job.id)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-2">{job.title}</CardTitle>
            <CardDescription className="text-base font-medium text-foreground/80">
              {job.company}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge
              variant={getMatchScoreVariant(matchScore)}
              className={`${getMatchScoreColor(matchScore)} font-semibold`}
            >
              {matchScore.toFixed(0)}% Match
            </Badge>
            {job.url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                asChild
              >
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${job.title} at ${job.company} on external site`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMockInterview}
            className="flex-1 min-w-[100px]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Mock Interview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTailorResume}
            className="flex-1 min-w-[100px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Tailor Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplainJob}
            className="flex-1 min-w-[100px]"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Explain Job
          </Button>
        </div>

        {(hasDescription || displaySummary || displayTasks.length > 0) && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={(value) => {
              const expanded = value === 'details'
              setIsExpanded(expanded)
              if (expanded && onExpand) {
                onExpand()
              }
            }}
          >
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                View Details & Prep Plan
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  {/* Loading state */}
                  {isGenerating && !displaySummary && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating personalized prep plan...</span>
                    </div>
                  )}

                  {/* Error state */}
                  {generationError && !displaySummary && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Unable to generate summary</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can still view the job details below.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Job summary */}
                  {displaySummary && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Job Summary</h4>
                      <div className="text-sm">
                        <MarkdownRenderer content={displaySummary} />
                      </div>
                    </div>
                  )}

                  {/* Prep tasks */}
                  {displayTasks.length > 0 && (
                    <div>
                      <PrepChecklist tasks={displayTasks} jobId={job.id} />
                    </div>
                  )}

                  {/* Job description (fallback if no summary) */}
                  {!displaySummary && job.description && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Job Description</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.description}
                      </div>
                    </div>
                  )}

                  {/* External link */}
                  {job.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Full Job Posting
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

