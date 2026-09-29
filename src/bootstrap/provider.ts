import type { ProviderDescriptor } from '@/libs/provider-builder';
import { QueryProvider } from '@/libs/query';

export const PROVIDERS: ProviderDescriptor[] = [['query', QueryProvider, {}]];
