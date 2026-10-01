import type { StateStorage } from 'zustand/middleware';

import env from '@/configs/env';
import { APP_ENV } from '@/configs/env/schema';

import packageJson from '../../../../package.json' with { type: 'json' };

type IndexedDbOptions = {
  databaseName: string;
  version: number;
  recreate: boolean;
};

const requestResult = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });

const isVersionError = (error: unknown) =>
  error instanceof DOMException && error.name === 'VersionError';

const createIndexedDbStorage = ({ databaseName, version, recreate }: IndexedDbOptions) => {
  const tables = new Set<string>();
  let connection: IDBDatabase | undefined;
  let opening: Promise<IDBDatabase> | undefined;
  let rebuilding: Promise<IDBDatabase> | undefined;

  const closeConnection = (current: IDBDatabase) => {
    current.onversionchange = null;
    current.close();
    if (connection === current) connection = undefined;
  };

  const open = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName, version);

      request.onupgradeneeded = () => {
        for (const table of tables) {
          if (!request.result.objectStoreNames.contains(table)) {
            request.result.createObjectStore(table);
          }
        }
      };

      request.onsuccess = () => {
        const database = request.result;

        database.onversionchange = () => {
          database.close();
          if (connection === database) connection = undefined;
        };

        connection = database;
        resolve(database);
      };

      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
      request.onblocked = () => reject(new Error('IndexedDB open blocked'));
    });

  const drop = () =>
    new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error('IndexedDB delete failed'));
      request.onblocked = () => reject(new Error('IndexedDB delete blocked'));
    });

  const missingTables = (database: IDBDatabase) =>
    [...tables].filter((table) => !database.objectStoreNames.contains(table));

  const missingMessage = (missing: string[]) =>
    `IndexedDB is missing object store: ${missing.join(', ')}`;

  const rebuild = async () => {
    await drop();
    const database = await open();
    const missing = missingTables(database);

    if (missing.length === 0) return database;

    closeConnection(database);
    throw new Error(missingMessage(missing));
  };

  const startRebuild = (current?: IDBDatabase) => {
    if (rebuilding) return rebuilding;

    if (current) closeConnection(current);
    opening = undefined;

    const attempt = rebuild().then(
      (database) => {
        if (rebuilding === attempt) rebuilding = undefined;
        return database;
      },
      (error: unknown) => {
        if (rebuilding === attempt) rebuilding = undefined;
        throw error;
      },
    );

    rebuilding = attempt;

    return attempt;
  };

  const connect = () => {
    if (connection) return Promise.resolve(connection);
    if (rebuilding) return rebuilding;
    if (opening) return opening;

    const attempt = open().then(
      (database) => {
        if (opening === attempt) opening = undefined;
        return database;
      },
      (error: unknown) => {
        if (opening === attempt) opening = undefined;
        if (!(recreate && isVersionError(error))) throw error;
        return startRebuild();
      },
    );

    opening = attempt;

    return attempt;
  };

  const syncSchema = (table: string): Promise<IDBDatabase> =>
    connect().then((database) => {
      if (database.objectStoreNames.contains(table)) return database;
      if (!recreate) throw new Error(missingMessage([table]));

      return startRebuild(database).then((rebuilt) => {
        if (rebuilt.objectStoreNames.contains(table)) return rebuilt;
        throw new Error(missingMessage([table]));
      });
    });

  const forTable = (table: string): StateStorage => {
    tables.add(table);

    const request = async <T>(
      mode: IDBTransactionMode,
      query: (store: IDBObjectStore) => IDBRequest<T>,
    ) => {
      const database = await syncSchema(table);
      return requestResult(query(database.transaction(table, mode).objectStore(table)));
    };

    return {
      getItem: async (key) => {
        const value = await request('readonly', (store) => store.get(key));
        return typeof value === 'string' ? value : null;
      },
      setItem: (key, value) => request('readwrite', (store) => store.put(value, key)),
      removeItem: (key) => request('readwrite', (store) => store.delete(key)),
    };
  };

  return { forTable };
};

// 1.0.100 → 1001000, 1.1.0 → 1010000. The units digit stays 0 for a later schema bump.
// IndexedDB rejects version 0, so package 0.0.0 is stored as 1.
const idbVersionFromPackage = (version: string) => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);

  if (!match) {
    throw new Error(`Invalid package version "${version}"`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const parsed = major * 10_000_000 + minor * 10_000 + patch * 10;

  return parsed < 1 ? 1 : parsed;
};

const indexedDb = createIndexedDbStorage({
  databaseName: env.VITE_IDB_STORE || packageJson.name,
  version: idbVersionFromPackage(packageJson.version),
  recreate: env.MODE === APP_ENV.DEVELOPMENT,
});

export { indexedDb };
