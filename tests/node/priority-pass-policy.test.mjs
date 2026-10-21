import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT, createLocalJWKSet, exportJWK } from 'jose';
import { establishContext, verifyAccessToken } from '../../lib/server/core.ts';
import { evaluatePriorityPassPolicy as evaluate, __testOnlyCreatePriorityPolicy as fixture, STAGING_PRIORITY_REGISTRY, STAGING_ISSUER } from '../../lib/server/priority-pass-policy.ts';
process.env.NODE_ENV = 'test';
const issuer = STAGING_ISSUER;
const subject = 'd9428888-122b-4a5a-9a1e-0c14d80b2f50';
const otherSubject = '00000000-0000-4000-8000-000000000001';
const sessionId = 'b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';
const now = Math.floor(Date.now()/1000);
const {privateKey,publicKey} = await generateKeyPair('ES256');
const jwks = createLocalJWKSet({keys:[{...(await exportJWK(publicKey)),kid:'synthetic',alg:'ES256',use:'sig'}]});
const config = {supabaseUrl:'https://akhftbbszejafxpoxiem.supabase.co',publishableKey:'sb_publishable_local_test',databaseUrl:'postgres://not-used',appOrigin:'https://local.example.test'};
async function token(extra={}) {
  return new SignJWT({sub:subject,session_id:sessionId,role:'authenticated',is_anonymous:false,aud:'authenticated',iss:issuer,iat:now,exp:now+600,...extra}).setProtectedHeader({alg:'ES256',kid:'synthetic'}).sign(privateKey);
}
async function verified(extra={}) {
  const id = extra.sub ?? subject;
  return establishContext(await token(extra), config, async()=>{}, async()=>Response.json({id,email:'synthetic@example.test',is_anonymous:false,email_confirmed_at:'2025-01-01T00:00:00Z'}),jwks);
}
const full = Array.from({length:30},(_,i)=>i+1);
const row = (patch={}) => ({status:'active',lessonIds:[],justMarketsReferral:false,justMarketsDeposit:false,accountLinkedAndOwnershipVerified:false,automationConsent:false,tradingActivated:false,exactWorkerAcknowledgementVerified:false,...patch});
const deps = (snapshot=row(), patch={}) => ({checkAppSession:async()=>{},readAuthoritativeSnapshot:async()=>snapshot,...patch});
const pass = fixture([{issuer,subject,expiresAt:now+300}]);
function locked(result) {
  for (const k of ['courseDeliveryEnabled','automationEligible','tradingEnabled']) assert.equal(result[k],false,k);
}

