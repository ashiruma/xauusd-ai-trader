import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmSignupEmail } from '../../lib/server/email-confirmation-provider.ts';
const env={VELARION_SUPABASE_URL:'https://akhftbbszejafxpoxiem.supabase.co',VELARION_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',VELARION_APP_ORIGIN:'https://preview.example.test'};
const id='a7c3ac86-e967-4c30-8c19-7c778212150f';
const sid='26a60a46-d816-448a-9b2f-1cb39738212f';
const jwt=claims=>`${Buffer.from('{"alg":"ES256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.synthetic`;
const token=jwt({sub:id,session_id:sid});
const user={id,email:'member@example.test',email_confirmed_at:'2026-01-01T00:00:00Z',is_anonymous:false};
const session={access_token:token,refresh_token:'synthetic-refresh',token_type:'bearer',user};
const input={email:'Member@Example.test',code:'001234'};
const error=(p,code='EMAIL_CONFIRMATION_REJECTED',status=400)=>assert.rejects(p,e=>e.code===code&&e.status===status);
function mock(options={}){const calls=[];return {calls,fetcher:async(url,init)=>{url=String(url);calls.push({url,init});assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');assert.ok(init.signal instanceof AbortSignal);assert.equal(init.headers.apikey,env.VELARION_SUPABASE_PUBLISHABLE_KEY);
if(url.endsWith('/verify'))return options.verify?options.verify():Response.json(session);
assert.equal(init.headers.Authorization,`Bearer ${(options.access??token)}`);
if(url.endsWith('/user'))return options.online?options.online():Response.json(user);
if(url.endsWith('/logout?scope=local'))return options.cleanup?options.cleanup():new Response(null,{status:204});
throw Error('Unexpected request; no live network allowed');}};}
test('real flat HTTP200 verify response leads to online lookup then local204 cleanup and returns void',async()=>{
const {calls,fetcher}=mock();assert.equal(await confirmSignupEmail(input,env,fetcher),undefined);assert.equal(calls.length,3);
assert.deepEqual(JSON.parse(calls[0].init.body),{email:'member@example.test',token:'001234',type:'signup'});
assert.equal(calls[0].init.method,'POST');assert.equal(calls[1].init.method,'GET');assert.equal(calls[2].init.method,'POST');assert.equal(calls[2].init.body,undefined);
assert.ok(calls.every(c=>c.url.startsWith(env.VELARION_SUPABASE_URL+'/auth/v1/')));
assert.doesNotMatch(JSON.stringify(calls.map(c=>c.url)),/refresh_token|001234|scope=global/);
});
test('expired, replay, unknown and rejected codes have identical public errors',async()=>{
for(const status of [400,401,403,409,422]){const {calls,fetcher}=mock({verify:()=>Response.json({error:'sensitive provider reason'},{status})});await error(confirmSignupEmail(input,env,fetcher));assert.equal(calls.length,1);}
});
test('upstream500 and429 fail closed without exposing provider details',async()=>{
for(const status of [500,429]){const {fetcher}=mock({verify:()=>Response.json({message:'sensitive'},{status})});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);}
});
test('HTTP204 verification is not a valid session-bearing success',async()=>{
const {calls,fetcher}=mock({verify:()=>new Response(null,{status:204})});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,1);
});
test('SDK-shaped nested response cannot be mistaken for raw API success',async()=>{
const {calls,fetcher}=mock({verify:()=>Response.json({session,user})});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,1);
});
test('malformed result retaining session-bound token is locally cleaned up',async()=>{
for(const patch of [{refresh_token:null},{user:null}]){const {calls,fetcher}=mock({verify:()=>Response.json({...session,...patch})});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,2);assert.match(calls[1].url,/logout\?scope=local$/);}
});
test('no session_id never invokes logout that could fall back to global',async()=>{
const access=jwt({sub:id});const {calls,fetcher}=mock({access,verify:()=>Response.json({...session,access_token:access})});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,1);
});
test('wrong email, subject, unconfirmed, banned, deleted, anonymous and future confirmation fail after cleanup',async()=>{
for(const patch of [{email:'other@example.test'},{id:sid},{email_confirmed_at:null},{banned_until:'2999-01-01T00:00:00Z'},{banned_until:'invalid'},{deleted_at:'2026-01-01T00:00:00Z'},{is_anonymous:true},{is_anonymous:undefined},{email_confirmed_at:'2999-01-01T00:00:00Z'}]){const {calls,fetcher}=mock({online:()=>Response.json({...user,...patch})});await error(confirmSignupEmail(input,env,fetcher));assert.equal(calls.length,3);assert.match(calls[2].url,/logout\?scope=local$/);}
});
test('online lookup outage or parse failure still attempts cleanup',async()=>{
for(const online of [()=>{throw Error('offline')},()=>Response.json({},{status:500}),()=>new Response('not JSON')]){const {calls,fetcher}=mock({online});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,3);}
});
test('logout404,500,200 or timeout never means confirmation success and is not retried',async()=>{
for(const cleanup of [()=>new Response(null,{status:404}),()=>new Response(null,{status:500}),()=>Response.json({}),()=>{throw Error('timeout')}]){const {calls,fetcher}=mock({cleanup});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,3);}
});
test('ambiguous verify/network/redirect failures are never retried',async()=>{
for(const reason of ['timeout','redirect']){const {calls,fetcher}=mock({verify:()=>{throw new TypeError(reason)}});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,1);}
});
test('invalid JSON success is unavailable and cannot manufacture cleanup credentials',async()=>{
const {calls,fetcher}=mock({verify:()=>new Response('bad JSON')});await error(confirmSignupEmail(input,env,fetcher),'EMAIL_CONFIRMATION_UNAVAILABLE',503);assert.equal(calls.length,1);
});
test('invalid code and email values fail before any network',async()=>{
for(const patch of [{code:''},{code:'12345'},{code:123456},{code:'1234567'},{code:'secret-code'},{email:'bad'},{email:'x'.repeat(255)+'@y.test'}]){const {calls,fetcher}=mock();await error(confirmSignupEmail({...input,...patch},env,fetcher));assert.equal(calls.length,0);}
});
test('config is pinned to staging and publishable-only',async()=>{
for(const patch of [{VELARION_SUPABASE_URL:'https://evil.test'},{VELARION_SUPABASE_PUBLISHABLE_KEY:'sb_secret_never'},{VELARION_APP_ORIGIN:'http://preview.example.test'}]){const {calls,fetcher}=mock();await assert.rejects(confirmSignupEmail(input,{...env,...patch},fetcher),e=>e.code==='AUTH_CONFIG_UNAVAILABLE'||e.code==='AUTH_CONFIG_INVALID');assert.equal(calls.length,0);}
});
