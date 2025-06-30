import { describe, it, expect } from 'vitest'
import { ImageValidation } from '../../validation/ImageValidation'

describe('ImageValidation', () => {
  describe('validateDimensions', () => {
    it('should pass for valid dimensions', () => {
      expect(() => ImageValidation.validateDimensions(1920, 1080)).not.toThrow()
      expect(() => ImageValidation.validateDimensions(1, 1)).not.toThrow()
      expect(() => ImageValidation.validateDimensions(9999, 9999)).not.toThrow()
    })

    it('should throw for zero or negative dimensions', () => {
      expect(() => ImageValidation.validateDimensions(0, 1080))
        .toThrowError('Image dimensions must be positive numbers')
      
      expect(() => ImageValidation.validateDimensions(1920, 0))
        .toThrowError('Image dimensions must be positive numbers')
      
      expect(() => ImageValidation.validateDimensions(-100, 1080))
        .toThrowError('Image dimensions must be positive numbers')
    })

    it('should throw for non-integer dimensions', () => {
      expect(() => ImageValidation.validateDimensions(1920.5, 1080))
        .toThrowError('Image dimensions must be integers')
      
      expect(() => ImageValidation.validateDimensions(1920, 1080.3))
        .toThrowError('Image dimensions must be integers')
    })

    it('should throw for dimensions exceeding maximum', () => {
      expect(() => ImageValidation.validateDimensions(10001, 1080))
        .toThrowError('Image dimensions exceed maximum allowed size (10000px)')
      
      expect(() => ImageValidation.validateDimensions(1920, 10001))
        .toThrowError('Image dimensions exceed maximum allowed size (10000px)')
    })
  })

  describe('validateFormat', () => {
    it('should pass for supported formats', () => {
      expect(() => ImageValidation.validateFormat('jpeg')).not.toThrow()
      expect(() => ImageValidation.validateFormat('JPG')).not.toThrow()
      expect(() => ImageValidation.validateFormat('png')).not.toThrow()
      expect(() => ImageValidation.validateFormat('WEBP')).not.toThrow()
      expect(() => ImageValidation.validateFormat('bmp')).not.toThrow()
    })

    it('should throw for unsupported formats', () => {
      expect(() => ImageValidation.validateFormat('gif'))
        .toThrowError('Unsupported image format: gif. Supported: jpeg, jpg, png, webp, bmp')
      
      expect(() => ImageValidation.validateFormat('tiff'))
        .toThrowError('Unsupported image format: tiff. Supported: jpeg, jpg, png, webp, bmp')
    })

    it('should throw for invalid format input', () => {
      expect(() => ImageValidation.validateFormat(''))
        .toThrowError('Image format must be a non-empty string')
      
      expect(() => ImageValidation.validateFormat(null as any))
        .toThrowError('Image format must be a non-empty string')
      
      expect(() => ImageValidation.validateFormat(undefined as any))
        .toThrowError('Image format must be a non-empty string')
    })
  })

  describe('validateFileSize', () => {
    it('should pass for valid file sizes', () => {
      expect(() => ImageValidation.validateFileSize(1024)).not.toThrow()
      expect(() => ImageValidation.validateFileSize(50 * 1024 * 1024)).not.toThrow()
      expect(() => ImageValidation.validateFileSize(1)).not.toThrow()
    })

    it('should throw for invalid file sizes', () => {
      expect(() => ImageValidation.validateFileSize(0))
        .toThrowError('File size must be positive')
      
      expect(() => ImageValidation.validateFileSize(-1000))
        .toThrowError('File size must be positive')
      
      expect(() => ImageValidation.validateFileSize(51 * 1024 * 1024))
        .toThrowError('File size exceeds maximum allowed (50MB)')
    })
  })

  describe('validateUpscaleFactor', () => {
    it('should pass for valid upscale factors', () => {
      expect(() => ImageValidation.validateUpscaleFactor(2)).not.toThrow()
      expect(() => ImageValidation.validateUpscaleFactor(4)).not.toThrow()
      expect(() => ImageValidation.validateUpscaleFactor(1.5)).not.toThrow()
      expect(() => ImageValidation.validateUpscaleFactor(3.99)).not.toThrow()
    })

    it('should throw for invalid upscale factors', () => {
      expect(() => ImageValidation.validateUpscaleFactor(1))
        .toThrowError('Upscale factor must be greater than 1')
      
      expect(() => ImageValidation.validateUpscaleFactor(0.5))
        .toThrowError('Upscale factor must be greater than 1')
      
      expect(() => ImageValidation.validateUpscaleFactor(5))
        .toThrowError('Upscale factor cannot exceed 4x for performance reasons')
      
      expect(() => ImageValidation.validateUpscaleFactor(Infinity))
        .toThrowError('Upscale factor must be a finite number')
      
      expect(() => ImageValidation.validateUpscaleFactor(NaN))
        .toThrowError('Upscale factor must be a finite number')
    })
  })
})