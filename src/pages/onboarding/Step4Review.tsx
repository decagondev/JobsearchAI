/**
 * Step 4: Review & Start Search
 * Displays summary of all collected data with edit navigation
 */

import { useNavigate } from 'react-router-dom'
import { Edit, ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OnboardingLayout } from '@/components/OnboardingLayout'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'

export function Step4Review() {
  const navigate = useNavigate()
  const { formData } = useOnboardingProgress()

  const handleEditStep = (step: number) => {
    navigate(`/onboarding/step${step}`)
  }

  const handleStartSearch = () => {
    // Navigate to searching page (will be created in Epic 2)
    navigate('/searching')
  }

  const hasRequiredData = formData.step1?.name && formData.resumeRaw

  return (
    <OnboardingLayout
      currentStep={4}
      showNavigation={false}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Review Your Information</h1>
          <p className="text-muted-foreground">
            Please review your information before starting your job search
          </p>
        </div>

        {/* Basics Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Step 1 details</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStep(1)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{formData.step1?.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Title</p>
                <p className="font-medium">{formData.step1?.currentTitle || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
                <p className="font-medium">
                  {formData.step1?.yearsExperience !== undefined
                    ? `${formData.step1.yearsExperience} years`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Salary</p>
                <p className="font-medium">
                  {formData.step1?.targetSalary
                    ? `$${formData.step1.targetSalary.toLocaleString()}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Job Preferences</CardTitle>
                <CardDescription>Step 2 details</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStep(2)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Work Preference</p>
              <p className="font-medium capitalize">
                {formData.step2?.remotePreference || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Preferred Locations</p>
              {formData.step2?.preferredLocations && formData.step2.preferredLocations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.step2.preferredLocations.map((location, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">None specified</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tech Stack</p>
              {formData.step2?.techStack && formData.step2.techStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.step2.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">None specified</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Role Keywords</p>
              {formData.step2?.roleKeywords && formData.step2.roleKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.step2.roleKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary rounded-md text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">None specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resume</CardTitle>
                <CardDescription>Step 3 details</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStep(3)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.resumeRaw ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resume uploaded</p>
                <p className="font-medium">
                  {formData.resumeRaw.length.toLocaleString()} characters
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.resumeRaw.substring(0, 200)}...
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No resume uploaded</p>
            )}
          </CardContent>
        </Card>

        {/* Start Search Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleStartSearch}
            disabled={!hasRequiredData}
            className="flex items-center gap-2"
          >
            Start My Job Search
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!hasRequiredData && (
          <p className="text-center text-sm text-muted-foreground">
            Please complete at least Step 1 (Name) and Step 3 (Resume) to continue
          </p>
        )}
      </div>
    </OnboardingLayout>
  )
}

