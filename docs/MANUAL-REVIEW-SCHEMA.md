# Manual broker review — schema proposal assessment

**Review artifact only; not executed.** The SQL is a local generated proposal. No SQL, remote database, provider console, deployment, environment setting, binding, or commit was used. It does not create enrollments, alter access gates, or enable automation/trading. Existing application-side BFF and onboarding UI code are present; they remain feature-flagged and not enabled here.

## Current interface and safeguards

The isolated `velarion_review.workflow(...)` RPC uses an existing verified auth context and rechecks it through the handle-inclusive `velarion_api.check_auth_session(text,text,uuid,uuid,timestamptz,timestamptz)` overload. Authentication must evaluate exactly `true`; false or NULL fails closed. Supported operation names are explicitly bounded. The BFF uses `VELARION_MANUAL_REVIEW_ENABLED === 'true'` and `VELARION_MANUAL_REVIEW_SCHEMA === 'manual-broker-review-v1'`; no env flag was enabled. SQL errors are mapped by the BFF to generic 503 responses.

- `self_read` and `self_submit` expose the caller's own rows only, without owner identifiers, reviewer identifiers, internal notes, or decision history. User view is status/evidence-oriented; notes/history are admin-only.
- `self_submit` accepts exact `{stage,brokerEmail,mt5Id,server,evidenceReference}`; JSON values must be strings. `server` is the actual broker server string supplied by the submission, 1–100 characters. The referral identity is separate and fixed server-side: code `tohstb0d83` and link `https://one.justmarkets.link/a/tohstb0d83`. Broker email/account ID are claims, not proof. Per-owner advisory transaction locking serializes count checks before enforcing 10/hour and 100 lifetime caps.
- `admin_queue` is admin-bound and returns newest 100 with `hasMore`; there is deliberately no cursor in the contract. Admin rows include owner issuer/subject (not auth tokens or sessions) to distinguish duplicates and correlate evidence. Decision history is capped at 100 per submission.
- `admin_decide` requires exact keys and explicit JSON types; revision/deposit integer syntax and deposit range are checked without coercive acceptance. A decision must match current revision under row lock and cannot be self-reviewed. Success returns only `{success:true}`.
- Latest-per-stage status drives eligibility. `checkpointSatisfied` is true only when both the latest demo row is verified and the latest live row is verified with the minimum deposit and deposit evidence. These are advisory flags only.
- Submission identity, ownership and evidence identifiers are immutable; status/workflow fields change only through the controlled RPC. Decision rows are append-only; TRUNCATE is rejected for submissions, decisions, admin bindings and binding audit. Admin binding changes are audited to a protected append-only audit table. No bindings are inserted by this proposal.

`depositUsdCents` is bigint, bounded 0–100,000,000,000; live verification requires at least 5,000 cents plus independent evidence. The evidence process and threshold policy still require accountable policy approval; matching account/email, referral clicks, balance, bonus, profit, demo funds, or a screenshot alone are not proof. No course-completion claim is made.

## Actual review blockers and verification limits

1. **No current target catalog was consulted.** Existing catalog artifacts are snapshots only; they do not prove live schema, roles, grants, function body, overload, or PostgreSQL behavior. Confirm exact-target state, permissions/default ACLs, role capabilities, version, routine signature/body fingerprint, and schema absence under separately approved read-only review immediately before any migration consideration.
2. **No behavioral SQL verification.** This proposal has only been edited as text; it has not been parsed or run against PostgreSQL or an isolated test instance. Review SQL syntax, trigger behavior, permission model, concurrency, payload edge cases and output compatibility with tests before approval.
3. **Role custody remains unresolved.** The SQL no longer grants `velarion_owner` membership to `postgres`. `SET ROLE velarion_owner` may therefore fail closed; separately approve and provision custody if appropriate. No existing membership is changed here.
4. **Admin bindings are empty.** A separately authorized, audited process must establish who may review and how changes are approved. The SQL proposal does not add users.
5. **Evidence/privacy/retention policy remains to approve.** Define evidence access, storage, retention/deletion, notices, appeal, reviewer separation, incident response, audit export, and deposit qualification before operational use.
6. **Feature remains disabled.** Existing BFF/UI code has configuration guards; do not set either enabling flag or enable deployment as part of this review. Generic 503 handling is intentional to avoid exposing SQL errors.
7. **No workflow side effects.** This review does not enable lessons, course delivery, enrollments, progress, activation, account linking, automation, execution, or trading. Any future gate integration requires separate design, approval and tests.
8. **Migration approval is separate.** The SQL has an explicit transaction-local approval guard, expected principal/database checks, locks/timeouts and collision refusal, but these are not a substitute for exact-target review, migration/grant approval, rollback plan, test evidence and deployment authorization.

The artifacts are a proposal, not a deployed broker verification, proof of account ownership, access entitlement, or authorization to trade.
