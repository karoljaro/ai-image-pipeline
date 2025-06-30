import { describe, it, expect, beforeEach } from 'vitest'
import { Image } from '../../entities/Image'
import { ImageDimensions } from '../../value-objects/ImageDimensions'

describe('Image Entity', () => {
    const validImageData = {
        id: 'img-123',
        width: 1920,
        height: 1080,
        format: 'jpeg',
        sizeInBytes: 500000
    } as const

    describe('constructor', () => {
        it('should create valid image', () => {
            const image = new Image(
                validImageData.id,
                validImageData.width,
                validImageData.height,
                validImageData.format,
                validImageData.sizeInBytes
            )

            expect(image.id).toBe('img-123')
            expect(image.width).toBe(1920)
            expect(image.height).toBe(1080)
            expect(image.format).toBe('jpeg')
            expect(image.sizeInBytes).toBe(500000)
            expect(image.createdAt).toBeInstanceOf(Date)
        })

        it('should throw for invalid dimensions', () => {
            expect(() => new Image('img-123', 0, 1080, 'jpeg', 500000))
                .toThrowError('Image dimensions must be positive numbers')

            expect(() => new Image('img-123', 1920, -100, 'jpeg', 500000))
                .toThrowError('Image dimensions must be positive numbers')

            expect(() => new Image('img-123', 1920.5, 1080, 'jpeg', 500000))
                .toThrowError('Image dimensions must be integers')
        })

        it('should throw for invalid format', () => {
            expect(() => new Image('img-123', 1920, 1080, 'gif', 500000))
                .toThrowError('Unsupported image format: gif')

            expect(() => new Image('img-123', 1920, 1080, '', 500000))
                .toThrowError('Image format must be a non-empty string')
        })

        it('should throw for invalid file size', () => {
            expect(() => new Image('img-123', 1920, 1080, 'jpeg', 0))
                .toThrowError('File size must be positive')

            expect(() => new Image('img-123', 1920, 1080, 'jpeg', -1000))
                .toThrowError('File size must be positive')

            expect(() => new Image('img-123', 1920, 1080, 'jpeg', 60 * 1024 * 1024))
                .toThrowError('File size exceeds maximum allowed (50MB)')
        })
    })

    describe('business logic', () => {
        let image: Image

        beforeEach(() => {
            image = new Image(
                validImageData.id,
                validImageData.width,
                validImageData.height,
                validImageData.format,
                validImageData.sizeInBytes
            )
        })

        it('should calculate correct aspect ratio', () => {
            expect(image.aspectRatio).toBeCloseTo(1.7778, 4)

            const squareImage = new Image('square-1', 1000, 1000, 'png', 300000)
            expect(squareImage.aspectRatio).toBe(1)

            const portraitImage = new Image('portrait-1', 1080, 1920, 'jpeg', 400000)
            expect(portraitImage.aspectRatio).toBeCloseTo(0.5625, 4)
        })

        it('should calculate correct megapixels', () => {
            expect(image.megapixels).toBeCloseTo(2.0736, 4)

            const hdImage = new Image('hd-1', 1280, 720, 'jpeg', 200000)
            expect(hdImage.megapixels).toBeCloseTo(0.9216, 4)

            const fourKImage = new Image('4k-1', 3840, 2160, 'jpeg', 1000000)
            expect(fourKImage.megapixels).toBeCloseTo(8.2944, 4)
        })

        it('should identify low resolution correctly', () => {
            const lowResImage = new Image('low-1', 800, 600, 'jpeg', 100000)
            expect(lowResImage.isLowResolution).toBe(true)
            expect(lowResImage.megapixels).toBeLessThan(1)

            expect(image.isLowResolution).toBe(false)
            expect(image.megapixels).toBeGreaterThan(1)

            const exactlyOneMegapixel = new Image('1mp-1', 1000, 1000, 'jpeg', 300000)
            expect(exactlyOneMegapixel.isLowResolution).toBe(false)
            expect(exactlyOneMegapixel.megapixels).toBe(1)
        })

        it('should determine upscale capability', () => {
            expect(image.canBeUpscaled()).toBe(true)

            const highResImage = new Image('high-1', 5000, 5000, 'jpeg', 2000000)
            expect(highResImage.canBeUpscaled()).toBe(false)

            const borderlineImage = new Image('border-1', 4000, 4000, 'jpeg', 1500000)
            expect(borderlineImage.canBeUpscaled()).toBe(false)

            const justUnderLimitImage = new Image('under-1', 3999, 3999, 'jpeg', 1400000)
            expect(justUnderLimitImage.canBeUpscaled()).toBe(true)
        })

        it('should calculate upscaled dimensions correctly', () => {
            const upscaled2x = image.getUpscaledDimensions(2)
            expect(upscaled2x).toBeInstanceOf(ImageDimensions)
            expect(upscaled2x.width).toBe(3840)
            expect(upscaled2x.height).toBe(2160)

            const upscaled1_5x = image.getUpscaledDimensions(1.5)
            expect(upscaled1_5x.width).toBe(Math.round(1920 * 1.5))
            expect(upscaled1_5x.height).toBe(Math.round(1080 * 1.5))

            const upscaled4x = image.getUpscaledDimensions(4)
            expect(upscaled4x.width).toBe(7680)
            expect(upscaled4x.height).toBe(4320)
        })

        it('should throw for invalid upscale factor', () => {
            expect(() => image.getUpscaledDimensions(0.5))
                .toThrowError('Upscale factor must be greater than 1')

            expect(() => image.getUpscaledDimensions(1))
                .toThrowError('Upscale factor must be greater than 1')

            expect(() => image.getUpscaledDimensions(5))
                .toThrowError('Upscale factor cannot exceed 4x for performance reasons')

            expect(() => image.getUpscaledDimensions(Infinity))
                .toThrowError('Upscale factor must be a finite number')
        })
    })

    describe('immutability', () => {
        let image: Image

        beforeEach(() => {
            image = new Image(
                validImageData.id,
                validImageData.width,
                validImageData.height,
                validImageData.format,
                validImageData.sizeInBytes
            )
        })

        it('should return new Date instance for createdAt', () => {
            const date1 = image.createdAt
            const date2 = image.createdAt

            expect(date1).not.toBe(date2) // Different instances
            expect(date1.getTime()).toBe(date2.getTime()) // Same value
        })

        it('should have readonly properties', () => {
            // TypeScript compilation would fail if these weren't readonly
            // But we can test the getter behavior
            expect(image.id).toBe('img-123')
            expect(image.width).toBe(1920)
            expect(image.height).toBe(1080)
            expect(image.format).toBe('jpeg')
            expect(image.sizeInBytes).toBe(500000)
        })
    })

    describe('edge cases', () => {
        it('should handle minimum valid dimensions', () => {
            const minImage = new Image('min-1', 1, 1, 'png', 1000)

            expect(minImage.width).toBe(1)
            expect(minImage.height).toBe(1)
            expect(minImage.aspectRatio).toBe(1)
            expect(minImage.megapixels).toBe(0.000001)
            expect(minImage.isLowResolution).toBe(true)
        })

        it('should handle maximum valid dimensions', () => {
            const maxImage = new Image('max-1', 10000, 10000, 'jpeg', 50 * 1024 * 1024)

            expect(maxImage.width).toBe(10000)
            expect(maxImage.height).toBe(10000)
            expect(maxImage.canBeUpscaled()).toBe(false)
            expect(maxImage.megapixels).toBe(100)
        })

        it('should handle case-insensitive formats', () => {
            const jpegUpper = new Image('jpeg-upper', 1920, 1080, 'JPEG', 500000)
            const pngMixed = new Image('png-mixed', 1920, 1080, 'PnG', 500000)

            expect(jpegUpper.format).toBe('JPEG')
            expect(pngMixed.format).toBe('PnG')
        })
    })
})