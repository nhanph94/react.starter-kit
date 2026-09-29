import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';

import type { ProviderDescriptor } from '@/libs/provider-builder';
import { PROVIDERS } from '@/bootstrap/provider';
import { ProviderBuilder } from '@/libs/provider-builder';

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Override the app providers (defaults to the production `PROVIDERS` list). */
  providers?: ProviderDescriptor[];
};

/**
 * Custom render wrapper: wraps the UI with every Context Provider registered
 * in `src/bootstrap/provider.ts`, so tests always mirror the real app tree.
 */
const renderWithProviders = (
  ui: ReactElement,
  { providers = PROVIDERS, ...options }: RenderWithProvidersOptions = {},
): RenderResult => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ProviderBuilder providers={providers}>{children}</ProviderBuilder>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export { renderWithProviders as render };
