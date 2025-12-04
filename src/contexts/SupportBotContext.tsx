/**
 * React Context for managing SupportBot state globally
 * Allows components to open chat with pre-filled prompts and specific modes
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { BotMode } from '@/lib/groqClient'

interface SupportBotContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openChat: (mode: BotMode, initialMessage?: string, contextJobId?: string) => void
  initialMessage: string | null
  setInitialMessage: (message: string | null) => void
  contextJobId: string | null
  setContextJobId: (jobId: string | null) => void
  mode: BotMode | null
  setMode: (mode: BotMode | null) => void
}

const SupportBotContext = createContext<SupportBotContextValue | undefined>(undefined)

interface SupportBotProviderProps {
  children: ReactNode
}

/**
 * Provider component for SupportBot context
 * Wraps the app to provide global chat state management
 * 
 * @example
 * ```tsx
 * <SupportBotProvider>
 *   <App />
 * </SupportBotProvider>
 * ```
 */
export function SupportBotProvider({ children }: SupportBotProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [contextJobId, setContextJobId] = useState<string | null>(null)
  const [mode, setMode] = useState<BotMode | null>(null)

  /**
   * Open chat with optional mode, initial message, and job context
   * 
   * @param mode - Bot mode to use (e.g., 'jobcoach')
   * @param initialMessage - Optional pre-filled message for the input
   * @param contextJobId - Optional job ID to filter RAG context
   */
  const openChat = useCallback(
    (newMode: BotMode, newInitialMessage?: string, newContextJobId?: string) => {
      if (newMode) {
        setMode(newMode)
      }
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
    <SupportBotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openChat,
        initialMessage,
        setInitialMessage,
        contextJobId,
        setContextJobId,
        mode,
        setMode,
      }}
    >
      {children}
    </SupportBotContext.Provider>
  )
}

/**
 * Hook to access SupportBot context
 * Must be used within SupportBotProvider
 * 
 * @example
 * ```tsx
 * const { openChat, isOpen } = useSupportBot()
 * openChat('jobcoach', 'Help me prepare for this interview', 'job_123')
 * ```
 */
export function useSupportBot(): SupportBotContextValue {
  const context = useContext(SupportBotContext)
  if (context === undefined) {
    throw new Error('useSupportBot must be used within SupportBotProvider')
  }
  return context
}

