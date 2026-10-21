import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, chmod, readFile, writeFile, readdir, symlink, rm, mkdir, lstat, rename } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { FileAdmissionVault, newAdmissionAttemptId, isAdmissionAttemptId } from '../../lib/server/admission-vault.ts';

const secret = 'a'.repeat(64), wrongSecret = 'b'.repeat(64), key = Buffer.alloc(32, 7);
let root;
async function setup() { root = await mkdtemp(path.join(os.tmpdir(), 'admission-vault-')); await chmod(root, 0o700); return new FileAdmissionVault({ directory: root, key }); }
const record = (state='pending', expiresAt=Date.now()+60_000) => ({ state, expiresAt, handle: 'private-handle', attemptSecret: 'hidden' });
test.afterEach(async () => { if (root) await rm(root, { recursive:true, force:true }); });

test('create/read/CAS/remove persists encrypted revisioned records bound to browser capability', async () => {
  const vault = await setup(); const created = await vault.create(secret, record());
  assert.equal(created.revision, 1);
  const names = await readdir(root); const raw = await readFile(path.join(root, names.find(x => x.endsWith('.vault'))), 'utf8');
  assert.equal(raw.includes('private-handle'), false); assert.equal(raw.includes(secret), false);
  assert.deepEqual(await vault.read(secret), created); assert.equal(await vault.read(wrongSecret), null);
  const changed = await vault.cas(secret, 1, record('verified'));
  assert.equal(changed.revision, 2); assert.equal(changed.state, 'verified');
  await assert.rejects(vault.cas(secret, 1, record('wrong')), e => e.code === 'ADMISSION_VAULT_CAS_CONFLICT');
  assert.equal((await vault.remove(secret)).state, 'verified'); assert.equal(await vault.read(secret), null);
});
test('ciphertext cannot be swapped between browser capability files', async () => {
  const vault = await setup(); await vault.create(secret, record('first')); await vault.create(wrongSecret, record('second'));
  const files = (await readdir(root)).filter(x => x.endsWith('.vault'));
  const [a, b] = await Promise.all(files.map(name => readFile(path.join(root, name), 'utf8')));
  await writeFile(path.join(root, files[0]), b, { mode: 0o600 });
  await writeFile(path.join(root, files[1]), a, { mode: 0o600 });
  await assert.rejects(vault.read(secret), e => e.code === 'ADMISSION_VAULT_CORRUPT');
  await assert.rejects(vault.read(wrongSecret), e => e.code === 'ADMISSION_VAULT_CORRUPT');
});
test('concurrent stale CAS has one winner; existing lock is never stolen', async () => {
  const vault = await setup(); await vault.create(secret, record());
  const outcomes = await Promise.allSettled([vault.cas(secret, 1, record('one')), vault.cas(secret, 1, record('two'))]);
  assert.equal(outcomes.filter(x => x.status === 'fulfilled').length, 1);
  assert.equal(outcomes.filter(x => x.status === 'rejected' && ['ADMISSION_VAULT_CAS_CONFLICT','ADMISSION_VAULT_LOCKED'].includes(x.reason.code)).length, 1);
  const dataName = (await readdir(root)).find(x => x.endsWith('.vault'));
  await writeFile(path.join(root, dataName.replace('.vault','.lock')), 'held', { mode:0o600 });
  await assert.rejects(vault.read(secret), e => e.code === 'ADMISSION_VAULT_LOCKED');
});
test('expiry, tamper, wrong key, and unsafe filesystem permissions fail closed', async () => {
  const vault = await setup(); await vault.create(secret, record('expired', Date.now()+20));
  await new Promise(resolve => setTimeout(resolve, 30)); assert.equal(await vault.read(secret), null);
  const liveSecret = 'c'.repeat(64); await vault.create(liveSecret, record());
  const file = path.join(root, (await readdir(root)).find(x => x.endsWith('.vault')));
  const altered = new FileAdmissionVault({ directory:root, key:Buffer.alloc(32,8) });
  await assert.rejects(altered.read(liveSecret), e => e.code === 'ADMISSION_VAULT_CORRUPT');
  const envelope = JSON.parse(await readFile(file, 'utf8')); envelope.ciphertext = 'AA=='; await writeFile(file, JSON.stringify(envelope), { mode:0o600 });
  await assert.rejects(vault.read(liveSecret), e => e.code === 'ADMISSION_VAULT_CORRUPT');
  await chmod(file, 0o644); await assert.rejects(vault.read(liveSecret), e => e.code === 'ADMISSION_VAULT_FILE_UNSAFE');
  await chmod(root, 0o755); await assert.rejects(vault.read(liveSecret), e => e.code === 'ADMISSION_VAULT_DIRECTORY_UNSAFE');
});
test('purgeExpired removes encrypted expired records without reading by capability and leaves live records', async () => {
  const vault = await setup(); const expired = 'd'.repeat(64), live = 'e'.repeat(64), originalNow = Date.now;
  const createdAt = originalNow();
  await vault.create(expired, record('expired', createdAt+10)); await vault.create(live, record('live', createdAt+60_000));
  Date.now = () => createdAt+20;
  try { assert.equal(await vault.purgeExpired(), 1); }
  finally { Date.now = originalNow; }
  assert.equal(await vault.read(expired), null); assert.equal((await vault.read(live)).state, 'live');
});
test('rejects symlink directory/capability malformed records and emits UUID attempts', async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'admission-link-')); const link = path.join(base, 'link'); await symlink(root, link);
  const linked = new FileAdmissionVault({ directory:link, key });
  await assert.rejects(linked.read(secret), e => e.code === 'ADMISSION_VAULT_DIRECTORY_UNSAFE');
  const vault = await setup(); await assert.rejects(vault.read('no'), e => e.code === 'ADMISSION_VAULT_CAPABILITY_INVALID');
  await vault.create(secret, record()); await assert.rejects(vault.create(secret, record()), e => e.code === 'ADMISSION_VAULT_EXISTS');
  const parent = path.join(base, 'parent-link'); await symlink(root, parent);
  const linkedParent = new FileAdmissionVault({ directory:path.join(parent, 'child'), key });
  await assert.rejects(linkedParent.read(secret), e => e.code === 'ADMISSION_VAULT_DIRECTORY_UNSAFE');
  const id = newAdmissionAttemptId(); assert.equal(isAdmissionAttemptId(id), true); await rm(base, {recursive:true,force:true});
});
