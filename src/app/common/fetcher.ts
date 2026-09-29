import { appConfig } from '@/configs/app';
import { createHttpClient } from '@/libs/http';

const fetcher = createHttpClient({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiRequestTimeout,
  withCredentials: appConfig.apiRequestWithCredentials,
});

export { fetcher };
