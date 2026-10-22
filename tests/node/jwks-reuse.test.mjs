import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { verifyAccessToken, checkCurrentUser, requireVerifiedContext } from '../../lib/server/core.ts';

const url = 'https://akhftbbszejafxpoxiem.supabase.co';
const subject = 'd9428888-122b-4a5a-9a1e-0c14d80b2f50';
const session = 'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';

test('warm public JWKS reuse preserves signature, issuer, expiry and live confirmation checks', async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const jwk = { ...await exportJWK(publicKey), kid: 'offline-test', alg: 'ES256', use: 'sig' };
  const now = Math.floor(Date.now() / 1000);
  const sign = (patch = {}, key = privateKey, kid = 'offline-test') => new SignJWT({
    iss: `${url}/auth/v1`, aud: 'authenticated', sub: subject, session_id: session,
    role: 'authenticated', is_anonymous: false, iat: now, exp: now + 600, ...patch,
  }).setProtectedHeader({ alg: 'ES256', kid }).sign(key);
  const originalFetch = globalThis.fetch;
  let keyFetches = 0, userFetches = 0;
  globalThis.fetch = async input => {
    assert.equal(String(input), `${url}/auth/v1/.well-known/jwks.json`, 'No live network permitted');
    keyFetches++;
    return Response.json({ keys: [jwk] });
  };
  try {
    const token = await sign();
    const a = await verifyAccessToken(token, url);
    const b = await verifyAccessToken(token, url);
    assert.notEqual(a, b, 'contexts must not be cached');
    assert.equal(keyFetches, 1, 'one public-key fetch per warm resolver');
    assert.throws(() => requireVerifiedContext(b), e => e.code === 'UNVERIFIED_AUTH_CONTEXT');
    const config = { supabaseUrl: url, publishableKey: 'sb_publishable_offline' };
    const user = async (_input, init) => {
      userFetches++;
      assert.equal(init.cache, 'no-store');
      return Response.json({ id: subject, email: 'synthetic@example.test', is_anonymous: false,
        email_confirmed_at: '2025-01-01T00:00:00Z' });
    };
    await checkCurrentUser(a, config, user);
    await checkCurrentUser(b, config, user);
    assert.equal(userFetches, 2);
    const c = await verifyAccessToken(token, url);
    await assert.rejects(checkCurrentUser(c, config, async () => Response.json({
      id: subject, email: 'synthetic@example.test', is_anonymous: false, email_confirmed_at: null,
    })), e => e.code === 'AUTH_USER_REJECTED');
    assert.throws(() => requireVerifiedContext(c), e => e.code === 'UNVERIFIED_AUTH_CONTEXT');
    await assert.rejects(verifyAccessToken(await sign({ exp: now - 60 }), url), e => e.code === 'TOKEN_INVALID');
    await assert.rejects(verifyAccessToken(await sign({ iss: 'https://attacker.test/auth/v1' }), url), e => e.code === 'TOKEN_INVALID');
    await assert.rejects(verifyAccessToken(token, 'https://attacker.test'), e => e.code === 'TOKEN_INVALID');
    const other = await generateKeyPair('ES256');
    await assert.rejects(verifyAccessToken(await sign({}, other.privateKey), url), e => e.code === 'TOKEN_INVALID');
    await assert.rejects(verifyAccessToken(await sign({}, privateKey, 'unknown-key'), url), e => e.code === 'TOKEN_INVALID');
    assert.equal(keyFetches, 1);
  } finally { globalThis.fetch = originalFetch; }
});
