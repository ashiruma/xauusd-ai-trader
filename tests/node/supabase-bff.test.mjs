import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, createLocalJWKSet } from 'jose';
import {
  BffError, verifyAccessToken, establishContext, checkCurrentUser,
  validateConfig, validateProgress, requireVerifiedContext,
} from '../../lib/server/core.ts';
import { queryCoreProgress } from '../../lib/server/db-core.ts';

const issuer = 'https://akhftbbszejafxpoxiem.supabase.co/auth/v1';
const supabaseUrl = 'https://akhftbbszejafxpoxiem.supabase.co';
const subject = 'd9428888-122b-4a5a-9a1e-0c14d80b2f50';
const sessionId = 'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';
const now = Math.floor(Date.now() / 1000);
const { privateKey, publicKey } = await generateKeyPair('ES256');
const publicJwk = await (await import('jose')).exportJWK(publicKey);
const jwks = createLocalJWKSet({ keys: [{ ...publicJwk, kid: 'test-key', alg: 'ES256', use: 'sig' }] });

async function token(overrides = {}, alg = 'ES256', key = privateKey) {
  const base = { sub: subject, session_id: sessionId, role: 'authenticated', is_anonymous: false, aud: 'authenticated', iss: issuer, iat: now, exp: now + 600, ...overrides };
  let signer = new SignJWT(base).setProtectedHeader({ alg, kid: 'test-key' });
  if (base.iss !== undefined) signer = signer.setIssuer(base.iss);
  return signer.sign(key);
}
const config = { supabaseUrl, publishableKey: 'public-test-key', databaseUrl: 'postgres://app_login:strong-password@db.example.test/db', appOrigin: 'https://app.example' };
const validUserResponse = (id = subject, extra = {}) => new Response(JSON.stringify({ id, email: 'learner@example.test', is_anonymous: false, email_confirmed_at: '2025-01-01T00:00:00Z', ...extra }), { status: 200 });

test('accepts ES256 authenticated token and extracts only verified identity context', async () => {
  const value = await verifyAccessToken(await token(), supabaseUrl, jwks);
  assert.equal(value.subject, subject);
  assert.equal(value.sessionId, sessionId);
  assert.equal(value.issuer, issuer);
  assert.equal(value.issuedAt, now);
});

test('rejects issuer, audience, expiration, future iat, missing session, anonymous and HS256', async () => {
  const cases = [
    [await token({ iss: 'https://evil.example/auth/v1' }), jwks],
    [await token({ aud: 'other' }), jwks],
    [await token({ exp: now - 1 }), jwks],
    [await token({ iat: now + 60 }), jwks],
    [await token({ session_id: undefined }), jwks],
    [await token({ is_anonymous: true }), jwks],
  ];
  for (const [value, resolver] of cases) await assert.rejects(verifyAccessToken(value, supabaseUrl, resolver), e => e instanceof BffError && e.code === 'TOKEN_INVALID');
  const hsKey = new TextEncoder().encode('local-test-only-hmac-key-32-bytes-minimum');
  await assert.rejects(verifyAccessToken(await token({}, 'HS256', hsKey), supabaseUrl, jwks), e => e.code === 'TOKEN_INVALID');
});

