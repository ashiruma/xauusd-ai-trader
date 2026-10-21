# Velarion learning: secure first, engaging without financial incentives

## The important finding

A secure learning system is feasible, but **this repository cannot safely reopen full lessons yet**. Its current identity issuers do not prove control of the claimed learner account, and its backend accepts caller-selected learning progress. Adding rewards to those records would reward forged progress.

This is a **local review proposal**, not a working authenticated learning platform, launch approval or security certification. The site, Windows checkout and GitHub are untouched. No credentials, broker requests, account linking, Python/trading backend, push or deployment were used.

## What the review patch does now

The academy displays public summaries and a clearly labelled rewards preview. It no longer uses browser storage to display “passed” units, completion percentages or claimed unlocks. It displays unavailable progress rather than a fabricated zero balance. All full lessons, quizzes, awards and verified learning records remain unavailable.

The new `/api/school/rewards` GET/POST boundary returns HTTP 503 with `private, no-store`, no balance, no cookies and no persistence. `/api/school/progress` GET now does the same instead of fetching untrusted backend records or falling back to session/admin completion. Its POST still rejects self-marking with HTTP 400. Quiz submission remains suspended. None of these three routes parses submitted learner identity, loads protected course data, calls the backend, or mints completion/rewards.

`proposals/learning/rewards-policy.mjs` is an **unwired, pure policy specification** with executable unit tests. It is not imported by the application, is not an authentication or storage adapter, and cannot be used as a public award authority. Its test events are mathematical inputs, not genuine authenticated completions.

## An encouraging learning experience

Proposed reward policy, pending approval:

- **20 non-cash points** for a lesson’s first authoritative assessment pass; 30 lessons means at most 600 points. Retries, repeats and content-version changes do not generate extra points. Points are not redeemable, transferable, monetary or a promise of mastery.
- Private milestone badges at the first check and 5, 15 and 30 completed lessons. Optional 3- and 7-day streak badges celebrate consistency, not trading competence. No public leaderboard.
- One active day for a first-time qualifying lesson pass, based on trusted server UTC time. Multiple passes in one day count once. Repeat attempts do not bridge inactive days. A missed day resets only the current streak, never earned points, badges, best streak or course progress. Read-time projection shows a lapsed streak as zero without waiting for another completion.
- Core safety learning and eligible access never require a streak, points or a badge. No streak purchases, loss-pressure countdowns or forced notifications. “Welcome back—your progress is still here” is preferable to guilt.
- Deposits, recruiting referrals, profit, trading volume, account linking and automation activation never earn rewards. Cash and broker-linked incentives are outside this patch and require separate legal and broker approval.

When secure infrastructure exists, the screen can offer a verified “continue learning” card, short checkpoints, private milestones and optional celebrations respecting reduced-motion preferences. No such personalised state is fabricated now. The draft UTC day ends at 03:00 in Kenya; show that clearly rather than silently using a browser clock. A different timezone policy needs an explicit product decision and anti-switching rules.

## Why existing infrastructure is insufficient

These are local-source findings, not a fresh audit of the live deployment. Paths refer to the inspected contained review baseline unless noted.

**Identity:** [`app/api/auth/login/route.ts`](app/api/auth/login/route.ts) accepts an MT5 ID/email pair; [`api/app.py`](api/app.py), around lines 620–635, compares the submitted email to stored email. A match proves knowledge, not mailbox or broker-account control. [`app/api/verify-mt5/route.ts`](app/api/verify-mt5/route.ts) can register a caller-supplied account and sign a session based on attribution. Referral attribution is not ownership proof. [`lib/auth.ts`](lib/auth.ts) verifies a signed session but lacks a complete finite-expiry/schema requirement and current revocation/membership lookup. Signing unproven claims does not make them trustworthy.

**Persistence:** Python `/api/school/progress/update` and `/api/school/progress` around [`api/app.py:902–943`](api/app.py) accept an account ID without ownership-bound authentication. [`data/storage.py:670–678`](data/storage.py) updates learning fields by that ID. [`next.config.mjs`](next.config.mjs) exposes `/api/py/:path*` to the backend. These remain unchanged and must be closed or authenticated before any learning authority is connected. Loopback backend binding is not adequate protection behind a public proxy.

