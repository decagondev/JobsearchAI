import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for PDF.js - using CDN for browser compatibility
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface ParsedPDF {
  text: string
  pages: number
  metadata?: {
    title?: string
    author?: string
    subject?: string
  }
}

export async function parsePDF(file: File): Promise<ParsedPDF> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  let fullText = ''
  const numPages = pdf.numPages

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n\n'
  }

  const metadata = await pdf.getMetadata()
  const info = metadata.info as any

  return {
    text: fullText.trim(),
    pages: numPages,
    metadata: {
      title: info?.Title,
      author: info?.Author,
      subject: info?.Subject
    }
  }
}

export function isResume(text: string): boolean {
  const resumeKeywords = [
    'resume', 'cv', 'curriculum vitae', 'experience', 'education',
    'skills', 'employment', 'work history', 'professional', 'objective',
    'summary', 'qualifications', 'certifications', 'references'
  ]
  
  const lowerText = text.toLowerCase()
  const matches = resumeKeywords.filter(keyword => lowerText.includes(keyword))
  
  return matches.length >= 3
}

