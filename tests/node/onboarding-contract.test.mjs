import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOnboarding} from '../../lib/server/onboarding-contract.ts';
const base=()=>({gates:[{gate:'referral',status:'pending'},{gate:'deposit',status:'pending'},{gate:'core_completion',status:'pending'}],progress:{coreCompleted:0,coreTotal:30},linking:'pending',consent:'pending',activation:'pending',deliveryEnabled:false,automationEligible:false,tradingEligible:false,eligibilitySatisfied:false});
test('authoritative zero-progress pending client remains locked and private identity fields are projected out',()=>{
  const dto=validateOnboarding({...base(),subject:'private-subject',email:'not-for-client@example.test'});assert.equal(dto.progress.coreCompleted,0);assert.equal(dto.eligibilitySatisfied,false);assert.equal('subject' in dto,false);assert.equal('email' in dto,false);
});
test('all three UUID-waived gates satisfy prerequisites without manufacturing completion or enabling trading',()=>{
  const b=base();b.gates.forEach(g=>g.status='waived');b.eligibilitySatisfied=true;
  const dto=validateOnboarding(b);assert.equal(dto.progress.coreCompleted,0);assert.equal(dto.deliveryEnabled,false);assert.equal(dto.automationEligible,false);assert.equal(dto.tradingEligible,false);
});
test('onboarding rejects boolean enablement, fake completion, inconsistent counts and expanded gate payloads',()=>{
  const variants=[];for(const key of ['deliveryEnabled','automationEligible','tradingEligible','linking','consent','activation'])variants.push({...base(),[key]:true});
  variants.push({...base(),progress:{coreCompleted:31,coreTotal:30}},{...base(),progress:{coreCompleted:30,coreTotal:30}},{...base(),eligibilitySatisfied:true});
  const fake=base();fake.gates[2].status='complete';variants.push(fake);
  const expanded=base();expanded.gates[0].subject='forged';variants.push(expanded);
  for(const v of variants)assert.throws(()=>validateOnboarding(v),e=>e.code==='ONBOARDING_RESPONSE_INVALID');
});
test('exact thirty real completions remain distinguishable from an admin waiver',()=>{
  const b=base();b.gates.forEach(g=>g.status='complete');b.progress.coreCompleted=30;b.eligibilitySatisfied=true;
  assert.equal(validateOnboarding(b).progress.coreCompleted,30);
});
