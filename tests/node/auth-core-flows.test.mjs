import test from 'node:test';
import assert from 'node:assert/strict';
import { NextResponse } from 'next/server';
import { createRequestAuth, AUTH_COOKIE, STAGING_URL } from '../../lib/server/auth-client-core.ts';
import { createAuthFlows, finishAuth } from '../../lib/server/auth-flow-core.ts';
import { createLogoutFlow } from '../../lib/server/auth-logout-core.ts';
const origin = 'https://app.example.test';
const env = { VELARION_SUPABASE_URL: STAGING_URL, VELARION_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test', VELARION_APP_ORIGIN: origin };
const id = '00000000-0000-4000-8000-000000000001';
const b64 = x => Buffer.from(JSON.stringify(x)).toString('base64url');
const fakeJwt = () => `${b64({ alg: 'none' })}.${b64({ sub: id, role: 'authenticated', exp: 4102444800 })}.local-only`;
function fixture(fetcher = async () => new Response('{}', { status: 500 })) {
  const jar = new Map(); const writes = []; const calls = [];
  const port = { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => { writes.push(values); for (const c of values) c.options?.maxAge === 0 ? jar.delete(c.name) : jar.set(c.name, c.value); } };
  const auth = createRequestAuth(port, env, async (input, init) => { calls.push({ url: String(input), init }); return fetcher(input, init); });
  return { auth, jar, writes, calls, port };
}
const request = (path, body, headers = {}) => new Request(`https://untrusted.example${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });

test('auth config is staging-pinned and only accepts publishable key and canonical HTTPS origin', () => {
  for (const bad of [{}, { ...env, VELARION_SUPABASE_URL: 'https://attacker.example' }, { ...env, VELARION_SUPABASE_PUBLISHABLE_KEY: 'service_role_secret' }, { ...env, VELARION_APP_ORIGIN: 'https://app.example.test/' }, { ...env, VELARION_APP_ORIGIN: 'http://app.example.test' }]) assert.throws(() => createRequestAuth({ getAll: () => [], setAll() {} }, bad), e => e.code?.startsWith('AUTH_CONFIG'));
});
test('real SDK adapter filters unrelated cookies, hardens domainless cookie options and enforces fetch deadline/no-store', async () => {
  const f = fixture(async () => Response.json({ user: { id }, session: null }));
  f.jar.set('unrelated', 'secret'); f.jar.set('__Host-velarion-access', 'legacy');
  await f.auth.client.auth.signUp({ email: 'a@example.test', password: 'fake-password', options: { emailRedirectTo: `${origin}/auth/callback` } });
  assert.equal(f.calls.length, 1); assert.match(f.calls[0].url, new RegExp(STAGING_URL.replaceAll('.', '\\.')));
  assert.equal(f.calls[0].init.cache, 'no-store'); assert.ok(f.calls[0].init.signal instanceof AbortSignal);
  assert.equal(f.auth.config.origin, origin);
  for (const c of f.writes.flat()) { assert.equal(c.options.httpOnly, true); assert.equal(c.options.secure, true); assert.equal(c.options.sameSite, 'lax'); assert.equal(c.options.path, '/'); assert.equal(c.options.domain, undefined); }
  assert.equal(f.jar.has('unrelated'), true); assert.equal(f.jar.has('__Host-velarion-access'), true);
  assert.ok(f.auth.pending().some(c => c.name.includes('-code-verifier')));
});
test('adapter safely chunks cookies and clear purges all owned chunks and verifier only', () => {
  const f = fixture();
  f.jar.set(`${AUTH_COOKIE}.0`, 'chunk-a'); f.jar.set(`${AUTH_COOKIE}.1`, 'chunk-b'); f.jar.set(`${AUTH_COOKIE}-code-verifier.0`, 'verifier'); f.jar.set('unrelated', 'keep');
  f.auth.clear();
  assert.equal(f.jar.has('unrelated'), true); assert.equal(f.jar.has(`${AUTH_COOKIE}.0`), false); assert.equal(f.jar.has(`${AUTH_COOKIE}.1`), false); assert.equal(f.jar.has(`${AUTH_COOKIE}-code-verifier.0`), false);
  assert.ok(f.auth.pending().every(c => c.options.maxAge === 0 && c.options.httpOnly && c.options.secure && !c.options.domain));
});
test('login verifies provider session and returns only locked DTO with secure SDK cookie synchronization', async () => {
  const f = fixture(async () => Response.json({ access_token: fakeJwt(), refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, user: { id, email: 'a@example.test' } }));
  const flows = createAuthFlows({ create: async () => f.auth, verifyProvider: async token => { assert.equal(token, fakeJwt()); }, origin: () => origin });
  const response = await flows.login(request('/api/auth/login', { email: 'a@example.test', password: 'fake-password' }));
  assert.equal(response.status, 200); const body = await response.json(); assert.equal(body.providerAuthenticated, true); assert.equal(body.bffAuthorized, false); assert.equal(body.connected, false);
  assert.doesNotMatch(JSON.stringify(body), /access_token|refresh_token|synthetic-refresh|a@example/);
  assert.match(response.headers.get('cache-control'), /no-store/); assert.ok(response.headers.getSetCookie().some(c => c.startsWith(`${AUTH_COOKIE}=`) && /HttpOnly/.test(c) && /Secure/.test(c) && !/Domain=/i.test(c)));
});
test('login fails closed and clears provider cookie if confirmation fails; signup never enrolls or authenticates', async () => {
  const f = fixture(async () => Response.json({ access_token: fakeJwt(), refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user: { id } })); let verifyCalls = 0;
  const flows = createAuthFlows({ create: async () => f.auth, verifyProvider: async () => { verifyCalls++; throw new Error('local verifier rejection'); }, origin: () => origin });
  const failed = await flows.login(request('/login', { email: 'a@example.test', password: 'fake-password' })); assert.equal(failed.status, 503); assert.ok(failed.headers.getSetCookie().some(c => c.startsWith(`${AUTH_COOKIE}=`) && /Max-Age=0/.test(c))); assert.equal(verifyCalls, 1);
  let signupCalls = 0; const signupClient = { auth: { signUp: async input => { signupCalls++; assert.equal(input.options.emailRedirectTo, `${origin}/auth/callback`); return { data: { user: { identities: [{ id: 'x' }] }, session: null }, error: null }; } } };
  const noEnroll = createAuthFlows({ create: async () => ({ client: signupClient, config: { origin }, pending: () => [{ name: `${AUTH_COOKIE}-code-verifier`, value: 'local-verifier', options: { httpOnly: true, secure: true, path: '/' } }], headers: () => new Headers(), clear() {} }), verifyProvider: async () => { throw new Error('must not verify'); }, origin: () => origin });
  const signed = await noEnroll.signup(request('/signup', { email: 'a@example.test', password: 'fake-password' })); const dto = await signed.json(); assert.equal(signupCalls, 1); assert.equal(dto.success, true); assert.equal(dto.providerAuthenticated, false); assert.equal(dto.bffAuthorized, false); assert.doesNotMatch(JSON.stringify(dto), /access_token|refresh_token|identities|a@example\.test/);
});
test('strict credentials input, origin and callback code multiplicity/allowlist reject before SDK work', async () => {
  let created = 0; const flows = createAuthFlows({ create: async () => { created++; throw new Error('unexpected'); }, verifyProvider: async () => {}, origin: () => origin });
  for (const req of [request('/x', { email: 'a@example.test', password: '1234567890', subject: id }), request('/x', '{'), request('/x', { email: 'a@example.test', password: '1234567890' }, { Origin: 'https://evil.example' })]) { const r = await flows.login(req); assert.ok([400, 403].includes(r.status)); }
  for (const url of [`${origin}/auth/callback`, `${origin}/auth/callback?code=a&code=b`, `${origin}/auth/callback?code=a&next=https://evil.example`]) { const r = await flows.callback(new Request(url)); assert.equal(r.status, 303); assert.equal(r.headers.get('location'), `${origin}/login?error=auth`); }
  assert.equal(created, 0);
});
test('callback redirect is pinned to configured origin regardless of Host, forwarded host, and next', async () => {
  const f = fixture(); f.auth.client.auth.exchangeCodeForSession = async code => { assert.equal(code, 'local-code'); return { data: { session: { access_token: fakeJwt() } }, error: null }; };
  const flows = createAuthFlows({ create: async () => f.auth, verifyProvider: async token => assert.equal(token, fakeJwt()), origin: () => origin });
  const r = await flows.callback(new Request('https://attacker.example/auth/callback?code=local-code', { headers: { Host: 'attacker.example', 'X-Forwarded-Host': 'evil.example' } }));
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), `${origin}/auth/complete`); assert.match(r.headers.get('cache-control'), /no-store/);
});
test('logout independently records BFF revoke and provider local signout failures, always clears on configured attempt', async () => {
  const f = fixture(); let revokeCalls = 0;
  f.auth.client.auth.getSession = async () => ({ data: { session: { access_token: 'local-synthetic-token' } }, error: null });
  f.auth.client.auth.signOut = async () => ({ error: new Error('provider unavailable') }); f.jar.set(AUTH_COOKIE, 'local-session');
  const logout = createLogoutFlow({ create: async () => f.auth, origin: () => origin, revoke: async token => { revokeCalls++; assert.equal(token, 'local-synthetic-token'); throw new Error('BFF unavailable'); } });
  const r = await logout(request('/logout')); const b = await r.json(); assert.equal(r.status, 503); assert.equal(revokeCalls, 1); assert.equal(b.revoked, false); assert.equal(b.providerLocalSignOut, false); assert.equal(b.providerSessionsRevoked, false); assert.equal(b.browserCleared, true); assert.equal(f.jar.has(AUTH_COOKIE), false); assert.match(r.headers.getSetCookie().join(';'), /Max-Age=0/);
});
test('logout with absent config clears incoming auth chunks, origin denial does not clear', async () => {
  const missing = createLogoutFlow({ create: async () => { throw Object.assign(new Error(), { code: 'AUTH_CONFIG_UNAVAILABLE', status: 503 }); }, origin: () => origin, revoke: async () => ({}) });
  const r = await missing(new Request(`${origin}/logout`, { method: 'POST', headers: { Origin: origin, Cookie: `${AUTH_COOKIE}.0=a; ${AUTH_COOKIE}-code-verifier=b` } }));
  assert.equal(r.status, 503); assert.equal((await r.json()).browserCleared, true); assert.ok(r.headers.getSetCookie().some(c => c.startsWith(`${AUTH_COOKIE}.0=`) && /Max-Age=0/.test(c)));
  const denied = await missing(new Request(`${origin}/logout`, { method: 'POST', headers: { Origin: 'https://evil.example', Cookie: `${AUTH_COOKIE}=a` } })); assert.equal(denied.status, 403); assert.equal(denied.headers.getSetCookie().length, 0);
});
test('refresh rotation pending cookies and anti-cache headers synchronize onto NextResponse via finishAuth', async () => {
  let refreshes = 0; const refreshed = { access_token: fakeJwt(), refresh_token: 'rotated-refresh', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, user: { id } };
  const f = fixture(async input => {
    if (String(input).includes('grant_type=refresh_token')) { refreshes++; return Response.json(refreshed); }
    assert.match(String(input), /\/auth\/v1\/user/); return Response.json({ id });
  });
  f.jar.set(AUTH_COOKIE, `base64-${Buffer.from(JSON.stringify({ access_token: fakeJwt(), refresh_token: 'old-synthetic-refresh', token_type: 'bearer', expires_at: 1, user: { id } })).toString('base64url')}`);
  await f.auth.client.auth.getClaims(); assert.equal(refreshes, 1);
  const response = finishAuth(NextResponse.json({ success: true }), f.auth);
  assert.match(response.headers.get('cache-control'), /no-store/); assert.match(response.headers.get('vary'), /Cookie/); assert.ok(response.headers.getSetCookie().length > 0);
  assert.ok(response.headers.getSetCookie().every(c => /HttpOnly/.test(c) && /Secure/.test(c) && !/Domain=/i.test(c))); assert.doesNotMatch(await response.text(), /access_token|refresh_token|rotated-refresh/);
});

