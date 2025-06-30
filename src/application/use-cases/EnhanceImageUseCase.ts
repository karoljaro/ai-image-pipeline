import { Image } from '@domain/entities/Image';
import { ProcessingJob } from '@domain/entities/ProcessingJob';
import { ImageValidation } from '@domain/validation/ImageValidation';
import { ImageLoaderPort } from '@application/ports/ImageLoaderPort';
import { SuperResolutionPort } from '@application/ports/SuperResolutionPort';
import { EnhanceImageRequest, EnhanceImageResponse } from '@application/types/EnhanceImageTypes';

/**
 * Use case for enhancing image quality using AI super-resolution.
 * 
 * This is the main business logic for improving image quality from low to high resolution.
 * It coordinates image loading, AI processing, and result tracking.
 */
export class EnhanceImageUseCase {
    constructor(
        private readonly imageLoader: ImageLoaderPort,
        private readonly superResolution: SuperResolutionPort
    ) {}

    async execute(request: EnhanceImageRequest): Promise<EnhanceImageResponse> {
        const startTime = Date.now();
        
        const upscaleFactor = request.upscaleFactor ?? 2;
        
        let originalImage: Image | undefined;
        let job: ProcessingJob | undefined;
        
        try {
            // 1. Validate upscale factor
            ImageValidation.validateUpscaleFactor(upscaleFactor);
            
            // 2. Load original image
            const loadedImage = await this.imageLoader.loadImage(request.imageInput);
            
            // 3. Validate image dimensions
            ImageValidation.validateDimensions(loadedImage.width, loadedImage.height);
            ImageValidation.validateFileSize(loadedImage.sizeBytes);
            ImageValidation.validateFormat(loadedImage.format);
            
            // 4. Create image entity
            const imageId = this.generateImageId();
            originalImage = new Image(
                imageId,
                loadedImage.width,
                loadedImage.height,
                loadedImage.format,
                loadedImage.sizeBytes
            );
            
            // 5. Create processing job
            const jobId = this.generateJobId();
            job = new ProcessingJob(jobId, originalImage);
            
            // 6. Start processing
            job.startProcessing();
            
            // 7. Enhance image with AI
            const result = await this.superResolution.enhanceImage(loadedImage.data, upscaleFactor);
            
            // 8. Calculate enhanced dimensions
            const enhancedDimensions = originalImage.getUpscaledDimensions(upscaleFactor);
            
            // 9. Complete job successfully
            const totalProcessingTime = Date.now() - startTime;
            job.completeSuccessfully(enhancedDimensions, totalProcessingTime);
            
            return {
                success: true,
                enhancedImageData: result.enhancedImageData,
                originalImage,
                job,
                enhancedDimensions,
                processingTimeMs: totalProcessingTime
            };
            
        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            job?.fail(errorMessage);
            
            const errorResponse: EnhanceImageResponse = {
                success: false,
                processingTimeMs: processingTime,
                errorMessage
            };
            
            if (originalImage) {
                errorResponse.originalImage = originalImage;
            }
            if (job) {
                errorResponse.job = job;
            }
            
            return errorResponse;
        }
    }
    
    private generateImageId(): string {
        return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    private generateJobId(): string {
        return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
