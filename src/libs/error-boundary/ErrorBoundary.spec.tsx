import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import { DefaultErrorFallback, ErrorBoundary } from '@/libs/error-boundary';

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('boom');
  return <p>content rendered</p>;
};

// React logs caught errors via console.error — keep the test output clean.
const silenceReactLogs = () => vi.spyOn(console, 'error').mockImplementation(() => {});

test('renders children when nothing throws', () => {
  render(
    <ErrorBoundary>
      <Bomb shouldThrow={false} />
    </ErrorBoundary>,
  );

  expect(screen.getByText('content rendered')).toBeInTheDocument();
});

test('shows the default fallback with the error message and a retry button', () => {
  silenceReactLogs();

  render(
    <ErrorBoundary>
      <Bomb shouldThrow />
    </ErrorBoundary>,
  );

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('boom')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  expect(screen.queryByText('content rendered')).not.toBeInTheDocument();
});

test('recovers via retry once the error is resolved', async () => {
  silenceReactLogs();

  const { rerender } = render(
    <ErrorBoundary>
      <Bomb shouldThrow />
    </ErrorBoundary>,
  );

  // Fixing the child alone does not reset the boundary — fallback stays.
  rerender(
    <ErrorBoundary>
      <Bomb shouldThrow={false} />
    </ErrorBoundary>,
  );
  expect(screen.queryByText('content rendered')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(screen.getByText('content rendered')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('uses a custom fallback and reports the error through onError', () => {
  silenceReactLogs();
  const onError = vi.fn();

  render(
    <ErrorBoundary
      onError={onError}
      fallback={(error, reset) => (
        <div>
          <p>custom fallback: {error.message}</p>
          <button type="button" onClick={reset}>
            dismiss
          </button>
        </div>
      )}
    >
      <Bomb shouldThrow />
    </ErrorBoundary>,
  );

  expect(screen.getByText('custom fallback: boom')).toBeInTheDocument();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
});

test('DefaultErrorFallback works standalone and invokes reset on retry', async () => {
  const reset = vi.fn();

  render(<DefaultErrorFallback error={new Error('standalone')} reset={reset} />);

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('standalone')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(reset).toHaveBeenCalledTimes(1);
});
