import test from 'node:test';
import assert from 'node:assert/strict';
import { createServerClient } from '@supabase/ssr';
import { accessTokenCandidate } from '../../lib/server/auth-cookie-token.ts';
import { establishContext, verifyAccessToken, BffError } from '../../lib/server/core.ts';
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from 'jose';
import { AUTH_COOKIE } from '../../lib/server/auth-client-core.ts';

const project = 'https://akhftbbszejafxpoxiem.supabase.co';
const subject = 'd9428888-122b-4a5a-9a1e-0c14d80b2f50';
const sessionId = 'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';
const now = Math.floor(Date.now() / 1000);
const { privateKey, publicKey } = await generateKeyPair('ES256');
const publicJwk = await exportJWK(publicKey); const jwks = createLocalJWKSet({ keys: [{ ...publicJwk, kid: 'local-key', alg: 'ES256', use: 'sig' }] });
const access = await new SignJWT({ role: 'authenticated', is_anonymous: false, session_id: sessionId }).setProtectedHeader({ alg: 'ES256', kid: 'local-key' }).setIssuer(`${project}/auth/v1`).setAudience('authenticated').setSubject(subject).setIssuedAt(now).setExpirationTime(now + 600).sign(privateKey);
const session = { access_token: access, refresh_token: 'local-synthetic-refresh', token_type: 'bearer', expires_at: now + 600, user: { id: subject } };

async function sdkCookies(value) {
  const jar = new Map();
  const client = createServerClient(project, 'sb_publishable_test', { cookieOptions: { name: AUTH_COOKIE, httpOnly: true, secure: true, sameSite: 'lax', path: '/' }, cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => { for (const c of values) c.options?.maxAge === 0 ? jar.delete(c.name) : jar.set(c.name, c.value); } }, global: { fetch: async () => Response.json(value) } });
  await client.auth.setSession({ access_token: value.access_token, refresh_token: value.refresh_token });
  return [...jar].map(([name, value]) => ({ name, value }));
}

test('SDK cookie transport extracts only untrusted candidate then establishes signed/current-user/guarded BFF context', async () => {
  const cookies = await sdkCookies(session);
  assert.ok(cookies.length > 0);
  const candidate = await accessTokenCandidate(cookies);
  assert.equal(candidate, access);
  const config = { supabaseUrl: project, publishableKey: 'sb_publishable_test', databaseUrl: 'postgres://velarion_bff_runtime:local@db.akhftbbszejafxpoxiem.supabase.co/db', appOrigin: 'https://app.example.test' };
  await assert.rejects(establishContext(candidate, config, async () => { throw new BffError('SESSION_REVOKED', 401); }, async () => Response.json({ id: subject, email: 'learner@example.test', is_anonymous: false, email_confirmed_at: '2026-01-01T00:00:00Z' }), jwks), e => e.code === 'SESSION_REVOKED');
  const context = await establishContext(candidate, config, async () => {}, async () => Response.json({ id: subject, email: 'learner@example.test', is_anonymous: false, email_confirmed_at: '2026-01-01T00:00:00Z' }), jwks);
  assert.equal(context.subject, subject); assert.equal(context.sessionId, sessionId);
});

test('SDK chunk extraction handles chunks, rejects malformed/oversized input and ignores legacy BFF cookie', async () => {
  assert.equal(await accessTokenCandidate([{ name: `${AUTH_COOKIE}.0`, value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url') }]), access);
  for (const cookies of [[], [{ name: AUTH_COOKIE, value: 'not-json' }], [{ name: AUTH_COOKIE, value: JSON.stringify({ access_token: '' }) }], [{ name: AUTH_COOKIE, value: 'x'.repeat(32769) }], Array.from({ length: 17 }, (_, i) => ({ name: `${AUTH_COOKIE}.${i}`, value: 'x' }))]) await assert.rejects(accessTokenCandidate(cookies), e => e instanceof BffError && e.code === 'AUTHENTICATION_REQUIRED');
  await assert.rejects(accessTokenCandidate([{ name: '__Host-velarion_access', value: access }]), e => e.code === 'AUTHENTICATION_REQUIRED');
  // Candidate decoding is not signature verification: malformed JWT never authenticates.
  const bad = await accessTokenCandidate([{ name: AUTH_COOKIE, value: JSON.stringify({ access_token: `${access.slice(0, -2)}xx` }) }]);
  await assert.rejects(verifyAccessToken(bad, project, jwks), e => e.code === 'TOKEN_INVALID');
});
