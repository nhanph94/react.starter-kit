import { appConfig } from '@/configs/app';
import { createHttpClient } from '@/libs/http';

const apiClient = createHttpClient({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiRequestTimeout,
  withCredentials: appConfig.apiRequestWithCredentials,
});

export { apiClient };
