/**
 * JobCard component for displaying individual job listings
 * Shows match score, job details, and expandable accordion for more information
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ExternalLink, Loader2, AlertCircle, MessageSquare, FileText, HelpCircle, Heart, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MarkdownRenderer } from './MarkdownRenderer'
import { PrepChecklist } from './PrepChecklist'
import { useGeneratePrepPlan } from '@/hooks/useGeneratePrepPlan'
import { useSupportBot } from '@/contexts/SupportBotContext'
import { useJobManagement } from '@/hooks/useJobManagement'
import { getMockInterviewPrompt, getTailorResumePrompt, getExplainJobPrompt } from '@/lib/prompts/jobCoachPrompts'
import type { Job, ApplicationStatus } from '@/types/session'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [notes, setNotes] = useState(job.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newMaterialLabel, setNewMaterialLabel] = useState('')
  const [newMaterialUrl, setNewMaterialUrl] = useState('')
  const isUpdatingRef = useRef(false)
  const { openChat } = useSupportBot()
  const {
    toggleFavorite,
    updateApplicationStatus,
    updateNotes,
    addCustomLink,
    removeCustomLink,
    addSupportingMaterial,
    removeSupportingMaterial,
  } = useJobManagement()

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
    openChat(getMockInterviewPrompt(job), job.id)
  }

  const handleTailorResume = () => {
    openChat(getTailorResumePrompt(job), job.id)
  }

  const handleExplainJob = () => {
    openChat(getExplainJobPrompt(job), job.id)
  }

  // Job management handlers - memoized to prevent re-renders
  const handleToggleFavorite = useCallback(async () => {
    try {
      await toggleFavorite(job.id)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }, [job.id, toggleFavorite])

  const handleStatusChange = useCallback(async (status: ApplicationStatus) => {
    // Prevent multiple simultaneous updates
    if (isUpdatingRef.current) return
    if (status === job.applicationStatus) return // No change needed
    
    isUpdatingRef.current = true
    try {
      await updateApplicationStatus(job.id, status)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      // Use setTimeout to allow React to finish the current render cycle
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100)
    }
  }, [job.id, job.applicationStatus, updateApplicationStatus])

  // Memoize the status value to prevent Select re-renders
  const statusValue = useMemo(() => job.applicationStatus || 'not_applied', [job.applicationStatus])
  
  // Update local notes when job prop changes (but only if not currently editing)
  useEffect(() => {
    if (!isEditingNotes && job.notes !== notes) {
      setNotes(job.notes || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.notes, isEditingNotes])

  const handleSaveNotes = async () => {
    try {
      await updateNotes(job.id, notes)
      setIsEditingNotes(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
    }
  }

  const handleAddLink = async () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return
    try {
      await addCustomLink(job.id, { label: newLinkLabel, url: newLinkUrl })
      setNewLinkLabel('')
      setNewLinkUrl('')
    } catch (error) {
      console.error('Failed to add link:', error)
    }
  }

  const handleRemoveLink = async (index: number) => {
    try {
      await removeCustomLink(job.id, index)
    } catch (error) {
      console.error('Failed to remove link:', error)
    }
  }

  const handleAddMaterial = async () => {
    if (!newMaterialLabel.trim() || !newMaterialUrl.trim()) return
    try {
      await addSupportingMaterial(job.id, { label: newMaterialLabel, url: newMaterialUrl })
      setNewMaterialLabel('')
      setNewMaterialUrl('')
    } catch (error) {
      console.error('Failed to add material:', error)
    }
  }

  const handleRemoveMaterial = async (index: number) => {
    try {
      await removeSupportingMaterial(job.id, index)
    } catch (error) {
      console.error('Failed to remove material:', error)
    }
  }

  const getStatusColor = (status?: ApplicationStatus): string => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50'
      case 'interviewing':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50'
      case 'offer':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50'
      case 'rejected':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/50'
    }
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleToggleFavorite}
                aria-label={job.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`h-4 w-4 ${job.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
              </Button>
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
            <Badge
              variant={getMatchScoreVariant(matchScore)}
              className={`${getMatchScoreColor(matchScore)} font-semibold`}
            >
              {matchScore.toFixed(0)}% Match
            </Badge>
            {job.applicationStatus && (
              <Badge className={getStatusColor(job.applicationStatus)}>
                {job.applicationStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Application Status Selector */}
        <div className="mb-4">
          <Select
            value={statusValue}
            onValueChange={(value) => {
              // Only update if value actually changed
              const newStatus = value as ApplicationStatus
              if (newStatus !== job.applicationStatus) {
                handleStatusChange(newStatus)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Application Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_applied">Not Applied</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMockInterview}
            className="flex-1 md:flex-1 lg:flex-none min-w-[100px] lg:min-w-[140px]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Mock Interview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTailorResume}
            className="flex-1 md:flex-1 lg:flex-none min-w-[100px] lg:min-w-[140px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Tailor Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplainJob}
            className="flex-1 md:flex-1 lg:flex-none min-w-[100px] lg:min-w-[140px]"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Explain Job
          </Button>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          onValueChange={(value) => {
            const expanded = value === 'details' || value === 'manage'
            setIsExpanded(value === 'details')
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

            {/* Manage Job Section */}
            <AccordionItem value="manage" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                Manage Job
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  {/* Notes Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Notes</h4>
                      {!isEditingNotes ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingNotes(true)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveNotes}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditingNotes(false)
                              setNotes(job.notes || '')
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditingNotes ? (
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes about this job..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap p-2 bg-muted rounded-md min-h-[60px]">
                        {job.notes || 'No notes yet. Click Edit to add notes.'}
                      </div>
                    )}
                  </div>

                  {/* Custom Links Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Custom Links</h4>
                    {job.customLinks && job.customLinks.length > 0 && (
                      <div className="space-y-2">
                        {job.customLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-sm text-primary hover:underline"
                            >
                              {link.label}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveLink(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Link label"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddLink}
                        disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Supporting Materials Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Supporting Materials</h4>
                    {job.supportingMaterials && job.supportingMaterials.length > 0 && (
                      <div className="space-y-2">
                        {job.supportingMaterials.map((material, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-sm text-primary hover:underline"
                            >
                              {material.label}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveMaterial(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Material label"
                        value={newMaterialLabel}
                        onChange={(e) => setNewMaterialLabel(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={newMaterialUrl}
                        onChange={(e) => setNewMaterialUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddMaterial}
                        disabled={!newMaterialLabel.trim() || !newMaterialUrl.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
      </CardContent>
    </Card>
  )
}

