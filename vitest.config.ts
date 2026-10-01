import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // Unit tests are co-located with the code they cover (`src/**`); E2E specs live in `test/e2e`
    // and are run by Playwright, not Vitest.
    include: ['src/**/*.spec.{ts,tsx}'],
    restoreMocks: true,
    // Deterministic API configuration, independent from the gitignored .env files.
    env: {
      VITE_API_BASE_URL: '',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.spec.{ts,tsx}'],
      thresholds: {
        statements: 40,
        branches: 35,
        functions: 35,
        lines: 40,
      },
    },
  },
});
