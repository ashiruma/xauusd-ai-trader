import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEFAULT_PARTNER_CONFIG } from '../../lib/partner.ts';
import { RELEASE_POLICY } from '../../lib/release-policy.ts';
const read = p => readFile(new URL(`../../${p}`, import.meta.url), 'utf8');

test('existing partner URL and alphanumeric referral ID remain exact', () => {
  assert.equal(DEFAULT_PARTNER_CONFIG.primaryCode, 'tohstb0d83');
  assert.equal(DEFAULT_PARTNER_CONFIG.primaryLink, 'https://one.justmarkets.link/a/tohstb0d83');
  assert.equal(DEFAULT_PARTNER_CONFIG.activeLink, DEFAULT_PARTNER_CONFIG.primaryLink);
});
test('full journey requires demo ID, separate Velarion credentials and evidence rather than inferred ownership', async () => {
  const copy = await read('app/how-it-works/page.tsx');
  for (const term of ['demo MT5', 'trading account ID', 'separate Velarion password', 'USD 50', 'lessons 6–30', 'All 30', 'ownership', 'attribution', 'not active enforcement']) assert.ok(copy.includes(term), term);
  assert.match(copy, /account number or matching email alone does not prove/);
  assert.match(copy, /No automated broker verification is currently provided/);
  assert.match(copy, /No broker master, investor or trading password/);
});
test('funding checkpoint is not graduation or trading activation', async () => {
  const copy = await read('app/how-it-works/page.tsx');
  assert.match(copy, /five-lesson funding checkpoint is not graduation/);
  assert.match(copy, /A funded live account does not unlock it/);
  assert.match(copy, /separate affirmative consent/);
  assert.match(copy, /exact authenticated worker acknowledgement/);
  assert.equal(RELEASE_POLICY.courseDeliveryEnabled, false);
  assert.equal(RELEASE_POLICY.tradingEnabled, false);
  assert.equal(RELEASE_POLICY.automationEligible, false);
  assert.equal(RELEASE_POLICY.coreTotal, 30);
});
test('restricted access explains route without fake rate-limit redirect or ID collection', async () => {
  const pending = await read('components/ConnectionPending.tsx');
  assert.match(pending, /not confirmation of a broker signup or a temporary rate-limit error/);
  assert.match(pending, /DEFAULT_PARTNER_CONFIG.primaryLink/);
  assert.match(pending, /ID submission and broker verification remain unavailable/);
  assert.doesNotMatch(pending, /window\.location|redirect\(|<input/);
});
test('login still sends only Velarion email and password and never MT5 credentials', async () => {
  const login = await read('app/login/page.tsx');
  const fields = [...login.matchAll(/<input\s+name="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(fields, ['email', 'password']);
  assert.match(login, /JSON\.stringify\(\{ email: form\.get\('email'\), password: form\.get\('password'\) \}\)/);
  assert.match(login, /demo MT5 trading account ID is mandatory/);
  assert.match(login, /ID submission and broker verification are not enabled/);
  assert.match(login, /Never enter a JustMarkets or MT5 password/);
});
test('conditional free access, costs, conflicts, Kenya caveat and no guaranteed income stay visible', async () => {
  const copy = await read('app/how-it-works/page.tsx');
  for (const term of ['100% free on condition', 'Spreads, commissions, swaps', 'market losses remain your responsibility', 'IB rebates create a conflict', 'Kenya legal and regulatory review', 'neither earnings nor profitability while studying are promised']) assert.ok(copy.includes(term), term);
});
test('active assistant no longer suggests entering broker investor passwords', async () => {
  const copy = await read('components/AiAssistantWidget.tsx');
  assert.doesNotMatch(copy, /connect an MT5 Investor|What is an Investor Password/);
  assert.match(copy, /Never share broker passwords here/);
});
