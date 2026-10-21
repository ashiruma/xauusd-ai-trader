import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { open, lstat, mkdir, readdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { BffError } from './core';

export type AdmissionRecord = { expiresAt: number; state: string; revision?: number; [key: string]: unknown };
export type StoredAdmissionRecord = AdmissionRecord & { revision: number };
const DOMAIN = 'velarion-admission-vault-browser:v1:';
const CAPABILITY = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PURGE_SCAN = 1000;
const fail = (code: string, status = 503): never => { throw new BffError(code, status); };

function config(options?: { directory?: string; key?: Buffer }) {
  const dir = options?.directory ?? process.env.VELARION_ADMISSION_VAULT_DIR;
  const encoded = process.env.VELARION_ADMISSION_VAULT_KEY;
  if (options?.key) {
    if (!Buffer.isBuffer(options.key) || options.key.length !== 32 || !dir || !path.isAbsolute(dir)) fail('ADMISSION_VAULT_CONFIG_INVALID');
    return { dir: path.resolve(dir), key: Buffer.from(options.key) };
  }
  if (!dir || !path.isAbsolute(dir) || !encoded || !/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9_-]{43})$/.test(encoded)) fail('ADMISSION_VAULT_CONFIG_INVALID');
  const key = Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/') + (encoded.length === 43 ? '=' : ''), 'base64');
  if (key.length !== 32) fail('ADMISSION_VAULT_CONFIG_INVALID');
  return { dir: path.resolve(dir), key };
}
function capabilityHash(secret: string) {
  if (typeof secret !== 'string' || !CAPABILITY.test(secret)) fail('ADMISSION_VAULT_CAPABILITY_INVALID', 400);
  return createHash('sha256').update(DOMAIN + secret, 'utf8').digest('hex');
}
async function secureDir(dir: string) {
  const absolute = path.resolve(dir), parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    let st;
    try { st = await lstat(current); } catch (e: any) {
      if (e?.code !== 'ENOENT') fail('ADMISSION_VAULT_DIRECTORY_UNSAFE');
      try { await mkdir(current, { mode: 0o700 }); } catch (createError: any) { if (createError?.code !== 'EEXIST') fail('ADMISSION_VAULT_UNAVAILABLE'); }
      try { st = await lstat(current); } catch { fail('ADMISSION_VAULT_DIRECTORY_UNSAFE'); }
    }
    if (!st!.isDirectory() || st!.isSymbolicLink()) fail('ADMISSION_VAULT_DIRECTORY_UNSAFE');
  }
  const st = await lstat(absolute).catch(() => null);
  if (!st?.isDirectory() || st.isSymbolicLink() || st.uid !== process.getuid?.() || (st.mode & 0o777) !== 0o700) fail('ADMISSION_VAULT_DIRECTORY_UNSAFE');
}
function paths(dir: string, id: string) { return { data: path.join(dir, `${id}.vault`), lock: path.join(dir, `${id}.lock`) }; }
function aad(file: string) { return Buffer.from(DOMAIN + path.basename(file), 'utf8'); }
async function locked<T>(lockPath: string, operation: () => Promise<T>): Promise<T> {
  let handle;
  try { handle = await open(lockPath, 'wx', 0o600); }
  catch { fail('ADMISSION_VAULT_LOCKED'); }
  try {
    await handle!.chmod(0o600);
    const st = await handle!.stat();
    if (!st.isFile() || st.uid !== process.getuid?.() || (st.mode & 0o777) !== 0o600) fail('ADMISSION_VAULT_FILE_UNSAFE');
    return await operation();
  } finally { await handle!.close().catch(() => {}); await unlink(lockPath).catch(() => {}); }
}
async function readDisk(file: string, key: Buffer): Promise<StoredAdmissionRecord | null> {
  let handle;
  try {
    handle = await open(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
    const st = await handle.stat();
    if (!st.isFile() || st.uid !== process.getuid?.() || (st.mode & 0o777) !== 0o600) fail('ADMISSION_VAULT_FILE_UNSAFE');
    let envelope: any;
    try { envelope = JSON.parse(await handle.readFile('utf8')); } catch { fail('ADMISSION_VAULT_CORRUPT'); }
    if (envelope?.v !== 1 || typeof envelope.iv !== 'string' || typeof envelope.tag !== 'string' || typeof envelope.ciphertext !== 'string') fail('ADMISSION_VAULT_CORRUPT');
    try {
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
      decipher.setAAD(aad(file));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      const record = JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]).toString('utf8'));
      if (!record || Array.isArray(record) || typeof record !== 'object' || !Number.isSafeInteger(record.revision) || record.revision < 1 || !Number.isFinite(record.expiresAt) || typeof record.state !== 'string') fail('ADMISSION_VAULT_CORRUPT');
      return record;
    } catch (e) { if (e instanceof BffError) throw e; fail('ADMISSION_VAULT_CORRUPT'); }
  } catch (e: any) {
    if (e instanceof BffError) throw e;
    if (e?.code === 'ENOENT') return null;
    if (e?.code === 'ELOOP' || e?.code === 'EMLINK') fail('ADMISSION_VAULT_FILE_UNSAFE');
    fail('ADMISSION_VAULT_IO_ERROR');
  } finally { await handle?.close().catch(() => {}); }
}
async function writeDisk(file: string, key: Buffer, record: StoredAdmissionRecord) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad(file));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()]);
  const body = JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') });
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.${randomBytes(16).toString('hex')}.tmp`);
  let handle;
  try {
    handle = await open(tmp, 'wx', 0o600); await handle.writeFile(body, 'utf8'); await handle.sync(); await handle.close(); handle = undefined;
    await rename(tmp, file);
    const dir = await open(path.dirname(file), 'r'); try { await dir.sync(); } finally { await dir.close(); }
  } catch { await handle?.close().catch(() => {}); await unlink(tmp).catch(() => {}); fail('ADMISSION_VAULT_IO_ERROR'); }
}
function validRecord(record: AdmissionRecord) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || !Number.isFinite(record.expiresAt) || typeof record.state !== 'string' || !record.state) fail('ADMISSION_VAULT_RECORD_INVALID', 400);
}
export class FileAdmissionVault {
  constructor(private readonly options?: { directory?: string; key?: Buffer }) {}
  async create(browserSecret: string, record: AdmissionRecord): Promise<StoredAdmissionRecord> {
    const id = capabilityHash(browserSecret), { dir, key } = config(this.options); validRecord(record); await secureDir(dir);
    const p = paths(dir, id);
    return locked(p.lock, async () => {
      if (await readDisk(p.data, key)) fail('ADMISSION_VAULT_EXISTS', 409);
      if (record.expiresAt <= Date.now()) fail('ADMISSION_VAULT_EXPIRED', 410);
      const saved: StoredAdmissionRecord = { ...record, revision: 1 }; await writeDisk(p.data, key, saved); return saved;
    });
  }
  async read(browserSecret: string): Promise<StoredAdmissionRecord | null> {
    const id = capabilityHash(browserSecret), { dir, key } = config(this.options); await secureDir(dir); const p = paths(dir, id);
    return locked(p.lock, async () => {
      const value = await readDisk(p.data, key); if (!value) return null;
      if (value.expiresAt <= Date.now()) { await unlink(p.data).catch(() => {}); return null; }
      return value;
    });
  }
  async cas(browserSecret: string, expectedRevision: number, record: AdmissionRecord): Promise<StoredAdmissionRecord> {
    const id = capabilityHash(browserSecret), { dir, key } = config(this.options); validRecord(record); await secureDir(dir);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) fail('ADMISSION_VAULT_REVISION_INVALID', 400);
    const p = paths(dir, id);
    return locked(p.lock, async () => {
      const current = await readDisk(p.data, key);
      if (!current || current.expiresAt <= Date.now()) { if (current) await unlink(p.data).catch(() => {}); fail('ADMISSION_VAULT_EXPIRED', 410); }
      if (current.revision !== expectedRevision) fail('ADMISSION_VAULT_CAS_CONFLICT', 409);
      if (record.expiresAt <= Date.now()) fail('ADMISSION_VAULT_EXPIRED', 410);
      const saved: StoredAdmissionRecord = { ...record, revision: expectedRevision + 1 }; await writeDisk(p.data, key, saved); return saved;
    });
  }
  async remove(browserSecret: string): Promise<StoredAdmissionRecord | null> {
    const id = capabilityHash(browserSecret), { dir, key } = config(this.options); await secureDir(dir); const p = paths(dir, id);
    return locked(p.lock, async () => {
      const value = await readDisk(p.data, key); if (value) await unlink(p.data).catch(() => fail('ADMISSION_VAULT_IO_ERROR'));
      return value;
    });
  }
  async purgeExpired(): Promise<number> {
    const { dir, key } = config(this.options); await secureDir(dir);
    let names: string[];
    try { names = await readdir(dir); } catch { fail('ADMISSION_VAULT_IO_ERROR'); }
    const candidates = names.filter(name => /^[0-9a-f]{64}\.vault$/.test(name));
    if (candidates.length > MAX_PURGE_SCAN) fail('ADMISSION_VAULT_SCAN_LIMIT');
    let removed = 0;
    for (const name of candidates) {
      const file = path.join(dir, name), lockPath = path.join(dir, `${name.slice(0, -6)}.lock`);
      const didRemove = await locked(lockPath, async () => {
        const value = await readDisk(file, key);
        if (!value || value.expiresAt > Date.now()) return false;
        try { await unlink(file); return true; } catch (e: any) { if (e?.code === 'ENOENT') return false; fail('ADMISSION_VAULT_IO_ERROR'); }
      });
      if (didRemove) removed++;
    }
    return removed;
  }
}

export function newAdmissionAttemptId(): string { return randomUUID(); }
export function isAdmissionAttemptId(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

export function createAdmissionVault(env: NodeJS.ProcessEnv = process.env): FileAdmissionVault {
  const directory = env.VELARION_ADMISSION_VAULT_DIR;
  const encoded = env.VELARION_ADMISSION_VAULT_KEY;
  if (!directory || !path.isAbsolute(directory) || !encoded || !/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9_-]{43})$/.test(encoded)) fail('ADMISSION_VAULT_CONFIG_INVALID');
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/') + (encoded.length === 43 ? '=' : '');
  const key = Buffer.from(normalized, 'base64');
  if (key.length !== 32 || key.toString('base64') !== normalized) fail('ADMISSION_VAULT_CONFIG_INVALID');
  return new FileAdmissionVault({ directory, key });
}
