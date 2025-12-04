/**
 * Prompt template for extracting skills, experience, and domains from resume text
 * Used with Groq API to parse resume content into structured data
 */

/**
 * System prompt for skills extraction
 * Instructs the AI to extract structured information from resume text
 */
export function getSkillsExtractionPrompt(resumeText: string): string {
  return `You are an expert resume parser. Analyze the following resume text and extract structured information about the candidate's skills, experience level, and domain expertise.

Resume Text:
${resumeText}

Extract the following information and return ONLY a valid JSON object with this exact structure:
{
  "skills": ["skill1", "skill2", "skill3"],
  "seniority": "junior" | "mid" | "senior" | "lead" | "principal",
  "domains": ["domain1", "domain2"],
  "experience": <number of years>
}

Guidelines:
- skills: Extract all technical skills, programming languages, frameworks, tools, and technologies mentioned. Include both explicit skills and those implied by experience descriptions. Return as an array of strings.
- seniority: Determine the experience level based on years of experience, job titles, and responsibilities. Use one of: "junior", "mid", "senior", "lead", or "principal".
- domains: Identify the primary domains/industries the candidate has worked in (e.g., "web development", "mobile development", "data science", "cloud infrastructure", "fintech", "healthcare"). Return as an array of strings.
- experience: Extract the total years of professional experience. If not explicitly stated, estimate based on job history and education dates. Return as a number.

Important:
- Return ONLY the JSON object, no additional text or markdown formatting
- Ensure all arrays are non-empty
- If information cannot be determined, use reasonable defaults (empty arrays, "mid" for seniority, 0 for experience)
- Be thorough in extracting skills - include both hard and soft skills if relevant

Return the JSON object now:`
}

/**
 * User message for skills extraction
 */
export function getSkillsExtractionUserMessage(): string {
  return 'Extract skills, seniority level, domains, and years of experience from this resume. Return only valid JSON.'
}

