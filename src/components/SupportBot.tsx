import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Loader2, Maximize2, Minimize2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { chatWithGroq, getJobbySystemPrompt } from "@/lib/groqClient"
import { db } from "@/lib/storage"
import { memoryBank } from "@/lib/memoryBank"
import { useRAGContext } from "@/hooks/useRAGContext"
import { useSupportBot } from "@/contexts/SupportBotContext"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function SupportBot() {
  const {
    isOpen: contextIsOpen,
    setIsOpen: setContextIsOpen,
    initialMessage,
    setInitialMessage,
    contextJobId,
    setContextJobId,
  } = useSupportBot()
  
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const buildJobContext = useRAGContext()

  // Sync local state with context
  const isOpen = contextIsOpen
  const setIsOpen = setContextIsOpen

  // Load saved messages on mount
  useEffect(() => {
    loadMessages()
  }, [])

  // Handle initial message from context (e.g., from quick actions)
  useEffect(() => {
    if (isOpen && initialMessage) {
      setInput(initialMessage)
      setInitialMessage(null)
      // Focus input after a short delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, initialMessage, setInitialMessage])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      const savedMessages = await db.getAll<Message>('chats')
      if (savedMessages.length > 0) {
        setMessages(savedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const saveMessage = async (message: Message) => {
    try {
      await db.save('chats', message)
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    await saveMessage(userMessage)
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Get userId from MemoryBank (proper way to get current session)
      const userId = await memoryBank.getCurrentUserId()
      let context = ''
      
      if (userId) {
        // Build job-specific context using RAG hook
        // Use contextJobId if provided (from quick actions)
        context = await buildJobContext({
          userId,
          query: currentInput,
          contextJobId: contextJobId || undefined,
        })
        // Clear contextJobId after use
        if (contextJobId) {
          setContextJobId(null)
        }
      } else {
        context = 'No user session found. Please complete onboarding first to get personalized assistance.'
      }

      const systemPrompt = getJobbySystemPrompt(context)
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: currentInput }
      ]

      const response = await chatWithGroq(conversationMessages, context)

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      await saveMessage(assistantMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again!`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    setMessages([])
    await db.clear('chats')
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center z-50 group"
          aria-label="Chat with Jobby"
        >
          <div className="relative">
            <MessageSquare className="h-7 w-7" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Chat with Jobby
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ${
          isMaximized 
            ? 'inset-4 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]' 
            : 'bottom-6 right-6 w-96 h-[600px]'
        }`}>
          {/* Header with Branding */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <Sparkles className="h-3 w-3 absolute -top-0.5 -right-0.5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Jobby
                </h3>
                <p className="text-xs text-muted-foreground font-medium">Your Jobsearch Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8"
                aria-label={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8 space-y-3">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Hey there! I'm Jobby 👋</p>
                  <p className="text-sm">Your AI-powered job search assistant</p>
                </div>
                <div className="text-xs space-y-1 pt-2">
                  <p className="font-medium text-foreground/80">I can help you with:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Mock interviews</li>
                    <li>• Resume tailoring</li>
                    <li>• Job analysis</li>
                    <li>• Interview prep</li>
                  </ul>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border border-border/50'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted border border-border/50 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="w-full mb-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Chat
              </Button>
            )}
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask Jobby anything about your job search..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
