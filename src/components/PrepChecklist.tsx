/**
 * PrepChecklist component for displaying and managing prep tasks
 * Shows tasks as checkboxes with priority badges and persists completion state
 */

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useMemoryBank } from '@/hooks/useMemoryBank'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import type { PrepTask, Job } from '@/types/session'

export interface PrepChecklistProps {
  tasks: PrepTask[]
  jobId: string
}

/**
 * Get badge variant based on priority
 */
function getPriorityVariant(priority?: string): 'default' | 'secondary' | 'outline' {
  switch (priority) {
    case 'high':
      return 'default'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'outline'
    default:
      return 'secondary'
  }
}

/**
 * Get priority label
 */
function getPriorityLabel(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'Medium'
  }
}

/**
 * PrepChecklist component for displaying prep tasks
 * 
 * @param tasks - Array of prep tasks to display
 * @param jobId - ID of the job these tasks belong to
 * 
 * @example
 * ```tsx
 * <PrepChecklist tasks={prepTasks} jobId={job.id} />
 * ```
 */
export function PrepChecklist({ tasks, jobId }: PrepChecklistProps) {
  const memoryBank = useMemoryBank()
  const { userId } = useOnboardingProgress()
  const [localTasks, setLocalTasks] = useState<PrepTask[]>(tasks)

  // Update local tasks when prop changes
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  /**
   * Handle task completion toggle
   */
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!userId) {
      console.error('User ID is required to update tasks')
      return
    }

    // Update local state immediately for responsive UI
    setLocalTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      )
    )

    try {
      // Load session to get current jobs
      const session = await memoryBank.loadSession(userId)
      if (!session?.jobs) {
        console.error('No jobs found in session')
        return
      }

      // Find and update the job's prep tasks
      const updatedJobs: Job[] = session.jobs.map((job) => {
        if (job.id === jobId && job.prepTasks) {
          return {
            ...job,
            prepTasks: job.prepTasks.map((task) =>
              task.id === taskId ? { ...task, completed } : task
            ),
          }
        }
        return job
      })

      // Save updated jobs to MemoryBank
      await memoryBank.updateJobs(userId, updatedJobs)
    } catch (error) {
      console.error('Failed to update task completion:', error)
      // Revert local state on error
      setLocalTasks(tasks)
    }
  }

  if (localTasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No preparation tasks available for this job.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Preparation Tasks</h4>
      <div className="space-y-3">
        {localTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={(checked) => {
                handleTaskToggle(task.id, checked === true)
              }}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={task.id}
                className={`text-sm font-medium cursor-pointer ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </Label>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
            </div>
            {task.priority && (
              <Badge
                variant={getPriorityVariant(task.priority)}
                className="shrink-0 text-xs"
              >
                {getPriorityLabel(task.priority)}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

