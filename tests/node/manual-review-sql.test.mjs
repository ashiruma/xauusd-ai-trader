import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=()=>readFile(new URL('../../sql/review/manual-broker-review.sql.review',import.meta.url),'utf8');
test('review SQL text has explicit approval, auth, binding and direct-access guards (not SQL behavioral validation)',async()=>{
  const sql=await source();for(const term of ["current_setting('velarion.manual_review_migration_approved',true)","IS DISTINCT FROM true","SET search_path=''","FOR SHARE","FOR UPDATE","admin_bindings","ENABLE ROW LEVEL SECURITY","REVOKE ALL ON ALL TABLES","REVOKE ALL ON ALL SEQUENCES","REVOKE ALL ON ALL FUNCTIONS","SET LOCAL ROLE velarion_owner"])assert.ok(sql.includes(term),term);
  assert.doesNotMatch(sql,/GRANT velarion_owner TO|INSERT INTO velarion_review.admin_bindings|EXECUTE\s+format|EXECUTE\s+'/i);
});
test('review SQL text keeps identity and history immutable and role changes audited',async()=>{
  const sql=await source();for(const term of ['bindings_identity_immutable','submissions_identity_immutable','submissions_no_delete','decisions_immutable','decisions_no_truncate','binding_audit_no_truncate','bindings_audit','changed_by name NOT NULL DEFAULT session_user','final slot reserved for revocation'])assert.ok(sql.includes(term),term);
});
test('review SQL text bounds workload, keeps referral separate and does not write legacy gates',async()=>{
  const sql=await source();for(const term of ['pg_advisory_xact_lock(hashtextextended','q.rn<=100',"'hasMore',more",'DISTINCT ON(stage)','deposit_usd_cents>=5000',"'tohstb0d83'","'https://one.justmarkets.link/a/tohstb0d83'"])assert.ok(sql.includes(term),term);
  assert.doesNotMatch(sql,/(?:INSERT INTO|UPDATE|DELETE FROM) velarion_(?:private|api)\./);
});
