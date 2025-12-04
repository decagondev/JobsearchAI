/**
 * Zod schemas for onboarding wizard form validation
 */

import { z } from 'zod'

/**
 * Schema for Step 1: Basic Information
 */
export const step1BasicsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  currentTitle: z.string().max(100, 'Title must be less than 100 characters').optional(),
  yearsExperience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience must be less than 50 years').optional(),
  targetSalary: z.number().min(0, 'Salary cannot be negative').optional(),
})

export type Step1BasicsData = z.infer<typeof step1BasicsSchema>

/**
 * Schema for Step 2: Preferences
 */
export const step2PreferencesSchema = z.object({
  remotePreference: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  preferredLocations: z.array(z.string().min(1, 'Location cannot be empty')),
  techStack: z.array(z.string().min(1, 'Tech stack item cannot be empty')),
  roleKeywords: z.array(z.string().min(1, 'Role keyword cannot be empty')),
})

export type Step2PreferencesData = z.infer<typeof step2PreferencesSchema>

/**
 * Combined schema for complete onboarding data
 */
export const onboardingSchema = step1BasicsSchema.merge(step2PreferencesSchema).extend({
  resumeRaw: z.string().optional(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

