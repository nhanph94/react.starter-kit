type DefaultErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

const DefaultErrorFallback = ({ error, reset }: DefaultErrorFallbackProps) => (
  <main
    role="alert"
    className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
  >
    <h1 className="text-2xl font-bold">Something went wrong</h1>
    <p className="text-error">{error.message || 'Unexpected application error'}</p>
    {import.meta.env.DEV && error.stack ? (
      <pre className="max-w-2xl overflow-auto rounded-box bg-base-200 p-4 text-left text-xs">
        {error.stack}
      </pre>
    ) : null}
    <div className="flex gap-2">
      <button type="button" className="btn btn-primary" onClick={reset}>
        Try again
      </button>
      <button type="button" className="btn" onClick={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  </main>
);

export type { DefaultErrorFallbackProps };
export { DefaultErrorFallback };
