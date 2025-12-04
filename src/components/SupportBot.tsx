import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Settings, Send, Upload, FileText, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { chatWithGroq, getSystemPrompt, type BotMode } from "@/lib/groqClient"
import { parseFile, isResume } from "@/lib/fileParser"
import { vectorDB } from "@/lib/vectorDB"
import { localStorage, db } from "@/lib/storage"
import siteContextData from "@/lib/siteContext.json"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [mode, setMode] = useState<BotMode>('sales')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; type: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved mode and messages
  useEffect(() => {
    const savedMode = localStorage.get('bot_mode') as BotMode
    if (savedMode) setMode(savedMode)

    loadMessages()
  }, [])

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
    setInput('')
    setIsLoading(true)

    try {
      // Build context based on mode
      let context = JSON.stringify(siteContextData, null, 2)

      if (mode === 'raggy' && uploadedDocs.length > 0) {
        // Get relevant chunks from vector DB
        const results = await vectorDB.search(input, 5)
        if (results.length > 0) {
          context += '\n\nRelevant document excerpts:\n' + results.map(r => r.text).join('\n\n')
        }
      }

      const systemPrompt = getSystemPrompt(mode, context)
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: input }
      ]

      const response = await chatWithGroq(mode, conversationMessages, context)

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
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setIsLoading(true)
      
      let isResumeFile = false
      const processedCount = { count: 0 }
      
      // Process all selected files
      for (const file of Array.from(files)) {
        try {
          const parsed = await parseFile(file)
          
          // Check if it's a resume (only for single file uploads)
          if (files.length === 1 && !isResumeFile) {
            isResumeFile = isResume(parsed.text)
          }
          
          // Split into chunks (smaller chunks for better retrieval)
          const chunkSize = 500 // characters per chunk
          const chunks: string[] = []
          
          // Split by paragraphs first, then by size
          const paragraphs = parsed.text.split(/\n\n+/).filter(p => p.trim().length > 0)
          
          let currentChunk = ''
          for (const para of paragraphs) {
            if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
              chunks.push(currentChunk.trim())
              currentChunk = para
            } else {
              currentChunk += (currentChunk ? '\n\n' : '') + para
            }
          }
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim())
          }

          // Filter out very small chunks
          const validChunks = chunks.filter(chunk => chunk.trim().length > 50)

          if (validChunks.length === 0) {
            throw new Error('File appears to be empty or could not be parsed')
          }

          // Upsert vectors (will replace if filename exists)
          await vectorDB.upsertVectors(validChunks, {
            filename: file.name,
            fileType: parsed.fileType,
            isResume: isResume(parsed.text),
            ...parsed.metadata
          })

          // Update uploaded docs list
          setUploadedDocs(prev => {
            const filtered = prev.filter(doc => doc.name !== file.name)
            return [...filtered, { name: file.name, type: parsed.fileType }]
          })

          // Save document to IndexedDB
          await db.save('documents', {
            filename: file.name,
            content: parsed.text,
            fileType: parsed.fileType,
            metadata: parsed.metadata,
            uploadedAt: new Date()
          })
          
          processedCount.count++
        } catch (fileError) {
          const errorMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: `❌ Failed to process "${file.name}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          continue // Process next file
        }
      }

      // Success message
      if (processedCount.count > 0) {
        const successMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `✅ Successfully processed ${processedCount.count} file(s). I can now answer questions about ${processedCount.count === 1 && isResumeFile ? 'your resume' : 'the uploaded documents'}. What would you like to know?`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
        await saveMessage(successMessage)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to process files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFile = async (filename: string) => {
    try {
      // Remove vectors from vector DB
      await vectorDB.removeByFilename(filename)
      
      // Remove from uploaded docs list
      setUploadedDocs(prev => prev.filter(doc => doc.name !== filename))
      
      // Optionally remove from IndexedDB (optional, keeping for history)
      // You can uncomment this if you want to remove from IndexedDB too
      // const allDocs = await db.getAll('documents')
      // const docToDelete = allDocs.find((d: any) => d.filename === filename)
      // if (docToDelete) {
      //   await db.delete('documents', docToDelete.id)
      // }
      
      const removeMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `🗑️ Removed "${filename}" from the knowledge base.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, removeMessage])
      await saveMessage(removeMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to remove "${filename}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleModeChange = (newMode: BotMode) => {
    setMode(newMode)
    localStorage.set('bot_mode', newMode)
    setShowSettings(false)
    
    // Clear vector DB when switching modes
    if (newMode !== 'raggy') {
      vectorDB.clear()
      setUploadedDocs([])
    }
  }

  const clearChat = async () => {
    setMessages([])
    await db.clear('chats')
  }

  const modeLabels = {
    sales: 'Sales Bot',
    tutor: 'Tutor Bot',
    raggy: 'Raggy Bot'
  }

  const modeDescriptions = {
    sales: 'Help hire BotAI for chatbot and AI solutions',
    tutor: 'Learn about chatbots and BotAI services',
    raggy: 'Upload files (PDF, Markdown, HTML, JS, etc.) and chat about them'
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center z-50"
          aria-label="Open support bot"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ${
          isMaximized 
            ? 'inset-4 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]' 
            : 'bottom-6 right-6 w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Support Bot</h3>
                <p className="text-xs text-muted-foreground">{modeLabels[mode]}</p>
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
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
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

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-border bg-muted/50">
              <h4 className="font-semibold mb-3">Select Mode</h4>
              <div className="space-y-2">
                {(Object.keys(modeLabels) as BotMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      mode === m
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium">{modeLabels[m]}</div>
                    <div className="text-xs opacity-80">{modeDescriptions[m]}</div>
                  </button>
                ))}
              </div>

              {/* Mode-specific controls */}
              {mode === 'raggy' && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">Upload Files</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md,.markdown,.html,.htm,.js,.jsx,.ts,.tsx,.css,.json,.txt"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Processing...' : uploadedDocs.length > 0 ? `Add More Files` : 'Upload Files'}
                  </Button>
                  {uploadedDocs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Uploaded ({uploadedDocs.length}):</p>
                      {uploadedDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground group">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate flex-1">{doc.name}</span>
                          <button
                            onClick={() => handleRemoveFile(doc.name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive flex-shrink-0"
                            aria-label={`Remove ${doc.name}`}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="w-full mt-4 text-destructive"
              >
                Clear Chat
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p>Start a conversation with {modeLabels[mode]}</p>
                <p className="text-xs mt-2">{modeDescriptions[mode]}</p>
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
                      : 'bg-muted'
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
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            {/* Mode-specific action buttons */}
            {mode === 'raggy' && (
              <div className="mb-2 flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.md,.markdown,.html,.htm,.js,.jsx,.ts,.tsx,.css,.json,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : uploadedDocs.length > 0 ? `Add Files (${uploadedDocs.length})` : 'Upload Files'}
                </Button>
                {uploadedDocs.length > 0 && (
                  <div className="flex items-center text-xs text-muted-foreground px-2">
                    <FileText className="h-3 w-3 mr-1" />
                    <span>{uploadedDocs.length} file{uploadedDocs.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
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

