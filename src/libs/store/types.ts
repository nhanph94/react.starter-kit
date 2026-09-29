import type { Draft } from 'immer';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

import type { PERSIST_STORAGE } from './constants';

type PersistStorageName = (typeof PERSIST_STORAGE)[keyof typeof PERSIST_STORAGE];

type StoreSetter<T> = {
  (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: false,
    action?: string,
  ): void;
  (state: T | ((state: T) => T), replace: true, action?: string): void;
};

type StoreInitializer<T> = (set: StoreSetter<T>, get: () => T) => T;

type ImmerStoreSetter<T> = {
  (partial: T | Partial<T> | ((state: Draft<T>) => void), replace?: false, action?: string): void;
  (state: T | ((state: Draft<T>) => void), replace: true, action?: string): void;
};

type ImmerStoreInitializer<T> = (set: ImmerStoreSetter<T>, get: () => T) => T;

type PersistOverride<T> = Partial<Omit<PersistOptions<T, Partial<T>>, 'storage'>> & {
  name?: string;
  storage?: PersistStorageName;
};

type PersistChoice<T> = boolean | PersistStorageName | PersistOverride<T>;

type CreateStoreOptions<T> = {
  devtools?: boolean | DevtoolsOptions;
  immer?: boolean;
  persist?: PersistChoice<T>;
  subscribeWithSelector?: boolean;
};

export type {
  CreateStoreOptions,
  ImmerStoreInitializer,
  PersistChoice,
  PersistStorageName,
  StoreInitializer,
};
