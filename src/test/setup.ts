/**
 * Vitest setup file
 * Configures test environment and global mocks
 */

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Note: expect is available globally when globals: true is set in vitest.config.ts
// Extend Vitest's expect with custom matchers if needed:
// import { expect } from 'vitest'
// expect.extend({ ... })