// These exercise the implementation's framework/SDK seam, not a stand-alone substitute adapter.
import { NextRequest } from 'next/server';
import { proxy } from '../../proxy.ts';
import { accessTokenCandidate } from '../../lib/server/auth-cookie-token.ts';
import { readCredentials } from '../../lib/server/auth-body.ts';
test('actual Next Proxy never refreshes, mutates provider cookies or creates app sessions', async () => {
  const saved = Object.fromEntries(Object.keys(env).map(k => [k, process.env[k]]));
  const oldFetch = globalThis.fetch;
  let refreshes = 0;
  try {
    Object.assign(process.env, env);
    globalThis.fetch = async input => {
      const url = String(input);
      assert.ok(url.startsWith(STAGING_URL), 'No live provider access permitted');
      if (url.includes('grant_type=refresh_token')) {
        refreshes++;
        return Response.json({ access_token: fakeJwt(), refresh_token: 'rotated-local-refresh', token_type: 'bearer', expires_in: 3600, user: { id } });
      }
      if (url.endsWith('/auth/v1/user')) return Response.json({ id });
      throw new Error('Unexpected mock URL');
    };
    const stale = `base64-${Buffer.from(JSON.stringify({ access_token: fakeJwt(), refresh_token: 'old-local-refresh', expires_at: 1, user: { id } })).toString('base64url')}`;
    const req = new NextRequest(`${origin}/auth/complete`, { headers: { Cookie: `${AUTH_COOKIE}=${stale}` } });
    const response = await proxy(req);
    assert.equal(refreshes, 0);
    assert.equal(await accessTokenCandidate(req.cookies.getAll()), fakeJwt());
    assert.equal(response.headers.get('x-middleware-request-cookie'), null);
    assert.deepEqual(response.headers.getSetCookie(), []);
    assert.match(response.headers.get('cache-control'), /no-store/);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : process.env[k] = v;
  }
});
test('actual signup and PKCE callback route core persist session cookies and consume verifier on fixed redirect', async () => {
  let exchanges = 0;
  const f = fixture(async (input, init) => {
    const url = String(input);
    if (url.includes('/auth/v1/signup')) return Response.json({ user: { id }, session: null });
    if (url.includes('grant_type=pkce')) {
      exchanges++;
      const body = JSON.parse(String(init.body));
      assert.ok(body.code_verifier); assert.equal(body.auth_code, 'synthetic-code');
      return Response.json({ access_token: fakeJwt(), refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user: { id } });
    }
    throw new Error('Unexpected mock call');
  });
  const flows = createAuthFlows({ create: async () => f.auth, verifyProvider: async t => assert.equal(t, fakeJwt()), origin: () => origin });
  const signup = await flows.signup(request('/api/auth/signup', { email: 'a@example.test', password: 'synthetic-password' }));
  assert.equal(signup.status, 200); assert.ok(f.jar.has(`${AUTH_COOKIE}-code-verifier`));
  const callback = await flows.callback(new Request(`${origin}/auth/callback?code=synthetic-code`));
  assert.equal(callback.status, 303); assert.equal(exchanges, 1);
  assert.equal(callback.headers.get('location'), `${origin}/auth/complete`);
  assert.ok(callback.headers.getSetCookie().some(c => c.startsWith(`${AUTH_COOKIE}=`) && /HttpOnly/.test(c)));
  assert.equal(f.jar.has(`${AUTH_COOKIE}-code-verifier`), false);
  assert.equal(await accessTokenCandidate([...f.jar].map(([name, value]) => ({ name, value }))), fakeJwt());
  assert.doesNotMatch(await callback.text(), /access_token|refresh_token|synthetic-refresh/);
});
test('credential reader enforces streamed byte cap, absolute deadline, JSON and exact fields', async () => {
  assert.deepEqual(await readCredentials(request('/x', { email: 'a@example.test', password: 'synthetic-password' }), true), { email: 'a@example.test', password: 'synthetic-password' });
  await assert.rejects(readCredentials(request('/x', ' '.repeat(4097)), false), e => e.code === 'BODY_TOO_LARGE');
  await assert.rejects(readCredentials(request('/x', { email: 'a@example.test', password: 'x', subject: id }), false), e => e.code === 'CREDENTIALS_INVALID');
  await assert.rejects(readCredentials(request('/x?issuer=forged', { email: 'a@example.test', password: 'x' }), false), e => e.code === 'UNEXPECTED_MUTATION_INPUT');
  await assert.rejects(readCredentials(request('/x', '{}', { 'Content-Type': 'text/plain' }), false), e => e.code === 'JSON_REQUIRED');
  const body = new ReadableStream({ start() {} });
  await assert.rejects(readCredentials(new Request(`${origin}/x`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, duplex: 'half' }), false, 10), e => e.code === 'BODY_TIMEOUT');
});
test('logout success and partial failure never conflate current provider scope with all-provider revocation', async () => {
  for (const bffOk of [true, false]) for (const providerOk of [true, false]) {
    const f = fixture();
    f.auth.client.auth.getSession = async () => ({ data: { session: { access_token: 'local-token' } }, error: null });
    f.auth.client.auth.signOut = async options => { assert.deepEqual(options, { scope: 'local' }); return { error: providerOk ? null : new Error() }; };
    const logout = createLogoutFlow({ create: async () => f.auth, origin: () => origin, revoke: async () => { if (!bffOk) throw new Error(); return { scope: 'current', revoked: true, revokedAt: '2026-10-21T00:00:00Z' }; } });
    const response = await logout(request('/logout', {}));
    const dto = await response.json();
    assert.equal(response.status, bffOk && providerOk ? 200 : 503);
    assert.equal(dto.success, bffOk && providerOk); assert.equal(dto.revoked, bffOk);
    assert.equal(dto.providerLocalSignOut, providerOk); assert.equal(dto.providerSessionsRevoked, false);
    assert.equal(dto.browserCleared, true); assert.equal(dto.tradingEnabled, false);
  }
});
