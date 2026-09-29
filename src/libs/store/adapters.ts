import type { StateStorage } from 'zustand/middleware';

import { PERSIST_STORAGE } from './constants';
import type { PersistStorageName } from './types';

const webStorage: Record<
  Exclude<PersistStorageName, typeof PERSIST_STORAGE.INDEXED_DB>,
  StateStorage
> = {
  [PERSIST_STORAGE.LOCAL]: localStorage,
  [PERSIST_STORAGE.SESSION]: sessionStorage,
};

const indexedDbByTable = new Map<string, Promise<StateStorage>>();

const indexedDbTable = (table: string) => {
  const cached = indexedDbByTable.get(table);

  if (cached) return cached;

  const storage = import('./storage').then(({ indexedDb }) => indexedDb.forTable(table));
  indexedDbByTable.set(table, storage);
  return storage;
};

const indexedDbStorage = (table: string): StateStorage => ({
  getItem: (key) => indexedDbTable(table).then((store) => store.getItem(key)),
  setItem: (key, value) => indexedDbTable(table).then((store) => store.setItem(key, value)),
  removeItem: (key) => indexedDbTable(table).then((store) => store.removeItem(key)),
});

export { indexedDbStorage, webStorage };
