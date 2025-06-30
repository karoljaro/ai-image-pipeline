import { describe, it, expect } from 'vitest'
import { ImageDimensions } from '../../value-objects/ImageDimensions'

describe('ImageDimensions', () => {
  describe('constructor', () => {
    it('should create valid dimensions', () => {
      const dims = new ImageDimensions(1920, 1080)
      
      expect(dims.width).toBe(1920)
      expect(dims.height).toBe(1080)
    })

    it('should throw for invalid dimensions', () => {
      expect(() => new ImageDimensions(0, 1080))
        .toThrowError('Image dimensions must be positive numbers')
      
      expect(() => new ImageDimensions(1920, -100))
        .toThrowError('Image dimensions must be positive numbers')
      
      expect(() => new ImageDimensions(1920.5, 1080))
        .toThrowError('Image dimensions must be integers')
    })
  })

  describe('aspectRatio', () => {
    it('should calculate correct aspect ratio', () => {
      const dims = new ImageDimensions(1920, 1080)
      expect(dims.aspectRatio).toBeCloseTo(1.7778, 4)
      
      const square = new ImageDimensions(1000, 1000)
      expect(square.aspectRatio).toBe(1)
      
      const portrait = new ImageDimensions(1080, 1920)
      expect(portrait.aspectRatio).toBeCloseTo(0.5625, 4)
    })
  })

  describe('equals', () => {
    it('should return true for equal dimensions', () => {
      const dims1 = new ImageDimensions(1920, 1080)
      const dims2 = new ImageDimensions(1920, 1080)
      
      expect(dims1.equals(dims2)).toBe(true)
    })

    it('should return false for different dimensions', () => {
      const dims1 = new ImageDimensions(1920, 1080)
      const dims2 = new ImageDimensions(1280, 720)
      
      expect(dims1.equals(dims2)).toBe(false)
    })

    it('should return false for partially different dimensions', () => {
      const dims1 = new ImageDimensions(1920, 1080)
      const dims2 = new ImageDimensions(1920, 720)
      const dims3 = new ImageDimensions(1280, 1080)
      
      expect(dims1.equals(dims2)).toBe(false)
      expect(dims1.equals(dims3)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return formatted string', () => {
      const dims = new ImageDimensions(1920, 1080)
      expect(dims.toString()).toBe('1920x1080')
      
      const square = new ImageDimensions(512, 512)
      expect(square.toString()).toBe('512x512')
    })
  })
})