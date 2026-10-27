import { timingSafeEqual } from 'node:crypto';
import { Container } from '@cloudflare/containers';

type Stub = { fetch(request: Request): Promise<Response> };
export type ExtractionHostEnv = {
  APP_ENV: string;
  EXTRACTION_SERVICE_SECRET?: string;
  EXTRACTION_SOURCE_ORIGIN: string;
  EXTRACTOR: { getByName(name: string): Stub };
  SOURCE_BUCKET: {
    get(key: string): Promise<{ size: number; body: ReadableStream<Uint8Array> } | null>;
  };
} & Partial<Record<(typeof pipelineVariables)[number], string>>;

const pipelineVariables = [
  'OCR_SPACE_API_KEY',
  'MENU_AI_API_KEY',
  'MENU_AI_API_URL',
  'MENU_AI_MODEL',
  'NARA_ROUTER_KEY',
  'NARA_ROUTER_URL',
  'NARA_ROUTER_MODEL',
  'a2agent_api_key',
  'a2agent_url',
  'a2agent_api_MODEL',
] as const;

export class ExtractionContainer extends Container<ExtractionHostEnv> {
  defaultPort = 8080;
  sleepAfter = '60s';

  constructor(ctx: ConstructorParameters<typeof Container>[0], env: ExtractionHostEnv) {
    super(ctx, env);
    this.envVars = {
      EXTRACTION_SERVICE_SECRET: env.EXTRACTION_SERVICE_SECRET ?? '',
      EXTRACTION_SOURCE_ORIGIN: env.EXTRACTION_SOURCE_ORIGIN,
      ...Object.fromEntries(
        pipelineVariables.flatMap((key) => (env[key] ? [[key, env[key]]] : [])),
      ),
    };
  }
}

const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const sourcePath = new RegExp(`^/sources/(${uuid})/(${uuid})$`);
const json = (error: string, status: number) =>
  Response.json(
    { error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  );

export default {
  async fetch(request: Request, env: ExtractionHostEnv): Promise<Response> {
    const secret = env.EXTRACTION_SERVICE_SECRET;
    if (env.APP_ENV !== 'staging' || !secret || secret.length < 48)
      return json('not_configured', 503);
    const supplied = new TextEncoder().encode(request.headers.get('authorization') ?? '');
    const expected = new TextEncoder().encode(`Bearer ${secret}`);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return json('unauthorized', 401);
    }
    const url = new URL(request.url);
    if (url.search) return json('invalid_request', 400);
    try {
      const source = sourcePath.exec(url.pathname);
      if (source && request.method === 'GET') {
        // Only the authenticated Worker chooses tenant/job IDs; no arbitrary bucket/key input.
        const object = await env.SOURCE_BUCKET.get(
          `menu-ingestion/sources/${source[1]}/${source[2]}/source`,
        );
        if (!object) return json('not_found', 404);
        if (object.size <= 0 || object.size > 12_000_000) {
          await object.body.cancel();
          return json('source_too_large', 413);
        }
        return new Response(object.body, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(object.size),
            'Cache-Control': 'no-store',
          },
        });
      }
      if (
        (url.pathname === '/extract' && request.method === 'POST') ||
        (url.pathname === '/health' && request.method === 'GET')
      ) {
        return await env.EXTRACTOR.getByName('staging-extractor').fetch(request);
      }
      return json('not_found', 404);
    } catch {
      return json('extraction_unavailable', 502);
    }
  },
};
