import axios, { type AxiosInstance } from 'axios';

import { type HttpAuthConfig, installAuth, type Tokens } from './auth';
import { rejectHttpError } from './error';

type HttpClient = AxiosInstance & {
  getTokens: () => Partial<Tokens> | null;
  setTokens: (tokens: Tokens | null) => void;
  subscribe: (listener: () => void) => () => void;
};

type HttpClientConfig = {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  auth?: HttpAuthConfig;
  onRejected?: (error: unknown) => unknown;
};

function createHttpClient(configs: HttpClientConfig & { auth: HttpAuthConfig }): HttpClient;
function createHttpClient(configs: HttpClientConfig): AxiosInstance;
function createHttpClient(configs: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    headers: { Accept: 'application/json' },
    baseURL: configs.baseURL,
    timeout: configs.timeout ?? 10_000,
    // Cross-origin credentials should be an explicit opt-in. This avoids
    // accidental cookie sharing when a project only configures a base URL.
    withCredentials: configs.withCredentials ?? false,
  });

  const reject = configs.onRejected ?? rejectHttpError;

  if (configs.auth) return Object.assign(client, installAuth(client, configs.auth, reject));

  client.interceptors.response.use(undefined, reject);
  return client;
}

export type { HttpClient, HttpClientConfig };
export { createHttpClient };
