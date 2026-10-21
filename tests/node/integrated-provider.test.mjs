import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createFreshProvider } from '../../lib/server/integrated-provider.ts';
const env = { VELARION_SUPABASE_URL:'https://akhftbbszejafxpoxiem.supabase.co', VELARION_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic', VELARION_APP_ORIGIN:'https://staging.example.test' };
const user={id:'11111111-1111-4111-8111-111111111111',email:'test@example.test'};
const session={access_token:'synthetic-access-token',refresh_token:'synthetic-refresh-token',token_type:'bearer',expires_in:3600,user};
test('actual provider adapter owns PKCE verifier server-side and fixed callback, never depends on browser token storage',async()=>{
  const calls=[];let challenge;
  const p=createFreshProvider(env,async(input,init)=>{
    const url=String(input),body=JSON.parse(init.body);calls.push({url,init,body});
    assert.ok(url.startsWith(env.VELARION_SUPABASE_URL));assert.equal(init.cache,'no-store');assert.ok(init.signal instanceof AbortSignal);
    if(url.includes('/signup')){challenge=body.code_challenge;assert.equal(body.code_challenge_method,'s256');assert.ok(url.includes(encodeURIComponent(env.VELARION_APP_ORIGIN+'/auth/callback')));return Response.json({user,session:null});}
    if(url.includes('grant_type=pkce')){assert.equal(body.auth_code,'synthetic-code');assert.equal(createHash('sha256').update(body.code_verifier).digest('base64url'),challenge);return Response.json(session);}
    throw Error('unexpected mock operation');
  });
  const storage=await p.signup({email:user.email,password:'synthetic-password'});
  assert.ok(Object.keys(storage).length >= 1);for (const key of Object.keys(storage)) assert.match(key,/-code-verifier$/);
  assert.doesNotMatch(JSON.stringify(storage),/synthetic-access-token|synthetic-refresh-token/);
  const tokens=await p.callback('synthetic-code',storage);assert.equal(tokens.accessToken,session.access_token);assert.equal(tokens.refreshToken,session.refresh_token);
  assert.equal(calls.length,2);await assert.rejects(()=>p.callback('code',{}),e=>e.code==='PKCE_BROWSER_REQUIRED');
});
test('signup that unexpectedly auto-authenticates is rejected, never enrolled',async()=>{
  const p=createFreshProvider(env,async()=>Response.json(session));
  await assert.rejects(()=>p.signup({email:user.email,password:'synthetic-password'}),e=>e.code==='SIGNUP_CONFIRMATION_UNAVAILABLE');
});
test('password login and explicit refresh use separate fresh exchange methods; signout scope is explicit',async()=>{
  const calls=[];const p=createFreshProvider(env,async(input,init)=>{calls.push({url:String(input),init});return String(input).includes('/logout')?new Response(null,{status:204}):Response.json(session);});
  assert.equal((await p.login({email:user.email,password:'synthetic-password'})).accessToken,session.access_token);
  assert.equal((await p.refresh('synthetic-refresh-token')).accessToken,session.access_token);
  assert.equal(await p.signOut(session.access_token,'local'),true);
  assert.equal(await p.signOut(session.access_token,'global'),true);
  assert.match(calls[0].url,/grant_type=password/);assert.match(calls[1].url,/grant_type=refresh_token/);
  assert.match(calls[2].url,/scope=local/);assert.match(calls[3].url,/scope=global/);
});