**Historical baseline finding (curriculum manifest review now denies legacy graduation at frontend learning gates):** [`lib/access-control.ts`](lib/access-control.ts), `/school`, `/api/access/*`, linking, automation handlers and middleware still consume legacy completion/session/admin claims. This patch does not certify or repair those independent paths. Existing admin fallbacks/master-secret cookie handling also require remediation. In particular, changing the Next progress endpoint does not secure direct Python writers or every automation gate.

The existing gate is not relaxed and no completion is granted. Full platform authorization remains a blocker: it must be unified before reopening, not bypassed through rewards.

## The end-to-end architecture to approve

Choose a vetted identity provider and a private transactional datastore first. A reasonable proposal is a managed OIDC/email-verification provider plus managed PostgreSQL, or an integrated identity/PostgreSQL service with server-side session verification and database row-level restrictions. **No provider/project is selected, configured or provisioned here.** Existing local SQLite files are not being repurposed as a Vercel identity or learning authority.

Use a stable internal learner UUID keyed to a verified provider issuer/subject; MT5 numbers and email strings must not be the primary ownership authority. Verify real sessions server-side, including issuer, audience, signature, required finite expiry, revocation/session status and current membership. Use dedicated scoped staff identities, not a shared master-secret cookie. Rotate affected secrets through a separately approved remediation.

Keep these proposed records in the same transactional store:

| Record | Required ownership and integrity |
| --- | --- |
| Learner identity | Unique `(issuer, subject)` maps to internal learner ID; broker linkage separate |
| Eligibility | Server-verified referral/deposit status, source, revision and freshness; never client claims |
| Assessment attempt | Random server-issued ID bound to learner, lesson, bank version and expiry; consumed status, request digest and stored result |
| Completion | Unique `(learner_id, lesson_id)` with assessed version, authoritative timestamp and audit event |
| Reward ledger | Unique `(learner_id, lesson_id, reward_type)` for first-pass points; immutable event linkage |
| Daily activity | Unique `(learner_id, utc_day)` from first-time qualifying completion only |
| Badges | Unique `(learner_id, badge_id)`; no duplicate award on retry |
| Reward summary | Per-learner locked projection/revision; rebuildable from ledger/activity |
| Automation consent | Separate affirmative consent/activation record; never written by learning transactions |

Every read/write derives the learner from a genuine verified server session. Database policies and service-role permissions must deny arbitrary client access; never accept `account_id`/`principalId` from JSON or a query as authority. Revoke/remove legacy public progress writers and audit every alternate writer, admin operation and proxy before migration. Existing browser/session/backend completion flags are untrusted; no automatic points, backfilled streaks or grandfathered access.

### Protected lesson delivery

Use one server-only data-access layer. On every body/question read, verify current identity, entitlement and authoritative prerequisites before loading the specific lesson. Fail closed on identity/store/eligibility failures. Return only that lesson’s allowed body and question/options DTO; answer keys, grading explanations and the whole bank stay server-only. Do not send bodies through a client visibility gate. Keep private responses out of static generation, public RSC/ISR, CDN caches, service-worker caches and source maps; use private/no-store on all protected responses including failures. The current summary-only pages do not enable this future delivery path.

### One completion transaction, never a client claim

Proposed transaction semantics, **not an implemented adapter or migration**:

1. Verify the genuine session and current status; validate allowed origin/CSRF and enforce request-size/rate limits. Only choices plus the server-issued attempt ID are accepted—not score, completion, points, day or trading flags.
2. Begin one transaction; lock the learner/summary, current eligibility/prerequisite state and attempt consistently. Recheck eligibility, owner, expiry, lesson sequence and assessment version. Use database constraints as the final arbiter, not check-then-write in JavaScript.
3. For a consumed attempt, same owner and identical request digest returns the committed stored result without awards; changed answers/different owner reject. Never return a replay result before authenticating and rechecking disclosure authorization. Unknown attempts reject.
4. Load one private versioned key bank and grade exact-length, valid option indexes server-side. Failed assessments consume the attempt with a no-award result; issue a new rate-limited attempt for a retry. Reconcile the two legacy banks before adopting either. Pass threshold and any retry/review policy need approval.
5. For a pass, conditionally insert the unique completion. Only a newly inserted completion can insert 20-point ledger credit, daily activity and any new badge. Compute streaks from qualifying activity dates and database time, not repeat audit events. Progress, attempt result, ledger and projections commit together. Reassessment may update evidence but cannot farm another reward.
6. Acknowledge success only after confirmed commit. Rollback means no completion, points, badge, streak or completion cookie. A lost response after commit is resolved by retrying the same attempt/digest; no compensating duplicate award. Version upgrades cannot create duplicate first-pass points.

