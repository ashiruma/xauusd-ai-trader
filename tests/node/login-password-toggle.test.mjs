import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = await readFile(new URL('../../app/login/page.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

// Exercise the actual component's event handlers and rendered props without adding
// a DOM library. Native focus, caret, and keyboard behavior are checked in-browser.
function harness() {
  const slots = [];
  let cursor = 0;
  let networkCalls = 0;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(name) {
      if (name === 'react') return { useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      } };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'next/link') return { __esModule: true, default: 'a' };
      if (name === '@/lib/partner') return { DEFAULT_PARTNER_CONFIG: { primaryLink: 'https://example.test/partner' } };
      if (name === './login.module.css') return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      throw new Error(`Unexpected import: ${name}`);
    },
    fetch() { networkCalls++; throw new Error('The visibility control must not call authentication'); },
  });
  return {
    render() { cursor = 0; return module.exports.default(); },
    get networkCalls() { return networkCalls; },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const input = tree => nodes(tree).find(n => n.type === 'input' && n.props.name === 'password');
const toggle = tree => nodes(tree).find(n => n.type === 'button' && /^(Show|Hide) password$/.test(n.props['aria-label']));
const modeSwitch = tree => nodes(tree).find(n => n.type === 'button' && n.props.type === 'button' && !n.props['aria-controls']);

for (const mode of ['login', 'signup']) {
  test(`password eye toggles safely in ${mode} mode with unchanged validation`, () => {
    const app = harness();
    let tree = app.render();
    if (mode === 'signup') { modeSwitch(tree).props.onClick(); tree = app.render(); }
    const original = input(tree);
    assert.equal(original.props.type, 'password');
    assert.equal(toggle(tree).props.type, 'button');
    assert.equal(toggle(tree).props['aria-label'], 'Show password');
    assert.equal(toggle(tree).props['aria-controls'], original.props.id);
    assert.equal(original.props.required, true);
    assert.equal(original.props.minLength, mode === 'signup' ? 12 : 1);
    assert.equal(original.props.maxLength, 1024);
    assert.equal(original.props.autoComplete, mode === 'signup' ? 'new-password' : 'current-password');
    toggle(tree).props.onClick();
    tree = app.render();
    assert.equal(input(tree).props.type, 'text');
    assert.equal(toggle(tree).props['aria-label'], 'Hide password');
    assert.equal(input(tree).props.id, original.props.id);
    assert.equal(input(tree).key, null, 'input must not be keyed/remounted on visibility');
    assert.equal(input(tree).props.value, undefined, 'input remains uncontrolled');
    assert.equal(input(tree).props.autoComplete, original.props.autoComplete);
    toggle(tree).props.onClick();
    tree = app.render();
    assert.equal(input(tree).props.type, 'password');
    assert.equal(toggle(tree).props['aria-label'], 'Show password');
    assert.equal(app.networkCalls, 0);
    assert.deepEqual(nodes(tree).filter(n => n.type === 'input').map(n => n.props.name), ['email', 'password']);
  });
}

test('eye pointer press preserves focus; native button remains keyboard operable', () => {
  const app = harness();
  const button = toggle(app.render());
  let prevented = false;
  button.props.onPointerDown({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(button.type, 'button');
  assert.equal(button.props.tabIndex, undefined);
  assert.equal(button.props.onKeyDown, undefined, 'do not override native Enter/Space activation');
  const icon = nodes(button).find(n => n.type === 'svg');
  assert.equal(icon.props['aria-hidden'], 'true');
  assert.equal(icon.props.focusable, 'false');
});
