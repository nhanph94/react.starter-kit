import env from '@/configs/env';
import { APP_ENV } from '@/configs/env/schema';

export { APP_ENV };

export const appConfig = {
  env: env.VITE_APP_ENV,
  title: env.VITE_APP_TITLE,
  description: env.VITE_APP_DESCRIPTION,
  url: env.VITE_APP_URL,

  apiBaseUrl: env.VITE_API_BASE_URL,
  apiRequestTimeout: env.VITE_API_REQUEST_TIMEOUT,
  apiRequestWithCredentials: env.VITE_API_REQUEST_WITH_CREDENTIALS,
} as const;
