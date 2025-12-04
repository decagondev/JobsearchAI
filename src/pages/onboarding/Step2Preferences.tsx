/**
 * Step 2: Preferences Form
 * Collects remote preference, locations, tech stack, and role keywords
 */

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { OnboardingLayout } from '@/components/OnboardingLayout'
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress'
import { step2PreferencesSchema, type Step2PreferencesData } from '@/schemas/onboarding'

export function Step2Preferences() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useOnboardingProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultFormValues: Step2PreferencesData = {
    remotePreference: formData.step2?.remotePreference,
    preferredLocations: formData.step2?.preferredLocations ?? [],
    techStack: formData.step2?.techStack ?? [],
    roleKeywords: formData.step2?.roleKeywords ?? [],
  }

  const form = useForm<Step2PreferencesData>({
    resolver: zodResolver(step2PreferencesSchema),
    defaultValues: defaultFormValues,
  })

  const locationsArray = useFieldArray({
    control: form.control,
    // @ts-ignore - react-hook-form type inference issue with zodResolver
    name: 'preferredLocations',
  })

  const techStackArray = useFieldArray({
    control: form.control,
    // @ts-ignore - react-hook-form type inference issue with zodResolver
    name: 'techStack',
  })

  const roleKeywordsArray = useFieldArray({
    control: form.control,
    // @ts-ignore - react-hook-form type inference issue with zodResolver
    name: 'roleKeywords',
  })

  const [newLocation, setNewLocation] = useState('')
  const [newTech, setNewTech] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  const addLocation = () => {
    if (newLocation.trim()) {
      locationsArray.append(newLocation.trim())
      setNewLocation('')
    }
  }

  const addTech = () => {
    if (newTech.trim()) {
      techStackArray.append(newTech.trim())
      setNewTech('')
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      roleKeywordsArray.append(newKeyword.trim())
      setNewKeyword('')
    }
  }

  const onSubmit = async (data: Step2PreferencesData) => {
    try {
      setIsSubmitting(true)
      await updateFormData(2, data)
      navigate('/onboarding/step3')
    } catch (error) {
      console.error('Failed to save step 2 data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    form.handleSubmit(onSubmit)()
  }

  return (
    <OnboardingLayout
      currentStep={2}
      onNext={handleNext}
      canProceed={!isSubmitting}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Preferences</h1>
          <p className="text-muted-foreground">
            Help us find the perfect opportunities for you
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="remotePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Preference</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredLocations"
              render={() => (
                <FormItem>
                  <FormLabel>Preferred Locations</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., San Francisco, CA"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addLocation()
                          }
                        }}
                      />
                      <Button type="button" onClick={addLocation} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {locationsArray.fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-md"
                        >
                          <span className="text-sm">{form.watch(`preferredLocations.${index}`)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => locationsArray.remove(index)}
                            className="h-4 w-4"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techStack"
              render={() => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., React, Python, TypeScript"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTech()
                          }
                        }}
                      />
                      <Button type="button" onClick={addTech} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {techStackArray.fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-md"
                        >
                          <span className="text-sm">{form.watch(`techStack.${index}`)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => techStackArray.remove(index)}
                            className="h-4 w-4"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleKeywords"
              render={() => (
                <FormItem>
                  <FormLabel>Role Keywords</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Full Stack, Backend, DevOps"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyword} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roleKeywordsArray.fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-md"
                        >
                          <span className="text-sm">{form.watch(`roleKeywords.${index}`)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => roleKeywordsArray.remove(index)}
                            className="h-4 w-4"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
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

