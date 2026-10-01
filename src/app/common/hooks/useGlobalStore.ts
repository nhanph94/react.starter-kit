import createStore from '@/libs/store';

type Theme = 'light' | 'night';

type GlobalState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const migrateGlobalState = (persistedState: unknown): Partial<GlobalState> => {
  if (!persistedState || typeof persistedState !== 'object') return { theme: 'light' };

  const { theme } = persistedState as { theme?: unknown };
  return { theme: theme === 'night' || theme === 'dark' ? 'night' : 'light' };
};

const useGlobalStore = createStore<GlobalState>(
  'global',
  (set) => ({
    theme: 'light',
    setTheme: (theme) => set({ theme }, false, 'global/setTheme'),
  }),
  {
    devtools: true,
    immer: true,
    persist: { version: 1, migrate: migrateGlobalState },
    subscribeWithSelector: true,
  },
);

export type { Theme };
export { migrateGlobalState, useGlobalStore };
