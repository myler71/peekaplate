import type { BoundedRetrievalResult } from '@peekaplate/contracts';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../index';

describe('Retrieval API HTTP Boundary (/venues/:venueId/menu-evidence)', () => {
  const venueId = '00000000-0000-4000-8000-000000000001';
  const path = `/venues/${venueId}/menu-evidence`;

  it('rejects unauthenticated requests with 401', async () => {
    const app = createApp({
      verify: vi.fn(),
      execute: vi.fn(),
    });

    const response = await app.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Tomato Soup' }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
  });

  it('rejects malformed non-UUID venueId with 400', async () => {
    const app = createApp({
      verify: vi.fn().mockResolvedValue('actor-123'),
      execute: vi.fn(),
    });

    const response = await app.request('/venues/not-a-uuid/menu-evidence', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid.jwt.token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'Tomato Soup' }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_request' });
  });

  it('rejects unsupported media type with 415', async () => {
    const app = createApp({
      verify: vi.fn().mockResolvedValue('actor-123'),
      execute: vi.fn(),
    });

    const response = await app.request(path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid.jwt.token',
        'Content-Type': 'text/plain',
      },
      body: 'query=Tomato+Soup',
    });

    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: 'unsupported_media_type' });
  });

  it('executes retrieval and returns validated bounded response', async () => {
    const mockRetrievalResult: BoundedRetrievalResult = {
      schema_version: 1,
      status: 'success',
      passages: [
        {
          passage_id: 'pass_1',
          source: { source_id: 'src_1', segment_id: 'seg_1' },
          text: 'Tomato Basil Soup: $10.00',
          start_offset: 0,
          end_offset: 25,
          rank: 1,
          score: 0.95,
        },
      ],
      warnings: [],
    };

    const retrieveMock = vi.fn().mockResolvedValue(mockRetrievalResult);
    const app = createApp({
      verify: vi.fn().mockResolvedValue('actor-123'),
      execute: vi.fn(),
      retrieve: retrieveMock,
    });

    const response = await app.request(path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid.jwt.token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Tomato Basil Soup',
        max_passages: 5,
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockRetrievalResult);
    expect(retrieveMock).toHaveBeenCalledWith({
      query: 'Tomato Basil Soup',
      max_passages: 5,
    });
  });
});
