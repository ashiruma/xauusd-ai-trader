# Velarion’s secure manual-review upgrade

The website keeps its existing navigation, partner link and product structure. This candidate adds a real-data admin queue and a member evidence form—not a sample dashboard—and leaves everything fail-closed until separately approved configuration exists. No JustMarkets API is used.

## What the review controls do

Members declare their broker-associated email, required MT5 account ID, actual broker server and a minimal case/evidence reference. The website’s fixed alphanumeric referral code is separate from the member’s digit-string MT5 ID. Referral intent is recorded as website provenance, not proof that the broker credited the referral. Admins must independently establish ownership and partner attribution from a trustworthy, lawfully available source.

Demo and live reviews are independent. The live review also requires evidence of at least USD 50 qualifying deposited cash, not a balance, bonus, credit, demo amount or trading profit. An admin records a decision, mandatory reason and independent evidence reference. Revisions prevent a stale page from overwriting a newer decision; history is appended rather than erased. New submissions do not edit old evidence and reset that stage’s advisory eligibility until the newest submission is verified. Self-review is rejected.

Admin permissions are not inferred from the old hard-to-guess URL, email addresses, legacy admin cookies, metadata, referral codes or user-selected identifiers. The server obtains the immutable issuer/subject from a freshly verified existing admitted session. SQL rechecks that session and a separately configured enabled identity/scope binding. The binding table is empty in the proposal; no admins are created here. Only review record IDs and expected revisions identify admin work items; neither learner nor reviewer identity is selectable in the request body.

## Where the implementation lives

| Path | Purpose |
| --- | --- |
| `app/admin-secure-x9f8k2/page.tsx` | Existing admin route, now guarded on the server before rendering |
| `components/AdminBrokerReview.tsx` | Real queue, evidence attestations, decisions and history; no fabricated users |
| `components/ManualBrokerReview.tsx` | Authenticated member submission/status panel; form hidden when unavailable |
| `app/onboarding/page.tsx` | Existing journey with the review panel added in place |
| `app/api/admin/reviews/route.ts` | Guarded queue GET |
| `app/api/admin/reviews/decision/route.ts` | Guarded decision POST |
| `app/api/onboarding/review/route.ts` | Guarded self-read GET and self-submit POST |
| `lib/server/manual-review-core.ts` | Exact payload validation, MT5 normalization, CSRF/body limits, privacy projections, locked release flags |
| `lib/server/manual-review-runtime.ts` | Disabled configuration guard, verified session, fixed parameterized workflow call |
| `sql/review/manual-broker-review.sql.review` | Unexecuted isolated schema/workflow migration proposal |
| `tests/node/manual-review.test.mjs` | Normalization, identity injection, origin, body-size, denied authorization, privacy and disabled-state tests |
| `tests/node/release-containment.test.mjs` | Preserved legacy denials with explicit recognition of the guarded review routes |

## What remains deliberately unavailable

A review decision changes only the review ledger and its advisory eligibility state. It cannot create an Auth account, bind an app identity, enroll a learner, write course completions, deliver a lesson, link an execution account, supply automation consent or activate trading. All 30 lessons and authoritative assessments remain the graduation requirement. Funding after five lessons is only the intended lesson-6 checkpoint.

The current protected content and assessment routes stay disabled. The existing onboarding entitlement contract still groups referral, deposit and full course completion; the first-five-before-funding server contract has not been substituted. A separately reviewed implementation must enforce demo/referral eligibility for lessons 1–5 and current live-funding eligibility for lessons 6–30, including rechecks on every server-side assessment/content request. No UI label should be treated as this enforcement.

Newly confirmed but unbound/unadmitted Auth registrants cannot yet submit through the existing admitted-session path. This candidate does not weaken that boundary. Registration admission/bootstrap and secure admin binding remain separate prerequisites, not automatic effects of visiting the referral link.

## Required approvals and operational work

1. Review the exact current staging catalog, dependencies, signatures, ownership and privileges; approve and validate the new migration in an isolated database before any target apply. No SQL was executed during this task.
2. Approve a narrow process for binding real reviewer Auth issuer/subject identities and scopes; require independent identity verification and no self-review. No binding command or user UUID is prefilled.
3. Approve the pending-signup admission/bootstrap and lesson-level entitlement changes. Do not auto-enroll or bypass sealed routines.
4. Define a trustworthy manual partner/evidence process, USD cash-deposit qualification, freshness and recheck rules, refunds/withdrawals, disputes and any non-USD/aggregation policy. The current proposal does not implement those business judgments automatically.
5. Approve privacy notices, evidence custody, access controls, retention/erasure, audit retention, review-volume limits and queue pagination/export. Internal notes and reviewer identity remain admin-only. Opaque case references are not evidence validation or an evidence-upload system.
6. Separately approve configuration/deployment. The two new server-only switches are `VELARION_MANUAL_REVIEW_ENABLED=true` and `VELARION_MANUAL_REVIEW_SCHEMA=manual-broker-review-v1`; neither is installed. All existing staging/session/database configuration and permission restrictions still apply. A version string is an operator attestation, not proof the migration ran.
7. Complete Kenya legal/regulatory and IB conflict review. Any future automation additionally needs separate explicit account/environment-scoped consent, execution ownership and exact authenticated worker acknowledgement. Neither deposit nor admin verification supplies those approvals.

## Honest member-facing wording

Platform use is 100% free conditional on registration through the website’s JustMarkets link and verified attribution, subject to the other gates. Broker fees, deposits and market losses remain the member’s responsibility, and deposits/withdrawals remain at the broker under their control. Automation may lose the entire deposit. Do not promise cash, earnings while learning or profitable outcomes. IB referral/rebate incentives create a disclosed conflict.

## Validation boundary

The package’s `validation/` directory records the actual typecheck, production build, Node-suite and local HTTP results. Dependency-backed tests that are skipped remain skipped, not passed. Pure/HTTP tests check request handling and disabled behavior; they do not prove SQL authorization, concurrent transactions, live broker attribution, real account ownership or a working deposit verification. The SQL is review-only and was not executed, including against a disposable database. No production, Preview, Vercel or Supabase setting was changed, no remote branch was touched and no commit, push, PR, deployment, account enrollment or broker operation was performed.