test('runtime registry is frozen and empty; test factory rejects non-test runtime',()=>{
  assert.ok(Object.isFrozen(STAGING_PRIORITY_REGISTRY));assert.equal(STAGING_PRIORITY_REGISTRY.length,0);
  process.env.NODE_ENV='production';try {assert.throws(()=>fixture([]),/TEST_FACTORY_UNAVAILABLE/);}finally{process.env.NODE_ENV='test';}
});
test('ordinary zero-progress client gets no waiver and all downstream routes remain off',async()=>{
  const r=await evaluate(await verified(),deps());
  assert.equal(r.exceptionMatched,false);assert.equal(r.studyPrerequisitesMet,false);assert.equal(r.coursePrerequisiteMet,false);assert.equal(r.activationPrerequisitesMet,false);locked(r);
});
test('client may satisfy study prerequisites before completing school, not the reverse',async()=>{
  const r=await evaluate(await verified(),deps(row({justMarketsReferral:true,justMarketsDeposit:true})));
  assert.equal(r.studyPrerequisitesMet,true);assert.equal(r.coursePrerequisiteMet,false);assert.equal(r.coreCompleted,0);locked(r);
});
test('synthetic priority pass waives referral/deposit AND course without manufacturing progress',async()=>{
  const r=await pass(await verified(),deps());
  assert.equal(r.exceptionMatched,true);assert.equal(r.referralPrerequisiteMet,true);assert.equal(r.depositPrerequisiteMet,true);assert.equal(r.studyPrerequisitesMet,true);assert.equal(r.coursePrerequisiteMet,true);
  assert.equal(r.coreCompleted,0);assert.equal(r.coreGraduated,false);assert.equal(r.activationPrerequisitesMet,false);locked(r);
});
test('empty runtime registry does not grant either email an exception',async()=>{
  for(const email of ['ashirumaabala@gmail.com','rafnesttonny@gmail.com']){
    const c=await verified({email,user_metadata:{role:'admin'},app_metadata:{role:'admin'}});
    assert.equal(Object.hasOwn(c,'email'),false);assert.equal((await evaluate(c,deps())).exceptionMatched,false);
  }
});
test('valid different subject, wrong issuer registry, and invalid UUID never match',async()=>{
  assert.equal((await pass(await verified({sub:otherSubject}),deps())).exceptionMatched,false);
  for(const entry of [{issuer:'https://evil.example/auth/v1',subject,expiresAt:now+300},{issuer,subject:'not-a-uuid',expiresAt:now+300}])
    assert.equal((await fixture([entry])(await verified(),deps())).exceptionMatched,false);
});
test('signature-only and forged contexts fail before app admission and snapshot reads',async()=>{
  let calls=0;const d=deps(row(),{checkAppSession:async()=>{calls++;},readAuthoritativeSnapshot:async()=>{calls++;return row();}});
  assert.throws(()=>evaluate({issuer,subject,expiresAt:now+300},d),/UNVERIFIED_AUTH_CONTEXT/);
  const signed=await verifyAccessToken(await token(),config.supabaseUrl,jwks);
  assert.throws(()=>evaluate(signed,d),/UNVERIFIED_AUTH_CONTEXT/);assert.equal(calls,0);
});
test('JWT with untrusted admin role, anonymous flag or wrong issuer is rejected',async()=>{
  for(const patch of [{role:'admin'},{is_anonymous:true},{iss:'https://evil.example/auth/v1'}]) await assert.rejects(verified(patch));
});
test('app session must succeed before snapshot read; outages/revocations deny',async()=>{
  let reads=0;const c=await verified();
  await assert.rejects(pass(c,deps(row(),{checkAppSession:async()=>{throw Error('revoked');},readAuthoritativeSnapshot:async()=>{reads++;return row();}})),/revoked/);assert.equal(reads,0);
  assert.throws(()=>evaluate(c,{}),/ADAPTER_UNAVAILABLE/);
  await assert.rejects(evaluate(c,deps(row(),{readAuthoritativeSnapshot:async()=>{throw Error('database unavailable');}})));
});
test('clients require exactly 30 unique authoritative lesson IDs; 29 never qualifies',async()=>{
  const c=await verified();
  const r=await evaluate(c,deps(row({lessonIds:full})));
  assert.equal(r.coursePrerequisiteMet,true);assert.equal(r.coreGraduated,true);assert.equal(r.studyPrerequisitesMet,false);locked(r);
  const partial=await evaluate(c,deps(row({lessonIds:full.slice(1)})));assert.equal(partial.coursePrerequisiteMet,false);assert.equal(partial.coreGraduated,false);
  for(const ids of [[...full.slice(1),30],[0,...full.slice(1)],[...full,31],Array(30),[1,'2']])await assert.rejects(evaluate(c,deps(row({lessonIds:ids}))));
});
test('malformed authoritative snapshots, missing fields and extra caller claims fail closed',async()=>{
  const c=await verified();
  for(const bad of [null,[],{},row({status:'mystery'}),row({justMarketsReferral:1}),row({automationConsent:'yes'}),row({email:'admin@example.test'}),row({lessonIds:[1,1]})])await assert.rejects(pass(c,deps(bad)),/SNAPSHOT_INVALID/);
});
test('suspended/revoked users denied even if pass and every other prerequisite match',async()=>{
  const c=await verified();for(const status of ['suspended','revoked'])for(const policy of [pass,evaluate])await assert.rejects(policy(c,deps(row({status,lessonIds:full}))),/PRIORITY_(SUSPENDED|REVOKED)/);
});
test('expired, nonfinite and exact-boundary exception expiry never matches',async()=>{
  const c=await verified();for(const expiresAt of [now-1,now,NaN,Infinity])assert.equal((await fixture([{issuer,subject,expiresAt}])(c,deps())).exceptionMatched,false);
});
test('linking, independent consent, activation and exact worker acknowledgement cannot be waived',async()=>{
  const c=await verified();const all=row({accountLinkedAndOwnershipVerified:true,automationConsent:true,tradingActivated:true,exactWorkerAcknowledgementVerified:true});
  for(const key of ['accountLinkedAndOwnershipVerified','automationConsent','tradingActivated','exactWorkerAcknowledgementVerified']){
    const r=await pass(c,deps({...all,[key]:false}));assert.equal(r.activationPrerequisitesMet,false,key);locked(r);
  }
});
test('modeled fully eligible admin/client never enables delivery automation or trading',async()=>{
  const c=await verified();const all=row({lessonIds:full,justMarketsReferral:true,justMarketsDeposit:true,accountLinkedAndOwnershipVerified:true,automationConsent:true,tradingActivated:true,exactWorkerAcknowledgementVerified:true});
  for(const policy of [pass,evaluate]){const r=await policy(c,deps(all));assert.equal(r.activationPrerequisitesMet,true);locked(r);assert.ok(Object.isFrozen(r));}
});
test('policy returns only booleans and progress counts, never lessons or assessment content',async()=>{
  const r=await pass(await verified(),deps());for(const [k,v]of Object.entries(r))assert.ok(typeof v==='boolean'||(k==='coreCompleted'||k==='coreTotal')&&typeof v==='number');assert.equal(Object.hasOwn(r,'lessonIds'),false);
});
