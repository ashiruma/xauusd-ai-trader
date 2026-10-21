import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { RELEASE_POLICY, RELEASE_GATES } from '../../lib/release-policy.ts';
import { parseCourseProgress, saveCourseProgress } from '../../lib/courseProgress.ts';
const root = new URL('../../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('preparation policy cannot enable delivery, automation or trading', () => {
  assert.equal(RELEASE_POLICY.connected, false);
  for (const key of ['courseDeliveryEnabled', 'automationEligible', 'tradingEnabled']) assert.equal(RELEASE_POLICY[key], false);
  assert.equal(RELEASE_POLICY.coreTotal, 30);
  assert.ok(Object.isFrozen(RELEASE_POLICY));
  assert.deepEqual(RELEASE_GATES.map(g => g[0]), ['justmarkets_eligibility', 'school_all_30', 'broker_ownership', 'automation_consent', 'worker_acknowledgement']);
});
test('legacy localStorage completions and writes confer no progress', () => {
  assert.deepEqual(parseCourseProgress(JSON.stringify(Array.from({length: 30}, (_, i) => i + 1))), []);
  assert.deepEqual(saveCourseProgress(Array.from({length: 30}, (_, i) => i + 1)), []);
});
test('only summary fields may enter curriculum client imports and public asset', async () => {
  const projection = JSON.parse(await read('lib/curriculum-summary.json'));
  assert.equal(projection.lessons.length, 30);
  const allowed = new Set(['id', 'level', 'levelTitle', 'lessonNum', 'globalNum', 'title', 'summary']);
  for (const lesson of projection.lessons) for (const key of Object.keys(lesson)) assert.ok(allowed.has(key), key);
  assert.match(await read('lib/curriculum.ts'), /curriculum-summary\.json/);
  assert.doesNotMatch(await read('public/forex_curriculum.js'), /correct:|"correct"|explanation:|"content"/);
  const page = await read('app/academy/[lessonSlug]/page.tsx');
  assert.doesNotMatch(page, /LessonQuiz|quizData|lesson\.content|dangerouslySetInnerHTML/);
  assert.match(page, /DELIVERY DISABLED/);
});
const custom = new Set(['auth/login', 'auth/signup', 'auth/session', 'auth/logout', 'auth/provision', 'auth/revoke-all', 'auth/begin', 'auth/recover', 'auth/refresh', 'onboarding/status', 'school/progress', 'access/status', 'newsletter']);
async function routes(dir = 'app/api') {
  const found = [];
  for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) found.push(...await routes(path));
    else if (entry.name === 'route.ts') found.push(path);
  }
  return found;
}
test('all legacy API handlers deny at handler level without middleware or admin bypass', async () => {
  for (const file of await routes()) {
    const path = file.replace('app/api/', '').replace('/route.ts', '');
    if (custom.has(path)) continue;
    const body = await read(file);
    assert.match(body, /denyLegacyOperation/, file);
    assert.doesNotMatch(body, /fetch\(|request\.json|cookies\(|writeFile|signSession/, file);
  }
  assert.doesNotMatch(await read('next.config.mjs'), /destination:/);
  const proxy = await read('proxy.ts');
  assert.doesNotMatch(proxy, /ADMIN_MASTER_SECRET|x-forwarded-for/);
  assert.doesNotMatch(proxy, /createRequestAuth|getClaims|setSession|signIn|refreshSession/);
  assert.doesNotMatch(proxy, /cookies\.set|Set-Cookie/);
  assert.match(await read('lib/server/auth-client-core.ts'), /httpOnly:\s*true,\s*secure:\s*true/);
  assert.match(await read('lib/auth.ts'), /return null/);
  assert.doesNotMatch(await read('lib/auth.ts'), /crypto|LEGACY_FALLBACK_SECRET/);
});

const base = process.env.VELARION_TEST_BASE_URL;
const live = (name, fn) => test(name, {skip: base ? false : 'requires explicit VELARION_TEST_BASE_URL candidate HTTP server; not run against live/deployed services'}, fn);
const forged = {Cookie: 'velarion_admin_token=arbitrary; jm_auth_session=forged; velarion_mt5_account=1200533810'};
live('HTTP: legacy admin, broker, quiz, activation and execution handlers remain denied', async () => {
  for (const path of ['auth/login', 'admin/session', 'admin/users/bulk-verify', 'verify-mt5', 'accounts/link', 'access/check', 'access/activate', 'school/quiz/submit', 'school/progress', 'automation/control', 'positions/close/123', 'trading/settings', 'users/login', 'users/register']) {
    const response = await fetch(`${base}/api/${path}`, {method: 'POST', headers: {...forged, 'Content-Type': 'application/json'}, body: JSON.stringify({adminSecret:'forged',accountId:'1200533810',action:'ACTIVATE_DEMO',schoolCompleted:true})});
    assert.equal(response.status, 503, path);
    assert.match(response.headers.get('cache-control'), /no-store/, path);
    assert.equal(response.headers.get('set-cookie'), null, path);
    const data = await response.json();
    assert.equal(data.automationEligible, false, path);
    assert.equal(data.tradingEnabled, false, path);
  }
});
live('HTTP: missing and forged tokens fail closed and legacy cookies do not authenticate', async () => {
  for (const path of ['auth/session', 'school/progress']) {
    const missing = await fetch(`${base}/api/${path}`, {headers: forged});
    assert.equal(missing.status, 401, path);
    assert.equal((await missing.json()).authenticated, false, path);
    const legacy = await fetch(`${base}/api/${path}`, {headers: {Cookie:'__Host-velarion_access=forged'}});
    assert.equal(legacy.status, 401, path); // legacy cookie is ignored before configuration lookup
    assert.equal((await legacy.json()).authenticated, false, path);
    const current = await fetch(`${base}/api/${path}`, {headers: {Cookie:'__Host-velarion-auth=base64-eyJhY2Nlc3NfdG9rZW4iOiJmb3JnZWQifQ'}});
    assert.equal(current.status, 401, path); // retired provider cookies never reach the new server-held session adapter
    assert.equal((await current.json()).error, 'FRESH_LOGIN_REQUIRED');
  }
});
live('HTTP: access status keeps all five gates locked and no admin role bypass', async () => {
  const response = await fetch(`${base}/api/access/status`, {headers: forged});
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.canActivateTrading, false); assert.equal(data.isOwner, false);
  assert.equal(data.requirements.length, 5);
  assert.ok(data.requirements.every(g => g.status === 'not_started'));
});
live('HTTP: local logout rejects missing production origin configuration', async () => {
  const response = await fetch(`${base}/api/auth/logout`, {method:'POST',headers:{Origin:'https://attacker.example'}});
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('set-cookie'), null);
});
live('HTTP: protected route output stays summary-only and Python proxy is absent', async () => {
  const lesson = await fetch(`${base}/academy/lesson-1`, {headers: forged});
  assert.equal(lesson.status, 200);
  const html = await lesson.text();
  assert.match(html, /DELIVERY DISABLED/);
  assert.doesNotMatch(html, /question-option|Submit Assessment|markLessonCompleted/);
  for (const path of ['terminal', 'accounts', 'automation', 'school']) {
    assert.match(await (await fetch(`${base}/${path}`, {headers: forged})).text(), /NOT CONNECTED/, path);
  }
  assert.equal((await fetch(`${base}/admin-secure-x9f8k2?key=forged`, {headers:forged})).status, 404);
  assert.equal((await fetch(`${base}/api/py/positions`)).status, 404);
});

