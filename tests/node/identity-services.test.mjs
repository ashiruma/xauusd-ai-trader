import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, exportJWK } from 'jose';
import { verifyAccessToken, checkCurrentUser, BffError } from '../../lib/server/core.ts';
import { createIdentityServices, queryIdentity } from '../../lib/server/identity-core.ts';
import { withIdentityDatabase } from '../../lib/server/database.ts';

const issuerBase = 'https://akhftbbszejafxpoxiem.supabase.co';
const issuer = `${issuerBase}/auth/v1`;
const subject = 'e810577e-a12a-4c34-8b0d-7962e31bb981';
const sessionId = 'f9cc6fc9-e651-48e6-89e8-d492b1db802b';
const now = Math.floor(Date.now() / 1000);
const { privateKey, publicKey } = await generateKeyPair('ES256');
await exportJWK(publicKey);
const resolver = async () => publicKey;
async function token(overrides = {}) {
  return new SignJWT({ role: 'authenticated', is_anonymous: false, session_id: sessionId, ...overrides })
    .setProtectedHeader({ alg: 'ES256', kid: 'local-key' }).setIssuer(issuer)
    .setAudience('authenticated').setSubject(subject).setIssuedAt(now).setExpirationTime(now + 600).sign(privateKey);
}
const valid = await token();
const row = result => [{ result }];
function fixture({ sqlResult = true, check = async () => {}, query = async () => row(sqlResult) } = {}) {
  const calls = [];
  const services = createIdentityServices({
    verifyToken: value => verifyAccessToken(value, issuerBase, resolver, now),
    checkUser: async context => { calls.push(['user', context.subject]); await checkCurrentUser(context, { supabaseUrl: issuerBase, publishableKey: 'public-test-key' }, async () => new Response(JSON.stringify({ id: subject, email: 'learner@example.test', email_confirmed_at: '2025-01-01T00:00:00Z', is_anonymous: false }), { status: 200 })); await check(context); },
    query: async (op, context) => { calls.push([op, context.issuer, context.subject, context.sessionId, context.issuedAt]); return query(op, context); },
  });
  return { services, calls };
}

