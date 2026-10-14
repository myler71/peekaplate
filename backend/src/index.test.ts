import { describe, expect, it } from 'vitest';
import app from './index';

describe('foundation API', () => {
  it('returns a minimal liveness response without database or secret configuration', async () => {
    const response = await app.request('/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'ok',
      service: 'peekaplate-api',
      stage: 'foundation',
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('does not expose an unimplemented event ingestion endpoint', async () => {
    const response = await app.request('/events', { method: 'POST', body: '{}' });
    expect(response.status).toBe(404);
  });
});
