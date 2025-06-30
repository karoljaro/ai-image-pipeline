/**
 * Static validation class for image-related business rules.
 * 
 * This class contains centralized validation logic for image properties
 * such as dimensions, format, file size, and upscale factors.
 * All methods are static and throw descriptive errors when validation fails.
 * 
 * @example
 * ```typescript
 * ImageValidation.validateDimensions(1920, 1080); // passes
 * ImageValidation.validateFormat('jpeg'); // passes
 * ImageValidation.validateFileSize(500000); // passes
 * ImageValidation.validateUpscaleFactor(2); // passes
 * ```
 */
export class ImageValidation {

    /**
     * Validates image dimensions for business rules compliance.
     * 
     * Rules:
     * - Both width and height must be positive numbers
     * - Both width and height must be integers  
     * - Neither width nor height can exceed 10,000 pixels
     * 
     * @param width - Width in pixels to validate
     * @param height - Height in pixels to validate
     * 
     * @throws {Error} When dimensions are zero, negative, non-integer, or exceed maximum size
     * 
     * @example
     * ```typescript
     * ImageValidation.validateDimensions(1920, 1080); // passes
     * ImageValidation.validateDimensions(0, 1080); // throws error
     * ImageValidation.validateDimensions(1920.5, 1080); // throws error
     * ```
     */
    static validateDimensions(width: number, height: number): void {
        if (width <= 0 || height <= 0) {
            throw new Error('Image dimensions must be positive numbers');
        }

        if (!Number.isInteger(width) || !Number.isInteger(height)) {
            throw new Error('Image dimensions must be integers');
        }

        if (width > 10000 || height > 10000) {
            throw new Error('Image dimensions exceed maximum allowed size (10000px)');
        }
    }

    /**
     * Validates image format against supported formats.
     * 
     * Supported formats: jpeg, jpg, png, webp, bmp (case-insensitive)
     * 
     * @param format - Image format string to validate
     * 
     * @throws {Error} When format is empty, null, undefined, or unsupported
     * 
     * @example
     * ```typescript
     * ImageValidation.validateFormat('jpeg'); // passes
     * ImageValidation.validateFormat('PNG'); // passes (case-insensitive)
     * ImageValidation.validateFormat('gif'); // throws error (unsupported)
     * ImageValidation.validateFormat(''); // throws error (empty)
     * ```
     */
    static validateFormat(format: string): void {
        const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'bmp'];

        if (!format || typeof format !== 'string') {
            throw new Error('Image format must be a non-empty string');
        }

        if (!supportedFormats.includes(format.toLowerCase())) {
            throw new Error(`Unsupported image format: ${format}. Supported: ${supportedFormats.join(', ')}`);
        }
    }

    /**
     * Validates file size against business constraints.
     * 
     * Rules:
     * - File size must be positive (greater than 0 bytes)
     * - File size cannot exceed 50MB (52,428,800 bytes)
     * 
     * @param sizeInBytes - File size in bytes to validate
     * 
     * @throws {Error} When file size is zero, negative, or exceeds maximum allowed size
     * 
     * @example
     * ```typescript
     * ImageValidation.validateFileSize(500000); // passes (500KB)
     * ImageValidation.validateFileSize(50 * 1024 * 1024); // passes (50MB exactly)
     * ImageValidation.validateFileSize(0); // throws error
     * ImageValidation.validateFileSize(60 * 1024 * 1024); // throws error (exceeds 50MB)
     * ```
     */
    static validateFileSize(sizeInBytes: number): void {
        const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

        if (sizeInBytes <= 0) {
            throw new Error('File size must be positive');
        }

        if (sizeInBytes > maxSizeInBytes) {
            throw new Error(`File size exceeds maximum allowed (${maxSizeInBytes / 1024 / 1024}MB)`);
        }
    }

    /**
     * Validates upscale factor for image processing constraints.
     * 
     * Rules:
     * - Factor must be a finite number (not NaN or Infinity)
     * - Factor must be greater than 1 (no downscaling or same-size)
     * - Factor cannot exceed 4x for performance and memory reasons
     * 
     * @param factor - Upscale factor to validate
     * 
     * @throws {Error} When factor is invalid, not finite, <= 1, or > 4
     * 
     * @example
     * ```typescript
     * ImageValidation.validateUpscaleFactor(2); // passes (2x upscale)
     * ImageValidation.validateUpscaleFactor(4); // passes (4x upscale, maximum)
     * ImageValidation.validateUpscaleFactor(1.5); // passes (1.5x upscale)
     * ImageValidation.validateUpscaleFactor(1); // throws error (no upscale)
     * ImageValidation.validateUpscaleFactor(5); // throws error (exceeds maximum)
     * ImageValidation.validateUpscaleFactor(Infinity); // throws error (not finite)
     * ```
     */
    static validateUpscaleFactor(factor: number): void {
        if (!Number.isFinite(factor)) {
            throw new Error('Upscale factor must be a finite number');
        }

        if (factor <= 1) {
            throw new Error('Upscale factor must be greater than 1');
        }

        if (factor > 4) {
            throw new Error('Upscale factor cannot exceed 4x for performance reasons');
        }
    }
}