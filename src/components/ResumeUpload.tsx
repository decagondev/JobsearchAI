/**
 * Resume upload component with drag-drop, file picker, and textarea fallback
 * Supports PDF and TXT file formats
 */

import { useCallback, useState, useRef } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useResumeUpload } from '@/hooks/useResumeUpload'

export interface ResumeUploadProps {
  onUploadSuccess?: () => void
}

/**
 * Resume upload component with multiple input methods
 */
export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const { uploadResume, uploadResumeText, isUploading, error, resumeText, clearError } = useResumeUpload()
  const [isDragging, setIsDragging] = useState(false)
  const [showTextarea, setShowTextarea] = useState(false)
  const [pastedText, setPastedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    clearError()

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadResume(files[0])
      if (resumeText && onUploadSuccess) {
        onUploadSuccess()
      }
    }
  }, [uploadResume, resumeText, onUploadSuccess, clearError])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      clearError()
      await uploadResume(files[0])
      if (resumeText && onUploadSuccess) {
        onUploadSuccess()
      }
    }
  }, [uploadResume, resumeText, onUploadSuccess, clearError])

  const handlePasteSubmit = useCallback(async () => {
    if (pastedText.trim()) {
      clearError()
      await uploadResumeText(pastedText)
      if (onUploadSuccess) {
        onUploadSuccess()
      }
      setShowTextarea(false)
      setPastedText('')
    }
  }, [pastedText, uploadResumeText, onUploadSuccess, clearError])

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      {!showTextarea && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Parsing resume...</p>
              </div>
            ) : resumeText ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Resume uploaded successfully</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resumeText.length.toLocaleString()} characters
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                    // Note: Resume removal would need to be handled via hook
                    // For now, user can re-upload to replace
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload your resume</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Drag and drop your resume here, or click to browse
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleFileButtonClick} disabled={isUploading}>
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTextarea(true)}
                    disabled={isUploading}
                  >
                    Paste Text Instead
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDF and TXT files (max 10MB)
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Textarea Fallback */}
      {showTextarea && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Paste your resume</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTextarea(false)
                  setPastedText('')
                  clearError()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Paste your resume text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handlePasteSubmit} disabled={!pastedText.trim() || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Text'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTextarea(false)
                  setPastedText('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

