import { appConfig } from '@/configs/app';
import { createHttpClient } from '@/libs/http';

const apiClient = createHttpClient({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiRequestTimeout,
  withCredentials: appConfig.apiRequestWithCredentials,
  auth: {
    refreshToken: {
      path: '/auth/refresh',
      in: 'body',
      value: (tokens) => (tokens?.refreshToken ? { refreshToken: tokens.refreshToken } : null),
    },
    accessToken: {
      in: 'header',
      name: 'Authorization',
      value: (tokens) => (tokens?.accessToken ? `Bearer ${tokens.accessToken}` : null),
    },
    persist: {
      storage: localStorage,
      key: 'tokens',
    },
  },
});

export { apiClient };
