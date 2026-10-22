import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTemporaryDbProbe, probeCategory } from '../../lib/server/temporary-db-probe.ts';
import { SERVERLESS_DATABASE_OPTIONS } from '../../lib/server/serverless-database.ts';
const origin = 'https://velarion-git-staging-first-client-log-7929e9-ashirumas-projects.vercel.app';
const path = '/api/diagnostics/temporary-db-probe';
const env = {
  VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'staging/first-client-login-2026-10-21',
  VELARION_RELEASE_ENVIRONMENT: 'staging', VELARION_APP_ORIGIN: origin, VELARION_STAGING_APP_ORIGIN: origin,
  VELARION_SUPABASE_URL: 'https://akhftbbszejafxpoxiem.supabase.co',
  VELARION_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic',
  VELARION_BFF_DATABASE_URL: 'postgres://velarion_bff_runtime.akhftbbszejafxpoxiem:synthetic@aws-0-test.pooler.supabase.com:6543/postgres',
};
const headers = { origin, 'sec-fetch-site': 'same-origin', 'sec-fetch-mode': 'cors', 'sec-fetch-dest': 'empty' };
const req = (overrides = {}) => new Request(origin + path, { method: 'POST', headers, ...overrides });
const sensitive = 'PRIVATE_SENTINEL postgres://password@example.test SQL user token';
function setup(failAt, error, overrideEnv = env) {
  const calls = [];
  const query = async (strings, ...values) => {
    const statement = strings.join(''); calls.push(statement); assert.deepEqual(values, []);
    if (statement === failAt) throw error;
    return [{ ignored: sensitive }];
  };
  query.release = () => calls.push('release');
  const connect = (url, options) => {
    calls.push('connect'); assert.equal(url, env.VELARION_BFF_DATABASE_URL);
    assert.deepEqual(options, { ...SERVERLESS_DATABASE_OPTIONS, fetch_types: false });
    return { reserve: async () => { calls.push('reserve'); if (failAt === 'reserve') throw error; return query; }, end: async () => calls.push('end') };
  };
  return { calls, probe: createTemporaryDbProbe({ env: overrideEnv, connect }) };
}
test('successful probe executes only approved read-only transaction and never commits', async t => {
  const log = t.mock.method(console, 'info', () => {});
  const { calls, probe } = setup(); const response = await probe(req());
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true, category: 'SUCCESS' });
  assert.deepEqual(calls, ['connect', 'reserve', 'BEGIN READ ONLY', 'SELECT 1', 'ROLLBACK', 'release', 'end']);
  assert.deepEqual(log.mock.calls.map(c => c.arguments), [['[velarion.temporary-db-probe] SUCCESS']]);
  assert.match(response.headers.get('cache-control'), /no-store/); assert.equal(response.headers.get('set-cookie'), null);
});
for (const [failAt, expected] of [
  ['reserve', ['connect', 'reserve', 'end']],
  ['BEGIN READ ONLY', ['connect', 'reserve', 'BEGIN READ ONLY', 'release', 'end']],
  ['SELECT 1', ['connect', 'reserve', 'BEGIN READ ONLY', 'SELECT 1', 'ROLLBACK', 'release', 'end']],
  ['ROLLBACK', ['connect', 'reserve', 'BEGIN READ ONLY', 'SELECT 1', 'ROLLBACK', 'release', 'end']],
]) test(`failure at ${failAt} is generic, redacted and never retried`, async t => {
  const log = t.mock.method(console, 'info', () => {});
  const error = Object.assign(new Error(sensitive), { code: 'SELF_SIGNED_CERT_IN_CHAIN', detail: sensitive, query: sensitive, parameters: [sensitive], cause: new Error(sensitive) });
  const { calls, probe } = setup(failAt, error); const response = await probe(req());
  assert.equal(response.status, 503); assert.deepEqual(await response.json(), { ok: false, category: 'TLS_TRUST', code: 'SELF_SIGNED_CERT_IN_CHAIN' });
  assert.deepEqual(calls, expected); assert.deepEqual(log.mock.calls.map(c => c.arguments), [['[velarion.temporary-db-probe] TLS_TRUST']]);
});
test('stage, branch and Preview deployment guards fail closed before DB access', async () => {
  for (const key of ['VERCEL_ENV', 'VERCEL_GIT_COMMIT_REF', 'VELARION_RELEASE_ENVIRONMENT', 'VELARION_APP_ORIGIN', 'VELARION_STAGING_APP_ORIGIN']) {
    for (const value of [undefined, 'production', 'https://attacker.test']) {
      const { calls, probe } = setup(undefined, undefined, { ...env, [key]: value });
      const response = await probe(req()); assert.equal(response.status, 404); assert.deepEqual(await response.json(), { ok: false }); assert.deepEqual(calls, []);
    }
  }
});
test('exact origin, URL, method, fetch metadata and empty-body guards fail closed', async t => {
  const log = t.mock.method(console, 'info', () => {});
  const requests = [req({ method: 'GET' }), req({ body: sensitive }),
    new Request(origin + path + '?x=1', { method: 'POST', headers }),
    new Request('https://attacker.test' + path, { method: 'POST', headers })];
  for (const key of Object.keys(headers)) for (const value of [undefined, 'cross-site']) {
    const h = { ...headers }; if (value === undefined) delete h[key]; else h[key] = value;
    requests.push(req({ headers: h }));
  }
  requests.push(req({ headers: { ...headers, 'content-length': '1' } }));
  requests.push(req({ headers: { ...headers, 'transfer-encoding': 'chunked' } }));
  const { calls, probe } = setup(); for (const r of requests) assert.equal((await probe(r)).status, 404);
  assert.deepEqual(calls, []); assert.equal(log.mock.callCount(), 0);
});
test('category allowlist suppresses arbitrary codes, messages, nested causes and accessors', () => {
  for (const code of [sensitive, '42P01', 'BAD_CODE', '', null, 12345]) assert.deepEqual(probeCategory({ code, message: sensitive }), { category: 'SQL_RUNTIME' });
  for (const [code, category] of [['ECONNREFUSED', 'NETWORK'], ['ERR_TLS_CERT_ALTNAME_INVALID', 'TLS_VERIFICATION'], ['28P01', 'AUTH_PERMISSION'], ['42501', 'AUTH_PERMISSION'], ['57014', 'SQL_RUNTIME']]) assert.deepEqual(probeCategory({ code }), { category, code });
  assert.deepEqual(probeCategory({ cause: { code: 'SELF_SIGNED_CERT_IN_CHAIN' }, message: sensitive }), { category: 'SQL_RUNTIME' });
  assert.deepEqual(probeCategory(Object.defineProperty({}, 'code', { get() { throw new Error(sensitive); } })), { category: 'SQL_RUNTIME' });
});
test('invalid runtime config is generic and opens no connection', async t => {
  t.mock.method(console, 'info', () => {});
  const { calls, probe } = setup(undefined, undefined, { ...env, VELARION_BFF_DATABASE_URL: undefined });
  const response = await probe(req()); assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, category: 'SQL_RUNTIME' }); assert.deepEqual(calls, []);
});
test('route exposes only POST using Node runtime', () => {
  const source = readFileSync(new URL('../../app/api/diagnostics/temporary-db-probe/route.ts', import.meta.url), 'utf8');
  assert.match(source, /runtime = 'nodejs'/); assert.match(source, /export const POST/);
  assert.doesNotMatch(source, /export (?:const|function) (?:GET|PUT|DELETE|PATCH|HEAD|OPTIONS)/);
});

test('empty POST stream is accepted without decoding content', async t => {
  t.mock.method(console, 'info', () => {});
  const { probe } = setup(); assert.equal((await probe(req({ body: '' }))).status, 200);
});
