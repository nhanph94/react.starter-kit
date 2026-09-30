import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@test';
import { expect, test } from 'vitest';

import App from '@/app/App';
import { apiClient } from '@/app/common/apiClient';
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
