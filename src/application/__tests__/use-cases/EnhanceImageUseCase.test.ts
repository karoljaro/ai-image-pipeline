import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhanceImageUseCase } from '../../use-cases/EnhanceImageUseCase';
import { ImageLoaderPort } from '../../ports/ImageLoaderPort';
import { SuperResolutionPort } from '../../ports/SuperResolutionPort';
import { Image } from '../../../domain/entities/Image';
import { ProcessingJob, ProcessingStatus } from '../../../domain/entities/ProcessingJob';

describe('EnhanceImageUseCase', () => {
    let useCase: EnhanceImageUseCase;
    let mockImageLoader: ImageLoaderPort;
    let mockSuperResolution: SuperResolutionPort;

    beforeEach(() => {
        mockImageLoader = {
            loadImage: vi.fn()
        };

        mockSuperResolution = {
            enhanceImage: vi.fn()
        };

        useCase = new EnhanceImageUseCase(mockImageLoader, mockSuperResolution);
    });

    it('should successfully enhance an image with default options', async () => {
        // Arrange
        const testFile = new File([Buffer.from('fake-image-data')], 'test.jpg', { type: 'image/jpeg' });
        
        const loadedImage = {
            data: Buffer.from('original-image-data'),
            width: 800,
            height: 600,
            format: 'jpeg',
            sizeBytes: 50000
        };

        const enhancementResult = {
            enhancedImageData: Buffer.from('enhanced-image-data'),
            processingTimeMs: 1500
        };

        (mockImageLoader.loadImage as any).mockResolvedValue(loadedImage);
        (mockSuperResolution.enhanceImage as any).mockResolvedValue(enhancementResult);

        // Act
        const result = await useCase.execute({
            imageInput: testFile
        });

        // Assert
        expect(result.success).toBe(true);
        expect(result.enhancedImageData).toBe(enhancementResult.enhancedImageData);
        expect(result.originalImage).toBeInstanceOf(Image);
        expect(result.originalImage.width).toBe(800);
        expect(result.originalImage.height).toBe(600);
        expect(result.job).toBeInstanceOf(ProcessingJob);
        expect(result.job.status).toBe(ProcessingStatus.COMPLETED);
        expect(result.enhancedDimensions?.width).toBe(1600); // 2x upscale
        expect(result.enhancedDimensions?.height).toBe(1200); // 2x upscale
        expect(typeof result.processingTimeMs).toBe('number');
        expect(result.processingTimeMs).toBeGreaterThanOrEqual(0); // Allow 0 for fast tests
    });

    it('should enhance image with custom upscale factor', async () => {
        // Arrange
        const imageData = Buffer.from('test-image');
        
        const loadedImage = {
            data: imageData,
            width: 400,
            height: 300,
            format: 'png',
            sizeBytes: 25000
        };

        const enhancementResult = {
            enhancedImageData: Buffer.from('enhanced-3x'),
            processingTimeMs: 3000
        };

        (mockImageLoader.loadImage as any).mockResolvedValue(loadedImage);
        (mockSuperResolution.enhanceImage as any).mockResolvedValue(enhancementResult);

        // Act
        const result = await useCase.execute({
            imageInput: 'http://example.com/image.png',
            upscaleFactor: 3
        });

        // Assert
        expect(result.success).toBe(true);
        expect(result.enhancedDimensions?.width).toBe(1200); // 3x upscale
        expect(result.enhancedDimensions?.height).toBe(900); // 3x upscale
        
        // Verify AI was called with correct parameters
        expect(mockSuperResolution.enhanceImage).toHaveBeenCalledWith(imageData, 3);
    });

    it('should handle image loading failure', async () => {
        // Arrange
        const error = new Error('Failed to load image');
        (mockImageLoader.loadImage as any).mockRejectedValue(error);

        // Act
        const result = await useCase.execute({
            imageInput: 'invalid-file.jpg'
        });

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorMessage).toBe('Failed to load image');
        expect(result.originalImage).toBeUndefined(); // Nie ma obrazu bo nie udało się załadować
        expect(result.job).toBeUndefined(); // Nie ma job bo nie stworzono
        expect(result.enhancedImageData).toBeUndefined();
    });

    it('should handle AI processing failure', async () => {
        // Arrange
        const loadedImage = {
            data: Buffer.from('test-data'),
            width: 500,
            height: 400,
            format: 'jpeg',
            sizeBytes: 30000
        };

        (mockImageLoader.loadImage as any).mockResolvedValue(loadedImage);
        (mockSuperResolution.enhanceImage as any).mockRejectedValue(new Error('AI processing failed'));

        // Act
        const result = await useCase.execute({
            imageInput: Buffer.from('test')
        });

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorMessage).toBe('AI processing failed');
        expect(result.job.status).toBe(ProcessingStatus.FAILED);
    });

    it('should validate upscale factor', async () => {
        // Act & Assert - invalid upscale factor
        const result = await useCase.execute({
            imageInput: Buffer.from('test'),
            upscaleFactor: 5 // Invalid - too high
        });

        expect(result.success).toBe(false);
        expect(result.errorMessage).toContain('Upscale factor');
    });
});
