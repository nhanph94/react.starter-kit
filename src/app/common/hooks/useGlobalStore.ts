import createStore from '@/libs/store';

import { defaultTheme, isTheme } from 'virtual:theme-registry';

type Theme = string | 'system';

type GlobalState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const normalizeTheme = (theme: unknown): Theme => {
  if (theme === 'system') return 'system';
  if (theme === 'dark' && isTheme('night')) return 'night';
  return isTheme(theme) ? theme : defaultTheme;
};

const migrateGlobalState = (persistedState: unknown): Partial<GlobalState> => {
  if (!persistedState || typeof persistedState !== 'object') return { theme: defaultTheme };

  const { theme } = persistedState as { theme?: unknown };
  return { theme: normalizeTheme(theme) };
};

const useGlobalStore = createStore<GlobalState>(
  'global',
  (set) => ({
    theme: defaultTheme,
    setTheme: (theme) => set({ theme: normalizeTheme(theme) }, false, 'global/setTheme'),
  }),
  {
    devtools: true,
    immer: true,
    persist: {
      version: 1,
      migrate: migrateGlobalState,
      onRehydrateStorage: () => (state) => {
        if (state && state.theme !== normalizeTheme(state.theme)) state.setTheme(state.theme);
      },
    },
    subscribeWithSelector: true,
  },
);

export type { Theme };
export { migrateGlobalState, normalizeTheme, useGlobalStore };
