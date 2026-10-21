import test from 'node:test';
import assert from 'node:assert/strict';
import { requireEmptyMutationBody } from '../../lib/server/mutation-body.ts';

const request = (body, type = 'application/json', url = 'https://velarion-one.vercel.app/api/auth/provision') =>
  new Request(url, {method:'POST', headers: {'Content-Type':type}, ...(body === undefined ? {} : {body})});
test('identity mutations accept only empty body or empty JSON, never caller identity or scope', async () => {
  await requireEmptyMutationBody(request());
  await requireEmptyMutationBody(request('{}'));
  for (const body of [JSON.stringify({subject:'forged'}), JSON.stringify({issuer:'https://attacker.example'}), JSON.stringify({email:'same@example.com'}), JSON.stringify({learnerId:'other'}), JSON.stringify({scope:'account'}), '[]', 'null', 'true']) {
    await assert.rejects(requireEmptyMutationBody(request(body)), error => error.code === 'UNEXPECTED_MUTATION_INPUT');
  }
});
test('identity mutations reject malformed, non-JSON and query-string inputs', async () => {
  await assert.rejects(requireEmptyMutationBody(request('{')), error => error.code === 'INVALID_JSON');
  await assert.rejects(requireEmptyMutationBody(request('{}', 'text/plain')), error => error.code === 'JSON_REQUIRED');
  await assert.rejects(requireEmptyMutationBody(request(undefined, 'application/json', 'https://velarion-one.vercel.app/api/auth/provision?subject=forged')), error => error.code === 'UNEXPECTED_MUTATION_INPUT');
});
test('identity mutations enforce the actual streamed byte limit without trusting content-length', async () => {
  await assert.rejects(requireEmptyMutationBody(request(' '.repeat(4097))), error => error.code === 'BODY_TOO_LARGE');
  const stream = new ReadableStream({start(controller) {controller.enqueue(new TextEncoder().encode(' '.repeat(2048)));controller.enqueue(new TextEncoder().encode(' '.repeat(2049)));controller.close();}});
  const req = new Request('https://velarion-one.vercel.app/api/auth/provision', {method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'});
  await assert.rejects(requireEmptyMutationBody(req), error => error.code === 'BODY_TOO_LARGE');
});

test('identity mutation parsing times out a stalled stream without service execution', async () => {
  const stream = new ReadableStream({start() {}});
  const req = new Request('https://velarion-one.vercel.app/api/auth/provision', {method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'});
  await assert.rejects(requireEmptyMutationBody(req, 10), error => error.code === 'BODY_TIMEOUT');
});

const configuredBase = process.env.VELARION_TEST_CONFIGURED_BASE_URL;
const configuredTest = (name, fn) => test(name, {skip: configuredBase ? false : 'requires explicit VELARION_TEST_CONFIGURED_BASE_URL local HTTP fixture endpoint'}, fn);
const origin = 'https://velarion-one.vercel.app';
configuredTest('HTTP origin-only fixture: all identity mutations reject cross-site requests', async () => {
  for (const path of ['provision','revoke-all','logout']) {
    const response = await fetch(`${configuredBase}/api/auth/${path}`, {method:'POST',headers:{Origin:'https://attacker.example'}});
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal((await response.json()).success, false);
  }
});
configuredTest('HTTP origin-only fixture: browser identity is rejected before cookie/SQL verification', async () => {
  for (const path of ['provision','revoke-all']) {
    const response = await fetch(`${configuredBase}/api/auth/${path}`, {method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:'__Host-velarion_access=forged'},body:JSON.stringify({subject:'other',email:'same@example.com',learnerId:'other'})});
    assert.equal(response.status, path === 'provision' ? 403 : 400);
    assert.equal((await response.json()).error, path === 'provision' ? 'PROVISIONING_NOT_APPROVED' : 'UNEXPECTED_MUTATION_INPUT');
    assert.equal(response.headers.get('set-cookie'), null);
  }
});
configuredTest('HTTP origin-only fixture: missing credentials fail closed; local cookie clearing never claims revocation', async () => {
  for (const path of ['provision','revoke-all','logout']) {
    const response = await fetch(`${configuredBase}/api/auth/${path}`, {method:'POST',headers:{Origin:origin,Cookie:'__Host-velarion_access=forged'}});
    assert.equal(response.status, path === 'provision' ? 403 : 503);
    const body = await response.json();
    assert.equal(body.success, false);
    if (path === 'provision') {
      assert.equal('dbRevoked' in body, false);
      assert.equal(body.error, 'PROVISIONING_NOT_APPROVED');
      assert.equal(response.headers.get('set-cookie'), null);
    } else {
      assert.equal(body.dbRevoked, false); assert.equal(body.providerSignOut, false);
      assert.equal(body.browserCleared, true);
      const cookie = response.headers.get('set-cookie');
      assert.match(cookie, /Max-Age=0/); assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=lax/i);
    }
  }
});
