import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/**/*.test.ts',
                'src/**/__tests__/**',
                'dist/'
            ],
            thresholds: {
                global: {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@domain': path.resolve(__dirname, './src/domain'),
            '@domain/entities': path.resolve(__dirname, './src/domain/entities'),
            '@domain/value-objects': path.resolve(__dirname, './src/domain/value-objects'),
            '@domain/validation': path.resolve(__dirname, './src/domain/validation'),
            '@application': path.resolve(__dirname, './src/application'),
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@shared': path.resolve(__dirname, './src/shared')
        }
    }
})