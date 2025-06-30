import { ImageDimensions } from '@domain/value-objects/ImageDimensions';
import { ImageValidation } from '@domain/validation/ImageValidation';

/**
 * Represents an image entity with its metadata and business logic.
 * 
 * This class encapsulates image properties such as dimensions, format, and file size,
 * along with methods for determining image characteristics and capabilities for processing.
 * 
 * @example
 * ```typescript
 * const image = new Image('img-123', 1920, 1080, 'jpeg', 500000);
 * console.log(image.aspectRatio); // 1.7778
 * console.log(image.canBeUpscaled()); // true
 * ```
 */
export class Image {
    private readonly _id: string;
    private readonly _width: number;
    private readonly _height: number;
    private readonly _format: string;
    private readonly _sizeInBytes: number;
    private readonly _createdAt: Date;

    /**
     * Creates a new Image instance with validation.
     * 
     * @param id - Unique identifier for the image
     * @param width - Image width in pixels (must be positive integer)
     * @param height - Image height in pixels (must be positive integer)
     * @param format - Image format (jpeg, jpg, png, webp, bmp)
     * @param sizeInBytes - File size in bytes (must be positive, max 50MB)
     * 
     * @throws {Error} When dimensions are invalid (non-positive, non-integer, or exceed 10000px)
     * @throws {Error} When format is unsupported or invalid
     * @throws {Error} When file size is invalid (non-positive or exceeds 50MB)
     * 
     * @example
     * ```typescript
     * const image = new Image('img-123', 1920, 1080, 'jpeg', 500000);
     * ```
     */
    constructor(
        id: string,
        width: number,
        height: number,
        format: string,
        sizeInBytes: number
    ) {
        ImageValidation.validateDimensions(width, height);
        ImageValidation.validateFormat(format);
        ImageValidation.validateFileSize(sizeInBytes);

        this._id = id;
        this._width = width;
        this._height = height;
        this._format = format;
        this._sizeInBytes = sizeInBytes;
        this._createdAt = new Date();
    }

    /**
     * Gets the unique identifier of the image.
     * 
     * @returns The image ID
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets the width of the image in pixels.
     * 
     * @returns The image width
     */
    get width(): number {
        return this._width;
    }

    /**
     * Gets the height of the image in pixels.
     * 
     * @returns The image height
     */
    get height(): number {
        return this._height;
    }

    /**
     * Gets the format of the image.
     * 
     * @returns The image format (e.g., 'jpeg', 'png')
     */
    get format(): string {
        return this._format;
    }

    /**
     * Gets the file size in bytes.
     * 
     * @returns The file size in bytes
     */
    get sizeInBytes(): number {
        return this._sizeInBytes;
    }

    /**
     * Gets the creation timestamp of the image.
     * Returns a new Date instance to maintain immutability.
     * 
     * @returns A new Date instance representing when the image was created
     */
    get createdAt(): Date {
        return new Date(this._createdAt);
    }

    /**
     * Calculates the aspect ratio of the image (width/height).
     * 
     * @returns The aspect ratio as a number
     * 
     * @example
     * ```typescript
     * const image = new Image('id', 1920, 1080, 'jpeg', 500000);
     * console.log(image.aspectRatio); // 1.7778 (16:9 ratio)
     * ```
     */
    get aspectRatio(): number {
        return this._width / this._height;
    }

    /**
     * Calculates the image resolution in megapixels.
     * 
     * @returns The resolution in megapixels
     * 
     * @example
     * ```typescript
     * const image = new Image('id', 1920, 1080, 'jpeg', 500000);
     * console.log(image.megapixels); // 2.0736
     * ```
     */
    get megapixels(): number {
        return (this._width * this._height) / 1_000_000;
    }

    /**
     * Determines if the image is considered low resolution (less than 1 megapixel).
     * 
     * @returns True if the image has less than 1 megapixel, false otherwise
     * 
     * @example
     * ```typescript
     * const lowRes = new Image('id', 800, 600, 'jpeg', 100000);
     * console.log(lowRes.isLowResolution); // true (0.48 MP)
     * ```
     */
    get isLowResolution(): boolean {
        return this.megapixels < 1;
    }

    /**
     * Determines if the image can be upscaled based on its current dimensions.
     * Images with width or height >= 4000px are considered too large for upscaling.
     * 
     * @returns True if the image can be safely upscaled, false otherwise
     * 
     * @example
     * ```typescript
     * const image = new Image('id', 1920, 1080, 'jpeg', 500000);
     * console.log(image.canBeUpscaled()); // true
     * 
     * const largeImage = new Image('id', 4000, 4000, 'jpeg', 2000000);
     * console.log(largeImage.canBeUpscaled()); // false
     * ```
     */
    canBeUpscaled(): boolean {
        return this._width < 4000 && this._height < 4000;
    }

    /**
     * Calculates the dimensions that would result from upscaling by a given factor.
     * 
     * @param factor - The upscale factor (must be > 1 and <= 4)
     * @returns New ImageDimensions object with the calculated upscaled dimensions
     * 
     * @throws {Error} When factor is <= 1, > 4, or not a finite number
     * 
     * @example
     * ```typescript
     * const image = new Image('id', 1920, 1080, 'jpeg', 500000);
     * const upscaled = image.getUpscaledDimensions(2);
     * console.log(upscaled.toString()); // "3840x2160"
     * ```
     */
    getUpscaledDimensions(factor: number): ImageDimensions {
        ImageValidation.validateUpscaleFactor(factor);

        return new ImageDimensions(
            Math.round(this._width * factor),
            Math.round(this._height * factor)
        );
    }
}