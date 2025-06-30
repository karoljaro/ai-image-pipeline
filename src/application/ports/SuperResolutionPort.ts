/**
 * Port for AI super-resolution processing.
 * 
 * This interface abstracts AI enhancement functionality, allowing different
 * AI implementations (TensorFlow.js, ONNX, cloud APIs, etc.).
 */
export interface SuperResolutionPort {
    /**
     * Enhance image quality using AI super-resolution.
     * 
     * @param imageData - Raw image data to enhance
     * @param upscaleFactor - Target upscale factor (1.1 to 4.0)
     * @returns Promise resolving to enhanced image data
     * 
     * @throws {Error} When AI processing fails
     */
    enhanceImage(imageData: Buffer, upscaleFactor: number): Promise<SuperResolutionResult>;
}

/**
 * Result from super-resolution processing.
 */
export interface SuperResolutionResult {
    /** Enhanced image data */
    enhancedImageData: Buffer;
    /** Processing time in milliseconds */
    processingTimeMs: number;
}
