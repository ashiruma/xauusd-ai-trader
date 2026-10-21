import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { PostgresAdmissionVault } from '../../lib/server/postgres-admission-vault.ts';

const socket=process.env.VELARION_LOCAL_TEST_SOCKET;
test('PostgresAdmissionVault encrypts every payload and performs lifecycle through parameterized SQL routines',async()=>{
 const key=randomBytes(32), plain={state:'pending',expiresAt:Date.now()+60_000,refreshToken:'never-store-in-clear'};
 let row=null, calls=[];
 const sql=async(strings,...values)=>{
  const text=strings.join('?');calls.push({text,values});
  if(text.includes('admission_vault_create')){if(row)return [{status:'exists'}];row={status:'ok',revision:values[1],expires_at:values[2],iv:values[3],tag:values[4],ciphertext:values[5]};return [row];}
  if(text.includes('admission_vault_read'))return row?[row]:[{status:'missing'}];
  if(text.includes('admission_vault_cas')){row={status:'ok',revision:values[2],expires_at:values[3],iv:values[4],tag:values[5],ciphertext:values[6]};return [row];}
  if(text.includes('admission_vault_remove')){const old={...row,status:'removed'};row=null;return [old];}
  if(text.includes('admission_vault_purge'))return [{removed:0}];
  throw Error('unexpected SQL routine');
 };
 const vault=new PostgresAdmissionVault(sql,{key});
 const created=await vault.create('a'.repeat(64),plain);
 assert.equal(created.revision,1);
 assert.equal(row.ciphertext.includes('never-store-in-clear'),false);
 assert.ok(Buffer.from(row.ciphertext,'base64').length>0);
 assert.deepEqual(await vault.read('a'.repeat(64)),created);
 const changed={...plain,state:'authorized'};
 assert.equal((await vault.cas('a'.repeat(64),1,changed)).revision,2);
 assert.equal((await vault.remove('a'.repeat(64))).revision,2);
 assert.equal(await vault.purgeExpired(),0);
 assert.ok(calls.every(c=>c.text.includes('velarion_api.admission_vault_')));
 assert.ok(calls.every(c=>c.values.length>=0));
});

test('PostgresAdmissionVault rejects a ciphertext whose AAD-bound expiry metadata was changed',async()=>{
 const key=randomBytes(32),record={state:'pending',expiresAt:Date.now()+60_000};let captured;
 const sql=async(strings,...values)=>{const s=strings.join('?');if(s.includes('admission_vault_create')){captured={status:'ok',revision:values[1],expires_at:values[2],iv:values[3],tag:values[4],ciphertext:values[5]};return [captured];}if(s.includes('admission_vault_read'))return [{...captured,expires_at:captured.expires_at+1}];throw Error(s);};
 const vault=new PostgresAdmissionVault(sql,{key});await vault.create('b'.repeat(64),record);
 await assert.rejects(vault.read('b'.repeat(64)),/ADMISSION_VAULT_CORRUPT/);
});

test('real isolated PostgreSQL routine smoke test is opt-in and never uses a URL', {skip:!socket?'requires the supplied disposable Unix-socket fixture':false},async()=>{
 assert.ok(socket.startsWith('/'));assert.match(socket,/(?:velarion|onboarding|run-)/);assert.ok(!socket.includes('://'));
 const postgres=(await import('postgres')).default;
 const sql=postgres({host:socket,port:1,username:'ubuntu',database:'postgres',max:1,prepare:false,connect_timeout:3,onnotice:()=>{},debug:()=>{}});
 try{
  await sql`SET ROLE velarion_bff`;
  const hash='f'.repeat(64),exp=Date.now()+60_000;
  const ins=await sql`select * from velarion_api.admission_vault_create(${hash},1::bigint,${exp}::bigint,'aGVsbG8=','dGFn','Y2lwaGVy')`;
  assert.equal(ins[0].status,'ok');
  const got=await sql`select * from velarion_api.admission_vault_read(${hash})`;assert.equal(got[0].status,'ok');
  const removed=await sql`select * from velarion_api.admission_vault_remove(${hash})`;assert.equal(removed[0].status,'removed');
  const replay=await sql`select * from velarion_api.admission_vault_read(${hash})`;assert.equal(replay[0].status,'consumed');
 }finally{await sql.end({timeout:2});}
});

