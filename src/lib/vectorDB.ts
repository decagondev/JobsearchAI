// Simple in-memory vector database for RAG
interface Vector {
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
}

export const vectorDB = new VectorDB()

