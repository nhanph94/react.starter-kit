import { HttpResponse, http } from 'msw';
import { expect, test } from 'vitest';

import { server } from '@/mocks/node';

import { createHttpClient, HttpError } from './index';

const createAuthenticatedClient = () =>
  createHttpClient({
    baseURL: '',
    auth: {
      refreshToken: {
        path: '/api/auth/refresh',
        in: 'body',
        value: (tokens) => (tokens?.refreshToken ? { refreshToken: tokens.refreshToken } : null),
      },
      accessToken: {
        in: 'header',
        name: 'Authorization',
        value: (tokens) => (tokens?.accessToken ? `Bearer ${tokens.accessToken}` : null),
      },
    },
  });

test('refreshes once and retries concurrent unauthorized requests', async () => {
  let refreshCalls = 0;
  server.use(
    http.get('/api/private', ({ request }) => {
      if (request.headers.get('Authorization') === 'Bearer fresh-access-token') {
        return HttpResponse.json({ ok: true });
      }

      return new HttpResponse(null, { status: 401 });
    }),
    http.post('/api/auth/refresh', () => {
      refreshCalls += 1;
      return HttpResponse.json({
        accessToken: 'fresh-access-token',
        refreshToken: 'fresh-refresh-token',
      });
    }),
  );
  const client = createAuthenticatedClient();
  client.setTokens({ accessToken: 'expired-access-token', refreshToken: 'refresh-token' });

  const responses = await Promise.all([client.get('/api/private'), client.get('/api/private')]);

  expect(responses.map((response) => response.data)).toEqual([{ ok: true }, { ok: true }]);
  expect(refreshCalls).toBe(1);
  expect(client.getTokens()).toEqual({
    accessToken: 'fresh-access-token',
    refreshToken: 'fresh-refresh-token',
  });
});

test('clears tokens and rejects when refresh fails', async () => {
  server.use(
    http.get('/api/private', () => new HttpResponse(null, { status: 401 })),
    http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 500 })),
  );
  const client = createAuthenticatedClient();
  client.setTokens({ accessToken: 'expired-access-token', refreshToken: 'refresh-token' });

  await expect(client.get('/api/private')).rejects.toMatchObject({
    name: HttpError.name,
    status: 500,
  });
  expect(client.getTokens()).toBeNull();
});