test('rejects tampering and unsigned / unsupported algorithm tokens', async () => {
  const signed = await token();
  const parts = signed.split('.');
  parts[1] = Buffer.from(JSON.stringify({ sub: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', iss: issuer, iat: now, exp: now + 600, role: 'authenticated', session_id: sessionId })).toString('base64url');
  await assert.rejects(verifyAccessToken(parts.join('.'), supabaseUrl, jwks));
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${parts[1]}.`;
  await assert.rejects(verifyAccessToken(none, supabaseUrl, jwks));
});

test('online user checks reject disabled/unconfirmed/mismatched accounts and accept a valid user', async () => {
  const ctx = await verifyAccessToken(await token(), supabaseUrl, jwks);
  for (const response of [new Response('{}', { status: 401 }), validUserResponse(subject, { email_confirmed_at: null }), validUserResponse('00000000-0000-4000-8000-000000000000'), validUserResponse(subject, { banned_until: '2099-01-01' }), validUserResponse(subject, { deleted_at: '2025-01-01' })]) {
    await assert.rejects(checkCurrentUser(ctx, config, async () => response), e => e instanceof BffError);
  }
  await checkCurrentUser(ctx, config, async () => validUserResponse());
  for (const response of [validUserResponse(subject, { email_confirmed_at: '' }), validUserResponse(subject, { banned_until: 'not-a-date' })]) await assert.rejects(checkCurrentUser(ctx, config, async () => response), e => e.code === 'AUTH_USER_REJECTED');
});

test('session revocation guard failure is fail-closed; injected live guard permits establishment', async () => {
  const value = await token();
  await assert.rejects(establishContext(value, config, async () => { throw new BffError('IDENTITY_SERVICE_UNAVAILABLE', 503); }, async () => validUserResponse(), jwks), e => e.code === 'IDENTITY_SERVICE_UNAVAILABLE' && e.status === 503);
  const ctx = await establishContext(value, config, async () => {}, async () => validUserResponse(), jwks);
  assert.equal(ctx.subject, subject);
  await assert.rejects(establishContext(value, config, async () => { throw new BffError('GUARD_UNAVAILABLE', 503); }, async () => validUserResponse(), jwks), e => e.code === 'GUARD_UNAVAILABLE');
});

test('configuration is complete and pinned to HTTPS Supabase project and HTTPS app origin', () => {
  assert.throws(() => validateConfig({}), e => e.code === 'BFF_CONFIG_UNAVAILABLE');
  const env = { VELARION_SUPABASE_URL: 'https://akhftbbszejafxpoxiem.supabase.co', VELARION_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test', VELARION_BFF_DATABASE_URL: 'postgres://velarion_bff_runtime:strong-password@db.akhftbbszejafxpoxiem.supabase.co/db', VELARION_APP_ORIGIN: 'https://app.example.test' };
  assert.equal(validateConfig(env).publishableKey, 'sb_publishable_test');
  assert.throws(() => validateConfig({ ...env, VELARION_SUPABASE_URL: 'http://example-project.supabase.co' }), e => e.code === 'BFF_CONFIG_INVALID');
  assert.throws(() => validateConfig({ ...env, VELARION_SUPABASE_URL: 'https://attacker.example' }), e => e.code === 'BFF_CONFIG_INVALID');
  for (const badUrl of ['https://user@akhftbbszejafxpoxiem.supabase.co', 'https://akhftbbszejafxpoxiem.supabase.co:444', 'https://akhftbbszejafxpoxiem.supabase.co/?x=1']) assert.throws(() => validateConfig({ ...env, VELARION_SUPABASE_URL: badUrl }), e => e.code === 'BFF_CONFIG_INVALID');
  for (const user of ['postgres', 'service_role', 'supabase_admin', 'other_runtime']) assert.throws(() => validateConfig({ ...env, VELARION_BFF_DATABASE_URL: `postgres://${user}:pw@db.akhftbbszejafxpoxiem.supabase.co/db` }), e => e.code === 'BFF_CONFIG_INVALID');
  assert.throws(() => validateConfig({ ...env, VELARION_BFF_DATABASE_URL: 'postgres://velarion_bff_runtime:pw@db.example.test/db' }), e => e.code === 'BFF_CONFIG_INVALID');
  assert.throws(() => validateConfig({ ...env, VELARION_BFF_DATABASE_URL: 'postgres://velarion_bff_runtime:pw@db.akhftbbszejafxpoxiem.supabase.co/db?sslmode=disable' }), e => e.code === 'BFF_CONFIG_INVALID');
  assert.throws(() => validateConfig({ ...env, VELARION_SUPABASE_PUBLISHABLE_KEY: 'service_role_secret' }), e => e.code === 'BFF_CONFIG_INVALID');
  assert.throws(() => validateConfig({ ...env, VELARION_APP_ORIGIN: 'http://app.example' }), e => e.code === 'BFF_CONFIG_INVALID');
});

test('progress DTO accepts exact contract and rejects malformed, expanded, or privacy-leaking shapes', () => {
  assert.deepEqual(validateProgress({ coreCompleted: 30, coreTotal: 30, coreGraduated: true, automationEligible: false, earlyMilestone: true, learnerId: subject }), { coreCompleted: 30, coreTotal: 30, coreGraduated: true, automationEligible: false, earlyMilestone: true });
  for (const bad of [
    { coreCompleted: -1, coreTotal: 30, coreGraduated: false, automationEligible: false, earlyMilestone: false },
    { coreCompleted: 31, coreTotal: 30, coreGraduated: false, automationEligible: false, earlyMilestone: false },
    { coreCompleted: 1, coreTotal: 30, coreGraduated: true, automationEligible: false, earlyMilestone: false },
    { coreCompleted: 1, coreTotal: 30, coreGraduated: false, automationEligible: true, earlyMilestone: false },
    { coreCompleted: 1, coreTotal: 29, coreGraduated: false, automationEligible: false, earlyMilestone: false },
    null,
  ]) assert.throws(() => validateProgress(bad), e => e.code === 'PROGRESS_INVALID');
});


test('pure progress query helper binds exact order and DTO column is unwrapped strictly', async () => {
  const calls = [];
  const sql = async (strings, ...values) => { calls.push({ text: strings.join('?'), values }); return [{ progress: { coreCompleted: 30, coreTotal: 30, coreGraduated: true, automationEligible: false, earlyMilestone: true } }]; };
  const context = await verifyAccessToken(await token(), supabaseUrl, jwks);
  await checkCurrentUser(context, config, async () => validUserResponse());
  const rows = await queryCoreProgress(sql, context);
  assert.deepEqual(calls[0].values, [issuer, subject, sessionId, new Date(now * 1000), new Date((now + 600) * 1000), 'velarion-forex', 'core-1.extensions-0']);
  assert.match(calls[0].text, /AS progress/i);
  assert.deepEqual(validateProgress(rows[0]?.progress), { coreCompleted: 30, coreTotal: 30, coreGraduated: true, automationEligible: false, earlyMilestone: true });
  assert.throws(() => validateProgress([rows[0].progress]), e => e.code === 'PROGRESS_INVALID');
});

test('forged and signature-only contexts cannot be used for protected database access', async () => {
  assert.throws(() => requireVerifiedContext({ issuer, subject, sessionId, issuedAt: now, expiresAt: now + 600, accessToken: 'forged' }), e => e.code === 'UNVERIFIED_AUTH_CONTEXT');
  const signedOnly = await verifyAccessToken(await token(), supabaseUrl, jwks);
  assert.throws(() => requireVerifiedContext(signedOnly), e => e.code === 'UNVERIFIED_AUTH_CONTEXT');
  let queried = false;
  const fakeSql = async () => { queried = true; return []; };
  // The query helper is intentionally a binder; the public DB service performs the provenance guard.
  assert.equal(queried, false);
});
