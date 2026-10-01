import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

import { Metadata } from '@/app/common/components';
import { useGlobalStore } from '@/app/common/hooks';
import { appConfig } from '@/configs/app';
import { ModalContainer } from '@/libs/react/modal';
import Logo from '@/resources/icons/logo.svg?react';

const THEME_OPTIONS = ['light', 'night', 'system'] as const;

const ThemeToggle = () => {
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);

  return (
    <fieldset className="join">
      <legend className="sr-only">Theme preference</legend>
      {THEME_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={`join-item btn btn-sm ${theme === option ? 'btn-primary' : 'btn-ghost'}`}
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
        >
          {option}
        </button>
      ))}
    </fieldset>
  );
};

export default function App() {
  const theme = useGlobalStore((state) => state.theme);

  useEffect(() => {
    // Treat a value persisted by an older template version (`dark`) as `night`.
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
      return;
    }

    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <Metadata metadata={{ description: appConfig.description }} />

      <div className="min-h-dvh bg-base-200 text-base-content">
        <header className="border-base-300 border-b bg-base-100/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-7" role="img" aria-label={`${appConfig.title} logo`} />
              <h1 className="font-semibold">{appConfig.title}</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto grid max-w-5xl gap-6 px-6 py-12 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="card border-base-300 bg-base-100 border shadow-sm">
            <div className="card-body gap-6">
              <div className="space-y-3">
                <div className="badge badge-primary badge-outline">Theme showcase</div>
                <h2 className="card-title text-4xl">A starter that adapts to every preference.</h2>
                <p className="max-w-prose text-base-content/70">
                  Switch between light, night, and system to preview DaisyUI tokens, component
                  states, and contrast before adding product screens.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary">
                  Primary action
                </button>
                <button type="button" className="btn btn-outline">
                  Secondary action
                </button>
                <button type="button" className="btn btn-ghost">
                  Ghost action
                </button>
              </div>

              <div className="alert alert-info">
                <span>
                  Active preference: <strong className="capitalize">{theme}</strong>
                  {theme === 'system' ? ' (following your operating system)' : ''}
                </span>
              </div>
            </div>
          </section>

          <aside className="card border-base-300 bg-base-100 border shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Component preview</h2>
              <p className="text-sm text-base-content/70">
                The current theme is persisted locally and restored before React renders.
              </p>

              <div className="divider my-1" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Project status</span>
                <span className="badge badge-success">Ready</span>
              </div>
              <progress className="progress progress-primary w-full" value="72" max="100" />

              <div className="stats border-base-300 border shadow-sm">
                <div className="stat px-4 py-3">
                  <div className="stat-title">Coverage</div>
                  <div className="stat-value text-primary text-2xl">56%</div>
                  <div className="stat-desc">Protected by CI threshold</div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      <ModalContainer />
      <ToastContainer position="bottom-right" stacked />
    </>
  );
}
