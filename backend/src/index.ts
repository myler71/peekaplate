import type { HealthResponse } from '@peekaplate/contracts';
import { Hono } from 'hono';

const app = new Hono();
app.get('/health', (c) => {
  c.header('Cache-Control', 'no-store');
  return c.json({
    status: 'ok',
    service: 'peekaplate-api',
    stage: 'foundation',
  } satisfies HealthResponse);
});
app.notFound((c) => c.json({ error: 'not_found' }, 404));
export default app;
