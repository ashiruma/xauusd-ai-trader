import test from 'node:test';
import assert from 'node:assert/strict';
import { authRateBudget } from '../../lib/server/auth-rate-policy.ts';
test('original begin and credentials/session budgets remain identical',()=>{
 for(const now of [0,59999,60000,899999,900000]){
  assert.deepEqual(authRateBudget('begin',now),{max:60,bucket:Math.floor(now/60000),expiresAt:(Math.floor(now/60000)+1)*60000});
  for(const scope of ['credentials:a@example.test','session:opaque','callback:opaque','confirmation'])assert.deepEqual(authRateBudget(scope,now),{max:6,bucket:Math.floor(now/60000),expiresAt:(Math.floor(now/60000)+1)*60000});
 }
});
test('confirmation email has six attempts per fixed15-minute bucket across devices',()=>{
 assert.deepEqual(authRateBudget('confirmation-email:a@example.test',0),{max:6,bucket:0,expiresAt:900000});
 assert.deepEqual(authRateBudget('confirmation-email:a@example.test',899999),{max:6,bucket:0,expiresAt:900000});
 assert.deepEqual(authRateBudget('confirmation-email:a@example.test',900000),{max:6,bucket:1,expiresAt:1800000});
});
