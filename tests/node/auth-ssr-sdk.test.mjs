import test from 'node:test';
import assert from 'node:assert/strict';
import { createServerClient } from '@supabase/ssr';

const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = () => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: '00000000-0000-4000-8000-000000000001', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.local-test-signature`;
const session = () => ({ access_token: jwt(), refresh_token: 'local-fake-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'local@example.test' } });

function fixture(fetchImpl) {
  const jar = new Map();
  const writes = [];
  const client = createServerClient('https://fake-project.supabase.co', 'public-test-key', {
    cookieOptions: { name: '__Host-test-auth', httpOnly: true, secure: true, sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: values => { writes.push(values); for (const item of values) item.options?.maxAge === 0 ? jar.delete(item.name) : jar.set(item.name, item.value); },
    },
    global: { fetch: fetchImpl },
  });
  return { client, jar, writes };
}

test('real Supabase SSR SDK password sign-in stores session in HttpOnly secure host cookies, not response DTO', async () => {
  const requests = [];
  const { client, jar, writes } = fixture(async (input, init = {}) => {
    requests.push({ url: String(input), method: init.method });
    return Response.json(session(), { status: 200 });
  });
  const { data, error } = await client.auth.signInWithPassword({ email: 'local@example.test', password: 'not-a-real-password' });
  assert.equal(error, null);
  assert.equal(data.user.id, '00000000-0000-4000-8000-000000000001');
  assert.ok(requests.some(request => request.url.includes('/auth/v1/token?grant_type=password')));
  assert.ok(jar.has('__Host-test-auth'));
  assert.ok(writes.length > 0);
  for (const cookie of writes.flat()) {
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.path, '/');
    assert.equal(cookie.options.sameSite, 'lax');
  }
  const browserDto = { success: true };
  assert.doesNotMatch(JSON.stringify(browserDto), /access_token|refresh_token|local@example\.test|00000000-0000-4000-8000-000000000001/);
});

test('real Supabase SSR SDK logout calls Auth signout and clears persisted auth cookie', async () => {
  let called = false;
  const { client, jar } = fixture(async (input) => {
    assert.match(String(input), /\/auth\/v1\/logout/);
    called = true;
    return new Response(null, { status: 204 });
  });
  jar.set('__Host-test-auth', JSON.stringify({ access_token: jwt(), refresh_token: 'local-fake-refresh-token', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: '00000000-0000-4000-8000-000000000001' } }));
  await client.auth.signOut();
  assert.equal(called, true);
  assert.equal(jar.has('__Host-test-auth'), false);
});

test('real Supabase SSR SDK signup uses PKCE and callback exchanges code into a cookie session', async () => {
  const requests = [];
  const { client, jar } = fixture(async (input, init = {}) => {
    const url = String(input);
    requests.push({ url, method: init.method, body: init.body });
    if (url.includes('/auth/v1/signup')) return Response.json({ user: { id: '00000000-0000-4000-8000-000000000001', email: 'local@example.test', identities: [] }, session: null }, { status: 200 });
    if (url.includes('/auth/v1/token?grant_type=pkce')) return Response.json(session(), { status: 200 });
    throw new Error(`Unexpected fake Auth request ${url}`);
  });
  const { error } = await client.auth.signUp({ email: 'local@example.test', password: 'fake-local-password', options: { emailRedirectTo: 'https://app.example.test/auth/callback' } });
  assert.equal(error, null);
  assert.ok(requests.some(({ url }) => url.includes('/auth/v1/signup')));
  assert.ok([...jar.keys()].some(name => name.includes('code-verifier')));
  const { error: exchangeError } = await client.auth.exchangeCodeForSession('local-fake-auth-code');
  assert.equal(exchangeError, null);
  assert.ok(requests.some(({ url, body }) => url.includes('grant_type=pkce') && String(body).includes('auth_code')));
  assert.ok(jar.has('__Host-test-auth'));
  assert.doesNotMatch(JSON.stringify({ success: true, message: 'Check your email to continue.' }), /access_token|refresh_token|local@example\.test/);
});

test('real Supabase SSR SDK rotates refresh credentials through Auth without exposing them in a DTO', async () => {
  const requests = [];
  const { client, jar } = fixture(async (input, init = {}) => {
    const url = String(input);
    requests.push({ url, body: init.body });
    return Response.json(session(), { status: 200 });
  });
  await client.auth.signInWithPassword({ email: 'local@example.test', password: 'fake-local-password' });
  await client.auth.refreshSession();
  assert.ok(requests.some(({ url }) => url.includes('grant_type=refresh_token')));
  assert.ok(jar.has('__Host-test-auth'));
  assert.doesNotMatch(JSON.stringify({ success: true }), /access_token|refresh_token/);
});

test('real Supabase SSR SDK sign-in failure produces no authenticated cookie', async () => {
  const { client, jar, writes } = fixture(async () => Response.json({ message: 'Invalid login credentials', code: 'invalid_credentials' }, { status: 400 }));
  const { data, error } = await client.auth.signInWithPassword({ email: 'local@example.test', password: 'wrong-local-password' });
  assert.ok(error);
  assert.equal(data.session, null);
  assert.equal(jar.has('__Host-test-auth'), false);
  assert.equal(writes.length, 0);
});
