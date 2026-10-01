import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import { PROVIDERS } from '@/bootstrap/provider';
import { ProviderBuilder } from '@/libs/react/provider-builder';

import '@/resources/styles/main.css';

const enableMocking = async () => {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
};

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element "#root" was not found');
}

enableMocking().then(() => {
  createRoot(root).render(
    <StrictMode>
      <ProviderBuilder providers={PROVIDERS}>
        <App />
      </ProviderBuilder>
    </StrictMode>,
  );
});
