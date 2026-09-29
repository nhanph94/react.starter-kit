import type { ProviderDescriptor } from '@/libs/provider-builder';
import { ErrorBoundary } from '@/libs/error-boundary';
import { QueryProvider } from '@/libs/query';

// Order matters: the first provider is the outermost wrapper.
export const PROVIDERS: ProviderDescriptor[] = [
  ['errorBoundary', ErrorBoundary, {}],
  ['query', QueryProvider, {}],
];
