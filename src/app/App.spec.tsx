import { useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@test';
import { toast } from 'react-toastify';
import { expect, test } from 'vitest';

import App from '@/app/App';
import { apiClient } from '@/app/common/apiClient';
import { useGlobalStore } from '@/app/common/hooks';
import { appConfig } from '@/configs/app';

test('renders the application title from config', () => {
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: appConfig.title })).toBeInTheDocument();
  expect(document.title).toBe(appConfig.title);
  expect(document.head.querySelectorAll('title')).toHaveLength(1);
});

test('transforms SVG files imported with ?react into components', () => {
  render(<App />);

  expect(screen.getByRole('img', { name: `${appConfig.title} logo` })).toBeInTheDocument();
});

test('applies the persisted theme to the document root', () => {
  useGlobalStore.getState().setTheme('night');
  render(<App />);

  expect(document.documentElement).toHaveAttribute('data-theme', 'night');

  useGlobalStore.getState().setTheme('light');
});

test('renders notifications stacked at the bottom right', async () => {
  render(<App />);

  toast('First notification');
  toast('Second notification');

  expect(await screen.findByText('First notification')).toBeInTheDocument();
  expect(await screen.findByText('Second notification')).toBeInTheDocument();

  await waitFor(() => {
    const container = document.querySelector('.Toastify__toast-container--bottom-right');
    expect(container).toHaveAttribute('data-stacked', 'true');
    expect(container?.querySelectorAll('.Toastify__toast--stacked')).toHaveLength(2);
  });

  toast.dismiss();
});

const HealthIndicator = () => {
  const { data, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await apiClient.get<{ ok: boolean }>('/api/health')).data,
  });

  if (isPending) return <p>Checking API...</p>;

  return <p>{data?.ok ? 'API is healthy' : 'API is down'}</p>;
};

test('provides the query client and resolves requests through MSW', async () => {
  render(<HealthIndicator />);

  expect(await screen.findByText('API is healthy')).toBeInTheDocument();
});
