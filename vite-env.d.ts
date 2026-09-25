/// <reference types="vite/client" />

import type { EnvInput } from './src/configs/env/schema.ts';

declare global {
  interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
  }

  interface ImportMetaEnv extends EnvInput {}
}

export type { ViteTypeOptions };
