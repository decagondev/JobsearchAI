/**
 * Layout component for onboarding wizard with progress indicator
 * Provides consistent navigation and progress tracking across all steps
 */

import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  onNext?: () => void
  onBack?: () => void
  canProceed?: boolean
  showNavigation?: boolean
}

const TOTAL_STEPS = 4
const STEP_LABELS = ['Basics', 'Preferences', 'Resume', 'Review']

/**
 * Layout wrapper for onboarding wizard steps
 * Displays progress bar and navigation controls
 */
export function OnboardingLayout({
  children,
  currentStep,
  onNext,
  onBack,
  canProceed = true,
  showNavigation = true,
}: OnboardingLayoutProps) {
  const navigate = useNavigate()
  const { goToStep } = useOnboardingProgress()

  const progress = (currentStep / TOTAL_STEPS) * 100

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (currentStep < TOTAL_STEPS) {
      navigate(`/onboarding/step${currentStep + 1}`)
      goToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (currentStep > 1) {
      navigate(`/onboarding/step${currentStep - 1}`)
      goToStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Step {currentStep} of {TOTAL_STEPS}</h2>
            <span className="text-sm text-muted-foreground">
              {STEP_LABELS[currentStep - 1]}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {STEP_LABELS.map((label, index) => (
              <span
                key={index}
                className={index + 1 <= currentStep ? 'text-primary font-medium' : ''}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-6">
          {children}
        </div>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed || currentStep === TOTAL_STEPS}
              className="flex items-center gap-2"
            >
              {currentStep === TOTAL_STEPS ? 'Complete' : 'Next'}
              {currentStep < TOTAL_STEPS && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

