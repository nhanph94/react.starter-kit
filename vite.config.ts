import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

import { parseEnv } from './src/configs/env/helper.ts';

export default defineConfig(({ mode }) => {
  try {
    parseEnv(loadEnv(mode, process.cwd(), ''));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  return {
    plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
      tsconfigPaths: true,
    },
  } as UserConfig;
});
