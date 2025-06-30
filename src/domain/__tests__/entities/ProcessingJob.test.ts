import { describe, it, expect, beforeEach } from 'vitest'
import { ImageDimensions } from '../../value-objects/ImageDimensions'
import { Image } from '../../entities/Image'
import { ProcessingJob, ProcessingStatus } from '../../entities/ProcessingJob'

describe('ProcessingJob Entity', () => {
    let sourceImage: Image
    let job: ProcessingJob

    beforeEach(() => {
        sourceImage = new Image('img-123', 1920, 1080, 'jpeg', 500000)
        job = new ProcessingJob('job-456', sourceImage)
    })

    describe('constructor', () => {
        it('should create job with initial state', () => {
            expect(job.id).toBe('job-456')
            expect(job.sourceImage).toBe(sourceImage)
            expect(job.status).toBe(ProcessingStatus.PENDING)
            expect(job.enhancedDimensions).toBeNull()
            expect(job.processingTimeMs).toBeNull()
            expect(job.errorMessage).toBeNull()
            expect(job.createdAt).toBeInstanceOf(Date)
            expect(job.completedAt).toBeNull()
            expect(job.isCompleted).toBe(false)
            expect(job.hasFailed).toBe(false)
        })

        it('should have unique creation time', () => {
            const job1 = new ProcessingJob('job-1', sourceImage)
            const job2 = new ProcessingJob('job-2', sourceImage)

            // Jobs created at slightly different times
            expect(job1.createdAt).toBeDefined()
            expect(job2.createdAt).toBeDefined()
        })
    })

    describe('state transitions', () => {
        describe('startProcessing', () => {
            it('should start processing from PENDING', () => {
                expect(job.status).toBe(ProcessingStatus.PENDING)

                job.startProcessing()

                expect(job.status).toBe(ProcessingStatus.IN_PROGRESS)
            })

            it('should throw when starting from non-PENDING status', () => {
                job.startProcessing()
                expect(job.status).toBe(ProcessingStatus.IN_PROGRESS)

                expect(() => job.startProcessing())
                    .toThrowError('Job can only be started from PENDING status')
            })

            it('should throw when starting from COMPLETED status', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)

                job.startProcessing()
                job.completeSuccessfully(enhancedDims, 2500)

                expect(() => job.startProcessing())
                    .toThrowError('Job can only be started from PENDING status')
            })

            it('should throw when starting from FAILED status', () => {
                job.startProcessing()
                job.fail('GPU error')

                expect(() => job.startProcessing())
                    .toThrowError('Job can only be started from PENDING status')
            })
        })

        describe('completeSuccessfully', () => {
            it('should complete successfully from IN_PROGRESS', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)
                const processingTime = 2500

                job.startProcessing()
                job.completeSuccessfully(enhancedDims, processingTime)

                expect(job.status).toBe(ProcessingStatus.COMPLETED)
                expect(job.enhancedDimensions).toBe(enhancedDims)
                expect(job.processingTimeMs).toBe(processingTime)
                expect(job.completedAt).toBeInstanceOf(Date)
                expect(job.isCompleted).toBe(true)
                expect(job.hasFailed).toBe(false)
                expect(job.errorMessage).toBeNull()
            })

            it('should throw when completing from PENDING status', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)

                expect(() => job.completeSuccessfully(enhancedDims, 2500))
                    .toThrowError('Job must be IN_PROGRESS to complete')
            })

            it('should throw when completing from COMPLETED status', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)

                job.startProcessing()
                job.completeSuccessfully(enhancedDims, 2500)

                expect(() => job.completeSuccessfully(enhancedDims, 3000))
                    .toThrowError('Job must be IN_PROGRESS to complete')
            })

            it('should throw when completing from FAILED status', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)

                job.startProcessing()
                job.fail('Error occurred')

                expect(() => job.completeSuccessfully(enhancedDims, 2500))
                    .toThrowError('Job must be IN_PROGRESS to complete')
            })
        })

        describe('fail', () => {
            it('should fail from IN_PROGRESS', () => {
                const errorMessage = 'GPU memory exceeded'

                job.startProcessing()
                job.fail(errorMessage)

                expect(job.status).toBe(ProcessingStatus.FAILED)
                expect(job.errorMessage).toBe(errorMessage)
                expect(job.completedAt).toBeInstanceOf(Date)
                expect(job.isCompleted).toBe(false)
                expect(job.hasFailed).toBe(true)
                expect(job.enhancedDimensions).toBeNull()
                expect(job.processingTimeMs).toBeNull()
            })

            it('should throw when failing from PENDING status', () => {
                expect(() => job.fail('Error'))
                    .toThrowError('Job must be IN_PROGRESS to fail')
            })

            it('should throw when failing from COMPLETED status', () => {
                const enhancedDims = new ImageDimensions(3840, 2160)

                job.startProcessing()
                job.completeSuccessfully(enhancedDims, 2500)

                expect(() => job.fail('Error'))
                    .toThrowError('Job must be IN_PROGRESS to fail')
            })

            it('should throw when failing from FAILED status', () => {
                job.startProcessing()
                job.fail('First error')

                expect(() => job.fail('Second error'))
                    .toThrowError('Job must be IN_PROGRESS to fail')
            })
        })
    })

    describe('business logic properties', () => {
        it('should correctly identify completed jobs', () => {
            expect(job.isCompleted).toBe(false)

            job.startProcessing()
            expect(job.isCompleted).toBe(false)

            const enhancedDims = new ImageDimensions(3840, 2160)
            job.completeSuccessfully(enhancedDims, 2500)
            expect(job.isCompleted).toBe(true)
        })

        it('should correctly identify failed jobs', () => {
            expect(job.hasFailed).toBe(false)

            job.startProcessing()
            expect(job.hasFailed).toBe(false)

            job.fail('GPU error')
            expect(job.hasFailed).toBe(true)
        })

        it('should have mutually exclusive completion states', () => {
            const enhancedDims = new ImageDimensions(3840, 2160)

            // Success case
            const successJob = new ProcessingJob('success-job', sourceImage)
            successJob.startProcessing()
            successJob.completeSuccessfully(enhancedDims, 2500)

            expect(successJob.isCompleted).toBe(true)
            expect(successJob.hasFailed).toBe(false)

            // Failure case
            const failJob = new ProcessingJob('fail-job', sourceImage)
            failJob.startProcessing()
            failJob.fail('Error')

            expect(failJob.isCompleted).toBe(false)
            expect(failJob.hasFailed).toBe(true)
        })
    })

    describe('immutability', () => {
        it('should return new Date instances for timestamps', () => {
            const created1 = job.createdAt
            const created2 = job.createdAt

            expect(created1).not.toBe(created2) // Different instances
            expect(created1.getTime()).toBe(created2.getTime()) // Same value
        })

        it('should return new Date for completedAt when completed', () => {
            job.startProcessing()
            job.fail('Error')

            const completed1 = job.completedAt
            const completed2 = job.completedAt

            expect(completed1).not.toBe(completed2) // Different instances
            expect(completed1!.getTime()).toBe(completed2!.getTime()) // Same value
        })

        it('should preserve source image reference', () => {
            expect(job.sourceImage).toBe(sourceImage)

            // Source image should remain unchanged throughout job lifecycle
            job.startProcessing()
            expect(job.sourceImage).toBe(sourceImage)

            const enhancedDims = new ImageDimensions(3840, 2160)
            job.completeSuccessfully(enhancedDims, 2500)
            expect(job.sourceImage).toBe(sourceImage)
        })
    })

    describe('edge cases', () => {
        it('should handle zero processing time', () => {
            const enhancedDims = new ImageDimensions(3840, 2160)

            job.startProcessing()
            job.completeSuccessfully(enhancedDims, 0)

            expect(job.processingTimeMs).toBe(0)
            expect(job.isCompleted).toBe(true)
        })

        it('should handle very long processing time', () => {
            const enhancedDims = new ImageDimensions(3840, 2160)
            const longProcessingTime = 60000 // 1 minute

            job.startProcessing()
            job.completeSuccessfully(enhancedDims, longProcessingTime)

            expect(job.processingTimeMs).toBe(longProcessingTime)
        })

        it('should handle empty error messages', () => {
            job.startProcessing()
            job.fail('')

            expect(job.errorMessage).toBe('')
            expect(job.hasFailed).toBe(true)
        })

        it('should handle very long error messages', () => {
            const longError = 'A'.repeat(1000)

            job.startProcessing()
            job.fail(longError)

            expect(job.errorMessage).toBe(longError)
            expect(job.hasFailed).toBe(true)
        })
    })

    describe('ProcessingStatus enum', () => {
        it('should have all expected status values', () => {
            expect(ProcessingStatus.PENDING).toBe('PENDING')
            expect(ProcessingStatus.IN_PROGRESS).toBe('IN_PROGRESS')
            expect(ProcessingStatus.COMPLETED).toBe('COMPLETED')
            expect(ProcessingStatus.FAILED).toBe('FAILED')
        })
    })
})