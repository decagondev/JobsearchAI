/**
 * Main onboarding page with nested routes for wizard steps
 * Handles routing and step navigation
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Step1Basics } from './onboarding/Step1Basics'
import { Step2Preferences } from './onboarding/Step2Preferences'
import { Step3Resume } from './onboarding/Step3Resume'
import { Step4Review } from './onboarding/Step4Review'

/**
 * Onboarding wizard page
 * Routes to appropriate step based on URL
 */
export function Onboarding() {
  const location = useLocation()

  // Redirect root /onboarding to step1
  if (location.pathname === '/onboarding') {
    return <Navigate to="/onboarding/step1" replace />
  }

  return (
    <Routes>
      <Route path="step1" element={<Step1Basics />} />
      <Route path="step2" element={<Step2Preferences />} />
      <Route path="step3" element={<Step3Resume />} />
      <Route path="step4" element={<Step4Review />} />
      <Route path="*" element={<Navigate to="/onboarding/step1" replace />} />
    </Routes>
  )
}

