import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTHENTICATION_ALGORITHMS: ('RS256' | 'ES256')[] = ['RS256', 'ES256'];
const SUPABASE_AUDIENCE = 'authenticated';
const MAX_BEARER_TOKEN_LENGTH = 8_192;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AuthenticationError extends Error {
  readonly status = 401;

  constructor() {
    super('Authentication failed.');
    this.name = 'AuthenticationError';
  }
}

export class AuthUnavailableError extends Error {
  readonly status = 503;

  constructor(cause?: unknown) {
    super('Authentication is temporarily unavailable.', { cause });
    this.name = 'AuthUnavailableError';
  }
}

export type StaffVerifier = (authorization: string | undefined) => Promise<string>;

/**
 * Builds a reusable verifier for one trusted Supabase Auth issuer.
 *
 * Callers must retain this verifier for the configured Worker environment; it caches the issuer's
 * JWKS for ten minutes, limits unknown-key refreshes to once per 30 seconds, and times out JWKS
 * retrieval after two seconds. It returns only the verified staff UUID and never logs token data.
 */
export function createStaffVerifier(config: {
  issuer: string;
  allowLocalIssuer?: boolean;
}): StaffVerifier {
  const issuer = trustedIssuer(config);
  const jwks = createRemoteJWKSet(new URL('.well-known/jwks.json', `${issuer}/`), {
    timeoutDuration: 2_000,
    cooldownDuration: 30_000,
    cacheMaxAge: 600_000,
  });

  return async (authorization) => {
    const token = bearerToken(authorization);

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: SUPABASE_AUDIENCE,
        algorithms: AUTHENTICATION_ALGORITHMS,
        requiredClaims: ['exp', 'sub'],
      });

      if (
        payload.role !== SUPABASE_AUDIENCE ||
        payload.is_anonymous === true ||
        typeof payload.sub !== 'string' ||
        !UUID_PATTERN.test(payload.sub)
      ) {
        throw new AuthenticationError();
      }

      return payload.sub.toLowerCase();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      if (isAuthenticationFailure(error)) {
        throw new AuthenticationError();
      }

      throw new AuthUnavailableError(error);
    }
  };
}

function bearerToken(authorization: string | undefined): string {
  const match = /^Bearer ([^\s]+)$/i.exec(authorization ?? '');
  if (!match || !match[1] || match[1].length > MAX_BEARER_TOKEN_LENGTH) {
    throw new AuthenticationError();
  }
  return match[1];
}

function trustedIssuer(config: { issuer: string; allowLocalIssuer?: boolean }): string {
  let issuer: URL;
  try {
    issuer = new URL(config.issuer);
  } catch {
    throw new AuthUnavailableError();
  }

  const isLocal = ['127.0.0.1', '[::1]', 'localhost'].includes(issuer.hostname);
  const trustedProtocol =
    issuer.protocol === 'https:' ||
    (config.allowLocalIssuer === true && isLocal && issuer.protocol === 'http:');
  if (
    !trustedProtocol ||
    issuer.pathname !== '/auth/v1' ||
    issuer.search ||
    issuer.hash ||
    issuer.username ||
    issuer.password
  ) {
    throw new AuthUnavailableError();
  }

  return issuer.href;
}

function isAuthenticationFailure(error: unknown): boolean {
  if (!(error instanceof Error) || !('code' in error)) {
    return false;
  }

  return [
    'ERR_JOSE_ALG_NOT_ALLOWED',
    'ERR_JWS_INVALID',
    'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
    'ERR_JWT_CLAIM_VALIDATION_FAILED',
    'ERR_JWT_EXPIRED',
    'ERR_JWT_INVALID',
    'ERR_JWKS_NO_MATCHING_KEY',
  ].includes(error.code as string);
}
