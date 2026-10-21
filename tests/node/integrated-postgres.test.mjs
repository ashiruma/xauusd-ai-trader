import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import path from 'node:path';
import postgres from 'postgres';
import { generateKeyPair, SignJWT } from 'jose';
import { createAdmissionQueries } from '../../lib/server/admission-db.ts';
import { PostgresAdmissionVault } from '../../lib/server/postgres-admission-vault.ts';
import { createIntegratedAuth } from '../../lib/server/integrated-auth-core.ts';
import { verifyAccessToken, checkCurrentUser } from '../../lib/server/core.ts';
const socket=process.env.VELARION_LOCAL_TEST_SOCKET;
// This adapter never consumes the hosted database URL or enables a runtime test-mode route.
test('real isolated PG + encrypted vault + verified online identity: admission, pending access, refresh, exact recovery and account revoke', {skip:!socket?'requires isolated Unix-socket fixture, never a hosted database':false},async()=>{
  assert.ok(path.isAbsolute(socket));
  assert.match(socket, /(?:velarion|onboarding|run-)/);
  assert.ok(!socket.includes('://'));
  const sql=postgres({host:socket,port:1,username:'ubuntu',database:'postgres',max:1,prepare:false,connect_timeout:3,onnotice:()=>{},debug:()=>{}});
  const sql2=postgres({host:socket,port:1,username:'ubuntu',database:'postgres',max:1,prepare:false,max_pipeline:1,connect_timeout:3,onnotice:()=>{},debug:()=>{}});
  const key=randomBytes(32),vault=new PostgresAdmissionVault(sql,{key});
  const vault2=new PostgresAdmissionVault(sql2,{key});
  const {privateKey,publicKey}=await generateKeyPair('ES256');
  const url='https://akhftbbszejafxpoxiem.supabase.co',issuer=url+'/auth/v1';
  const subject=randomUUID(),learner=randomUUID();
  try {
    await sql`SET ROLE velarion_owner`;
    await sql`INSERT INTO velarion_private.auth_issuers(issuer,enabled) VALUES(${issuer},true) ON CONFLICT(issuer) DO UPDATE SET enabled=true`;
    await sql`INSERT INTO velarion_private.learners(id,state) VALUES(${learner}::uuid,'active')`;
    await sql`INSERT INTO velarion_private.identities(issuer,subject,learner_id,email_verified_at) VALUES(${issuer},${subject}::uuid,${learner}::uuid,clock_timestamp())`;
    await sql`SET ROLE velarion_bff`;
    await sql2`SET ROLE velarion_bff`;
    const database=createAdmissionQueries(sql);
    function provider(sub=subject){
      const sid=randomUUID();let token;
      async function issue(){const now=Math.floor(Date.now()/1000);token=await new SignJWT({role:'authenticated',session_id:sid,is_anonymous:false}).setProtectedHeader({alg:'ES256'}).setIssuer(issuer).setAudience('authenticated').setSubject(sub).setIssuedAt(now).setExpirationTime(now+600).sign(privateKey);return {accessToken:token,refreshToken:'synthetic-refresh-only'};}
      return {login:issue,refresh:issue,signup:async()=>({}),callback:issue,
        async verify(t){const c=await verifyAccessToken(t,url,async()=>publicKey);await checkCurrentUser(c,{supabaseUrl:url,publishableKey:'sb_publishable_test'},async()=>Response.json({user:{id:sub,email:'synthetic@example.test',email_confirmed_at:new Date(Date.now()-1000).toISOString(),is_anonymous:false}}));return c;},
        async signOut(_t,scope){assert.ok(['local','global'].includes(scope));return true;}};
    }
    const p=provider(),auth=createIntegratedAuth({provider:p,vault,db:database});
    const cap=await auth.begin();assert.equal((await auth.login(cap,{email:'not-an-authorization-key@example.test',password:'synthetic'})).bffAuthorized,true);
    assert.equal((await auth.session(cap)).bffAuthorized,true);
    const otherInstance=createIntegratedAuth({provider:p,vault:vault2,db:createAdmissionQueries(sql2)});
    assert.equal((await otherInstance.session(cap)).bffAuthorized,true); // Cold/fleet instance reads durable state.
    const status=await auth.onboarding(cap);assert.deepEqual(status.gates.map(g=>g.status),['pending','pending','pending']);assert.equal(status.progress.coreCompleted,0);assert.equal(status.deliveryEnabled,false);
    await assert.rejects(auth.progress(cap)); // No evidence or delivery, even for a legitimately admitted session.
    const before=await vault.read(cap);await auth.refresh(cap);const after=await vault.read(cap);assert.equal(after.handle,before.handle);assert.equal(after.expiresAt,before.expiresAt);
    const revoked=await auth.logout(cap,true);assert.equal(revoked.dbRevoked,true);assert.equal(revoked.providerSignOut,true);await assert.rejects(auth.session(cap));await assert.rejects(otherInstance.session(cap));
    // Simulate a real committed INSERT with its application response lost. Exact SQL recovery must succeed, never re-admit.
    let admits=0;
    const ambiguous=createIntegratedAuth({provider:provider(),vault,db:{...database,async admit(...args){admits++;await database.admit(...args);throw Error('simulated response loss after commit');}}});
    const cap2=await ambiguous.begin();assert.equal((await ambiguous.login(cap2,{email:'x@example.test',password:'synthetic'})).bffAuthorized,false);
    assert.equal((await ambiguous.session(cap2)).bffAuthorized,false);assert.equal((await ambiguous.recover(cap2)).bffAuthorized,true);assert.equal(admits,1);
    // A confirmed but independently unapproved subject reaches only authenticated pending-access.
    const unknown=createIntegratedAuth({provider:provider(randomUUID()),vault,db:database});const cap3=await unknown.begin();
    assert.equal((await unknown.login(cap3,{email:'same-email-is-not-authority@example.test',password:'synthetic'})).bffAuthorized,false);
    const pending=await unknown.session(cap3);assert.equal(pending.authenticated,true);assert.equal(pending.bffAuthorized,false);await assert.rejects(unknown.progress(cap3));await assert.rejects(unknown.recover(cap3));
    const receipt=await vault.read(cap2);const c=await p.verify(after.accessToken);
    await assert.rejects(database.check('0'.repeat(64),c));
    assert.equal(typeof receipt.generation,'string');
    // Two instances cannot both reach the provider exchange from the same browser ceremony.
    let exchanges=0;const baseProvider=provider();
    const racingProvider={...baseProvider,async login(){exchanges++;return baseProvider.login();}};
    const a=createIntegratedAuth({provider:racingProvider,vault,db:database});
    const b=createIntegratedAuth({provider:racingProvider,vault:vault2,db:createAdmissionQueries(sql2)});
    const raceCap=await a.begin();
    const race=await Promise.allSettled([a.login(raceCap,{email:'synthetic@example.test',password:'synthetic'}),b.login(raceCap,{email:'synthetic@example.test',password:'synthetic'})]);
    assert.equal(race.filter(r=>r.status==='fulfilled').length,1);assert.equal(exchanges,1);
  } finally {await sql.end({timeout:2});await sql2.end({timeout:2});}
});