test('fixed SQL routines bind only verified actor tuple in required order', async () => {
  let statement, values;
  const fakeTag = async (strings, ...params) => { statement = strings.join('?'); values = params; return []; };
  const context = await verifyAccessToken(valid, issuerBase, resolver, now);
  await checkCurrentUser(context, { supabaseUrl: issuerBase, publishableKey: 'public-test-key' }, async () => new Response(JSON.stringify({id:subject,email:'learner@example.test',email_confirmed_at:'2025-01-01T00:00:00Z',is_anonymous:false}), {status:200}));
  await queryIdentity(fakeTag, 'revokeAccountSessions', context);
  assert.match(statement, /velarion_api\.revoke_account_sessions\(\?, \?::uuid, \?::uuid, \?::timestamptz, \?::timestamptz\)/);
  assert.deepEqual(values, [issuer, subject, sessionId, new Date(now * 1000), new Date((now + 600) * 1000)]);
});
test('raw JWT is verified and online user precedes check-session query', async () => {
  const { services, calls } = fixture();
  await services.checkSession(valid);
  assert.deepEqual(calls, [['user', subject], ['checkSession', issuer, subject, sessionId, now]]);
});
test('forged decoded/browser context objects and tampered, expired, or wrong-issuer JWTs never query', async () => {
  const { services, calls } = fixture();
  await assert.rejects(services.checkSession({ issuer, subject, sessionId, issuedAt: now }), BffError);
  await assert.rejects(services.checkSession(`${valid.slice(0, -2)}xx`), BffError);
  const expired = await new SignJWT({ role: 'authenticated', session_id: sessionId }).setProtectedHeader({ alg: 'ES256' }).setIssuer(issuer).setAudience('authenticated').setSubject(subject).setIssuedAt(now - 1000).setExpirationTime(now - 1).sign(privateKey);
  await assert.rejects(services.checkSession(expired), BffError);
  const wrongIssuer = await new SignJWT({ role: 'authenticated', session_id: sessionId }).setProtectedHeader({ alg: 'ES256' }).setIssuer('https://other.supabase.co/auth/v1').setAudience('authenticated').setSubject(subject).setIssuedAt(now).setExpirationTime(now + 600).sign(privateKey);
  await assert.rejects(services.checkSession(wrongIssuer), BffError);
  assert.deepEqual(calls, []);
});
test('online user rejection and false live-session result fail closed', async () => {
  const badUser = fixture({ check: async () => { throw new BffError('AUTH_USER_REJECTED', 401); } });
  await assert.rejects(badUser.services.checkSession(valid));
  assert.equal(badUser.calls.some(c => c[0] === 'checkSession'), false);
  const stale = fixture({ sqlResult: false });
  await assert.rejects(stale.services.checkSession(valid), /SESSION_REJECTED/);
});
test('provisioning is denied before SQL; revocation DTOs strictly whitelist returned properties', async () => {
  const provision = fixture();
  await assert.rejects(provision.services.provisionLearner(valid), error => error.code === 'PROVISIONING_NOT_APPROVED');
  assert.equal(provision.calls.some(call => call[0] === 'provisionLearner'), false);
  const receipt = new Date().toISOString();
  const rev = fixture({ sqlResult: { scope: 'current', revoked: true, revokedAt: receipt } });
  assert.deepEqual(await rev.services.revokeCurrentSession(valid), { scope: 'current', revoked: true, revokedAt: receipt });
  const wrongScope = fixture({ sqlResult: { scope: 'account', revoked: true, revokedAt: receipt } });
  await assert.rejects(wrongScope.services.revokeCurrentSession(valid), /IDENTITY_RESPONSE_INVALID/);
});
test('account generation remains revoked after refreshed JWT and unknown session IDs', async () => {
  const receipt = new Date().toISOString();
  let generation = 0;
  const bindings = new Map([[sessionId, 0]]);
  const mockDatabase = async (op, context) => {
    const allowed = bindings.has(context.sessionId) && bindings.get(context.sessionId) === generation;
    if (op === 'revokeAccountSessions') {
      if (!allowed) throw new BffError('SESSION_REJECTED', 401);
      generation++;
      return row({ scope: 'account', revoked: true, revokedAt: receipt });
    }
    return row(allowed);
  };
  const { services } = fixture({ query: mockDatabase });
  await services.checkSession(valid);
  assert.deepEqual(await services.revokeAccountSessions(valid), { scope: 'account', revoked: true, revokedAt: receipt });
  await assert.rejects(services.checkSession(valid), /SESSION_REJECTED/);
  const refreshed = await new SignJWT({ role: 'authenticated', is_anonymous: false, session_id: sessionId })
    .setProtectedHeader({ alg: 'ES256' }).setIssuer(issuer).setAudience('authenticated').setSubject(subject)
    .setIssuedAt(now + 1).setExpirationTime(now + 600).sign(privateKey);
  await assert.rejects(services.checkSession(refreshed), /SESSION_REJECTED/);
  const unknown = await token({ session_id: '9d7b83e6-c4d7-4a10-bbb7-053218719cc8' });
  await assert.rejects(services.checkSession(unknown), /SESSION_REJECTED/);
  await assert.rejects(services.revokeAccountSessions(valid), /SESSION_REJECTED/);
  assert.equal(generation, 1);
  // This mock exercises orchestration only; the disposable PG harness tests real SQL semantics.
});
test('database refuses missing production configuration before opening a connection', async () => {
  let connected = false;
  await assert.rejects(withIdentityDatabase(async () => {}, { env: {}, connect: () => { connected = true; throw new Error('must not connect'); } }), /BFF_CONFIG_UNAVAILABLE/);
  assert.equal(connected, false);
});

test('runtime provenance rejects fabricated verified-context objects before user or SQL adapters', async () => {
  let calls = 0;
  const fake = {issuer:'https://example-project.supabase.co/auth/v1',subject:'d9428888-122b-4a5a-9a1e-0c14d80b2f50',sessionId:'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f',issuedAt:Math.floor(Date.now()/1000),expiresAt:Math.floor(Date.now()/1000)+600,accessToken:'forged'};
  const { createIdentityServices: create } = await import('../../lib/server/identity-core.ts');
  const services = create({verifyToken:async()=>fake,checkUser:async()=>{calls++;},query:async()=>{calls++;return [{result:true}];}});
  await assert.rejects(services.checkSession('forged'), error => error.code === 'UNVERIFIED_AUTH_CONTEXT');
  await assert.rejects(services.provisionLearner('forged'), error => error.code === 'PROVISIONING_NOT_APPROVED');
  await assert.rejects(services.revokeCurrentSession('forged'), error => error.code === 'UNVERIFIED_AUTH_CONTEXT');
  await assert.rejects(services.revokeAccountSessions('forged'), error => error.code === 'UNVERIFIED_AUTH_CONTEXT');
  await assert.rejects(services.assertLiveSession(fake), error => error.code === 'UNVERIFIED_AUTH_CONTEXT');
  assert.equal(calls, 0);
});
