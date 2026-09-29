import type { StateCreator } from 'zustand';
import { createJSONStorage, type PersistOptions, persist } from 'zustand/middleware';

import { indexedDbStorage, webStorage } from '../adapters';
import { PERSIST_STORAGE } from '../constants';
import type { PersistChoice } from '../types';

const RECORD_KEY = 'state';

const persistOptions = <T>(
  name: string,
  value: Exclude<PersistChoice<T>, false>,
): PersistOptions<T, Partial<T>> => {
  const override = typeof value === 'object' ? value : {};
  const { storage: storageOption, name: key, ...options } = override;
  const storage =
    value === true
      ? PERSIST_STORAGE.LOCAL
      : typeof value === 'string'
        ? value
        : (storageOption ?? PERSIST_STORAGE.LOCAL);

  if (storage === PERSIST_STORAGE.INDEXED_DB) {
    return {
      ...options,
      name: key ?? RECORD_KEY,
      storage: createJSONStorage(() => indexedDbStorage(name)),
    };
  }

  return {
    ...options,
    name: key ?? name,
    storage: createJSONStorage(() => webStorage[storage]),
  };
};

const withPersist = <T>(
  creator: StateCreator<T>,
  name: string,
  value: Exclude<PersistChoice<T>, false>,
) => persist(creator, persistOptions(name, value)) as StateCreator<T>;

export { withPersist };
