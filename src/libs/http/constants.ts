const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
} as const;

const HTTP_ERROR_MESSAGE = {
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS.SERVER_ERROR]: 'Server error',
} as const;

type HttpErrorStatus = keyof typeof HTTP_ERROR_MESSAGE;

export type { HttpErrorStatus };
export { HTTP_ERROR_MESSAGE, HTTP_STATUS };
