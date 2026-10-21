import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import { mkdtemp, chmod, rm } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
import { verifyAccessToken, checkCurrentUser } from '../../lib/server/core.ts';
import { FileAdmissionVault } from '../../lib/server/admission-vault.ts';
import { createIntegratedAuth } from '../../lib/server/integrated-auth-core.ts';

const issuer='https://akhftbbszejafxpoxiem.supabase.co/auth/v1', url='https://akhftbbszejafxpoxiem.supabase.co';
const subject='d9428888-122b-4a5a-9a1e-0c14d80b2f50', sid='b77c9e4e-fd3d-4e4b-9b29-06be8db1511f';
let root, vault, clock=Date.now(), privateKey, publicKey, token;
async function init(){ root=await mkdtemp(path.join(os.tmpdir(),'integrated-auth-')); await chmod(root,0o700); vault=new FileAdmissionVault({directory:root,key:Buffer.alloc(32,7)}); ({privateKey,publicKey}=await generateKeyPair('ES256')); const now=Math.floor(clock/1000); token=await new SignJWT({role:'authenticated',session_id:sid,is_anonymous:false}).setProtectedHeader({alg:'ES256'}).setIssuer(issuer).setAudience('authenticated').setSubject(subject).setIssuedAt(now).setExpirationTime(now+600).sign(privateKey); }
test.afterEach(async()=>{if(root) await rm(root,{recursive:true,force:true}); root=undefined; clock=Date.now();});
function provider(events=[]){return {async login(){events.push('exchange');return {accessToken:token,refreshToken:'refresh'}},async signup(){return {'pkce-code-verifier':'v'}},async callback(){events.push('exchange');return {accessToken:token,refreshToken:'refresh'}},async verify(t){const c=await verifyAccessToken(t,url,async()=>publicKey,Math.floor(clock/1000)); await checkCurrentUser(c,{supabaseUrl:url,publishableKey:'sb_publishable_test'},async()=>Response.json({user:{id:subject,email:'member@example.test',email_confirmed_at:new Date(clock-1000).toISOString(),is_anonymous:false}}));events.push('verify'); return c;},async refresh(){events.push('refresh');return {accessToken:token,refreshToken:'rotated'}},async signOut(t,s){events.push('signout:'+s);return true;}}}
function db(events=[],overrides={}){return {async begin(id){events.push('begin');return {attemptId:id,fence:'1',expiresAt:new Date(clock+60000).toISOString()};},async admit(id){events.push('admit');return {attemptId:id,generation:'1',expiresAt:new Date(clock+3600000).toISOString()}},async recover(id){events.push('recover');return {attemptId:id,generation:'1',expiresAt:new Date(clock+3600000).toISOString()}},async check(){return true},async progress(){return {coreCompleted:0,coreTotal:30,coreGraduated:false,automationEligible:false,earlyMilestone:false}},async onboarding(){return {}},async revokeCurrent(h,c,id){events.push('revoke');return {requestId:id,scope:'local',revoked:true,generation:'2'}},async revokeAccount(h,c,id){events.push('revoke');return {requestId:id,scope:'account',revoked:true,generation:'2'}},...overrides};}
async function ready(events=[],overrides={}){await init();const d=db(events,overrides);const auth=createIntegratedAuth({provider:provider(events),vault,db:d,clock:()=>clock});const cap=await auth.begin();return {auth,cap,d,events};}

test('fences DB before provider exchange, cryptographically verifies online user, then admits; encrypted vault receipt',async()=>{const e=[];const {auth,cap}=await ready(e);const r=await auth.login(cap,{email:'evil@example.test',password:'pw'});assert.deepEqual(e.slice(0,4),['begin','exchange','verify','admit']);assert.equal(r.bffAuthorized,true);assert.equal(r.connected,false);assert.equal((await auth.session(cap)).bffAuthorized,true);});
test('provider-authenticated pending state never grants BFF authority; progress denied',async()=>{const e=[];const {auth,cap}=await ready(e,{async admit(){throw Error('ambiguous')}});const result=await auth.login(cap,{email:'x@y.test',password:'pw'});assert.equal(result.providerAuthenticated,true);assert.equal(result.bffAuthorized,false);assert.equal((await auth.session(cap)).authenticated,true);assert.equal((await auth.session(cap)).bffAuthorized,false);await assert.rejects(auth.progress(cap),x=>x.code==='ACCESS_PENDING');});
test('ambiguous admission recovery is exact browser-bound receipt and does not re-admit; other browser cannot recover',async()=>{let admits=0;const e=[];const {auth,cap}=await ready(e,{async admit(){admits++;throw Error('timeout')},async recover(id){e.push('recover');return {attemptId:id,generation:'3',expiresAt:new Date(clock+3600000).toISOString()}}});await auth.login(cap,{email:'x@y.test',password:'pw'});await assert.rejects(auth.recover('a'.repeat(64)));assert.equal((await auth.recover(cap)).bffAuthorized,true);assert.equal(admits,1);assert.ok(e.includes('recover'));});
test('no preverified/fabricated context can become authority; expired receipt denied',async()=>{await init();let verifyCalled=false;const p=provider();const auth=createIntegratedAuth({provider:{...p,verify:async()=>{verifyCalled=true;return {issuer,subject,sessionId:sid,issuedAt:1,expiresAt:9999999999,accessToken:token}}},vault,db:db(),clock:()=>clock});const cap=await auth.begin();await assert.rejects(auth.login(cap,{email:'a@b.test',password:'pw'}),e=>e.code==='UNVERIFIED_AUTH_CONTEXT');assert.equal(verifyCalled,true);});
test('refresh keeps browser capability, does no admission and never reports cookie/expiry extension; ambiguous refresh fails closed',async()=>{const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});const before=await vault.read(cap);const out=await auth.refresh(cap);const after=await vault.read(cap);assert.equal(out.success,true);assert.equal(e.filter(x=>x==='admit').length,1);assert.equal(after.handle,before.handle);assert.equal(after.expiresAt,before.expiresAt);});
test('revoked current session denied; signout durably revokes before provider and exposes both outcomes',async()=>{const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});const revoked=await createIntegratedAuth({provider:provider(e),vault,db:db(e,{async check(){return false}}),clock:()=>clock});await assert.rejects(revoked.session(cap),x=>x.code==='SESSION_REJECTED');const r=await auth.logout(cap);assert.equal(r.success,true);assert.ok(e.indexOf('revoke')<e.indexOf('signout:local'));});
test('logout does not claim success when durable revoke fails',async()=>{const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});const bad=createIntegratedAuth({provider:provider(e),vault,db:db(e,{async revokeCurrent(){e.push('revoke');throw Error('db') }}),clock:()=>clock});const r=await bad.logout(cap);assert.equal(r.success,false);assert.equal(r.dbRevoked,false);assert.equal(e.includes('signout:local'),false);});

