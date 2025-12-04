/**
 * Step 1: Basic Information Form
 * Collects name, current title, years of experience, and target salary
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { OnboardingLayout } from '@/components/OnboardingLayout'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { step1BasicsSchema, type Step1BasicsData } from '@/schemas/onboarding'

export function Step1Basics() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useOnboardingProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<Step1BasicsData>({
    resolver: zodResolver(step1BasicsSchema),
    defaultValues: formData.step1 || {
      name: '',
      currentTitle: '',
      yearsExperience: undefined,
      targetSalary: undefined,
    },
  })

  const onSubmit = async (data: Step1BasicsData) => {
    try {
      setIsSubmitting(true)
      await updateFormData(1, data)
      navigate('/onboarding/step2')
    } catch (error) {
      console.error('Failed to save step 1 data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    form.handleSubmit(onSubmit)()
  }

  return (
    <OnboardingLayout
      currentStep={1}
      onNext={handleNext}
      canProceed={form.formState.isValid && !isSubmitting}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Basic Information</h1>
          <p className="text-muted-foreground">
            Tell us a bit about yourself to get started
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Software Engineer"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5"
                      min="0"
                      max="50"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? undefined : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Salary (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      min="0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? undefined : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  )
}

