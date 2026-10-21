import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { BffError } from './core';
import type { AdmissionRecord, StoredAdmissionRecord } from './admission-vault';

export type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => PromiseLike<any>;
const DOMAIN = 'velarion-admission-vault-browser:v1:';
const CAPABILITY = /^[0-9a-f]{64}$/;
const MAX_RECORD_BYTES = 64 * 1024;
const MAX_TTL_MS = 8 * 60 * 60 * 1000;
const fail = (code: string, status = 503): never => { throw new BffError(code, status); };
function keyFrom(env: NodeJS.ProcessEnv, supplied?: Buffer) {
  if (supplied) { if (!Buffer.isBuffer(supplied) || supplied.length !== 32) fail('ADMISSION_VAULT_CONFIG_INVALID'); return Buffer.from(supplied); }
  const encoded = env.VELARION_ADMISSION_VAULT_KEY;
  if (!encoded || !/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9_-]{43})$/.test(encoded)) fail('ADMISSION_VAULT_CONFIG_INVALID');
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/') + (encoded.length === 43 ? '=' : '');
  const key = Buffer.from(normalized, 'base64');
  if (key.length !== 32 || key.toString('base64') !== normalized) fail('ADMISSION_VAULT_CONFIG_INVALID');
  return key;
}
function idFor(secret: string) {
  if (typeof secret !== 'string' || !CAPABILITY.test(secret)) fail('ADMISSION_VAULT_CAPABILITY_INVALID', 400);
  return createHash('sha256').update(DOMAIN + secret, 'utf8').digest('hex');
}
function validRecord(value: AdmissionRecord) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isFinite(value.expiresAt) || typeof value.state !== 'string' || !value.state) fail('ADMISSION_VAULT_RECORD_INVALID', 400);
  const now=Date.now(); if (value.expiresAt <= now) fail('ADMISSION_VAULT_EXPIRED', 410);
  if (value.expiresAt > now + MAX_TTL_MS + 60_000) fail('ADMISSION_VAULT_RECORD_INVALID',400);
  if (Buffer.byteLength(JSON.stringify(value),'utf8') > MAX_RECORD_BYTES) fail('ADMISSION_VAULT_RECORD_INVALID',413);
}
function aad(id: string, revision: number, expiresAt: number) { return Buffer.from(`${DOMAIN}${id}:${revision}:${expiresAt}`, 'utf8'); }
function encrypt(key: Buffer,id:string,record:StoredAdmissionRecord) {
  const iv=randomBytes(12), c=createCipheriv('aes-256-gcm',key,iv); c.setAAD(aad(id,record.revision,record.expiresAt));
  const ciphertext=Buffer.concat([c.update(JSON.stringify(record),'utf8'),c.final()]);
  return {iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')};
}
function decrypt(key:Buffer,id:string,row:any):StoredAdmissionRecord {
  try {
    const revision=Number(row.revision), expiresAt=Number(row.expires_at);
    if(!Number.isSafeInteger(revision)||revision<1||!Number.isFinite(expiresAt)) throw Error();
    const d=createDecipheriv('aes-256-gcm',key,Buffer.from(row.iv,'base64')); d.setAAD(aad(id,revision,expiresAt)); d.setAuthTag(Buffer.from(row.tag,'base64'));
    const plain=Buffer.concat([d.update(Buffer.from(row.ciphertext,'base64')),d.final()]); if(plain.length>MAX_RECORD_BYTES) throw Error();
    const value=JSON.parse(plain.toString('utf8'));
    if(!value||Array.isArray(value)||typeof value!=='object'||value.revision!==revision||value.expiresAt!==expiresAt||typeof value.state!=='string') throw Error();
    return value;
  } catch { fail('ADMISSION_VAULT_CORRUPT'); }
}
function first(rows:any) { return rows?.[0] ?? null; }
export class PostgresAdmissionVault {
  private readonly key:Buffer;
  constructor(private readonly sql:SqlTag, options?:{key?:Buffer;env?:NodeJS.ProcessEnv}) { this.key=keyFrom(options?.env??process.env,options?.key); }
  async create(browserSecret:string,record:AdmissionRecord):Promise<StoredAdmissionRecord>{
    const id=idFor(browserSecret); validRecord(record); const saved={...record,revision:1}; const e=encrypt(this.key,id,saved);
    const rows=await this.sql`select * from velarion_api.admission_vault_create(${id},${1},${saved.expiresAt},${e.iv},${e.tag},${e.ciphertext})`;
    const r=first(rows); if(!r) fail('ADMISSION_VAULT_UNAVAILABLE'); if(r.status==='exists') fail('ADMISSION_VAULT_EXISTS',409); if(r.status==='expired') fail('ADMISSION_VAULT_EXPIRED',410); if(r.status!=='ok') fail('ADMISSION_VAULT_UNAVAILABLE'); return saved;
  }
  async read(browserSecret:string):Promise<StoredAdmissionRecord|null>{
    const id=idFor(browserSecret); const rows=await this.sql`select * from velarion_api.admission_vault_read(${id})`; const r=first(rows);
    if(!r||r.status==='missing'||r.status==='expired'||r.status==='consumed') return null; if(r.status!=='ok') fail('ADMISSION_VAULT_UNAVAILABLE'); return decrypt(this.key,id,r);
  }
  async cas(browserSecret:string,expectedRevision:number,record:AdmissionRecord):Promise<StoredAdmissionRecord>{
    const id=idFor(browserSecret); if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1||expectedRevision>=Number.MAX_SAFE_INTEGER) fail('ADMISSION_VAULT_REVISION_INVALID',400); validRecord(record);
    const saved={...record,revision:expectedRevision+1}; const e=encrypt(this.key,id,saved);
    const rows=await this.sql`select * from velarion_api.admission_vault_cas(${id},${expectedRevision},${saved.revision},${saved.expiresAt},${e.iv},${e.tag},${e.ciphertext})`; const r=first(rows);
    if(!r) fail('ADMISSION_VAULT_UNAVAILABLE'); if(r.status==='conflict') fail('ADMISSION_VAULT_CAS_CONFLICT',409); if(r.status==='expired'||r.status==='missing'||r.status==='consumed') fail('ADMISSION_VAULT_EXPIRED',410); if(r.status!=='ok') fail('ADMISSION_VAULT_UNAVAILABLE'); return saved;
  }
  async remove(browserSecret:string):Promise<StoredAdmissionRecord|null>{
    const id=idFor(browserSecret); const rows=await this.sql`select * from velarion_api.admission_vault_remove(${id})`; const r=first(rows);
    if(!r||r.status==='missing'||r.status==='consumed'||r.status==='expired') return null; if(r.status==='removed') return decrypt(this.key,id,r); fail('ADMISSION_VAULT_UNAVAILABLE');
  }
  async purgeExpired():Promise<number>{ const rows=await this.sql`select velarion_api.admission_vault_purge(500) as removed`; const n=Number(first(rows)?.removed); if(!Number.isSafeInteger(n)||n<0) fail('ADMISSION_VAULT_UNAVAILABLE'); return n; }
}

export function createPostgresAdmissionVault(sql: SqlTag, env: NodeJS.ProcessEnv = process.env): PostgresAdmissionVault {
  return new PostgresAdmissionVault(sql, { env });
}
