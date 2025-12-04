export interface ScrapedContent {
  url: string
  title: string
  text: string
  html: string
  json: Record<string, any>
}

// Multiple CORS proxy services to try as fallbacks
const CORS_PROXIES = [
  {
    name: 'allorigins',
    getUrl: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    parseResponse: async (response: Response) => {
      const data = await response.json()
      return data.contents || data
    }
  },
  {
    name: 'corsproxy',
    getUrl: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    parseResponse: async (response: Response) => {
      return await response.text()
    }
  },
  {
    name: 'cors-anywhere-alt',
    getUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    parseResponse: async (response: Response) => {
      return await response.text()
    }
  }
]

async function fetchWithProxy(url: string, proxyIndex: number = 0): Promise<string> {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error('All proxy services failed. The website may be blocking scraping attempts or the proxies are unavailable.')
  }

  const proxy = CORS_PROXIES[proxyIndex]
  
  try {
    const proxyUrl = proxy.getUrl(url)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Proxy ${proxy.name} returned ${response.status}`)
    }

    const html = await proxy.parseResponse(response)
    
    if (!html || (typeof html === 'string' && html.length < 100)) {
      throw new Error(`Proxy ${proxy.name} returned empty or invalid content`)
    }

    return typeof html === 'string' ? html : String(html)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after 30 seconds`)
    }
    console.warn(`Proxy ${proxy.name} failed:`, error)
    // Try next proxy
    return fetchWithProxy(url, proxyIndex + 1)
  }
}

// Enhanced HTML parsing similar to Beautiful Soup
function parseHTML(html: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Remove unwanted elements (like Beautiful Soup's decompose)
  const unwantedSelectors = [
    'script', 'style', 'noscript', 'iframe', 'embed', 'object',
    'nav', 'header', 'footer', 'aside', '[class*="ad"]', '[id*="ad"]',
    '[class*="cookie"]', '[id*="cookie"]', '[class*="popup"]', '[id*="popup"]'
  ]
  
  unwantedSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove())
  })

  // Extract title
  const title = doc.querySelector('title')?.textContent?.trim() || 
                doc.querySelector('h1')?.textContent?.trim() || 
                doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
                'Untitled'

  // Extract clean text content (like Beautiful Soup's get_text)
  const body = doc.querySelector('body')
  const text = body?.textContent?.replace(/\s+/g, ' ').trim() || ''

  // Extract structured data
  const metaTags = Array.from(doc.querySelectorAll('meta')).reduce((acc, meta) => {
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    const content = meta.getAttribute('content')
    if (name && content) {
      acc[name] = content
    }
    return acc
  }, {} as Record<string, string>)

  // Extract headings with hierarchy
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
    level: parseInt(h.tagName.charAt(1)),
    tag: h.tagName.toLowerCase(),
    text: h.textContent?.trim() || '',
    id: h.id || null
  }))

  // Extract links with full URLs
  const links = Array.from(doc.querySelectorAll('a[href]')).map(a => {
    const href = a.getAttribute('href') || ''
    return {
      text: a.textContent?.trim() || '',
      href: href,
      isExternal: href.startsWith('http') && !href.includes(window.location.hostname)
    }
  }).filter(link => link.text && link.href)

  // Extract paragraphs
  const paragraphs = Array.from(doc.querySelectorAll('p'))
    .map(p => p.textContent?.trim())
    .filter(p => p && p.length > 20) // Filter out very short paragraphs

  // Extract images
  const images = Array.from(doc.querySelectorAll('img[src]')).map(img => ({
    alt: img.getAttribute('alt') || '',
    src: img.getAttribute('src') || '',
    title: img.getAttribute('title') || null
  })).filter(img => img.src)

  // Extract lists
  const lists = Array.from(doc.querySelectorAll('ul, ol')).map(list => ({
    type: list.tagName.toLowerCase(),
    items: Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '').filter(item => item)
  })).filter(list => list.items.length > 0)

  // Extract tables
  const tables = Array.from(doc.querySelectorAll('table')).map(table => {
    const rows = Array.from(table.querySelectorAll('tr')).map(tr => {
      const cells = Array.from(tr.querySelectorAll('td, th')).map(cell => cell.textContent?.trim() || '')
      return cells
    })
    return rows
  }).filter(table => table.length > 0)

  return {
    title,
    text,
    meta: metaTags,
    headings,
    links,
    paragraphs,
    images,
    lists,
    tables,
    html: doc.documentElement.outerHTML
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  try {
    // Validate URL
    let targetUrl = url.trim()
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    // Validate it's a proper URL
    try {
      new URL(targetUrl)
    } catch {
      throw new Error('Invalid URL format. Please enter a valid URL.')
    }

    // Try fetching with multiple proxy services
    const html = await fetchWithProxy(targetUrl)
    
    // Parse HTML with enhanced parsing
    const parsed = parseHTML(html)

    // Convert to JSON structure
    const json = {
      url: targetUrl,
      title: parsed.title,
      meta: parsed.meta,
      headings: parsed.headings,
      links: parsed.links,
      paragraphs: parsed.paragraphs,
      images: parsed.images,
      lists: parsed.lists,
      tables: parsed.tables,
      text: parsed.text,
      summary: {
        headingCount: parsed.headings.length,
        linkCount: parsed.links.length,
        paragraphCount: parsed.paragraphs.length,
        imageCount: parsed.images.length,
        listCount: parsed.lists.length,
        tableCount: parsed.tables.length
      }
    }

    return {
      url: targetUrl,
      title: parsed.title,
      text: parsed.text,
      html: parsed.html,
      json
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide more helpful error messages
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
      throw new Error('Unable to access this website due to CORS restrictions. All proxy services failed. Some websites actively block scraping.')
    }
    
    if (errorMessage.includes('timeout')) {
      throw new Error('Request timed out. The website may be slow or blocking the request.')
    }
    
    throw new Error(`Failed to scrape website: ${errorMessage}`)
  }
}
