import test from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.VELARION_TEST_BASE_URL;
const configured = process.env.VELARION_TEST_CONFIGURED_BASE_URL;
const origin = 'https://velarion-one.vercel.app';
const http = (name, fn) => test(name, { skip: !base || !configured ? 'requires explicit VELARION_TEST_BASE_URL and VELARION_TEST_CONFIGURED_BASE_URL local HTTP fixture endpoints' : false }, fn);
http('HTTP Auth endpoints reject origin and browser identity; missing configuration never issues a session', async () => {
  for (const path of ['login', 'signup']) {
    const input = { email: 'local@example.test', password: 'synthetic-password' };
    const denied = await fetch(`${configured}/api/auth/${path}`, { method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    assert.equal(denied.status, 403); assert.equal(denied.headers.get('set-cookie'), null);
    const forged = await fetch(`${configured}/api/auth/${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, subject: 'forged', role: 'admin' }) });
    assert.equal(forged.status, 400); assert.equal(forged.headers.get('set-cookie'), null);
    const missing = await fetch(`${configured}/api/auth/${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    assert.equal(missing.status, 401); assert.match(missing.headers.get('cache-control'), /no-store/);
    assert.equal(missing.headers.get('set-cookie'), null);
    const dto = await missing.json();
    assert.equal(dto.error, 'FRESH_LOGIN_REQUIRED'); assert.equal(dto.bffAuthorized, false); assert.equal(dto.tradingEnabled, false);
    assert.doesNotMatch(JSON.stringify(dto), /access_token|refresh_token|local@example/);
  }
});
http('HTTP Auth streamed parsing rejects oversized, malformed and non-JSON credentials before provider work', async () => {
  for (const [body, type, status] of [[' '.repeat(4097), 'application/json', 413], ['{', 'application/json', 400], ['{}', 'text/plain', 415]]) {
    const response = await fetch(`${configured}/api/auth/login`, { method: 'POST', headers: { Origin: origin, 'Content-Type': type }, body });
    assert.equal(response.status, status); assert.equal(response.headers.get('set-cookie'), null); assert.match(response.headers.get('cache-control'), /no-store/);
  }
});
http('HTTP callback uses configured redirect authority and rejects open redirects, duplicate codes and missing config', async () => {
  const unconfigured = await fetch(`${base}/auth/callback?code=fake`, { redirect: 'manual' });
  assert.equal(unconfigured.status, 503); assert.equal(unconfigured.headers.get('location'), null);
  for (const query of ['', '?code=a&code=b', '?code=a&next=https://attacker.example', '?code=local-fake']) {
    const response = await fetch(`${configured}/auth/callback${query}`, { redirect: 'manual', headers: { 'X-Forwarded-Host': 'attacker.example' } });
    assert.equal(response.status, 303); assert.equal(response.headers.get('location'), `${origin}/login?error=auth`);
    assert.match(response.headers.get('cache-control'), /no-store/); assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  }
});
http('HTTP SSR completion never confuses provider storage with BFF authority and is not cacheable', async () => {
  const storage = Buffer.from(JSON.stringify({ access_token: 'forged', refresh_token: 'synthetic-refresh' })).toString('base64url');
  for (const headers of [{}, { Cookie: `__Host-velarion-auth=base64-${storage}; velarion_admin_token=forged` }]) {
    const response = await fetch(`${base}/auth/complete`, { headers });
    assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /no-store/);
    const html = await response.text();
    assert.match(html, /Sign in is not yet available/); assert.match(html, /Protected lessons and assessments remain server-disabled/);
    assert.doesNotMatch(html, /Session verified|synthetic-refresh|access_token|refresh_token/);
  }
});
