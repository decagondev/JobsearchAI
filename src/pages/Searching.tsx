/**
 * Job search page with automatic skills extraction and job search
 * Shows progress UI and navigates to dashboard on completion
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { useExtractSkills } from '@/hooks/useExtractSkills'
import { useJobSearch } from '@/hooks/useJobSearch'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type SearchStage = 'extracting' | 'searching' | 'complete' | 'error'

export function Searching() {
  const navigate = useNavigate()
  const { formData, userId } = useOnboardingProgress()
  const [currentStage, setCurrentStage] = useState<SearchStage>('extracting')
  const [error, setError] = useState<string | null>(null)

  const {
    extract,
    isLoading: isExtracting,
    error: extractionError,
    isAlreadyExtracted,
    result: extractionResult,
  } = useExtractSkills({ userId, autoRestore: true })

  const {
    jobs,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useJobSearch({
    profile: formData.step1 && formData.step2
      ? {
          name: formData.step1.name,
          currentTitle: formData.step1.currentTitle,
          yearsExperience: formData.step1.yearsExperience,
          targetSalary: formData.step1.targetSalary,
          remotePreference: formData.step2.remotePreference,
          preferredLocations: formData.step2.preferredLocations,
          techStack: formData.step2.techStack,
          roleKeywords: formData.step2.roleKeywords,
        }
      : undefined,
    skills: extractionResult?.skills || [],
    userId: userId || undefined,
    enabled: isAlreadyExtracted || !!extractionResult, // Enable search when skills are extracted
    maxResults: 10,
    restoreFromStorage: true,
  })

  // Auto-trigger skills extraction on mount if needed
  useEffect(() => {
    if (!userId || !formData.resumeRaw) {
      setError('Missing required data. Please complete onboarding first.')
      setCurrentStage('error')
      return
    }

    const triggerExtraction = async () => {
      // If skills are already extracted, move to searching stage
      if (isAlreadyExtracted || extractionResult) {
        // Check if we have jobs - if so, we're already complete
        if (jobs.length > 0) {
          setCurrentStage('complete')
        } else {
          setCurrentStage('searching')
        }
        return
      }

      // Only trigger extraction if not already extracted and not currently extracting
      if (!isExtracting && !extractionResult) {
        setCurrentStage('extracting')
        await extract(formData.resumeRaw!, userId)
      }
    }

    triggerExtraction()
  }, [userId, formData.resumeRaw, isAlreadyExtracted, isExtracting, extractionResult, extract, jobs.length])

  // Update stage based on extraction status
  useEffect(() => {
    if (extractionError) {
      setCurrentStage('error')
      setError(extractionError)
    } else if (isAlreadyExtracted || extractionResult) {
      setCurrentStage('searching')
    }
  }, [extractionError, isAlreadyExtracted, extractionResult])

  // Update stage based on search status
  useEffect(() => {
    if (searchError) {
      setCurrentStage('error')
      setError(searchError.message)
    } else if (jobs.length > 0 && !isSearching) {
      setCurrentStage('complete')
      // Only auto-navigate if we just completed a search (not if we're restoring)
      // Check if we're in the middle of searching or if search just completed
      if (currentStage === 'searching') {
        // Navigate to dashboard after a short delay to show completion
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else if (currentStage === 'complete') {
        // If already complete (restored state), allow user to manually navigate
        // Don't auto-navigate on restore
      }
    }
  }, [searchError, jobs, isSearching, navigate, currentStage])

  // Calculate progress percentage
  const getProgress = (): number => {
    switch (currentStage) {
      case 'extracting':
        return isExtracting ? 33 : 0
      case 'searching':
        return isSearching ? 66 : 33
      case 'complete':
        return 100
      case 'error':
        return 0
      default:
        return 0
    }
  }

  const handleRetry = () => {
    setError(null)
    if (currentStage === 'error') {
      if (extractionError) {
        // Retry extraction
        if (userId && formData.resumeRaw) {
          extract(formData.resumeRaw, userId)
        }
      } else if (searchError) {
        // Retry search
        refetchSearch()
      }
    }
  }

  if (!userId || !formData.resumeRaw) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Missing Required Data</CardTitle>
            <CardDescription>
              Please complete the onboarding process first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/onboarding/step1')}>
              Go to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Searching for Jobs</h1>
          <p className="text-muted-foreground">
            We're analyzing your resume and finding the best job matches for you
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Progress</CardTitle>
            <CardDescription>Current stage of the job search process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} />
            </div>

            {/* Extraction Stage */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {isExtracting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : isAlreadyExtracted || extractionResult ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Extracting Skills from Resume</p>
                  <p className="text-sm text-muted-foreground">
                    {isExtracting
                      ? 'Analyzing your resume to identify skills and experience...'
                      : isAlreadyExtracted || extractionResult
                      ? `Extracted ${extractionResult?.skills.length || 0} skills`
                      : 'Waiting to start...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Stage */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : jobs.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Searching for Jobs</p>
                  <p className="text-sm text-muted-foreground">
                    {isSearching
                      ? 'Finding job opportunities that match your profile...'
                      : jobs.length > 0
                      ? `Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`
                      : 'Waiting for skills extraction...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Stage */}
            {currentStage === 'complete' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Search Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      Redirecting to dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {currentStage === 'error' && error && (
              <div className="space-y-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Error</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Preview */}
        {extractionResult && extractionResult.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Skills</CardTitle>
              <CardDescription>Skills identified from your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {extractionResult.skills.slice(0, 10).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {extractionResult.skills.length > 10 && (
                  <span className="px-2 py-1 text-muted-foreground text-sm">
                    +{extractionResult.skills.length - 10} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
