import { beforeEach, expect, test, vi } from 'vitest';

import { useGlobalStore } from '@/app/common/hooks';

beforeEach(() => {
  localStorage.clear();
  useGlobalStore.setState({ theme: 'light' });
});

test('starts with the light theme', () => {
  expect(useGlobalStore.getState().theme).toBe('light');
});

test('setTheme updates the theme', () => {
  useGlobalStore.getState().setTheme('dark');

  expect(useGlobalStore.getState().theme).toBe('dark');
});

test('persists the theme to local storage', () => {
  useGlobalStore.getState().setTheme('dark');

  expect(localStorage.length).toBeGreaterThan(0);
});

test('notifies subscribers when the theme changes', () => {
  const listener = vi.fn();
  const unsubscribe = useGlobalStore.subscribe(listener);

  useGlobalStore.getState().setTheme('dark');

  expect(listener).toHaveBeenCalled();

  unsubscribe();
});
