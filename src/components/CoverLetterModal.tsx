/**
 * CoverLetterModal component for displaying and managing cover letters
 * Provides copy, revise, and PDF export functionality
 */

import { useState, useRef } from 'react'
import { Copy, Download, Loader2, AlertCircle, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGenerateCoverLetter } from '@/hooks/useGenerateCoverLetter'
import jsPDF from 'jspdf'
import type { Job } from '@/types/session'

export interface CoverLetterModalProps {
  job: Job
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * CoverLetterModal component
 * 
 * @param job - Job object to generate cover letter for
 * @param isOpen - Whether the modal is open
 * @param onOpenChange - Callback when modal open state changes
 */
type RevisionOption = 
  | 'none'
  | 'more_professional'
  | 'more_casual'
  | 'more_examples'
  | 'shorter'
  | 'longer'
  | 'more_enthusiasm'
  | 'better_alignment'
  | 'emphasize_technical'
  | 'emphasize_leadership'

const REVISION_OPTIONS: Record<RevisionOption, { label: string; instruction: string }> = {
  none: { label: 'No revision', instruction: '' },
  more_professional: { 
    label: 'Make tone more professional', 
    instruction: 'Make the tone more formal and professional, suitable for corporate environments' 
  },
  more_casual: { 
    label: 'Make tone more casual/friendly', 
    instruction: 'Make the tone more conversational and friendly while maintaining professionalism' 
  },
  more_examples: { 
    label: 'Include more examples of my work', 
    instruction: 'Add more specific examples of projects, achievements, and work experience from my resume' 
  },
  shorter: { 
    label: 'Make it shorter/more concise', 
    instruction: 'Make the cover letter more concise and to the point, removing any unnecessary details' 
  },
  longer: { 
    label: 'Make it longer/more detailed', 
    instruction: 'Expand the cover letter with more details about my experience and how it relates to the job' 
  },
  more_enthusiasm: { 
    label: 'Add more enthusiasm/passion', 
    instruction: 'Increase the enthusiasm and passion expressed about the role and company' 
  },
  better_alignment: { 
    label: 'Better align with job requirements', 
    instruction: 'Better align the cover letter with the specific job requirements and emphasize matching qualifications' 
  },
  emphasize_technical: { 
    label: 'Emphasize technical skills', 
    instruction: 'Place more emphasis on technical skills, tools, and technologies mentioned in my resume' 
  },
  emphasize_leadership: { 
    label: 'Emphasize leadership/soft skills', 
    instruction: 'Place more emphasis on leadership experience, teamwork, communication, and other soft skills' 
  },
}

export function CoverLetterModal({ job, isOpen, onOpenChange }: CoverLetterModalProps) {
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [revisionOption, setRevisionOption] = useState<RevisionOption>('none')
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset revision option when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRevisionOption('none')
      setCopied(false)
    }
    onOpenChange(open)
  }

  const selectedRevision = REVISION_OPTIONS[revisionOption]
  const revisionInstruction = selectedRevision.instruction || undefined

  const {
    coverLetter,
    isLoading,
    error,
    refetch,
  } = useGenerateCoverLetter({
    job,
    enabled: isOpen,
    revisionInstruction,
  })

  const handleCopy = async () => {
    if (!coverLetter) return

    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRevisionChange = (value: string) => {
    setRevisionOption(value as RevisionOption)
    // The hook will automatically regenerate when revisionInstruction changes
  }

  const handleExportPDF = async () => {
    if (!coverLetter || !contentRef.current) return

    setIsExporting(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Set up fonts and styling
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')

      // Add header with job info
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Cover Letter - ${job.title}`, 20, 20)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${job.company}`, 20, 27)

      // Format the cover letter text
      const lines = pdf.splitTextToSize(coverLetter, 170) // 170mm width (A4 width - margins)
      
      // Add cover letter content
      pdf.setFontSize(11)
      let yPosition = 40
      const lineHeight = 7
      const pageHeight = 280 // A4 height in mm
      const margin = 20

      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(lines[i], margin, yPosition)
        yPosition += lineHeight
      }

      // Save the PDF
      const fileName = `Cover_Letter_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error('Failed to export PDF:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cover Letter - {job.title}</DialogTitle>
          <DialogDescription>
            {job.company}
          </DialogDescription>
        </DialogHeader>

        {/* Revision Dropdown */}
        {!error && (
          <div className="flex items-center gap-2">
            <label htmlFor="revision-select" className="text-sm text-muted-foreground whitespace-nowrap">
              Revise:
            </label>
            <Select 
              value={revisionOption} 
              onValueChange={handleRevisionChange}
              disabled={isLoading}
            >
              <SelectTrigger id="revision-select" className="w-full">
                <SelectValue placeholder="Select revision option" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REVISION_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Generating your personalized cover letter...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Failed to generate cover letter</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error.message || 'An error occurred while generating your cover letter.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {coverLetter && !isLoading && !error && (
            <div ref={contentRef} className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted rounded-md">
                  {coverLetter}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {coverLetter && !isLoading && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!coverLetter}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={!coverLetter || isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              variant="default"
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

