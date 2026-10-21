import test from 'node:test';
import assert from 'node:assert/strict';
import { withServerlessDatabase, SERVERLESS_DATABASE_OPTIONS } from '../../lib/server/serverless-database.ts';
import { withAdmissionDatabase } from '../../lib/server/admission-db.ts';
const env = {
  VELARION_SUPABASE_URL: 'https://akhftbbszejafxpoxiem.supabase.co',
  VELARION_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic',
  VELARION_APP_ORIGIN: 'https://staging.example.test',
  VELARION_BFF_DATABASE_URL: 'postgres://velarion_bff_runtime.akhftbbszejafxpoxiem:synthetic@aws-0-test.pooler.supabase.com:6543/postgres',
};
function fixture({ commitFailure = false } = {}) {
  const calls = []; let commits = 0, ended = 0, connected = 0;
  const tx = async (strings, ...values) => { calls.push({ text: strings.join('?'), values }); return [{ result: true }]; };
  const connect = (url, options) => {
    connected++; assert.equal(url, env.VELARION_BFF_DATABASE_URL);
    assert.equal(options.max, 1); assert.equal(options.max_pipeline, 1);
    assert.equal(options.prepare, false); assert.equal(options.ssl, 'verify-full');
    assert.equal(options.connection, undefined); // No unsupported session-state startup options.
    return { async begin(fn) { const result = await fn(tx); commits++; if (commitFailure) throw Error('lost COMMIT reply'); return result; }, async end() { ended++; } };
  };
  return { calls, connect, get commits() { return commits; }, get ended() { return ended; }, get connected() { return connected; } };
}
test('pooler settings cap warm-instance connections, disable preparation and pipelining, preserve TLS verification', () => {
  assert.equal(SERVERLESS_DATABASE_OPTIONS.max, 1);
  assert.equal(SERVERLESS_DATABASE_OPTIONS.max_pipeline, 1);
  assert.equal(SERVERLESS_DATABASE_OPTIONS.prepare, false);
  assert.equal(SERVERLESS_DATABASE_OPTIONS.ssl, 'verify-full');
});
test('fixed SET LOCAL timeouts and work commit together, injected client is closed', async () => {
  const f = fixture();
  const result = await withServerlessDatabase(async sql => sql`SELECT ${123} AS result`, { env, connect: f.connect });
  assert.deepEqual(result, [{ result: true }]); assert.equal(f.commits, 1); assert.equal(f.ended, 1);
  assert.deepEqual(f.calls.map(c => c.text), ["SET LOCAL statement_timeout = '5s'", "SET LOCAL lock_timeout = '2s'", 'SELECT ? AS result']);
});
test('lost commit response is not retried and does not leak underlying error', async () => {
  const f = fixture({ commitFailure: true });
  await assert.rejects(withServerlessDatabase(sql => sql`SELECT 1`, { env, connect: f.connect }), e => e.code === 'ADMISSION_DATABASE_UNAVAILABLE' && !e.message.includes('COMMIT'));
  assert.equal(f.commits, 1); assert.equal(f.connected, 1); assert.equal(f.ended, 1);
});
test('admission fence adapter returns only after its independent transaction commits', async () => {
  const f = fixture();
  assert.equal(await withAdmissionDatabase(db => db.begin('00000000-0000-4000-8000-000000000001', 'a'.repeat(64)), { env, connect: f.connect }), true);
  assert.equal(f.commits, 1); assert.equal(f.calls.length, 3);
  assert.match(f.calls[2].text, /velarion_api.begin_session_admission/);
});
test('invalid config fails before client construction', async () => {
  let connected = false;
  await assert.rejects(withServerlessDatabase(async () => {}, { env: {}, connect: () => { connected = true; } }), e => e.code === 'BFF_CONFIG_UNAVAILABLE');
  assert.equal(connected, false);
});
