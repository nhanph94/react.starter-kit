import { beforeEach, expect, test, vi } from 'vitest';

import { migrateGlobalState, normalizeTheme, useGlobalStore } from '@/app/common/hooks';

import { defaultTheme } from 'virtual:theme-registry';

beforeEach(() => {
  localStorage.clear();
  useGlobalStore.setState({ theme: defaultTheme });
});

test('starts with the configured default theme', () => {
  expect(useGlobalStore.getState().theme).toBe(defaultTheme);
});

test('migrates the legacy dark theme to night', () => {
  expect(migrateGlobalState({ theme: 'dark' })).toEqual({ theme: 'night' });
});

test('preserves the system theme during migration', () => {
  expect(migrateGlobalState({ theme: 'system' })).toEqual({ theme: 'system' });
});

test('falls back to the default theme for unknown persisted values', () => {
  expect(migrateGlobalState({ theme: 'unknown-theme' })).toEqual({ theme: defaultTheme });
});

test('normalizes unknown theme selections to the default theme', () => {
  expect(normalizeTheme('unknown-theme')).toBe(defaultTheme);
  useGlobalStore.getState().setTheme('unknown-theme');

  expect(useGlobalStore.getState().theme).toBe(defaultTheme);
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
