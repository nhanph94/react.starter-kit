import { useGlobalStore } from '@/app/common/hooks';

const ThemeToggle = () => {
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const nextTheme = theme === 'light' ? 'night' : 'light';

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-label={`Switch to ${nextTheme} theme`}
      onClick={() => setTheme(nextTheme)}
    >
      Theme: {theme}
    </button>
  );
};

export { ThemeToggle };