// No runtime metadata or credentials are installed by these tests.
import { checkMutationOrigin } from '../../lib/server/http-policy.ts';
test('mutation policy rejects unconfigured, non-HTTPS, forged and missing origins', () => {
  const request = (headers = {}) => new Request('http://127.0.0.1/local', {method:'POST',headers});
  const origin = 'https://velarion-one.vercel.app';
  assert.equal(checkMutationOrigin(request(), ''), 503);
  assert.equal(checkMutationOrigin(request(), 'http://localhost:3000'), 503);
  assert.equal(checkMutationOrigin(request(), origin), 403);
  assert.equal(checkMutationOrigin(request({Origin:'https://attacker.example'}), origin), 403);
  assert.equal(checkMutationOrigin(request({Origin:origin,'Sec-Fetch-Site':'cross-site'}), origin), 403);
  assert.equal(checkMutationOrigin(request({Origin:origin,'Sec-Fetch-Site':'same-origin'}), origin), null);
});
test('mutation policy rejects excessive and malformed content-length without parsing a body', () => {
  for (const length of ['4097','99999999999999','-1','nope']) {
    const request = new Request('http://127.0.0.1/local', {method:'POST',headers:{Origin:'https://velarion-one.vercel.app','Content-Length':length}});
    assert.equal(checkMutationOrigin(request, 'https://velarion-one.vercel.app'), 413);
  }
});

live('HTTP: identity mutation routes fail closed with no production configuration', async () => {
  for (const operation of ['auth/provision','auth/revoke-all']) {
    const response = await fetch(`${base}/api/${operation}`, {method:'POST',headers:{Origin:'https://attacker.example',Cookie:'__Host-velarion_access=forged','Content-Type':'application/json'},body:JSON.stringify({subject:'forged',email:'attacker@example.com'})});
    assert.equal(response.status, operation === 'auth/provision' ? 403 : 503);
    assert.equal(response.headers.get('set-cookie'), null);
    const body = await response.json();
    assert.equal(body.success, false); assert.equal(body.automationEligible, false);
  }
});
