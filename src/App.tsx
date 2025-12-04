import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Landing } from "@/pages/Landing"
import { About } from "@/pages/About"
import { Features } from "@/pages/Features"
import { Onboarding } from "@/pages/Onboarding"
import { Searching } from "@/pages/Searching"
import { Dashboard } from "@/pages/Dashboard"
import { Settings } from "@/pages/Settings"
import { SupportBot } from "@/components/SupportBot"
import { SupportBotProvider } from "@/contexts/SupportBotContext"
import { memoryBank } from "@/lib/memoryBank"
import { useSessionPersistence, useAutoSaveSession } from "@/hooks/useSessionPersistence"

function AppContent() {
  const { restoreSessionState } = useSessionPersistence()

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userId = await memoryBank.getCurrentUserId()
        if (userId) {
          await restoreSessionState(userId)
        }
      } catch (error) {
        console.error('Failed to restore session on mount:', error)
      }
    }

    restoreSession()
  }, [restoreSessionState])

  // Get userId for auto-save
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUserId = async () => {
      const id = await memoryBank.getCurrentUserId()
      setUserId(id)
    }
    getUserId()
  }, [])

  // Auto-save session periodically and on unload
  useAutoSaveSession(userId)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/onboarding/*" element={<Onboarding />} />
          <Route path="/searching" element={<Searching />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <SupportBot />
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <SupportBotProvider>
      <AppContent />
    </SupportBotProvider>
  )
}

export default App