import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for PDF.js
// For pdfjs-dist 5.x, we need to use a CDN that properly serves ES modules
if (typeof window !== 'undefined') {
  const pdfjsVersion = '5.4.449'
  
  // Use unpkg with the correct path - it should handle both .js and .mjs
  // If .mjs fails, PDF.js will try to fallback
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`
  
  // If the above fails, PDF.js will show an error, but we can catch it in parsePDF
}

export interface ParsedFile {
  text: string
  filename: string
  fileType: string
  metadata?: Record<string, any>
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileType = file.type || getFileTypeFromExtension(file.name)
  const filename = file.name

  try {
    switch (fileType) {
      case 'application/pdf':
        return await parsePDF(file)
      
      case 'text/markdown':
      case 'text/x-markdown':
        return await parseMarkdown(file)
      
      case 'text/html':
      case 'application/xhtml+xml':
        return await parseHTML(file)
      
      case 'text/javascript':
      case 'application/javascript':
      case 'text/typescript':
      case 'application/typescript':
        return await parseCode(file, 'javascript')
      
      case 'text/css':
        return await parseCode(file, 'css')
      
      case 'application/json':
        return await parseJSON(file)
      
      case 'text/plain':
      case 'text':
        return await parseText(file)
      
      default:
        // Try to parse as text for unknown types
        return await parseText(file)
    }
  } catch (error) {
    throw new Error(`Failed to parse ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function getFileTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'html': 'text/html',
    'htm': 'text/html',
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'ts': 'text/typescript',
    'tsx': 'text/typescript',
    'css': 'text/css',
    'json': 'application/json',
    'txt': 'text/plain'
  }
  return typeMap[ext || ''] || 'text/plain'
}

async function parsePDF(file: File): Promise<ParsedFile> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    // Ensure worker is set up - try multiple CDNs as fallback
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const pdfjsVersion = '5.4.449'
      // Try unpkg first
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`
    }
    
    // Use a more robust PDF parsing approach
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Suppress console warnings
      useSystemFonts: true,
      isEvalSupported: false, // Disable eval for security
      disableAutoFetch: false,
      disableStream: false
    })
    
    let pdf
    try {
      pdf = await loadingTask.promise
    } catch (workerError: any) {
      // If worker fails, try with .js extension as fallback
      if (workerError?.message?.includes('worker') || workerError?.message?.includes('Failed to fetch')) {
        console.warn('Worker .mjs failed, trying .js fallback')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.js`
        const retryTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0,
          useSystemFonts: true,
          isEvalSupported: false,
          disableAutoFetch: false,
          disableStream: false
        })
        pdf = await retryTask.promise
      } else {
        throw workerError
      }
    }
    
    let fullText = ''
    const numPages = pdf.numPages

    // Process pages with error handling
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .filter((str: string) => str.trim())
          .join(' ')
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n'
        }
      } catch (pageError) {
        console.warn(`Error parsing page ${pageNum}:`, pageError)
        // Continue with other pages
      }
    }

    let metadata: Record<string, any> = {}
    try {
      const pdfMetadata = await pdf.getMetadata()
      const info = pdfMetadata.info as any
      metadata = {
        title: info?.Title || null,
        author: info?.Author || null,
        subject: info?.Subject || null,
        pages: numPages
      }
    } catch {
      metadata = { pages: numPages }
    }

    if (!fullText.trim()) {
      throw new Error('PDF appears to be empty or contains only images')
    }

    return {
      text: fullText.trim(),
      filename: file.name,
      fileType: 'application/pdf',
      metadata
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid PDF')) {
      throw new Error('Invalid or corrupted PDF file')
    }
    throw error
  }
}

async function parseMarkdown(file: File): Promise<ParsedFile> {
  const text = await file.text()
  return {
    text: text.trim(),
    filename: file.name,
    fileType: 'text/markdown',
    metadata: {
      lines: text.split('\n').length,
      size: file.size
    }
  }
}

async function parseHTML(file: File): Promise<ParsedFile> {
  const html = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Remove scripts and styles
  doc.querySelectorAll('script, style').forEach(el => el.remove())

  // Extract text content
  const body = doc.querySelector('body') || doc.documentElement
  const text = body?.textContent?.replace(/\s+/g, ' ').trim() || ''

  // Extract metadata
  const title = doc.querySelector('title')?.textContent || null
  const metaTags = Array.from(doc.querySelectorAll('meta')).reduce((acc, meta) => {
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    const content = meta.getAttribute('content')
    if (name && content) {
      acc[name] = content
    }
    return acc
  }, {} as Record<string, string>)

  return {
    text: text || html, // Fallback to raw HTML if no text extracted
    filename: file.name,
    fileType: 'text/html',
    metadata: {
      title,
      ...metaTags,
      hasBody: !!doc.querySelector('body')
    }
  }
}

async function parseCode(file: File, language: string): Promise<ParsedFile> {
  const text = await file.text()
  return {
    text: text.trim(),
    filename: file.name,
    fileType: `text/${language}`,
    metadata: {
      language,
      lines: text.split('\n').length,
      size: file.size
    }
  }
}

async function parseJSON(file: File): Promise<ParsedFile> {
  const text = await file.text()
  try {
    const json = JSON.parse(text)
    // Convert JSON to readable text format
    const readableText = JSON.stringify(json, null, 2)
    return {
      text: readableText,
      filename: file.name,
      fileType: 'application/json',
      metadata: {
        isValid: true,
        keys: Object.keys(json)
      }
    }
  } catch {
    // If not valid JSON, return as text
    return {
      text: text.trim(),
      filename: file.name,
      fileType: 'application/json',
      metadata: {
        isValid: false
      }
    }
  }
}

async function parseText(file: File): Promise<ParsedFile> {
  const text = await file.text()
  return {
    text: text.trim(),
    filename: file.name,
    fileType: 'text/plain',
    metadata: {
      lines: text.split('\n').length,
      size: file.size
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

