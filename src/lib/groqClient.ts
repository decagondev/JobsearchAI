import Groq from 'groq-sdk'

// Initialize Groq with browser support
export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true
})

export type BotMode = 'sales' | 'tutor' | 'raggy'

const MODELS = {
  sales: 'llama-3.1-8b-instant',
  tutor: 'meta-llama/llama-4-scout-17b-16e-instruct',
  raggy: 'meta-llama/llama-4-maverick-17b-128e-instruct'
}

export async function chatWithGroq(
  mode: BotMode,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  _context?: string
): Promise<string> {
  const model = MODELS[mode]
  
  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2048
    })

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Groq API error:', error)
    throw new Error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getSystemPrompt(mode: BotMode, context?: string): string {
  const baseContext = context || ''

  switch (mode) {
    case 'sales':
      return `You are a helpful sales assistant for BotAI, a company that builds intelligent chatbots and AI solutions. 
Your goal is to help potential clients understand how BotAI can help them build chatbots and AI solutions for their business.
Be friendly, professional, and focus on understanding their needs and explaining how BotAI's services can help.
${baseContext ? `\n\nCompany Context:\n${baseContext}` : ''}
Always be helpful and try to guide them towards hiring BotAI for their chatbot and AI solution needs.`

    case 'tutor':
      return `You are a helpful tutor bot that teaches users about chatbots and BotAI's services.
Explain concepts clearly, answer questions about what chatbots are, how they work, and what BotAI offers.
Be educational, patient, and thorough in your explanations.
${baseContext ? `\n\nCompany Context:\n${baseContext}` : ''}
Help users learn about:
- What chatbots are and how they work
- BotAI's services and features
- How AI-powered automation can benefit businesses
- Best practices for chatbot development`

    case 'raggy':
      return `You are a helpful assistant that can answer questions about uploaded documents.
If the document is a resume, review it and provide:
- A summary of the candidate's qualifications
- Suggested job roles they might be suited for
- Strengths and areas for improvement
- Career recommendations

If the document is about another subject (code, markdown, HTML, etc.), answer questions about that subject based on the document content.
${baseContext ? `\n\nDocument Context:\n${baseContext}` : ''}
Be thorough, helpful, and provide detailed insights.`

    default:
      return 'You are a helpful assistant.'
  }
}

