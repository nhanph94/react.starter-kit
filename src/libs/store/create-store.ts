import { create, type StateCreator, type StoreApi } from 'zustand';
import { type DevtoolsOptions, devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { UseBoundStore } from 'zustand/react';

import { withPersist } from './middleware';
import type { CreateStoreOptions, ImmerStoreInitializer, StoreInitializer } from './types';

const devtoolsOptions = (name: string, value: true | DevtoolsOptions): DevtoolsOptions =>
  value === true
    ? { name, enabled: import.meta.env.DEV }
    : { name, enabled: import.meta.env.DEV, ...value };

const applyMiddleware = <T>(
  name: string,
  creator: StateCreator<T>,
  options?: CreateStoreOptions<T>,
) => {
  let next = creator;

  if (options?.immer) {
    next = immer(next as StateCreator<T, [['zustand/immer', never]]>) as StateCreator<T>;
  }

  if (options?.persist) {
    next = withPersist(next, name, options.persist);
  }

  if (options?.devtools) {
    next = devtools(next, devtoolsOptions(name, options.devtools)) as StateCreator<T>;
  }

  if (options?.subscribeWithSelector) {
    next = subscribeWithSelector(next) as StateCreator<T>;
  }

  return next;
};

function createStore<T>(
  name: string,
  initializer: ImmerStoreInitializer<T>,
  options: CreateStoreOptions<T> & { immer: true },
): UseBoundStore<StoreApi<T>>;
function createStore<T>(
  name: string,
  initializer: StoreInitializer<T>,
  options?: CreateStoreOptions<T>,
): UseBoundStore<StoreApi<T>>;
function createStore<T>(
  name: string,
  initializer: StoreInitializer<T> | ImmerStoreInitializer<T>,
  options?: CreateStoreOptions<T>,
) {
  return create<T>()(applyMiddleware(name, initializer as StateCreator<T>, options));
}

export { createStore };
