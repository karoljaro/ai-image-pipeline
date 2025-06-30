import { Image } from '@domain/entities/Image';
import { ImageDimensions } from '@domain/value-objects/ImageDimensions';

/**
 * Enumeration of possible processing job statuses.
 * 
 * @enum {string}
 */
export enum ProcessingStatus {
    /** Job is created and waiting to be processed */
    PENDING = 'PENDING',
    /** Job is currently being processed */
    IN_PROGRESS = 'IN_PROGRESS',
    /** Job has completed successfully */
    COMPLETED = 'COMPLETED',
    /** Job has failed during processing */
    FAILED = 'FAILED'
}

/**
 * Represents a processing job for image enhancement/super-resolution.
 * 
 * This class manages the lifecycle of an image processing operation,
 * tracking its status, timing, and results. It follows a state machine pattern
 * where transitions are only allowed from specific states.
 * 
 * State transitions:
 * PENDING → IN_PROGRESS → COMPLETED/FAILED
 * 
 * @example
 * ```typescript
 * const job = new ProcessingJob('job-123', sourceImage);
 * job.startProcessing();
 * // ... processing logic ...
 * job.completeSuccessfully(enhancedDimensions, 2500);
 * ```
 */
export class ProcessingJob {
    private readonly _id: string;
    private readonly _sourceImage: Image;
    private _status: ProcessingStatus;
    private _enhancedDimensions: ImageDimensions | null;
    private _processingTimeMs: number | null;
    private _errorMessage: string | null;
    private readonly _createdAt: Date; 
    private _completedAt: Date | null;

    /**
     * Creates a new processing job for the given image.
     * 
     * @param id - Unique identifier for the processing job
     * @param sourceImage - The source image to be processed
     * 
     * @example
     * ```typescript
     * const sourceImage = new Image('img-123', 1920, 1080, 'jpeg', 500000);
     * const job = new ProcessingJob('job-456', sourceImage);
     * ```
     */
    constructor(id: string, sourceImage: Image) {
        this._id = id;
        this._sourceImage = sourceImage;
        this._status = ProcessingStatus.PENDING;
        this._enhancedDimensions = null;
        this._processingTimeMs = null;
        this._errorMessage = null;
        this._createdAt = new Date();
        this._completedAt = null;
    }

    /**
     * Gets the unique identifier of the processing job.
     * 
     * @returns The job ID
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets the source image being processed.
     * 
     * @returns The source Image entity
     */
    get sourceImage(): Image {
        return this._sourceImage;
    }

    /**
     * Gets the current status of the processing job.
     * 
     * @returns The current ProcessingStatus
     */
    get status(): ProcessingStatus {
        return this._status;
    }

    /**
     * Gets the enhanced dimensions after successful processing.
     * 
     * @returns The enhanced ImageDimensions if completed successfully, null otherwise
     */
    get enhancedDimensions(): ImageDimensions | null {
        return this._enhancedDimensions;
    }

    /**
     * Gets the processing time in milliseconds.
     * 
     * @returns The processing time if completed successfully, null otherwise
     */
    get processingTimeMs(): number | null {
        return this._processingTimeMs;
    }

    /**
     * Gets the error message if the job failed.
     * 
     * @returns The error message if failed, null otherwise
     */
    get errorMessage(): string | null {
        return this._errorMessage;
    }

    /**
     * Gets the creation timestamp of the job.
     * Returns a new Date instance to maintain immutability.
     * 
     * @returns A new Date instance representing when the job was created
     */
    get createdAt(): Date {
        return new Date(this._createdAt);
    }

    /**
     * Gets the completion timestamp of the job.
     * Returns a new Date instance to maintain immutability.
     * 
     * @returns A new Date instance representing when the job was completed, or null if not completed
     */
    get completedAt(): Date | null {
        return this._completedAt ? new Date(this._completedAt) : null;
    }

    /**
     * Checks if the job has completed successfully.
     * 
     * @returns True if the job status is COMPLETED, false otherwise
     */
    get isCompleted(): boolean {
        return this._status === ProcessingStatus.COMPLETED;
    }

    /**
     * Checks if the job has failed.
     * 
     * @returns True if the job status is FAILED, false otherwise
     */
    get hasFailed(): boolean {
        return this._status === ProcessingStatus.FAILED;
    }

    /**
     * Starts the processing job by changing status from PENDING to IN_PROGRESS.
     * 
     * @throws {Error} When the job is not in PENDING status
     * 
     * @example
     * ```typescript
     * const job = new ProcessingJob('job-123', sourceImage);
     * job.startProcessing(); // Status: PENDING → IN_PROGRESS
     * ```
     */
    startProcessing(): void {
        if (this._status !== ProcessingStatus.PENDING) {
            throw new Error('Job can only be started from PENDING status');
        }

        this._status = ProcessingStatus.IN_PROGRESS;
    }

    /**
     * Completes the job successfully with the processed results.
     * 
     * @param enhancedDimensions - The dimensions of the enhanced image
     * @param processingTimeMs - The time taken to process the image in milliseconds
     * 
     * @throws {Error} When the job is not in IN_PROGRESS status
     * 
     * @example
     * ```typescript
     * const enhancedDims = new ImageDimensions(3840, 2160);
     * job.completeSuccessfully(enhancedDims, 2500);
     * ```
     */
    completeSuccessfully(enhancedDimensions: ImageDimensions, processingTimeMs: number): void {
        if (this._status !== ProcessingStatus.IN_PROGRESS) {
            throw new Error('Job must be IN_PROGRESS to complete');
        }

        this._status = ProcessingStatus.COMPLETED;
        this._enhancedDimensions = enhancedDimensions;
        this._processingTimeMs = processingTimeMs;
        this._completedAt = new Date();
    }

    /**
     * Marks the job as failed with an error message.
     * 
     * @param errorMessage - Description of what went wrong during processing
     * 
     * @throws {Error} When the job is not in IN_PROGRESS status
     * 
     * @example
     * ```typescript
     * job.fail('GPU memory exceeded during processing');
     * ```
     */
    fail(errorMessage: string): void {
        if (this._status !== ProcessingStatus.IN_PROGRESS) {
            throw new Error('Job must be IN_PROGRESS to fail');
        }

        this._status = ProcessingStatus.FAILED;
        this._errorMessage = errorMessage;
        this._completedAt = new Date();
    }
}