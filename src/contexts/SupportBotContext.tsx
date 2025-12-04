/**
 * React Context for managing Jobby (Jobsearch Assistant) state globally
 * Allows components to open chat with pre-filled prompts and job context
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface JobbyContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openChat: (initialMessage?: string, contextJobId?: string) => void
  initialMessage: string | null
  setInitialMessage: (message: string | null) => void
  contextJobId: string | null
  setContextJobId: (jobId: string | null) => void
}

const JobbyContext = createContext<JobbyContextValue | undefined>(undefined)

interface JobbyProviderProps {
  children: ReactNode
}

/**
 * Provider component for Jobby (Jobsearch Assistant) context
 * Wraps the app to provide global chat state management
 * 
 * @example
 * ```tsx
 * <JobbyProvider>
 *   <App />
 * </JobbyProvider>
 * ```
 */
export function JobbyProvider({ children }: JobbyProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [contextJobId, setContextJobId] = useState<string | null>(null)

  /**
   * Open chat with optional initial message and job context
   * 
   * @param initialMessage - Optional pre-filled message for the input
   * @param contextJobId - Optional job ID to filter RAG context
   */
  const openChat = useCallback(
    (newInitialMessage?: string, newContextJobId?: string) => {
      if (newInitialMessage) {
        setInitialMessage(newInitialMessage)
      }
      if (newContextJobId) {
        setContextJobId(newContextJobId)
      }
      setIsOpen(true)
    },
    []
  )

  return (
    <JobbyContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openChat,
        initialMessage,
        setInitialMessage,
        contextJobId,
        setContextJobId,
      }}
    >
      {children}
    </JobbyContext.Provider>
  )
}

/**
 * Hook to access Jobby context
 * Must be used within JobbyProvider
 * 
 * @example
 * ```tsx
 * const { openChat, isOpen } = useJobby()
 * openChat('Help me prepare for this interview', 'job_123')
 * ```
 */
export function useJobby(): JobbyContextValue {
  const context = useContext(JobbyContext)
  if (context === undefined) {
    throw new Error('useJobby must be used within JobbyProvider')
  }
  return context
}

// Legacy exports for backward compatibility
export const SupportBotProvider = JobbyProvider
export const useSupportBot = useJobby

