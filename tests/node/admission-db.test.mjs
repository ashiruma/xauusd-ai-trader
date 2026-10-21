import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import { checkCurrentUser, verifyAccessToken } from '../../lib/server/core.ts';
import { createAdmissionQueries } from '../../lib/server/admission-db.ts';

const issuer = 'https://akhftbbszejafxpoxiem.supabase.co/auth/v1';
const subject = 'd9428888-122b-4a5a-9a1e-0c14d80b2f50';
const session = 'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';
const uuid = '00000000-0000-4000-8000-000000000001';
const secret = 'a'.repeat(64);
async function verifiedContext() {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ role: 'authenticated', session_id: session, is_anonymous: false })
    .setProtectedHeader({ alg: 'ES256' }).setIssuer(issuer).setAudience('authenticated')
    .setSubject(subject).setIssuedAt(now).setExpirationTime(now + 600).sign(privateKey);
  const c = await verifyAccessToken(token, 'https://akhftbbszejafxpoxiem.supabase.co', async () => publicKey);
  await checkCurrentUser(c, { supabaseUrl: 'https://akhftbbszejafxpoxiem.supabase.co', publishableKey: 'sb_publishable_test' }, async () => Response.json({ user: { id: subject, email: 'member@example.test', email_confirmed_at: new Date().toISOString(), is_anonymous: false } }));
  return c;
}
function mockSql() {
  const calls = [];
  const sql = async (strings, ...values) => { calls.push({ text: strings.join('?'), values, strings }); return [{ result: { ok: true } }]; };
  return { sql, calls };
}

test('all adapter calls use only their fixed routine, bind values, and unwrap their sole result column', async () => {
  const { sql, calls } = mockSql(); const db = createAdmissionQueries(sql); const c = await verifiedContext();
  assert.deepEqual(await db.begin(uuid, secret), { ok: true });
  await db.admit(uuid, secret, c, secret, secret); await db.recover(uuid, secret, c, secret, secret);
  await db.check(secret, c); await db.rotate(secret, c, uuid, 'b'.repeat(64), secret);
  await db.revokeCurrent(secret, c, uuid, secret); await db.revokeAccount(secret, c, uuid, secret);
  await db.progress(secret, c); await db.onboarding(secret, c);
  assert.equal(calls.length, 9);
  const expected = ['begin_session_admission','admit_session','recover_admission','check_auth_session','rotate_session','revoke_current_session','revoke_account_sessions','read_core_progress','read_onboarding_status'];
  for (let i=0;i<expected.length;i++) { assert.match(calls[i].text, new RegExp(`velarion_api\\.${expected[i]}\\(`)); assert.ok(!calls[i].text.includes(secret)); }
  assert.equal(calls[1].values.includes(secret), true);
  assert.equal(calls[1].values.filter(v => v === c.issuer).length, 1);
  assert.equal(calls[7].values.at(-2), 'velarion-forex');
  assert.equal(calls[7].values.at(-1), 'core-1.extensions-0');
  assert.equal(calls[8].values.length, 6); // handle + exactly five attested context arguments
});

test('all context-bearing operations reject fabricated contexts before SQL', async () => {
  const { sql, calls } = mockSql(); const db = createAdmissionQueries(sql);
  const fake = { issuer, subject, sessionId: session, issuedAt: Math.floor(Date.now()/1000), expiresAt: Math.floor(Date.now()/1000)+600, accessToken: 'forged' };
  for (const operation of [() => db.admit(uuid,secret,fake,secret,secret), () => db.recover(uuid,secret,fake,secret,secret), () => db.check(secret,fake), () => db.rotate(secret,fake,uuid,'b'.repeat(64),secret), () => db.revokeCurrent(secret,fake,uuid,secret), () => db.revokeAccount(secret,fake,uuid,secret), () => db.progress(secret,fake), () => db.onboarding(secret,fake)]) await assert.rejects(operation, e => e.code === 'UNVERIFIED_AUTH_CONTEXT');
  assert.equal(calls.length, 0);
});

test('malformed ids and bearer secrets are rejected before SQL', async () => {
  const { sql, calls } = mockSql(); const db = createAdmissionQueries(sql); const c = await verifiedContext();
  await assert.rejects(db.begin('not-uuid',secret), e => e.code === 'ADMISSION_INPUT_INVALID');
  await assert.rejects(db.begin(uuid,'ABC'), e => e.code === 'ADMISSION_INPUT_INVALID');
  await assert.rejects(db.rotate(secret,c,'not-uuid','b'.repeat(64),secret), e => e.code === 'ADMISSION_INPUT_INVALID');
  await assert.rejects(db.check('x'.repeat(64),c), e => e.code === 'ADMISSION_INPUT_INVALID');
  assert.equal(calls.length, 0);
});

test('malformed result sets fail closed', async () => {
  const db = createAdmissionQueries(async () => [{ result: true, other: false }]);
  await assert.rejects(db.begin(uuid,secret), e => e.code === 'ADMISSION_RESPONSE_INVALID');
});
