import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import { parseThemeRegistry, themeRegistryModule } from './src/configs/theme/registry.ts';

const THEME_REGISTRY_MODULE = 'virtual:theme-registry';
const RESOLVED_THEME_REGISTRY_MODULE = `\0${THEME_REGISTRY_MODULE}`;

const themeRegistryPlugin = () => ({
  name: 'theme-registry-test',
  resolveId(id: string) {
    return id === THEME_REGISTRY_MODULE ? RESOLVED_THEME_REGISTRY_MODULE : undefined;
  },
  load(id: string) {
    if (id !== RESOLVED_THEME_REGISTRY_MODULE) return undefined;

    const css = readFileSync(resolve(process.cwd(), 'src/resources/styles/main.css'), 'utf8');
    return themeRegistryModule(parseThemeRegistry(css));
  },
});

export default defineConfig({
  plugins: [themeRegistryPlugin(), react(), svgr()],
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
