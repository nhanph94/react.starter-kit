import { Component, type ErrorInfo, type ReactNode } from 'react';

import { DefaultErrorFallback } from './DefaultErrorFallback';

type ErrorBoundaryProps = {
  children?: ReactNode;
  /** Custom fallback renderer; receives the caught error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Reporting hook — wire your monitoring service here (e.g. Sentry in the next step). */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Error boundary: catches render errors from the subtree below it and shows a
 * fallback UI (defaults to `DefaultErrorFallback`) with a retry button.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.reset);
      return <DefaultErrorFallback error={error} reset={this.reset} />;
    }

    return children;
  }
}

export type { ErrorBoundaryProps };
export { ErrorBoundary };
