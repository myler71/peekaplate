import { DishIntentEventSchema } from '@peekaplate/contracts';

export type Surface = 'diner' | 'console';
export type AnalyticsEnvironment = Readonly<Record<string, unknown>>;
export type CaptureResult = 'disabled' | 'invalid' | 'limited' | 'sent' | 'failed';

type Runtime = {
  origin: string;
  privacySignal: () => boolean;
  fetch: typeof fetch;
  uuid: () => string;
};

// Explicit capture only: no SDK autocapture, replay, URL enrichment or remote config.
export function createAnalytics(env: AnalyticsEnvironment, surface: Surface, runtime: Runtime) {
  const environment = env.VITE_POSTHOG_ENVIRONMENT;
  const host = env.VITE_POSTHOG_HOST;
  const key = env.VITE_POSTHOG_KEY;
  const configured =
    env.VITE_POSTHOG_ENABLED === 'true' &&
    (environment === 'staging' || environment === 'production') &&
    env.MODE === environment &&
    (host === 'https://us.i.posthog.com' || host === 'https://eu.i.posthog.com') &&
    typeof key === 'string' &&
    /^phc_[A-Za-z0-9_-]+$/.test(key) &&
    env.VITE_POSTHOG_ALLOWED_ORIGIN === runtime.origin;
  let consent = false;
  let identity: string | undefined;
  let attempts = 0;
  const seen = new Set<string>();
  const pending = new Set<AbortController>();

  function allowed() {
    try {
      return configured && consent && !runtime.privacySignal();
    } catch {
      return false;
    }
  }

  function setConsent(value: boolean) {
    consent = value;
    if (!value) {
      identity = undefined;
      for (const controller of pending) controller.abort();
      pending.clear();
    }
  }

  async function send(
    event: string,
    properties: Record<string, unknown>,
    eventId?: string,
  ): Promise<CaptureResult> {
    if (!allowed()) {
      setConsent(false);
      return 'disabled';
    }
    if (attempts >= 500 || pending.size >= 4 || (eventId && seen.has(eventId))) return 'limited';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    pending.add(controller);
    attempts += 1;
    if (eventId) seen.add(eventId);
    try {
      identity ??= runtime.uuid();
      const response = await runtime.fetch(`${host}/i/v0/e/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        signal: controller.signal,
        body: JSON.stringify({
          api_key: key,
          event,
          distinct_id: identity,
          properties: {
            ...properties,
            environment,
            surface,
            collection: 'optional_product_analytics',
            evidence_status: 'unverified_client_observation',
            $process_person_profile: false,
            $geoip_disable: true,
            $ip: null,
          },
        }),
      });
      return response.ok ? 'sent' : 'failed';
    } catch {
      return 'failed';
    } finally {
      clearTimeout(timer);
      pending.delete(controller);
    }
  }

  return {
    configured,
    allowed,
    setConsent,
    // Placeholder views are deliberately distinct from usable published-menu views.
    captureShellView: () => send('app_shell_viewed', { schema_version: 1 }),
    captureDishIntent: (input: unknown): Promise<CaptureResult> => {
      if (surface !== 'diner') return Promise.resolve('invalid');
      const result = DishIntentEventSchema.safeParse(input);
      if (!result.success) return Promise.resolve('invalid');
      const event = result.data;
      // Project only bounded facts; never forward session IDs or free-form renderer/arm strings.
      return send(
        event.eventType,
        {
          schema_version: event.schemaVersion,
          event_id: event.eventId,
          publication_hash: event.publicationHash,
          dish_revision_hash: event.dishRevisionHash,
          displayed_tier: event.displayedTier,
          manifest_hash: event.manifestHash,
          availability_version: event.availabilityVersion,
        },
        event.eventId,
      );
    },
  };
}

export type Analytics = ReturnType<typeof createAnalytics>;
