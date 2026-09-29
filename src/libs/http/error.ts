import { isAxiosError } from 'axios';

import { HTTP_ERROR_MESSAGE, type HttpErrorStatus } from './constants';

class HttpError extends Error {
  readonly status: HttpErrorStatus;

  constructor(status: HttpErrorStatus, cause: unknown) {
    super(HTTP_ERROR_MESSAGE[status], { cause });
    this.name = 'HttpError';
    this.status = status;
  }
}

const isHttpErrorStatus = (status: number | undefined): status is HttpErrorStatus =>
  status != null && status in HTTP_ERROR_MESSAGE;

const rejectHttpError = (error: unknown): never => {
  if (!isAxiosError(error)) throw error;

  const status = error.response?.status;
  if (isHttpErrorStatus(status)) throw new HttpError(status, error);

  throw error;
};

export { HttpError, rejectHttpError };
