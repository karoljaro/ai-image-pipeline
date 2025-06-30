/**
 * Port for loading images from various sources.
 * 
 * This interface abstracts image loading functionality, allowing different
 * implementations for file system, URLs, databases, etc.
 */
export interface ImageLoaderPort {
    /**
     * Load image data from File, URL, or Buffer.
     * 
     * @param input - Image input source
     * @returns Promise resolving to loaded image data with metadata
     * 
     * @throws {Error} When input cannot be loaded or is not a valid image
     */
    loadImage(input: File | string | Buffer): Promise<LoadedImageData>;
}

/**
 * Loaded image data with metadata.
 */
export interface LoadedImageData {
    /** Raw image data as Buffer */
    data: Buffer;
    /** Image width in pixels */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Image format (jpeg, png, webp, etc.) */
    format: string;
    /** File size in bytes */
    sizeBytes: number;
}