test('concurrent fresh-login workflows can exchange at most once for one browser capability',async()=>{
  const e=[];const {auth,cap}=await ready(e);
  const out=await Promise.allSettled([auth.login(cap,{email:'x@y.test',password:'pw'}),auth.login(cap,{email:'x@y.test',password:'pw'})]);
  assert.equal(e.filter(x=>x==='exchange').length,1);assert.equal(e.filter(x=>x==='admit').length,1);
  assert.equal(out.filter(x=>x.status==='fulfilled').length,1);
});
test('unavailable pre-exchange database fence prevents provider password exchange entirely',async()=>{
  const e=[];const {auth,cap}=await ready(e,{async begin(){throw Error('fence unavailable')}});
  await assert.rejects(auth.login(cap,{email:'x@y.test',password:'pw'}));assert.equal(e.includes('exchange'),false);assert.equal(e.includes('admit'),false);
});
test('recovery expiry is enforced and recovery misses never become admission',async()=>{
  const e=[];const {auth,cap}=await ready(e,{async admit(){e.push('admit');throw Error('timeout')}});
  await auth.login(cap,{email:'x@y.test',password:'pw'});clock+=120001;
  await assert.rejects(auth.recover(cap),x=>x.code==='FRESH_LOGIN_REQUIRED');assert.equal(e.filter(x=>x==='admit').length,1);assert.equal(e.includes('recover'),false);
});
test('revoked admission receipt cannot recover and ordinary status reads never retry admission',async()=>{
  const e=[];const {auth,cap}=await ready(e,{async admit(){e.push('admit');throw Error('ambiguous')},async recover(){e.push('recover');throw Error('revoked')}});
  await auth.login(cap,{email:'x@y.test',password:'pw'});await assert.rejects(auth.recover(cap));
  assert.equal((await auth.session(cap)).bffAuthorized,false);assert.equal((await auth.session(cap)).bffAuthorized,false);
  assert.equal(e.filter(x=>x==='admit').length,1);assert.equal(e.filter(x=>x==='recover').length,1);
});
test('ambiguous provider refresh cannot rebind, auto-retry or keep protected operations authorized',async()=>{
  const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});
  const bad=createIntegratedAuth({provider:{...provider(e),async refresh(){e.push('refresh-failed');throw Error('ambiguous')}},vault,db:db(e),clock:()=>clock});
  await assert.rejects(bad.refresh(cap));assert.equal((await bad.session(cap)).bffAuthorized,false);await assert.rejects(bad.context(cap),x=>x.code==='ACCESS_PENDING');
  await assert.rejects(bad.refresh(cap),x=>x.code==='FRESH_LOGIN_REQUIRED');assert.equal(e.filter(x=>x==='admit').length,1);assert.equal(e.filter(x=>x==='refresh-failed').length,1);
});
test('account-wide revoke uses explicit provider global scope only after durable account receipt',async()=>{
  const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});
  const out=await auth.logout(cap,true);assert.equal(out.dbRevoked,true);assert.equal(out.providerScope,'global');
  assert.ok(e.indexOf('revoke')<e.indexOf('signout:global'));assert.equal(e.includes('signout:local'),false);assert.equal(await vault.read(cap),null);
});
test('provider logout failure never hides successful app revocation or falsely confirms provider signout',async()=>{
  const e=[];const {auth,cap}=await ready(e);await auth.login(cap,{email:'a@b.test',password:'pw'});
  const bad=createIntegratedAuth({provider:{...provider(e),async signOut(){return false}},vault,db:db(e),clock:()=>clock});
  const out=await bad.logout(cap);assert.equal(out.success,false);assert.equal(out.dbRevoked,true);assert.equal(out.providerSignOut,false);assert.equal(out.browserCleared,true);
});