No learning operation calls account linking, broker operations, trading APIs or activation. There should be no general public `/mint` endpoint; a future rewards GET is an owner-bound projection only. Deletion/retention and audit redaction must be set before storing identities and attempts.

## Keep the required journey intact

**JustMarkets referral/deposit → mandatory learning → account linking → separate, explicit automation activation.** Verified identity supports the journey; it does not replace any step. Neither a course badge nor a completed course grants activation consent. Kenya compliance and IB-conflict disclosures stay visible, with unresolved status explicit. This proposal is not a legal opinion or approval of the broker funnel.

## Decisions needed before full lessons reopen

1. Approve the identity provider/project, verified-control method, session/revocation policy and scoped administration. Later configuration must use the selected provider’s normal secure process; no credentials are requested or used for this patch.
2. Approve the transactional store/service, hosting region, access model, backups, retention and server-only secret management. Close raw progress writes/proxy exposure and migrate all gate consumers to the new authority.
3. RESOLVED by owner: all original core IDs in the typed course manifest are mandatory for graduation. The early checkpoint is only a milestone; optional extensions do not change the original core certificate. No verified graduation is available during containment. Still choose one reviewed, versioned assessment bank, pass/retry/prerequisite policy and reassessment rules for previously exposed questions.
4. Approve the non-cash points/badge/streak policy and explicit UTC calendar. Confirm safety learning is never streak-gated. Broker/legal approval remains necessary for the commercial journey; cash incentives are excluded.
5. Resolve curriculum rights and historical disclosure: prior public repository/history, static banks, deployments and caches cannot be made secret by this patch. Decide on private source handling and replacement assessment keys if needed.
6. Demonstrate real multi-user identity, authorized delivery, cache separation, revocation, atomic commit/rollback and concurrent replay tests in an isolated environment before removing containment. Audit the separate linking/activation flow and prove learning alone cannot start trading.

## What the tests mean

The isolated frontend tests exercise anonymous, locked/expired/revoked/admin-claimed and forged sessions, cross-user parameters, malformed/cross-origin requests and parallel/replayed submissions. They prove **unconditional containment**, not identity validation. With no persistence dependency, the endpoints stay unavailable instead of falling back to signed completion claims. The pure reward policy tests demonstrate arithmetic, first-pass deduplication, dates, immutable input and streak behavior only.

Real permitted learner delivery, atomic server-verified awards, database-failure rollback and concurrent cross-user persistence remain explicitly skipped/blocked. No mock provider, in-memory repository or unsafe adapter is substituted to turn them green. The inherited scanner checks every emitted client JS/map and built/public text artifact, every discoverable public page/GET API, all 30 lesson HTML/RSC/prefetch responses and known private-data paths. It is finite regression evidence, not proof against every encoding or external deployment.

## Review and reproduce locally

Apply only in a separate clean copy. Start from original commit `9ad38452e6a4b475dd5ef108d9cc14537b7b49fd`, then apply the crawl/claims patch, then containment patch, then this learning review patch. Do not reapply a prerequisite already present. The review copy’s local baseline commit is only a snapshot of those prerequisite changes, not an upstream revision or push.

Run `npm ci`, `npm run build`, `npx tsc --noEmit`, `node --test tests/test_learning_reward_policy.mjs`, and `git diff --check`. Serve Next on `127.0.0.1:3239` using an ephemeral local `AUTH_SECRET` and a clean environment with no provider/broker variables; do not source `.env` files. Confirm nothing listens on backend port 8000. Run the three focused Python unittest files with `COURSE_BOUNDARY_BASE_URL=http://127.0.0.1:3239` and `COURSE_BOUNDARY_TEST_SECRET` matching that disposable frontend key. Python unittest here runs only HTTP/source checks, not the Python application. Do not run the full legacy trading suite or `npm run server`/`backend`.

Exact measured results and patch checks are in the separate `VALIDATION.txt`. Review artifacts and private curriculum source are not website assets; do not upload them to public/static paths.
