import env from '@/configs/env';
import { APP_ENV } from '@/configs/env/schema';

export { APP_ENV };

export const appConfig = {
  env: env.VITE_APP_ENV,
  title: env.VITE_APP_TITLE,
} as const;
