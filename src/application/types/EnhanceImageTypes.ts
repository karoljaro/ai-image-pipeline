import { Image } from '@domain/entities/Image';
import { ProcessingJob } from '@domain/entities/ProcessingJob';
import { ImageDimensions } from '@domain/value-objects/ImageDimensions';

/**
 * Request for image enhancement operation.
 */
export interface EnhanceImageRequest {
    /** Image input - can be File, URL, or Buffer */
    imageInput: File | string | Buffer;
    /** Upscale factor (1.1 to 4.0) */
    upscaleFactor?: number;
}

/**
 * Response from image enhancement operation.
 */
export interface EnhanceImageResponse {
    /** Processing was successful */
    success: boolean;
    /** Enhanced image data (if successful) */
    enhancedImageData?: Buffer;
    /** Original image entity (if successfully loaded) */
    originalImage?: Image;
    /** Processing job with status tracking (if job was created) */
    job?: ProcessingJob;
    /** Enhanced image dimensions (if successful) */
    enhancedDimensions?: ImageDimensions;
    /** Processing time in milliseconds */
    processingTimeMs: number;
    /** Error message (if failed) */
    errorMessage?: string;
}
