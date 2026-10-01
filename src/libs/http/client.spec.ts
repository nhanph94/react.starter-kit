import { HttpResponse, http } from 'msw';
import { expect, test } from 'vitest';

import { server } from '@/mocks/node';

import { createHttpClient, HttpError } from './index';

const apiBaseUrl = '';

test('does not send cross-origin credentials unless explicitly requested', () => {
  const client = createHttpClient({ baseURL: apiBaseUrl });

  expect(client.defaults.withCredentials).toBe(false);
});

test('maps known HTTP failures to HttpError', async () => {
  server.use(http.get('/api/forbidden', () => new HttpResponse(null, { status: 403 })));
  const client = createHttpClient({ baseURL: apiBaseUrl });

  await expect(client.get('/api/forbidden')).rejects.toMatchObject({
    name: HttpError.name,
    status: 403,
    message: 'Forbidden',
  });
});

test('preserves API error details for forms and feature-level handling', async () => {
  server.use(
    http.post('/api/users', () =>
      HttpResponse.json(
        { code: 'EMAIL_TAKEN', message: 'Email is already registered' },
        { status: 422, headers: { 'x-request-id': 'request-123' } },
      ),
    ),
  );
  const client = createHttpClient({ baseURL: apiBaseUrl });

  await expect(client.post('/api/users')).rejects.toMatchObject({
    name: HttpError.name,
    status: 422,
    code: 'EMAIL_TAKEN',
    message: 'Email is already registered',
    requestId: 'request-123',
  });
});
