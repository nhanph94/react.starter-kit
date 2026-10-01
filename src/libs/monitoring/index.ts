import type { ErrorInfo } from 'react';

type ErrorReporter = (error: Error, info: ErrorInfo) => void;

let reporter: ErrorReporter | undefined;

const setErrorReporter = (nextReporter: ErrorReporter | undefined) => {
  reporter = nextReporter;
};

const reportError: ErrorReporter = (error, info) => {
  try {
    reporter?.(error, info);
  } catch (reportingError) {
    if (import.meta.env.DEV) {
      console.warn('Error reporter failed.', reportingError);
    }
  }
};

export type { ErrorReporter };
export { reportError, setErrorReporter };
