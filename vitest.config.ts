import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment: 'happy-dom' for faster DOM testing (no need for jsdom overhead)
    environment: 'happy-dom',
    
    // Global test setup
    globals: true,
    
    // Setup files to run before each test
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/dist/',
        '.next/',
      ],
      // Require 80% coverage in lib/services/
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      // Critical paths to enforce 100% coverage
      include: ['lib/services/**', 'lib/utils/horarios.ts', 'lib/validations/**'],
    },
    
    // Test include patterns
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', '.next'],
    
    // Test isolation
    isolate: true,
    threads: true,
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter
    reporters: ['verbose'],
    outputFile: {
      json: './coverage/test-results.json',
    },
  },
  
  // Alias configuration (match tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
