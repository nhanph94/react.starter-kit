import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App.tsx';
import { PROVIDERS } from '@/bootstrap/provider';
import { ProviderBuilder } from '@/libs/provider-builder';

import '@/resources/styles/index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element "#root" was not found');
}

createRoot(root).render(
  <StrictMode>
    <ProviderBuilder providers={PROVIDERS}>
      <App />
    </ProviderBuilder>
  </StrictMode>,
);
