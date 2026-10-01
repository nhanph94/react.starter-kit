import { render, screen, userEvent } from '@test';
import { beforeEach, expect, test } from 'vitest';

import { useGlobalStore } from '@/app/common/hooks';

import { ThemeToggle } from './ThemeToggle';

beforeEach(() => {
  useGlobalStore.setState({ theme: 'light' });
});

test('switches between the supported themes', async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);

  await user.click(screen.getByRole('button', { name: 'Switch to night theme' }));

  expect(useGlobalStore.getState().theme).toBe('night');
  expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
});
