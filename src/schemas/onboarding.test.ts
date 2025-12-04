/**
 * Tests for onboarding Zod schemas
 */

import { describe, it, expect } from 'vitest'
import { step1BasicsSchema, step2PreferencesSchema, onboardingSchema } from './onboarding'

describe('step1BasicsSchema', () => {
  it('should validate valid basic data', () => {
    const valid = {
      name: 'John Doe',
      currentTitle: 'Software Engineer',
      yearsExperience: 5,
      targetSalary: 100000,
    }
    expect(step1BasicsSchema.parse(valid)).toEqual(valid)
  })

  it('should require name', () => {
    const invalid = {
      currentTitle: 'Software Engineer',
    }
    expect(() => step1BasicsSchema.parse(invalid)).toThrow()
  })

  it('should reject negative years of experience', () => {
    const invalid = {
      name: 'John Doe',
      yearsExperience: -1,
    }
    expect(() => step1BasicsSchema.parse(invalid)).toThrow()
  })

  it('should reject negative salary', () => {
    const invalid = {
      name: 'John Doe',
      targetSalary: -1000,
    }
    expect(() => step1BasicsSchema.parse(invalid)).toThrow()
  })

  it('should allow optional fields', () => {
    const minimal = {
      name: 'John Doe',
    }
    expect(step1BasicsSchema.parse(minimal)).toEqual(minimal)
  })

  it('should enforce name max length', () => {
    const invalid = {
      name: 'a'.repeat(101),
    }
    expect(() => step1BasicsSchema.parse(invalid)).toThrow()
  })
})

describe('step2PreferencesSchema', () => {
  it('should validate valid preferences data', () => {
    const valid = {
      remotePreference: 'remote' as const,
      preferredLocations: ['San Francisco', 'New York'],
      techStack: ['React', 'TypeScript'],
      roleKeywords: ['Full Stack', 'Frontend'],
    }
    expect(step2PreferencesSchema.parse(valid)).toEqual(valid)
  })

  it('should allow all optional fields', () => {
    const minimal = {}
    expect(step2PreferencesSchema.parse(minimal)).toEqual({
      preferredLocations: [],
      techStack: [],
      roleKeywords: [],
    })
  })

  it('should validate remotePreference enum', () => {
    const invalid = {
      remotePreference: 'invalid',
    }
    expect(() => step2PreferencesSchema.parse(invalid)).toThrow()
  })

  it('should reject empty strings in arrays', () => {
    const invalid = {
      preferredLocations: ['', 'Valid'],
    }
    expect(() => step2PreferencesSchema.parse(invalid)).toThrow()
  })

  it('should default empty arrays', () => {
    const data = {
      remotePreference: 'hybrid' as const,
    }
    const result = step2PreferencesSchema.parse(data)
    expect(result.preferredLocations).toEqual([])
    expect(result.techStack).toEqual([])
    expect(result.roleKeywords).toEqual([])
  })
})

describe('onboardingSchema', () => {
  it('should validate complete onboarding data', () => {
    const valid = {
      name: 'John Doe',
      currentTitle: 'Software Engineer',
      yearsExperience: 5,
      targetSalary: 100000,
      remotePreference: 'remote' as const,
      preferredLocations: ['San Francisco'],
      techStack: ['React'],
      roleKeywords: ['Full Stack'],
      resumeRaw: 'Resume text here...',
    }
    expect(onboardingSchema.parse(valid)).toEqual(valid)
  })

  it('should allow optional resumeRaw', () => {
    const valid = {
      name: 'John Doe',
    }
    expect(onboardingSchema.parse(valid)).toBeDefined()
  })
})

