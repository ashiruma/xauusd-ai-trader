import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntegratedHttp } from '../../lib/server/integrated-http-core.ts';
import { BffError } from '../../lib/server/core.ts';

const origin = 'https://velarion.example';
const sensitive = 'PRIVATE_SENTINEL token cookie password SQL postgres://secret@example.test';
const request = (extra = {}) => new Request(`${origin}/api/auth/begin`, {
  method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', ...extra },
});
function setup({ limitError, runtimeError, vaultError } = {}) {
  const calls = [];
  const http = createIntegratedHttp({
    origin: () => origin,
    rateLimit: async scope => { calls.push(scope); if (limitError) throw limitError; },
    runtime: () => {
      calls.push('runtime');
      if (runtimeError) throw runtimeError;
      return { begin: async () => { calls.push('vault'); if (vaultError) throw vaultError; return 'a'.repeat(64); } };
    },
  });
  return { http, calls };
}
const configCodes = [
  'BFF_CONFIG_UNAVAILABLE', 'BFF_CONFIG_INVALID', 'STAGING_RELEASE_NOT_CONFIGURED',
  'AUTH_CONFIG_UNAVAILABLE', 'AUTH_CONFIG_INVALID', 'ADMISSION_VAULT_CONFIG_INVALID',
  'DATABASE_CONFIG_CHANGED',
];
for (const code of configCodes) {
  test(`begin logs only CONFIG_VALIDATION for ${code}`, async t => {
    const log = t.mock.method(console, 'error', () => {});
    const { http, calls } = setup({ limitError: new BffError(code, 503, sensitive) });
    const response = await http.begin(request({ Cookie: `irrelevant=${sensitive}` }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal((await response.json()).error, code);
    assert.deepEqual(calls, ['begin']);
    assert.deepEqual(log.mock.calls.map(c => c.arguments), [['[velarion.auth.begin] CONFIG_VALIDATION']]);
  });
}
for (const [options, category, expectedCalls, publicCode] of [
  [{ limitError: new Error(sensitive) }, 'RATE_LIMIT_STORAGE', ['begin'], 'STAGING_AUTH_UNAVAILABLE'],
  [{ limitError: new BffError('ADMISSION_DATABASE_UNAVAILABLE', 503, sensitive) }, 'RATE_LIMIT_STORAGE', ['begin'], 'ADMISSION_DATABASE_UNAVAILABLE'],
  [{ runtimeError: new BffError('AUTH_CONFIG_INVALID', 503, sensitive) }, 'CONFIG_VALIDATION', ['begin', 'runtime'], 'AUTH_CONFIG_INVALID'],
  [{ runtimeError: new Error(sensitive) }, 'SESSION_VAULT', ['begin', 'runtime'], 'STAGING_AUTH_UNAVAILABLE'],
  [{ vaultError: new Error(sensitive) }, 'SESSION_VAULT', ['begin', 'runtime', 'vault'], 'STAGING_AUTH_UNAVAILABLE'],
  [{ vaultError: new BffError('ADMISSION_VAULT_UNAVAILABLE', 503, sensitive) }, 'SESSION_VAULT', ['begin', 'runtime', 'vault'], 'ADMISSION_VAULT_UNAVAILABLE'],
]) {
  test(`begin categorizes ${publicCode} at ${category} without exception details`, async t => {
    const log = t.mock.method(console, 'error', () => {});
    const { http, calls } = setup(options);
    const response = await http.begin(request());
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0');
    const body = await response.json();
    assert.equal(body.error, publicCode);
    assert.equal(body.bffAuthorized, false);
    assert.equal(body.tradingEnabled, false);
    assert.equal(JSON.stringify(body).includes(sensitive), false);
    assert.deepEqual(calls, expectedCalls);
    assert.deepEqual(log.mock.calls.map(c => c.arguments), [[`[velarion.auth.begin] ${category}`]]);
  });
}
test('begin still rejects origin, nonempty body and exhausted limiter without diagnostics or admission', async t => {
  const log = t.mock.method(console, 'error', () => {});
  const { http, calls } = setup();
  assert.equal((await http.begin(request({ Origin: 'https://attacker.test' }))).status, 403);
  const nonempty = new Request(`${origin}/api/auth/begin`, { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, body: JSON.stringify({ token: sensitive }) });
  assert.equal((await http.begin(nonempty)).status, 400);
  assert.deepEqual(calls, []);
  const limited = setup({ limitError: new BffError('AUTH_RATE_LIMITED', 429, sensitive) });
  const response = await limited.http.begin(request());
  assert.equal(response.status, 429);
  assert.equal((await response.json()).error, 'AUTH_RATE_LIMITED');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.deepEqual(limited.calls, ['begin']);
  assert.equal(log.mock.callCount(), 0);
});
test('successful begin remains silent and issues the existing secure cookie', async t => {
  const log = t.mock.method(console, 'error', () => {});
  const { http } = setup();
  const response = await http.begin(request());
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
  assert.match(response.headers.get('set-cookie'), /Secure/i);
  assert.equal((await response.text()).includes('a'.repeat(64)), false);
  assert.equal(log.mock.callCount(), 0);
});
