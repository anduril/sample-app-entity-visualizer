import { defineConfig } from 'vitest/config';

// Test runner config. Kept separate from vite.config.ts so the app's dev
// server proxy setup doesn't run during tests.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
