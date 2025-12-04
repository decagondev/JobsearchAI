/**
 * Unit tests for vectorDB similarity matching functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { vectorDB } from './vectorDB'

describe('VectorDB', () => {
  beforeEach(async () => {
    // Clear all vectors before each test
    await vectorDB.clear()
  })

  describe('findSimilarJobs', () => {
    it('should return empty array when no jobs are embedded', async () => {
      const userEmbedding = vectorDB.generateUserEmbedding('software engineer python javascript')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)
      
      expect(results).toEqual([])
    })

    it('should find similar jobs and return match scores', async () => {
      // Embed some jobs
      await vectorDB.embedJob({
        id: 'job1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        description: 'Python, JavaScript, React, Node.js'
      })

      await vectorDB.embedJob({
        id: 'job2',
        title: 'Frontend Developer',
        company: 'Web Inc',
        description: 'React, TypeScript, CSS'
      })

      await vectorDB.embedJob({
        id: 'job3',
        title: 'Data Scientist',
        company: 'Data Co',
        description: 'Python, Machine Learning, SQL'
      })

      // Generate user embedding that matches job1
      const userEmbedding = vectorDB.generateUserEmbedding('software engineer python javascript react node')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toHaveProperty('jobId')
      expect(results[0]).toHaveProperty('score')
      expect(results[0]).toHaveProperty('metadata')
      expect(results[0].score).toBeGreaterThan(0)
      expect(results[0].score).toBeLessThanOrEqual(100)
    })

    it('should filter out non-job vectors', async () => {
      // Add a job vector
      await vectorDB.embedJob({
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Python, JavaScript'
      })

      // Add a non-job vector (user profile)
      await vectorDB.addVector('user profile skills python javascript', {
        type: 'user_profile',
        userId: 'user1'
      })

      const userEmbedding = vectorDB.generateUserEmbedding('python javascript')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)

      // Should only return the job, not the user profile
      expect(results.length).toBe(1)
      expect(results[0].jobId).toBe('job1')
      expect(results[0].metadata.type).toBe('job')
    })

    it('should respect the limit parameter', async () => {
      // Embed multiple jobs
      for (let i = 0; i < 10; i++) {
        await vectorDB.embedJob({
          id: `job${i}`,
          title: `Job ${i}`,
          company: `Company ${i}`,
          description: `Python JavaScript ${i}`
        })
      }

      const userEmbedding = vectorDB.generateUserEmbedding('python javascript')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)

      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should return results sorted by score descending', async () => {
      // Embed jobs with different relevance
      await vectorDB.embedJob({
        id: 'job1',
        title: 'Python Developer',
        company: 'Python Corp',
        description: 'Python Python Python'
      })

      await vectorDB.embedJob({
        id: 'job2',
        title: 'JavaScript Developer',
        company: 'JS Corp',
        description: 'JavaScript JavaScript JavaScript'
      })

      await vectorDB.embedJob({
        id: 'job3',
        title: 'Full Stack Developer',
        company: 'Full Stack Corp',
        description: 'Python JavaScript React'
      })

      const userEmbedding = vectorDB.generateUserEmbedding('python python python')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)

      // Results should be sorted by score descending
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score)
      }
    })

    it('should return scores between 0 and 100', async () => {
      await vectorDB.embedJob({
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Python JavaScript'
      })

      const userEmbedding = vectorDB.generateUserEmbedding('python javascript')
      const results = await vectorDB.findSimilarJobs(userEmbedding, 5)

      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('generateUserEmbedding', () => {
    it('should generate embedding from text', () => {
      const text = 'python javascript react'
      const embedding = vectorDB.generateUserEmbedding(text)

      expect(Array.isArray(embedding)).toBe(true)
      expect(embedding.length).toBe(128)
      embedding.forEach((value) => {
        expect(typeof value).toBe('number')
      })
    })

    it('should generate consistent embeddings for same text', () => {
      const text = 'python javascript react'
      const embedding1 = vectorDB.generateUserEmbedding(text)
      const embedding2 = vectorDB.generateUserEmbedding(text)

      expect(embedding1).toEqual(embedding2)
    })

    it('should generate different embeddings for different text', () => {
      const embedding1 = vectorDB.generateUserEmbedding('python javascript')
      const embedding2 = vectorDB.generateUserEmbedding('java kotlin')

      expect(embedding1).not.toEqual(embedding2)
    })
  })

  describe('serialization', () => {
    beforeEach(async () => {
      await vectorDB.clear()
      // Clear IndexedDB vectors store
      const { db } = await import('./storage')
      await db.clear('vectors')
    })

    it('should serialize vectors to IndexedDB', async () => {
      // Add some vectors
      await vectorDB.addVector('Test text 1', { type: 'job', jobId: 'job_1' })
      await vectorDB.addVector('Test text 2', { type: 'job', jobId: 'job_2' })

      // Serialize
      await vectorDB.serialize()

      // Verify vectors are in IndexedDB
      const { db } = await import('./storage')
      const savedVectors = await db.getAll('vectors')
      expect(savedVectors.length).toBe(2)
      expect(savedVectors.find((v: any) => v.text === 'Test text 1')).toBeDefined()
      expect(savedVectors.find((v: any) => v.text === 'Test text 2')).toBeDefined()
    })

    it('should deserialize vectors from IndexedDB', async () => {
      // Add vectors directly to IndexedDB
      const { db } = await import('./storage')
      await db.put('vectors', {
        id: 'vec_1',
        embedding: [0.1, 0.2, 0.3],
        text: 'Restored text 1',
        metadata: { type: 'job', jobId: 'job_1' },
      })
      await db.put('vectors', {
        id: 'vec_2',
        embedding: [0.4, 0.5, 0.6],
        text: 'Restored text 2',
        metadata: { type: 'job', jobId: 'job_2' },
      })

      // Clear in-memory vectors
      await vectorDB.clear()

      // Deserialize
      await vectorDB.deserialize()

      // Verify vectors are restored
      const allVectors = await vectorDB.getAll()
      expect(allVectors.length).toBe(2)
      expect(allVectors.find((v) => v.id === 'vec_1')?.text).toBe('Restored text 1')
      expect(allVectors.find((v) => v.id === 'vec_2')?.text).toBe('Restored text 2')
    })

    it('should handle empty vectorDB during serialization', async () => {
      await vectorDB.clear()
      await vectorDB.serialize()

      const { db } = await import('./storage')
      const savedVectors = await db.getAll('vectors')
      expect(savedVectors.length).toBe(0)
    })

    it('should handle empty IndexedDB during deserialization', async () => {
      await vectorDB.clear()
      await vectorDB.deserialize()

      const allVectors = await vectorDB.getAll()
      expect(allVectors.length).toBe(0)
    })
  })
})

