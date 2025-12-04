/**
 * Step 3: Resume Upload
 * Wraps ResumeUpload component and handles navigation
 */

import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { OnboardingLayout } from '@/components/OnboardingLayout'
import { ResumeUpload } from '@/components/ResumeUpload'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'

export function Step3Resume() {
  const navigate = useNavigate()
  const { formData } = useOnboardingProgress()
  const hasResume = !!formData.resumeRaw

  const handleUploadSuccess = () => {
    // Resume is saved via the hook, just need to enable navigation
  }

  const handleNext = () => {
    if (hasResume) {
      navigate('/onboarding/step4')
    }
  }

  return (
    <OnboardingLayout
      currentStep={3}
      onNext={handleNext}
      canProceed={hasResume}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
          <p className="text-muted-foreground">
            Upload your resume in PDF or text format, or paste it directly
          </p>
        </div>

        {hasResume && (
          <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 rounded-md">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Resume uploaded successfully ({formData.resumeRaw?.length.toLocaleString()} characters)
            </span>
          </div>
        )}

        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </OnboardingLayout>
  )
}

