/**
 * Reusable progress indicator component for search operations
 * Shows current stage, progress bar, and loading states
 */

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface SearchProgressStage {
  id: string
  label: string
  description: string
  status: 'pending' | 'loading' | 'complete' | 'error'
  error?: string
}

export interface SearchProgressProps {
  title?: string
  description?: string
  stages: SearchProgressStage[]
  overallProgress?: number
  showProgressBar?: boolean
}

/**
 * Reusable progress indicator component
 * 
 * @example
 * ```tsx
 * <SearchProgress
 *   title="Search Progress"
 *   stages={[
 *     { id: '1', label: 'Extracting Skills', description: '...', status: 'complete' },
 *     { id: '2', label: 'Searching Jobs', description: '...', status: 'loading' },
 *   ]}
 *   overallProgress={50}
 * />
 * ```
 */
export function SearchProgress({
  title = 'Progress',
  description = 'Current operation status',
  stages,
  overallProgress,
  showProgressBar = true,
}: SearchProgressProps) {
  const calculatedProgress =
    overallProgress ??
    (stages.length > 0
      ? (stages.filter((s) => s.status === 'complete').length / stages.length) * 100
      : 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showProgressBar && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculatedProgress)}%</span>
            </div>
            <Progress value={calculatedProgress} />
          </div>
        )}

        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center gap-3">
                {stage.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {stage.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {stage.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {stage.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{stage.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {stage.status === 'error' && stage.error
                      ? stage.error
                      : stage.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

