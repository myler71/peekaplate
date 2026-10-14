import { createServer, type Server } from 'node:http';
import { exportJWK, generateKeyPair, generateSecret, type JWK, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticationError, AuthUnavailableError, createStaffVerifier } from './auth';

const STAFF_ID = '1699ae2d-5b55-4e47-91e1-e448d5dcab3a';
let server: Server;
let issuer: string;
let privateKey: CryptoKey;
let publicJwk: JWK;
let jwksRequests: string[] = [];

beforeAll(async () => {
  const keys = await generateKeyPair('RS256');
  privateKey = keys.privateKey;
  publicJwk = { ...(await exportJWK(keys.publicKey)), kid: 'test-key', use: 'sig', alg: 'RS256' };
  server = createServer((request, response) => {
    jwksRequests.push(request.url ?? '');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ keys: [publicJwk] }));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test JWKS server did not provide an address.');
  }
  issuer = `http://127.0.0.1:${address.port}/auth/v1`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe('createStaffVerifier', () => {
  it('returns a UUID only after validating a signed Supabase staff token', async () => {
    const verify = createLocalVerifier();
    await expect(verify(`Bearer ${await token()}`)).resolves.toBe(STAFF_ID);
    expect(jwksRequests).toContain('/auth/v1/.well-known/jwks.json');
  });

  it('accepts a case-insensitive bearer scheme and normalizes a verified UUID', async () => {
    const verify = createLocalVerifier();
    await expect(
      verify(`bearer ${await token({ subject: STAFF_ID.toUpperCase() })}`),
    ).resolves.toBe(STAFF_ID);
  });

  it.each([
    ['missing bearer token', undefined],
    ['wrong issuer', () => token({ issuer: `${issuer}/wrong` })],
    ['wrong audience', () => token({ audience: 'other' })],
    ['anonymous token', () => token({ isAnonymous: true })],
    ['wrong role', () => token({ role: 'anon' })],
    ['non-UUID subject', () => token({ subject: 'staff' })],
    ['expired token', () => token({ expiration: '1 second ago' })],
    ['token without expiration', () => token({ withoutExpiration: true })],
    ['disallowed signing algorithm', () => token({ algorithm: 'HS256' })],
    ['forged signature', () => token({ signWithNewKey: true })],
    [
      'forged jku header',
      () => token({ jku: 'https://example.invalid/jwks.json', signWithNewKey: true }),
    ],
  ])('rejects %s', async (_caseName, makeToken) => {
    const verify = createLocalVerifier();
    const authorization =
      typeof makeToken === 'function' ? `Bearer ${await makeToken()}` : makeToken;
    await expect(verify(authorization)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejects bearer tokens over the input limit before requesting a JWKS', async () => {
    const verify = createLocalVerifier();
    await expect(verify(`Bearer ${'a'.repeat(8_193)}`)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('ignores a signed token header that tries to select a different JWKS', async () => {
    const verify = createLocalVerifier();
    await expect(
      verify(`Bearer ${await token({ jku: 'https://example.invalid/jwks.json' })}`),
    ).resolves.toBe(STAFF_ID);
  });

  it('rejects non-Supabase and non-local issuer configuration before verification', () => {
    expect(() =>
      createStaffVerifier({ issuer: 'http://example.com/auth/v1', allowLocalIssuer: true }),
    ).toThrow(AuthUnavailableError);
    expect(() => createStaffVerifier({ issuer: 'https://example.com/wrong' })).toThrow(
      AuthUnavailableError,
    );
    expect(() => createStaffVerifier({ issuer, allowLocalIssuer: false })).toThrow(
      AuthUnavailableError,
    );
  });

  it('reports an unavailable JWKS endpoint separately from invalid credentials', async () => {
    const verify = createStaffVerifier({
      issuer: 'http://127.0.0.1:1/auth/v1',
      allowLocalIssuer: true,
    });
    await expect(verify(`Bearer ${await token()}`)).rejects.toBeInstanceOf(AuthUnavailableError);
  });
});

function createLocalVerifier() {
  return createStaffVerifier({ issuer, allowLocalIssuer: true });
}

async function token(
  options: {
    issuer?: string;
    audience?: string;
    isAnonymous?: boolean;
    role?: string;
    subject?: string;
    expiration?: string;
    signWithNewKey?: boolean;
    jku?: string;
    algorithm?: 'HS256';
    withoutExpiration?: boolean;
  } = {},
) {
  const algorithm = options.algorithm ?? 'RS256';
  const signingKey =
    algorithm === 'HS256'
      ? await generateSecret(algorithm)
      : options.signWithNewKey
        ? (await generateKeyPair(algorithm)).privateKey
        : privateKey;
  const jwt = new SignJWT({
    role: options.role ?? 'authenticated',
    is_anonymous: options.isAnonymous ?? false,
  })
    .setProtectedHeader({
      alg: algorithm,
      kid: 'test-key',
      ...(options.jku ? { jku: options.jku } : {}),
    })
    .setIssuer(options.issuer ?? issuer)
    .setAudience(options.audience ?? 'authenticated')
    .setSubject(options.subject ?? STAFF_ID)
    .setIssuedAt();
  if (!options.withoutExpiration) {
    jwt.setExpirationTime(options.expiration ?? '5 minutes');
  }
  return jwt.sign(signingKey);
}
