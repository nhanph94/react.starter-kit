import createStore from '@/libs/store';

type Theme = 'light' | 'dark';

type GlobalState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
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
    persist: true,
    subscribeWithSelector: true,
  },
);

export type { Theme };
export { useGlobalStore };
