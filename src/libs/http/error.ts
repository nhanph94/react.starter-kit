import { isAxiosError } from 'axios';

import { HTTP_ERROR_MESSAGE } from './constants';

class HttpError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly data: unknown;
  readonly requestId: string | undefined;

  constructor({
    status,
    code,
    data,
    requestId,
    message,
    cause,
  }: {
    status?: number;
    code?: string;
    data?: unknown;
    requestId?: string;
    message: string;
    cause: unknown;
  }) {
    super(message, { cause });
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.requestId = requestId;
  }
}

const errorDetails = (data: unknown) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

  const record = data as Record<string, unknown>;
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined,
  };
};

const headerValue = (headers: unknown, name: string) => {
  if (!headers || typeof headers !== 'object') return undefined;
  const value = (headers as Record<string, unknown>)[name];
  return typeof value === 'string' ? value : undefined;
};

const rejectHttpError = (error: unknown): never => {
  if (!isAxiosError(error)) throw error;

  const response = error.response;
  const status = response?.status;
  const data = response?.data;
  const details = errorDetails(data);
  const defaultMessage = status
    ? HTTP_ERROR_MESSAGE[status as keyof typeof HTTP_ERROR_MESSAGE]
    : undefined;

  throw new HttpError({
    status,
    code: details.code,
    data,
    requestId: headerValue(response?.headers, 'x-request-id'),
    message: details.message ?? defaultMessage ?? error.message ?? 'Network error',
    cause: error,
  });
};

export { HttpError, rejectHttpError };
