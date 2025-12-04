// Simple in-memory vector database for RAG
export interface Vector {
  id: string
  embedding: number[]
  text: string
  metadata?: Record<string, any>
}

class VectorDB {
  private vectors: Vector[] = []

  // Simple cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Simple embedding generation (TF-IDF-like approach)
  // In production, you'd use a proper embedding model
  private generateEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/)
    const wordFreq: Record<string, number> = {}
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })

    // Create a simple vector representation
    const allWords = Array.from(new Set(words))
    const embedding = new Array(128).fill(0)
    
    allWords.forEach((word, idx) => {
      if (idx < 128) {
        embedding[idx] = wordFreq[word] / words.length
      }
    })

    return embedding
  }

  async addVector(text: string, metadata?: Record<string, any>): Promise<string> {
    const id = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const embedding = this.generateEmbedding(text)
    
    const vector: Vector = {
      id,
      embedding,
      text,
      metadata
    }

    this.vectors.push(vector)
    return id
  }

  // Upsert: Update existing vectors for a filename or add new ones
  async upsertVectors(chunks: string[], metadata?: Record<string, any>): Promise<string[]> {
    const filename = metadata?.filename as string | undefined
    
    if (filename) {
      // Remove existing vectors with the same filename
      this.vectors = this.vectors.filter(v => v.metadata?.filename !== filename)
    }

    // Add new vectors for all chunks
    const ids: string[] = []
    for (const chunk of chunks) {
      const id = await this.addVector(chunk, metadata)
      ids.push(id)
    }

    return ids
  }

  async search(query: string, topK: number = 5): Promise<Array<{ text: string; score: number; metadata?: Record<string, any> }>> {
    const queryEmbedding = this.generateEmbedding(query)
    
    const results = this.vectors
      .map(vector => ({
        text: vector.text,
        score: this.cosineSimilarity(queryEmbedding, vector.embedding),
        metadata: vector.metadata
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return results
  }

  async clear(): Promise<void> {
    this.vectors = []
  }

  async getAll(): Promise<Vector[]> {
    return [...this.vectors]
  }

  // Remove all vectors for a specific filename
  async removeByFilename(filename: string): Promise<number> {
    const beforeCount = this.vectors.length
    this.vectors = this.vectors.filter(v => v.metadata?.filename !== filename)
    return beforeCount - this.vectors.length
  }

  /**
   * Embed a job for similarity search
   * Creates a vector from job title, company, and description
   * 
   * @param job - Job object to embed
   * @returns Vector ID
   */
  async embedJob(job: { id: string; title: string; company: string; description?: string }): Promise<string> {
    const jobText = `${job.title} at ${job.company}. ${job.description || ''}`.trim()
    return this.addVector(jobText, {
      type: 'job',
      jobId: job.id,
      title: job.title,
      company: job.company,
    })
  }

  /**
   * Find similar jobs based on user embedding
   * Filters vectors by job type and calculates cosine similarity
   * 
   * @param userEmbedding - User's embedding vector (from skills + resume)
   * @param limit - Maximum number of results to return (default: 8)
   * @returns Array of job matches with scores (0-100) and metadata
   */
  async findSimilarJobs(
    userEmbedding: number[],
    limit: number = 8
  ): Promise<Array<{ jobId: string; score: number; metadata: Record<string, any> }>> {
    // Filter vectors to only job types
    const jobVectors = this.vectors.filter(
      (vector) => vector.metadata?.type === 'job'
    )

    // Calculate similarity scores for all job vectors
    const results = jobVectors
      .map((vector) => {
        const similarity = this.cosineSimilarity(userEmbedding, vector.embedding)
        // Convert similarity (-1 to 1) to score (0 to 100)
        // Normalize: (similarity + 1) / 2 * 100
        const score = Math.max(0, Math.min(100, ((similarity + 1) / 2) * 100))
        
        return {
          jobId: vector.metadata?.jobId as string,
          score: Math.round(score * 100) / 100, // Round to 2 decimal places
          metadata: vector.metadata || {},
        }
      })
      .filter((result) => result.jobId && result.score > 0) // Only include valid jobs with positive scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit) // Limit results

    return results
  }

  /**
   * Generate embedding from text (public helper for user embedding generation)
   * Exposes the private generateEmbedding method for external use
   * 
   * @param text - Text to generate embedding from
   * @returns Embedding vector
   */
  generateUserEmbedding(text: string): number[] {
    return this.generateEmbedding(text)
  }

  /**
   * Serialize all vectors to IndexedDB for persistence
   * Saves all vectors to the 'vectors' store
   * 
   * @returns Promise that resolves when serialization is complete
   */
  async serialize(): Promise<void> {
    const { db } = await import('./storage')
    
    try {
      // Clear existing vectors in IndexedDB
      await db.clear('vectors')
      
      // Save all vectors
      for (const vector of this.vectors) {
        await db.put('vectors', vector)
      }
    } catch (error) {
      console.error('Failed to serialize vectors:', error)
      throw new Error(`Failed to serialize vectors: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Deserialize vectors from IndexedDB
   * Restores all vectors from the 'vectors' store
   * 
   * @returns Promise that resolves when deserialization is complete
   */
  async deserialize(): Promise<void> {
    const { db } = await import('./storage')
    
    try {
      // Load all vectors from IndexedDB
      const savedVectors = await db.getAll<Vector>('vectors')
      
      // Restore vectors to memory
      this.vectors = savedVectors.map((v) => ({
        id: v.id,
        embedding: v.embedding,
        text: v.text,
        metadata: v.metadata,
      }))
    } catch (error) {
      console.error('Failed to deserialize vectors:', error)
      throw new Error(`Failed to deserialize vectors: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const vectorDB = new VectorDB()

