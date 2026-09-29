import { HttpResponse, http } from 'msw';

const handlers = [http.get('/api/health', () => HttpResponse.json({ ok: true }))];

export { handlers };
