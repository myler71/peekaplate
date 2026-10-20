import { describe, expect, it, vi } from 'vitest';
import { createAnalytics } from './index';

const env = {
  MODE: 'staging',
  VITE_POSTHOG_ENABLED: 'true',
  VITE_POSTHOG_ENVIRONMENT: 'staging',
  VITE_POSTHOG_KEY: 'phc_test_fixture',
  VITE_POSTHOG_HOST: 'https://us.i.posthog.com',
  VITE_POSTHOG_ALLOWED_ORIGIN: 'https://menu.example.test',
};
const event = {
  eventId: '10000000-0000-4000-8000-000000000001',
  schemaVersion: 1,
  sessionId: '20000000-0000-4000-8000-000000000001',
  sequence: 1,
  eventType: 'dish_open',
  occurredAt: '2026-10-19T12:00:00Z',
  publicationHash: 'a'.repeat(64),
  dishRevisionHash: 'b'.repeat(64),
  displayedTier: 'T0',
  rendererVersion: null,
  manifestHash: null,
  availabilityVersion: 1,
  experimentAssignment: null,
};
function setup(overrides = {}, surface: 'diner' | 'console' = 'diner') {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'));
  const privacy = vi.fn(() => false);
  const uuid = vi.fn(() => crypto.randomUUID());
  const analytics = createAnalytics({ ...env, ...overrides }, surface, {
    origin: 'https://menu.example.test',
    fetch: fetcher,
    privacySignal: privacy,
    uuid,
  });
  return { analytics, fetcher, privacy, uuid };
}

describe('optional PostHog capture', () => {
  it('makes no request or identifier before consent, and drops pre-consent events', async () => {
    const { analytics, fetcher, uuid } = setup();
    expect(await analytics.captureDishIntent(event)).toBe('disabled');
    expect(fetcher).not.toHaveBeenCalled();
    expect(uuid).not.toHaveBeenCalled();
    analytics.setConsent(true);
    expect(fetcher).not.toHaveBeenCalled();
    expect(await analytics.captureDishIntent(event)).toBe('sent');
  });
  it.each([
    { VITE_POSTHOG_ENABLED: 'false' },
    { VITE_POSTHOG_KEY: '' },
    { VITE_POSTHOG_KEY: 'phx_personal_secret' },
    { VITE_POSTHOG_HOST: 'https://evil.test' },
    { VITE_POSTHOG_ALLOWED_ORIGIN: 'https://preview.example.test' },
    { MODE: 'development' },
    { VITE_POSTHOG_ENVIRONMENT: 'production' },
  ])('fails closed for incomplete/mismatched configuration %j', async (override) => {
    const { analytics, fetcher } = setup(override);
    analytics.setConsent(true);
    expect(await analytics.captureShellView()).toBe('disabled');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('isolates the production environment and project token', async () => {
    const { analytics, fetcher } = setup({
      MODE: 'production',
      VITE_POSTHOG_ENVIRONMENT: 'production',
      VITE_POSTHOG_KEY: 'phc_production_fixture',
    });
    analytics.setConsent(true);
    await analytics.captureShellView();
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.api_key).toBe('phc_production_fixture');
    expect(body.properties.environment).toBe('production');
  });
  it('projects only safe properties and retains exact v1 taxonomy', async () => {
    const { analytics, fetcher } = setup();
    analytics.setConsent(true);
    await analytics.captureDishIntent({
      ...event,
      displayedTier: 'T1',
      manifestHash: 'c'.repeat(64),
      rendererVersion: 'private-renderer-text',
      experimentAssignment: {
        experimentId: event.eventId,
        blockId: 'private-block',
        arm: 'private-arm',
      },
    });
    const [url, request] = fetcher.mock.calls[0] ?? [];
    const body = JSON.parse(String(request?.body));
    expect(url).toBe('https://us.i.posthog.com/i/v0/e/');
    expect(body.event).toBe('dish_open');
    expect(body.distinct_id).not.toBe(event.sessionId);
    expect(body.properties).toEqual({
      schema_version: 1,
      event_id: event.eventId,
      publication_hash: event.publicationHash,
      dish_revision_hash: event.dishRevisionHash,
      displayed_tier: 'T1',
      manifest_hash: 'c'.repeat(64),
      availability_version: 1,
      environment: 'staging',
      surface: 'diner',
      collection: 'optional_product_analytics',
      evidence_status: 'unverified_client_observation',
      $process_person_profile: false,
      $geoip_disable: true,
      $ip: null,
    });
    expect(String(request?.body)).not.toContain('private-');
    expect(request).toMatchObject({
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
    });
    expect(await analytics.captureDishIntent(event)).toBe('limited');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects arbitrary properties, absent enhanced references, unknown names and console dish events', async () => {
    const { analytics, fetcher } = setup();
    analytics.setConsent(true);
    for (const input of [
      { ...event, email: 'synthetic@example.test' },
      { ...event, displayedTier: 'T2' },
      { ...event, eventType: 'order_placed' },
    ])
      expect(await analytics.captureDishIntent(input)).toBe('invalid');
    expect(fetcher).not.toHaveBeenCalled();
    expect(await setup({}, 'console').analytics.captureDishIntent(event)).toBe('invalid');
  });
  it('respects privacy signals on every capture and rotates identity after withdrawal', async () => {
    const { analytics, fetcher, privacy } = setup();
    analytics.setConsent(true);
    await analytics.captureShellView();
    privacy.mockReturnValue(true);
    expect(await analytics.captureShellView()).toBe('disabled');
    privacy.mockReturnValue(false);
    expect(await analytics.captureShellView()).toBe('disabled');
    analytics.setConsent(true);
    await analytics.captureShellView();
    const ids = fetcher.mock.calls.map(
      ([, request]) => JSON.parse(String(request?.body)).distinct_id,
    );
    expect(ids[0]).not.toBe(ids[1]);
  });
  it('contains failures without logging or retrying', async () => {
    const { analytics, fetcher } = setup();
    analytics.setConsent(true);
    fetcher
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response('', { status: 429 }));
    expect(await analytics.captureShellView()).toBe('failed');
    expect(await analytics.captureShellView()).toBe('failed');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('aborts in-flight capture on withdrawal and limits concurrency', async () => {
    const { analytics, fetcher } = setup();
    analytics.setConsent(true);
    fetcher.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    );
    const requests = Array.from({ length: 4 }, () => analytics.captureShellView());
    expect(await analytics.captureShellView()).toBe('limited');
    analytics.setConsent(false);
    expect(await Promise.all(requests)).toEqual(['failed', 'failed', 'failed', 'failed']);
  });
  it('bounds total attempts and times out a stalled transport', async () => {
    const capped = setup();
    capped.analytics.setConsent(true);
    for (let i = 0; i < 500; i++) await capped.analytics.captureShellView();
    expect(await capped.analytics.captureShellView()).toBe('limited');
    expect(capped.fetcher).toHaveBeenCalledTimes(500);
    vi.useFakeTimers();
    try {
      const stalled = setup();
      stalled.analytics.setConsent(true);
      stalled.fetcher.mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
          ),
      );
      const result = stalled.analytics.captureShellView();
      await vi.advanceTimersByTimeAsync(3000);
      expect(await result).toBe('failed');
    } finally {
      vi.useRealTimers();
    }
  });
});
