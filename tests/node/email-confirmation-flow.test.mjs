import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createIntegratedHttp } from '../../lib/server/integrated-http-core.ts';
import { createIntegratedAuth } from '../../lib/server/integrated-auth-core.ts';
import { readConfirmation, readCredentials } from '../../lib/server/auth-body.ts';
import { BffError } from '../../lib/server/core.ts';
const origin = 'https://preview.example.test';
const input = { email: 'Member@Example.test', code: '001234' };
const request = (body=input, headers={}, path='/api/auth/confirm') => new Request(origin+path, { method:'POST', headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body) });
function setup(overrides={}) {
  const calls=[];
  const http=createIntegratedHttp({origin:()=>origin,runtime:()=>{throw Error('confirmation must never create app runtime')},rateLimit:async scope=>calls.push(scope),confirmEmail:async i=>calls.push(i),...overrides});
  return {http,calls};
}
test('confirmation works without any cookie and consumes three server-owned budgets before provider',async()=>{
  const {http,calls}=setup();const r=await http.confirm(request());assert.equal(r.status,200);
  assert.deepEqual(calls,['confirmation','credentials:member@example.test','confirmation-email:member@example.test',{email:'member@example.test',code:'001234'}]);
  assert.equal(r.headers.get('set-cookie'),null);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  const out=await r.json();assert.equal(out.emailConfirmed,true);
  for(const flag of ['authenticated','providerAuthenticated','bffAuthorized','connected','courseDeliveryEnabled','automationEligible','tradingEnabled']) assert.equal(out[flag],false);
  assert.doesNotMatch(JSON.stringify(out),/001234|member@example|access_token|refresh_token|capability/);
});
test('original, foreign, forged and duplicate cookies have no authority in confirmation',async()=>{
  for(const Cookie of ['',`__Host-velarion-session=${'a'.repeat(64)}`,`__Host-velarion-session=${'a'.repeat(64)}; __Host-velarion-session=${'b'.repeat(64)}`,'velarion_admin_token=forged; __Host-velarion-auth=forged']) {
    const {http}=setup();const r=await http.confirm(request(input,{Cookie}));assert.equal(r.status,200);assert.equal(r.headers.get('set-cookie'),null);
  }
});
test('foreign or missing Origin, cross-site metadata and unconfigured origin deny before any work',async()=>{
  for(const headers of [{Origin:'https://evil.test'},{Origin:''},{'Sec-Fetch-Site':'cross-site'}]){const {http,calls}=setup();assert.equal((await http.confirm(request(input,headers))).status,403);assert.deepEqual(calls,[]);}
  const {http,calls}=setup({origin:()=>undefined});assert.equal((await http.confirm(request())).status,503);assert.deepEqual(calls,[]);
});
test('strict code/email body refuses token, password, type, identity and query input',async()=>{
  const variants=[{...input,token:'fake'},{...input,password:'broker-secret'},{...input,type:'recovery'},{...input,subject:'fake'},{...input,code:'12345'},{...input,code:123456},{...input,code:'1234567'},{...input,email:'bad'},[],null];
  for(const body of variants){const {http,calls}=setup();assert.equal((await http.confirm(request(body))).status,400);assert.deepEqual(calls,[]);}
  const {http,calls}=setup();assert.equal((await http.confirm(request(input,{},'/api/auth/confirm?code=123456'))).status,400);assert.deepEqual(calls,[]);
});
test('body size, invalid UTF8/JSON, MIME and slow stream limits remain bounded',async()=>{
  const {http}=setup();assert.equal((await http.confirm(request('x'.repeat(4097)))).status,413);
  assert.equal((await http.confirm(request('{'))).status,400);assert.equal((await http.confirm(request(input,{'Content-Type':'text/plain'}))).status,415);
  const utf=new Request(origin,{method:'POST',headers:{'Content-Type':'application/json'},body:new Uint8Array([255])});await assert.rejects(readConfirmation(utf),e=>e.code==='INVALID_JSON');
  const stream=new ReadableStream({start(){}});const slow=new Request(origin,{method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'});await assert.rejects(readConfirmation(slow,10),e=>e.code==='BODY_TIMEOUT');
});
test('each limiter failure stops before verification; storage/config failure cannot grant access',async()=>{
  for(let fail=0;fail<3;fail++){let count=0,verified=false;const {http}=setup({rateLimit:async()=>{if(count++===fail)throw new BffError('AUTH_RATE_LIMITED',429)},confirmEmail:async()=>{verified=true}});const r=await http.confirm(request());assert.equal(r.status,429);assert.equal(verified,false);assert.equal(r.headers.get('set-cookie'),null);}
  const {http}=setup({confirmEmail:undefined});assert.equal((await http.confirm(request())).status,503);
});
test('expired, invalid, replay and unknown codes disclose neither email nor provider error',async()=>{
  for(const reason of ['expired','invalid','replay','unknown']){const {http}=setup({confirmEmail:async()=>{throw new BffError('EMAIL_CONFIRMATION_REJECTED',400)}});const r=await http.confirm(request());assert.equal(r.status,400);const out=await r.json();assert.equal(out.error,'EMAIL_CONFIRMATION_REJECTED');assert.equal(out.authenticated,false);assert.doesNotMatch(JSON.stringify(out),/Member@|001234/);}
});
test('signup stores no PKCE proof/session; expired original capability cannot affect later confirmation',async()=>{
  let record;let writes=0;const events=[];
  const vault={create:async(_,r)=>(record={...r,revision:1}),read:async()=>record,cas:async(_,rev,r)=>(writes++,record={...r,revision:rev+1})};
  const core=createIntegratedAuth({vault,provider:{signup:async()=>({'test-code-verifier':'synthetic-secret'}),callback:async()=>{throw Error('must not exchange')}},db:new Proxy({}, {get(){return ()=>{events.push('db');throw Error('must not admit')}}})});
  const cap=await core.begin();const out=await core.signup(cap,{email:'member@example.test',password:'synthetic-only'});
  assert.equal(out.providerAuthenticated,false);assert.equal(record.state,'awaiting-email');assert.equal(record.storage,null);assert.doesNotMatch(JSON.stringify(record),/synthetic-secret|accessToken|refreshToken/);
  await assert.rejects(core.callback(cap,'old-code'),e=>e.code==='PASSWORD_SIGN_IN_REQUIRED');assert.deepEqual(events,[]);assert.equal(writes,2);
  await assert.rejects(core.session(cap),e=>e.code==='FRESH_LOGIN_REQUIRED');
  await assert.rejects(core.recover(cap),e=>e.code==='FRESH_LOGIN_REQUIRED');
  await assert.rejects(core.context(cap),e=>e.code==='ACCESS_PENDING');
  const {http}=setup();assert.equal((await http.confirm(request())).status,200);
});
test('all old callbacks discard query values and cannot invoke runtime or issue cookies',async()=>{
  const {http,calls}=setup();for(const search of ['?code=abc','?code=a&code=b','?token_hash=bearer&type=email','?next=https://evil.test','']){const r=await http.callback(new Request(origin+'/auth/callback'+search));assert.equal(r.status,303);assert.equal(r.headers.get('location'),origin+'/auth/confirm');assert.equal(r.headers.get('set-cookie'),null);}assert.deepEqual(calls,[]);
});
test('normal password reader still rejects broker/token/identity fields and requires signup length',async()=>{
  assert.deepEqual(await readCredentials(request({email:'x@y.test',password:'pw'}),false),{email:'x@y.test',password:'pw'});
  await assert.rejects(readCredentials(request({email:'x@y.test',password:'pw'}),true),e=>e.code==='CREDENTIALS_INVALID');
  await assert.rejects(readCredentials(request({email:'x@y.test',password:'pw',token:'forged'}),false),e=>e.code==='CREDENTIALS_INVALID');
});
test('confirmation UI uses no session storage or begin/login call, asks no broker password, requires explicit sign-in',async()=>{
  const page=await readFile(new URL('../../app/auth/confirm/page.tsx',import.meta.url),'utf8');
  assert.match(page,/credentials: 'omit'/);assert.match(page,/autoComplete="one-time-code"/);assert.match(page,/Never enter a JustMarkets or MT5 password/);assert.match(page,/href="\/login"/);
  assert.doesNotMatch(page,/localStorage|sessionStorage|document\.cookie|\/api\/auth\/begin|\/api\/auth\/login|window\.location|token_hash|access_token|refresh_token/);
});
