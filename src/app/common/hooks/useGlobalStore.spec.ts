import { beforeEach, expect, test, vi } from 'vitest';

import { migrateGlobalState, useGlobalStore } from '@/app/common/hooks';

beforeEach(() => {
  localStorage.clear();
  useGlobalStore.setState({ theme: 'light' });
});

test('starts with the light theme', () => {
  expect(useGlobalStore.getState().theme).toBe('light');
});

test('migrates the legacy dark theme to night', () => {
  expect(migrateGlobalState({ theme: 'dark' })).toEqual({ theme: 'night' });
});

test('preserves the system theme during migration', () => {
  expect(migrateGlobalState({ theme: 'system' })).toEqual({ theme: 'system' });
});

test('setTheme updates the theme', () => {
  useGlobalStore.getState().setTheme('night');

  expect(useGlobalStore.getState().theme).toBe('night');
});

test('persists the theme to local storage', () => {
  useGlobalStore.getState().setTheme('night');

  expect(localStorage.length).toBeGreaterThan(0);
});

test('notifies subscribers when the theme changes', () => {
  const listener = vi.fn();
  const unsubscribe = useGlobalStore.subscribe(listener);

  useGlobalStore.getState().setTheme('night');

  expect(listener).toHaveBeenCalled();

  unsubscribe();
});
