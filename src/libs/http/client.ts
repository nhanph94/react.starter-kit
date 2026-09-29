import axios, { type AxiosInstance, isAxiosError } from 'axios';

import { HTTP_ERROR_MESSAGE, HTTP_STATUS, type HttpErrorStatus } from './constants';

class HttpError extends Error {
  readonly status: HttpErrorStatus;

  constructor(status: HttpErrorStatus, cause: unknown) {
    super(HTTP_ERROR_MESSAGE[status], { cause });
    this.name = 'HttpError';
    this.status = status;
  }
}

const isHttpErrorStatus = (status: number | undefined): status is HttpErrorStatus =>
  status === HTTP_STATUS.UNAUTHORIZED ||
  status === HTTP_STATUS.FORBIDDEN ||
  status === HTTP_STATUS.SERVER_ERROR;

type HttpClientConfig = {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  onRejected?: (error: unknown) => unknown;
};

const defaultConfig = {
  timeout: 10_000,
  withCredentials: true,
};

const resolveConfigs = (configs: HttpClientConfig) => ({
  baseURL: configs.baseURL,
  timeout: configs.timeout ?? defaultConfig.timeout,
  withCredentials: configs.withCredentials ?? defaultConfig.withCredentials,
});

const onRejected = (error: unknown): never => {
  if (!isAxiosError(error)) throw error;

  const status = error.response?.status;
  if (isHttpErrorStatus(status)) throw new HttpError(status, error);

  throw error;
};

const createHttpClient = (configs: HttpClientConfig): AxiosInstance => {
  const client = axios.create({
    headers: { Accept: 'application/json' },
    ...resolveConfigs(configs),
  });

  client.interceptors.response.use(undefined, configs.onRejected ?? onRejected);

  return client;
};

export type { HttpClientConfig };
export { createHttpClient, HttpError };