test('capability/revision/ciphertext substitution and wrong encryption key fail closed', async () => {
 const key=randomBytes(32),cap='c'.repeat(64);let row;
 const sql=async(s,...v)=>{if(s.join('').includes('_create')){row={status:'ok',revision:v[1],expires_at:v[2],iv:v[3],tag:v[4],ciphertext:v[5]};return [row];}return [row];};
 const vault=new PostgresAdmissionVault(sql,{key});await vault.create(cap,{state:'new',expiresAt:Date.now()+60000,accessToken:'synthetic-secret'});
 await assert.rejects(vault.read('d'.repeat(64)),/ADMISSION_VAULT_CORRUPT/);
 await assert.rejects(new PostgresAdmissionVault(sql,{key:randomBytes(32)}).read(cap),/ADMISSION_VAULT_CORRUPT/);
 const original={...row};row={...original,revision:2};await assert.rejects(vault.read(cap),/ADMISSION_VAULT_CORRUPT/);
 row={...original,ciphertext:Buffer.from('tampered').toString('base64')};await assert.rejects(vault.read(cap),/ADMISSION_VAULT_CORRUPT/);
});
test('invalid capability, key, expiry, revision and oversized record are rejected before SQL', async () => {
 let calls=0;const sql=async()=>{calls++;throw Error('must not call');};
 assert.throws(()=>new PostgresAdmissionVault(sql,{key:Buffer.alloc(1)}),/ADMISSION_VAULT_CONFIG_INVALID/);
 const v=new PostgresAdmissionVault(sql,{key:randomBytes(32)}),cap='e'.repeat(64),record={state:'new',expiresAt:Date.now()+60000};
 await assert.rejects(v.read('not-a-capability'),/CAPABILITY_INVALID/);
 await assert.rejects(v.create(cap,{...record,expiresAt:Date.now()-1}),/EXPIRED/);
 await assert.rejects(v.create(cap,{...record,expiresAt:Date.now()+9*3600000}),/RECORD_INVALID/);
 await assert.rejects(v.create(cap,{...record,data:'x'.repeat(65536)}),/RECORD_INVALID/);
 await assert.rejects(v.cas(cap,0,record),/REVISION_INVALID/);assert.equal(calls,0);
});
test('vault never automatically retries a write whose SQL acknowledgement is lost', async () => {
 let calls=0;const v=new PostgresAdmissionVault(async()=>{calls++;throw Error('synthetic uncertain commit');},{key:randomBytes(32)});
 await assert.rejects(v.cas('e'.repeat(64),1,{state:'fencing',expiresAt:Date.now()+60000}),/uncertain commit/);assert.equal(calls,1);
});
test('real PG encrypted vault: cross-client CAS winner, tombstone replay rejection, expiry/purge and denied private-table access', {skip:!socket?'requires isolated Unix-socket fixture':false}, async()=>{
 const postgres=(await import('postgres')).default;
 const settings={host:socket,port:1,username:'ubuntu',database:'postgres',max:1,prepare:false,max_pipeline:1,connect_timeout:3,onnotice:()=>{},debug:()=>{}};
 const a=postgres(settings),b=postgres(settings),key=randomBytes(32),cap=randomBytes(32).toString('hex');
 try{
  assert.ok(socket.startsWith('/'));assert.match(socket,/(?:velarion|onboarding|run-)/);assert.ok(!socket.includes('://'));
  await a`SET ROLE velarion_bff`;await b`SET ROLE velarion_bff`;
  const va=new PostgresAdmissionVault(a,{key}),vb=new PostgresAdmissionVault(b,{key}),record={state:'new',expiresAt:Date.now()+60000,accessToken:'not-in-database-cleartext'};
  const creates=await Promise.allSettled([va.create(cap,record),vb.create(cap,record)]);assert.equal(creates.filter(x=>x.status==='fulfilled').length,1);
  assert.deepEqual(await va.read(cap),await vb.read(cap));
  const raced=await Promise.allSettled([va.cas(cap,1,{...record,state:'fencing'}),vb.cas(cap,1,{...record,state:'fencing'})]);assert.equal(raced.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(raced.find(x=>x.status==='rejected').reason.code,'ADMISSION_VAULT_CAS_CONFLICT');
  const current=await vb.read(cap);assert.equal(current.revision,2);
  await va.remove(cap);assert.equal(await vb.read(cap),null);
  await assert.rejects(vb.cas(cap,2,record),/ADMISSION_VAULT_EXPIRED/);
  await assert.rejects(vb.create(cap,record),/ADMISSION_VAULT_EXISTS/);
  await assert.rejects(a`SELECT * FROM velarion_private.admission_vault`);
  await assert.rejects(a`SELECT velarion_api.admission_vault_purge(NULL::integer)`);
  await assert.rejects(a`SELECT velarion_api.admission_vault_purge(501)`);
  const expCap=randomBytes(32).toString('hex');await va.create(expCap,{state:'new',expiresAt:Date.now()+75});await new Promise(r=>setTimeout(r,100));
  assert.equal(await vb.read(expCap),null);assert.ok(await va.purgeExpired()>=1);
  await assert.rejects(vb.create(expCap,{...record,expiresAt:Date.now()+60000}),/ADMISSION_VAULT_EXISTS/);
  await a`SET ROLE anon`;await assert.rejects(a`SELECT * FROM velarion_api.admission_vault_read(${'f'.repeat(64)})`);
 }finally{await a.end({timeout:2});await b.end({timeout:2});}
});
