import { z } from 'zod';

const APP_ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

const envSchema = z.object({
  VITE_APP_ENV: z.enum(APP_ENV),

  VITE_APP_TITLE: z
    .string()
    .optional()
    .default('React / Starter KIT')
    .transform((val) => val.trim()),
});

type EnvInput = z.input<typeof envSchema>;
type Env = z.output<typeof envSchema>;

export type { Env, EnvInput };
export { APP_ENV, envSchema };
