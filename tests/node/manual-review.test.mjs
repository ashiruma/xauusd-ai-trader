import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BffError } from '../../lib/server/core.ts';
import { parseSubmission, parseDecision, normalizeMt5Id, createReviewHttp, reviewConfigured, projectReviewResponse } from '../../lib/server/manual-review-core.ts';
const origin = 'https://staging.example.com';
const submission = {stage:'demo',brokerEmail:'Person@Example.com',mt5Id:'00012345',server:'JustMarkets-Demo',evidenceReference:'case:demo-123'};
const decision = {reviewId:'11111111-1111-4111-8111-111111111111',expectedRevision:0,decision:'verified',note:'Matched independent broker partner record.',evidenceReference:'case:review-1',ownershipConfirmed:true,attributionConfirmed:true,depositUsdCents:null};
const request = (body = submission, headers = {}, method = 'POST') => new Request(`${origin}/api/onboarding/review`, {method, headers:{Origin:origin,'Content-Type':'application/json',...headers}, ...(method === 'POST' ? {body:JSON.stringify(body)} : {})});
const handler = (override = {}) => createReviewHttp({enabled:()=>true,origin:()=>origin,execute:async()=>({}),...override});
test('MT5 IDs remain normalized strings including leading zeroes, separate from referral codes',()=>{
  assert.equal(normalizeMt5Id(' 00012345 '),'00012345');
  for (const bad of [12345,'tohstb0d83','1e5','+123','12 34','１２３','', '1'.repeat(21)]) assert.throws(()=>normalizeMt5Id(bad));
  assert.equal(parseSubmission(submission).brokerEmail,'person@example.com');
});
test('submission rejects authority fields, passwords, extra fields and remote evidence URLs',()=>{
  for (const field of ['subject','issuer','userId','reviewerId','status','referralCode','password','accessToken','completedLessons']) assert.throws(()=>parseSubmission({...submission,[field]:'forged'}));
  for (const evidenceReference of ['https://attacker.example/a','x\nsecret','']) assert.throws(()=>parseSubmission({...submission,evidenceReference}));
});
test('decisions require bounded notes, exact fields, independent attribution and ownership',()=>{
  assert.equal(parseDecision(decision).expectedRevision,0);
  for (const patch of [{expectedRevision:-1},{expectedRevision:'0'},{note:'ok'},{ownershipConfirmed:false},{attributionConfirmed:false},{depositUsdCents:50.5},{depositUsdCents:-1},{subject:'forged'},{reviewId:'not-a-uuid'}]) assert.throws(()=>parseDecision({...decision,...patch}));
});
test('disabled workflow never invokes auth or database and never returns activation',async()=>{
  let calls=0; const run=handler({enabled:()=>false,execute:async()=>{calls++;return {};}});
  const r=await run(request(),'self_submit'); assert.equal(r.status,503);assert.equal(calls,0);
  const dto=await r.json();for(const k of ['connected','courseDeliveryEnabled','automationEligible','tradingEnabled'])assert.equal(dto[k],false);
  assert.match(r.headers.get('cache-control'),/no-store/);
});
test('cross-site, missing origin, query identity and unknown payload reject before database',async()=>{
  let calls=0; const run=handler({execute:async()=>{calls++;return {};}});
  for(const r of [request(submission,{Origin:'https://evil.example'}),request(submission,{'Sec-Fetch-Site':'cross-site'}),request({...submission,subject:'forged'}),new Request(`${origin}/api/onboarding/review?subject=forged`,{method:'GET'})])assert.equal((await run(r,r.method==='GET'?'self_read':'self_submit')).status>=400,true);
  assert.equal(calls,0);
});
test('stream byte limit enforces 4096 without trusting content length',async()=>{
  const r=await handler()(request({...submission,evidenceReference:'x'.repeat(5000)}),'self_submit');assert.equal(r.status,413);
});
test('authentication and role denials propagate closed without leaking database details',async()=>{
  for(const [code,status] of [['FRESH_LOGIN_REQUIRED',401],['REVIEW_ADMIN_REQUIRED',403]]){
    const r=await handler({execute:async()=>{throw new BffError(code,status);}})(request({}, {},'GET'),'admin_queue');assert.equal(r.status,status);
  }
  const r=await handler({execute:async()=>{throw new Error('private connection URL');}})(request({}, {},'GET'),'admin_queue');assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/private connection/);
});
test('fixed operations never accept user-selected identity and forced flags override SQL output',async()=>{
  let seen;const r=await handler({execute:async(op,payload)=>{seen={op,payload};return {success:true,tradingEnabled:true,automationEligible:true};}})(request(decision),'admin_decide');
  assert.deepEqual(seen,{op:'admin_decide',payload:decision});const body=await r.json();assert.equal(body.tradingEnabled,false);assert.equal(body.automationEligible,false);
});
test('configuration fails closed for missing, partial, wrong or truthy-but-not-exact flags',()=>{
  for(const env of [{},{VELARION_MANUAL_REVIEW_ENABLED:'true'},{VELARION_MANUAL_REVIEW_ENABLED:'1',VELARION_MANUAL_REVIEW_SCHEMA:'manual-broker-review-v1'},{VELARION_MANUAL_REVIEW_ENABLED:'true',VELARION_MANUAL_REVIEW_SCHEMA:'wrong'}])assert.equal(reviewConfigured(env),false);
  assert.equal(reviewConfigured({VELARION_MANUAL_REVIEW_ENABLED:'true',VELARION_MANUAL_REVIEW_SCHEMA:'manual-broker-review-v1'}),true);
});
test('self projection drops internal notes, identities, histories and unknown secret columns',()=>{
  const item={id:decision.reviewId,stage:'demo',brokerEmail:'person@example.com',mt5Id:'001',server:'JustMarkets-Demo',referralCode:'tohstb0d83',status:'submitted',revision:1,submittedAt:'2026-10-21T00:00:00Z',evidenceReference:'case:1',latestNote:'internal',ownerSubject:'private',history:[{reviewerSubject:'private'}],accessToken:'private'};
  const projected=projectReviewResponse({submissions:[item],eligibility:{demoVerified:false,liveVerified:false,checkpointSatisfied:false},accessToken:'private'},'self_read');
  assert.doesNotMatch(JSON.stringify(projected),/private|internal|history|ownerSubject|accessToken/);
  assert.throws(()=>projectReviewResponse({submissions:[],eligibility:{demoVerified:false,liveVerified:true,checkpointSatisfied:true}},'self_read'));
});
test('new routes all use guarded runtime, which requires verified session and parameterized fixed SQL',async()=>{
  const read=p=>readFile(new URL(`../../${p}`,import.meta.url),'utf8');
  for(const p of ['app/api/onboarding/review/route.ts','app/api/admin/reviews/route.ts','app/api/admin/reviews/decision/route.ts'])assert.match(await read(p),/manualReviewHttp/);
  const runtime=await read('lib/server/manual-review-runtime.ts');
  for(const term of ['requireVerifiedContext(c)','integratedRuntime().context(capability)','velarion_review.workflow','reviewConfigured(process.env)'])assert.ok(runtime.includes(term),term);
  assert.doesNotMatch(runtime,/ADMIN_MASTER_SECRET|user_metadata|app_metadata|service_role|sql\.unsafe/);
});
