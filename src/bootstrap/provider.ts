import type { ProviderDescriptor } from '@/libs/react/provider-builder';
import { QueryProvider } from '@/libs/query';
import { ErrorBoundary } from '@/libs/react/error-boundary';

// Order matters: the first provider is the outermost wrapper.
export const PROVIDERS: ProviderDescriptor[] = [
  ['errorBoundary', ErrorBoundary, {}],
  ['query', QueryProvider, {}],
];