test('real SQL waiver is exact-subject only; mismatched, expired, future and revoked evidence fail closed; no completion or downstream exemption', {skip:!socket?'requires isolated Unix-socket fixture, never a hosted database':false},async()=>{
  assert.ok(path.isAbsolute(socket));assert.match(socket,/(?:velarion|onboarding|run-)/);assert.ok(!socket.includes('://'));
  const sql=postgres({host:socket,port:1,username:'ubuntu',database:'postgres',max:1,prepare:false,connect_timeout:3,onnotice:()=>{},debug:()=>{}});
  const vault=new PostgresAdmissionVault(sql,{key:randomBytes(32)}),database=createAdmissionQueries(sql);
  const {privateKey,publicKey}=await generateKeyPair('ES256');
  const url='https://akhftbbszejafxpoxiem.supabase.co',issuer=url+'/auth/v1',learner=randomUUID(),a=randomUUID(),b=randomUUID();
  const owner=async(fn)=>{await sql`SET ROLE velarion_owner`;try{return await fn()}finally{await sql`SET ROLE velarion_bff`}};
  const evidence=async(kind,digest,when='valid')=>owner(async()=>{
    const id=randomUUID(),now=Date.now();
    const observed=new Date(now+(when==='future'?60000:-7200000)),until=new Date(now+(when==='expired'?-3600000:3600000));
    await sql`INSERT INTO velarion_private.eligibility_evidence(id,learner_id,broker,broker_subject_digest,kind,verifier,external_event_id,evidence_digest,observed_at,valid_until) VALUES(${id}::uuid,${learner}::uuid,'justmarkets',${digest},${kind},'synthetic-offline',${randomUUID()},'synthetic-digest',${observed.toISOString()}::timestamptz,${until.toISOString()}::timestamptz)`;
    return id;
  });
  const revoke=async(id)=>owner(()=>sql`INSERT INTO velarion_private.evidence_revocations(evidence_id,reason_code) VALUES(${id}::uuid,'synthetic-revoked')`);
  function provider(subject){const sid=randomUUID();return {
    async login(){const now=Math.floor(Date.now()/1000);return {accessToken:await new SignJWT({role:'authenticated',session_id:sid,is_anonymous:false}).setProtectedHeader({alg:'ES256'}).setIssuer(issuer).setAudience('authenticated').setSubject(subject).setIssuedAt(now).setExpirationTime(now+600).sign(privateKey),refreshToken:'synthetic-refresh'};},
    async verify(token){const c=await verifyAccessToken(token,url,async()=>publicKey);await checkCurrentUser(c,{supabaseUrl:url,publishableKey:'sb_publishable_test'},async()=>Response.json({user:{id:subject,email:'same@example.test',email_confirmed_at:new Date(Date.now()-1000).toISOString(),is_anonymous:false}}));return c;},
    async signup(){throw Error('not used')},async callback(){throw Error('not used')},async refresh(){throw Error('not used')},async signOut(){return true}
  }}
  try{
    await owner(async()=>{
      await sql`INSERT INTO velarion_private.auth_issuers(issuer,enabled) VALUES(${issuer},true) ON CONFLICT(issuer) DO UPDATE SET enabled=true`;
      await sql`INSERT INTO velarion_private.learners(id,state) VALUES(${learner}::uuid,'active')`;
      for(const subject of [a,b])await sql`INSERT INTO velarion_private.identities(issuer,subject,learner_id,email_verified_at) VALUES(${issuer},${subject}::uuid,${learner}::uuid,clock_timestamp())`;
      for(const scope of ['referral','deposit','core_completion'])await sql`INSERT INTO velarion_private.onboarding_waivers(issuer,subject,scope,expires_at,reason_code) VALUES(${issuer},${a}::uuid,${scope},clock_timestamp()+interval '1 hour','synthetic-local-test')`;
      await assert.rejects(sql`INSERT INTO velarion_private.onboarding_waivers(issuer,subject,scope,expires_at,reason_code) VALUES(${issuer},${a}::uuid,'linking',clock_timestamp()+interval '1 hour','forbidden-scope')`);
    });
    const authA=createIntegratedAuth({provider:provider(a),vault,db:database}),authB=createIntegratedAuth({provider:provider(b),vault,db:database});
    const ca=await authA.begin(),cb=await authB.begin();
    await authA.login(ca,{email:'same@example.test',password:'synthetic'});await authB.login(cb,{email:'same@example.test',password:'synthetic'});
    const sa=await authA.onboarding(ca),sb=await authB.onboarding(cb);
    assert.deepEqual(sa.gates.map(g=>g.status),['waived','waived','waived']);assert.equal(sa.progress.coreCompleted,0);assert.equal(sa.eligibilitySatisfied,true);
    assert.equal(sa.linking,'pending');assert.equal(sa.consent,'pending');assert.equal(sa.activation,'pending');assert.equal(sa.automationEligible,false);assert.equal(sa.tradingEligible,false);
    assert.deepEqual(sb.gates.map(g=>g.status),['pending','pending','pending']);
    await assert.rejects(authA.progress(ca),/Authorized content delivery is suspended/); // Waiver does NOT enable delivery.
    await assert.rejects(authB.progress(cb),/Verified current referral and deposit required/); // Alias cannot inherit A's pass.
    await owner(()=>sql`UPDATE velarion_private.onboarding_waivers SET created_at=clock_timestamp()-interval '2 hours',expires_at=clock_timestamp()-interval '1 hour' WHERE issuer=${issuer} AND subject=${a}::uuid`);
    assert.deepEqual((await authA.onboarding(ca)).gates.map(g=>g.status),['pending','pending','pending']);
    await assert.rejects(authA.progress(ca),/Verified current referral and deposit required/);
    await owner(()=>sql`UPDATE velarion_private.onboarding_waivers SET expires_at=clock_timestamp()+interval '1 hour' WHERE issuer=${issuer} AND subject=${a}::uuid`);
    await evidence('referral','account-a');await evidence('deposit','account-b');
    assert.deepEqual((await authB.onboarding(cb)).gates.map(g=>g.status),['pending','pending','pending']);
    await assert.rejects(authB.progress(cb),/Verified current referral and deposit required/);
    await evidence('deposit','account-a','expired');await evidence('deposit','account-a','future');
    await assert.rejects(authB.progress(cb),/Verified current referral and deposit required/);
    const matched=await evidence('deposit','account-a');
    assert.deepEqual((await authB.onboarding(cb)).gates.map(g=>g.status),['complete','complete','pending']);
    await assert.rejects(authB.progress(cb),/Authorized content delivery is suspended/);
    await revoke(matched);await assert.rejects(authB.progress(cb),/Verified current referral and deposit required/);
    // The separately gated online provider check cannot override current private identity/issuer/learner state.
    await owner(()=>sql`UPDATE velarion_private.identities SET disabled_at=clock_timestamp() WHERE issuer=${issuer} AND subject=${a}::uuid`);
    await assert.rejects(authA.session(ca));await assert.rejects(authA.onboarding(ca));
    await owner(()=>sql`UPDATE velarion_private.identities SET disabled_at=NULL WHERE issuer=${issuer} AND subject=${a}::uuid`);
    await owner(()=>sql`UPDATE velarion_private.auth_issuers SET enabled=false WHERE issuer=${issuer}`);
    await assert.rejects(authA.session(ca));await owner(()=>sql`UPDATE velarion_private.auth_issuers SET enabled=true WHERE issuer=${issuer}`);
    await owner(()=>sql`UPDATE velarion_private.learners SET state='suspended' WHERE id=${learner}::uuid`);await assert.rejects(authA.session(ca));
    const counts=await owner(()=>sql`SELECT (SELECT count(*)::int FROM velarion_private.completions WHERE learner_id=${learner}::uuid) AS completions,(SELECT count(*)::int FROM velarion_private.delivery_controls WHERE enabled) AS enabled`);
    assert.equal(counts[0].completions,0);assert.equal(counts[0].enabled,0);
    await assert.rejects(sql`SELECT * FROM velarion_private.onboarding_waivers`); // BFF gets no private-table read.
  } finally{await sql.end({timeout:2});}
});
