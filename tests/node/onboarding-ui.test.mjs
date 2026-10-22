import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const read = p => readFile(new URL(`../../${p}`, import.meta.url), 'utf8');
const pageSource = await read('app/onboarding/page.tsx');
const reviewSource = await read('components/ManualBrokerReview.tsx');
const css = await read('app/onboarding/onboarding.module.css');
function compile(source, imports, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, {
    module, exports: module.exports,
    require(name) {
      if (name in imports) return imports[name];
      if (name === 'react/jsx-runtime') return require(name);
      throw new Error(`Unexpected import: ${name}`);
    }, ...globals,
  });
  return module.exports.default;
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join('');
  return tree?.props ? text(tree.props.children) : '';
}
const sessions = () => null;
const review = () => null;
async function renderPage(session, snapshot = {}) {
  return compile(pageSource, {
    'next/link': { __esModule: true, default: 'a' },
    '@/lib/server/integrated-runtime': { currentSession: async () => { if (session instanceof Error) throw session; return session; }, currentOnboarding: async () => snapshot },
    '@/components/StagingSessionActions': { __esModule: true, default: sessions },
    '@/components/ManualBrokerReview': { __esModule: true, default: review },
    './onboarding.module.css': { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) },
  })();
}
test('signed-in pending state prioritizes application admission, not trading or review approval', async () => {
  const tree = await renderPage({ authenticated: true, bffAuthorized: false });
  assert.match(text(tree), /Signed in — access pending/);
  assert.match(text(tree), /Confirm application access/);
  assert.equal(nodes(tree).filter(n => n.type === sessions).length, 1);
  const cta = nodes(tree).find(n => n.props?.className === 'primaryAction');
  assert.equal(cta.props.href, '/login');
  assert.equal(cta.props.prefetch, false);
});
test('unconfirmed session remains fail-closed without session actions or fabricated status', async () => {
  const tree = await renderPage(new Error('private diagnostic'));
  assert.match(text(tree), /Sign in is not yet available/);
  assert.doesNotMatch(text(tree), /private diagnostic|Authoritative onboarding status/);
  assert.equal(nodes(tree).filter(n => n.type === sessions).length, 0);
});
test('admitted identity still has all six gates and exact server-reported progress, never activation', async () => {
  const tree = await renderPage({ authenticated: true, bffAuthorized: true }, { gates: [{ gate: 'referral', status: 'waived' }, { gate: 'deposit', status: 'pending' }, { gate: 'core_completion', status: 'pending' }], progress: { coreCompleted: 5 } });
  assert.match(text(tree), /Onboarding is still gated/);
  assert.match(text(tree), /Authoritative lesson completion: 5 \/ 30/);
  assert.match(text(tree), /referralwaived/);
  assert.equal(nodes(tree).find(n => n.type === 'ol').props.children.length, 6);
  for (const term of ['at least USD 50 deposited; no broker passwords', 'Separate explicit automation consent', 'exact worker acknowledgement', 'Review does not activate lessons or trading.', 'no pass is authorized by email', 'no earnings are guaranteed', 'Kenya regulatory review remains required']) assert.ok(text(tree).includes(term), term);
});
function reviewHarness(response) {
  const slots = []; let cursor = 0; let effect; const requests = [];
  const Component = compile(reviewSource, { react: { useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], v => { slots[i] = v; }]; }, useEffect(fn) { effect = fn; } } }, { fetch: async (...args) => { requests.push(args); return response; } });
  return { render() { cursor = 0; return Component(); }, async load() { effect(); await new Promise(resolve => setImmediate(resolve)); }, requests };
}
for (const [name, response] of [
  ['failed', { ok: false }],
  ['locked', { ok: true, json: async () => ({ submissions: [], eligibility: {}, locked: true }) }],
  ['malformed', { ok: true, json: async () => ({ submissions: [] }) }],
]) test(`${name} broker service never renders a submission action`, async () => {
  const app = reviewHarness(response); let tree = app.render();
  assert.equal(nodes(tree).filter(n => n.type === 'form').length, 0);
  await app.load(); tree = app.render();
  assert.equal(nodes(tree).filter(n => n.type === 'form').length, 0);
  assert.match(text(tree), /do not assume it failed or resubmit automatically/);
  assert.equal(app.requests[0][1].credentials, 'same-origin');
  assert.equal(app.requests[0][1].cache, 'no-store');
});
test('authenticated enabled review keeps the exact required inputs and manual-only submit', async () => {
  const app = reviewHarness({ ok: true, json: async () => ({ submissions: [], eligibility: { demoVerified: false, liveVerified: false, checkpointSatisfied: false } }) });
  app.render(); await app.load(); const tree = app.render();
  const inputs = nodes(tree).filter(n => n.type === 'input');
  assert.equal(inputs.length, 4); assert.ok(inputs.every(n => n.props.required));
  assert.equal(inputs[1].props.inputMode, 'numeric');
  assert.match(text(tree), /This is not graduation or permission to trade/);
  assert.match(text(tree), /Never enter a broker password, PIN, one-time code/);
  assert.equal(nodes(tree).find(n => n.type === 'button').props.type, 'submit');
  assert.equal(app.requests.length, 1, 'render and loading must never POST');
});
test('UI styling stays page-scoped, mobile-first and keyboard accessible', () => {
  assert.match(css, /@media \(min-width: 900px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /min-height: 48px/);
  assert.doesNotMatch(css, /display:\s*none[^}]*\}(?:\s*\/\*.*\*\/)?\s*\.review/s);
  assert.doesNotMatch(reviewSource, /rgba\(14,19,27/);
});
