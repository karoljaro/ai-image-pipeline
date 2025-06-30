import { ImageValidation } from "@domain/validation/ImageValidation";

/**
 * Value object representing image dimensions (width and height).
 * 
 * This immutable class encapsulates width and height with validation,
 * ensuring that dimensions are always valid positive integers.
 * As a value object, instances are compared by their values rather than identity.
 * 
 * @example
 * ```typescript
 * const dimensions = new ImageDimensions(1920, 1080);
 * console.log(dimensions.aspectRatio); // 1.7778
 * console.log(dimensions.toString()); // "1920x1080"
 * ```
 */
export class ImageDimensions {
    private readonly _width: number; 
    private readonly _height: number;

    /**
     * Creates new ImageDimensions with validation.
     * 
     * @param width - Width in pixels (must be positive integer, max 10000)
     * @param height - Height in pixels (must be positive integer, max 10000)
     * 
     * @throws {Error} When dimensions are invalid (non-positive, non-integer, or exceed 10000px)
     * 
     * @example
     * ```typescript
     * const dimensions = new ImageDimensions(1920, 1080);
     * const square = new ImageDimensions(512, 512);
     * ```
     */
    constructor(width: number, height: number) {
        ImageValidation.validateDimensions(width, height);

        this._width = width;
        this._height = height;
    }

    /**
     * Gets the width in pixels.
     * 
     * @returns The width value
     */
    get width(): number {
        return this._width;
    }

    /**
     * Gets the height in pixels.
     * 
     * @returns The height value
     */
    get height(): number {
        return this._height;
    }

    /**
     * Calculates the aspect ratio (width/height).
     * 
     * @returns The aspect ratio as a number
     * 
     * @example
     * ```typescript
     * const hd = new ImageDimensions(1920, 1080);
     * console.log(hd.aspectRatio); // 1.7778 (16:9 ratio)
     * 
     * const square = new ImageDimensions(1000, 1000);
     * console.log(square.aspectRatio); // 1.0 (1:1 ratio)
     * ```
     */
    get aspectRatio(): number {
        return this._width / this._height;
    }

    /**
     * Compares this ImageDimensions with another for equality.
     * Two ImageDimensions are equal if they have the same width and height.
     * 
     * @param other - The other ImageDimensions to compare with
     * @returns True if dimensions are equal, false otherwise
     * 
     * @example
     * ```typescript
     * const dims1 = new ImageDimensions(1920, 1080);
     * const dims2 = new ImageDimensions(1920, 1080);
     * const dims3 = new ImageDimensions(1280, 720);
     * 
     * console.log(dims1.equals(dims2)); // true
     * console.log(dims1.equals(dims3)); // false
     * ```
     */
    equals(other: ImageDimensions): boolean {
        return this._width === other.width && this._height === other.height;
    }

    /**
     * Returns a string representation of the dimensions in "WIDTHxHEIGHT" format.
     * 
     * @returns String representation of dimensions
     * 
     * @example
     * ```typescript
     * const dimensions = new ImageDimensions(1920, 1080);
     * console.log(dimensions.toString()); // "1920x1080"
     * ```
     */
    toString(): string {
        return `${this._width}x${this._height}`;
    }
}