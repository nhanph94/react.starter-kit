import { z } from 'zod';

const APP_ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

const envSchema = z.object({
  VITE_APP_ENV: z.enum(APP_ENV),

  VITE_APP_TITLE: z.string().trim().optional().default('React / Starter KIT'),

  VITE_IDB_STORE: z.string().trim().optional(),
});

type EnvInput = z.input<typeof envSchema>;
type Env = z.output<typeof envSchema>;

export type { Env, EnvInput };
export { APP_ENV, envSchema };
