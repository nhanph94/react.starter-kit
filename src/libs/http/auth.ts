import axios, { type AxiosInstance, type InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { z } from 'zod';

import { HTTP_STATUS } from './constants';

const tokenField = z.string().min(1);

const tokenSchema = z.object({
  accessToken: tokenField,
  refreshToken: tokenField,
});

type Tokens = z.output<typeof tokenSchema>;
type TokenState = Partial<Tokens>;

type TokenBody = Record<string, unknown>;

type TokenConfig =
  | { in: 'body'; value: (tokens: TokenState | null) => TokenBody | null }
  | { in: 'header'; name: string; value: (tokens: TokenState | null) => string | null };

type RefreshTokenConfig = { path?: string } & TokenConfig;

type TokenStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type HttpAuthConfig = {
  refreshToken?: RefreshTokenConfig;
  accessToken?: TokenConfig;
  persist?: {
    storage: TokenStorage;
    key: string;
    partialize?: (tokens: Tokens) => TokenState;
  };
};

const readTokenState = (value: unknown): TokenState | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const accessToken = tokenField.safeParse(record.accessToken);
  const refreshToken = tokenField.safeParse(record.refreshToken);
  const state: TokenState = {};
  if (accessToken.success) state.accessToken = accessToken.data;
  if (refreshToken.success) state.refreshToken = refreshToken.data;
  return state.accessToken || state.refreshToken ? state : null;
};

const installAuth = (
  client: AxiosInstance,
  auth: HttpAuthConfig,
  reject: (error: unknown) => unknown,
) => {
  let tokens: TokenState | null = null;
  const listeners = new Set<() => void>();
  let refreshing: Promise<void> | null = null;
  const retried = new WeakSet<InternalAxiosRequestConfig>();
  const refreshPath = auth.refreshToken?.path;
  const refreshToken = auth.refreshToken;
  const accessToken = auth.accessToken;

  const persistTokens = (next: Tokens | null) => {
    const persist = auth.persist;
    if (!persist) return;
    if (!next) {
      persist.storage.removeItem(persist.key);
      return;
    }
    const slice = readTokenState(persist.partialize?.(next) ?? next);
    if (!slice) {
      persist.storage.removeItem(persist.key);
      return;
    }
    persist.storage.setItem(persist.key, JSON.stringify(slice));
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const setTokens = (next: Tokens | null) => {
    if (!next) {
      tokens = null;
      persistTokens(null);
    } else {
      const parsed = tokenSchema.parse(next);
      tokens = parsed;
      persistTokens(parsed);
    }
    emit();
  };

  const getTokens = () => tokens;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  if (auth.persist) {
    try {
      const stored = readTokenState(
        JSON.parse(auth.persist.storage.getItem(auth.persist.key) ?? ''),
      );
      if (stored) tokens = stored;
    } catch {
      tokens = null;
    }
  }

  const isPlainBody = (data: unknown): data is TokenBody => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    const proto = Object.getPrototypeOf(data);
    return proto === Object.prototype || proto === null;
  };

  const mergeBody = (data: unknown, extra: TokenBody) =>
    data == null ? extra : isPlainBody(data) ? { ...data, ...extra } : data;

  type Placed = { in: 'header'; name: string; value: string } | { in: 'body'; data: TokenBody };

  const place = (config: TokenConfig, current: TokenState | null): Placed | null => {
    if (config.in === 'header') {
      const value = config.value(current);
      if (!value) return null;
      return { in: 'header', name: config.name, value };
    }

    const data = config.value(current);
    if (!data) return null;
    return { in: 'body', data };
  };

  const refreshTokens = (path: string, placed: Placed) => {
    const headers: Record<string, string> = {};
    let data: TokenBody | undefined;
    if (placed.in === 'header') headers[placed.name] = placed.value;
    else data = placed.data;

    return axios
      .post(path, data, {
        baseURL: client.defaults.baseURL,
        timeout: client.defaults.timeout,
        withCredentials: client.defaults.withCredentials,
        headers,
      })
      .then(({ data: body }) => {
        setTokens(body);
      });
  };

  client.interceptors.request.use((config) => {
    if (!accessToken || (refreshPath && config.url === refreshPath)) return config;
    const placed = place(accessToken, tokens);
    if (!placed) return config;
    if (placed.in === 'header') config.headers.set(placed.name, placed.value);
    else config.data = mergeBody(config.data, placed.data);
    return config;
  });

  const onRejected = async (error: unknown) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const config = error.config;

      const placed = refreshToken ? place(refreshToken, tokens) : null;
      if (
        refreshPath &&
        status === HTTP_STATUS.UNAUTHORIZED &&
        config &&
        config.url !== refreshPath &&
        !retried.has(config) &&
        placed
      ) {
        retried.add(config);

        try {
          refreshing ??= refreshTokens(refreshPath, placed).finally(() => {
            refreshing = null;
          });
          await refreshing;
          return client(config);
        } catch (cause) {
          setTokens(null);
          return reject(cause);
        }
      }
    }

    return reject(error);
  };

  client.interceptors.response.use(undefined, onRejected);

  return { setTokens, getTokens, subscribe };
};

export type { HttpAuthConfig, Tokens };
export { installAuth };
