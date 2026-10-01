import { render, screen, within } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { expect, test } from 'vitest';

import { ProviderBuilder, type ProviderDescriptor } from '@/libs/react/provider-builder';

type ProbeProps = { label: string };

const Probe = ({ children, label }: PropsWithChildren<ProbeProps>) => (
  <section data-testid={label}>{children}</section>
);

test('wraps children with providers in declaration order (first provider is outermost)', () => {
  const providers: ProviderDescriptor[] = [
    ['outer', Probe, { label: 'outer-provider' }],
    ['inner', Probe, { label: 'inner-provider' }],
  ];

  render(
    <ProviderBuilder providers={providers}>
      <span data-testid="child" />
    </ProviderBuilder>,
  );

  const outer = screen.getByTestId('outer-provider');
  const inner = screen.getByTestId('inner-provider');

  expect(within(outer).getByTestId('inner-provider')).toBeInTheDocument();
  expect(within(inner).getByTestId('child')).toBeInTheDocument();
});

test('renders children unchanged when no providers are given', () => {
  render(
    <ProviderBuilder providers={[]}>
      <span data-testid="child" />
    </ProviderBuilder>,
  );

  expect(screen.getByTestId('child')).toBeInTheDocument();
});
