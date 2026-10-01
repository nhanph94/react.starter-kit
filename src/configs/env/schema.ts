import { z } from 'zod';

const APP_ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

const appEnvSchema = z.enum(APP_ENV);

const envSchema = z.object({
  VITE_APP_TITLE: z.string().trim().optional().default('React / Starter KIT'),
  VITE_APP_DESCRIPTION: z
    .string()
    .trim()
    .optional()
    .default('A React starter kit powered by TypeScript and Vite.'),
  VITE_APP_URL: z.url().optional(),

  VITE_IDB_STORE: z.string().trim().optional(),

  VITE_API_BASE_URL: z.union([z.literal(''), z.url()]),
  VITE_API_REQUEST_TIMEOUT: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : Number(value)))
    .pipe(z.number().positive().optional()),
  VITE_API_REQUEST_WITH_CREDENTIALS: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value))
    .pipe(z.enum(['true', 'false']).optional())
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

type EnvInput = z.input<typeof envSchema>;
type Env = z.output<typeof envSchema>;
type AppEnv = z.output<typeof appEnvSchema>;

export type { AppEnv, Env, EnvInput };
export { APP_ENV, appEnvSchema, envSchema };
