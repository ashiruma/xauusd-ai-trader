# Course content containment — full learning access remains blocked

## What this patch actually achieves

This is a **fail-closed containment patch, not a completed authentication/progression implementation or launch approval**. Public lesson title/summary previews remain available. Full lesson bodies, objectives, examples, diagrams, glossary data, quizzes and answer keys are withheld from every caller, including existing verified/admin sessions. Assessments return HTTP 503 without grading, changing progress, contacting the backend or issuing completion cookies. Legitimate learners cannot currently resume full lessons or complete assessments.

The existing identity and progression architecture is not trustworthy enough to release protected material safely. No replacement client gate, mock authority, feature-flag bypass or content retrieval API is introduced. This stops at the last safe boundary rather than signing or accepting unverified completion claims.

Work is confined to `/workspace/velarion-security/repo`, a separate local clone. The Windows checkout is untouched. No push, deployment, account linking, broker request or live trading action was performed. The Python backend was not started: its lifespan can start a live trader depending on configuration. Local frontend tests use a clean environment with only an ephemeral local test signing secret and no service/broker credentials.

## What changed

- `lib/curriculum.ts` now imports a separate allowlisted `lib/curriculum-public.json`: only identifiers, level labels, numbering, titles and summaries. It never derives public objects at runtime from private source data. Catalogue cards no longer inspect body text for reading estimates; browser progress is labelled as an unverified display cache.
- The original full JSON is moved intact to `lib/server/curriculum-data.json`. Its only application import is the guarded `lib/server/curriculum.ts`. The additional quiz/cheat-sheet bank moves to guarded `lib/server/quizData.ts`. Both modules import `server-only`. Type-only interfaces are separate and contain no data. No application route currently imports either private data module.
- Lesson pages render public summaries and an explicit unavailable notice only. Nothing protected is passed as props, server-rendered children, HTML, RSC, metadata or structured data. There is no owner/admin bypass. Invalid lesson slugs return 404.
- Both directly downloadable copies, `public/forex_curriculum.js` and `dashboard/static/forex_curriculum.js`, are replaced with empty compatibility arrays, not sanitized copies of the full objects. The legacy dashboard now explains why its course is unavailable.
- The quiz submission route is suspended instead of grading against mismatched banks and persisting to an unauthenticated authority. Direct progress self-marking remains denied by the existing Next progress route.
- Old full-data generation/export/hint scripts are retired. Two old UI generators are stopped at their first statement, preserving archival UI source without allowing it to regenerate an unsafe course. Their old execution paths must not be restored without the new architecture and boundary tests.
- Authentication, membership/eligibility, middleware, backend persistence, account linking, activation/consent and trading code are unchanged. No existing requirement is waived and no new completion is granted. The registration/funding → required learning/quizzes → account linking → separate explicit automation consent journey remains the intended funnel, but full learning is deliberately unavailable.

## Why protected retrieval cannot safely be enabled yet

References below describe the original base plus crawl/claims review, before containment. The unchanged files can still be inspected at those paths.

**Identity is not established by signing a cookie.** `api/app.py`'s trader login compares a submitted account number and registered email, without proving control of either. `app/api/verify-mt5/route.ts` can treat a listed account number as verified without an account-ownership challenge. A signed JWT authenticates what the issuing server asserted, not the truth of those assertions. Login also expects an `access_granted` field not supplied by the inspected successful backend login response, an additional integration mismatch—not a security mechanism.

**Privileged credential handling needs replacement.** `app/api/auth/login/route.ts`, `app/api/admin/session/route.ts` and other admin consumers have a hard-coded admin fallback. Existing code uses the master secret itself as an admin bearer cookie. `lib/auth.ts` rejects its legacy signing fallback in production, but does not validate a complete session schema or require a finite expiry; current membership/revocation is not rechecked on lesson access. These are not repaired by this narrow containment patch. The new lesson page does not trust any of these claims.

**The database is not an authoritative learning record simply because it is server-side.** `api/app.py`'s `/api/school/progress/update` accepts caller-selected `account_id`, `completed_lessons` and `school_completed`, without authenticating the caller or binding them to an account. The matching read also accepts arbitrary account IDs. `data/storage.py` persists those fields. The optional internal-key helper is not attached to these routes. The existing Next `/api/py/:path*` rewrite and any exposed backend must be included in the owner’s remediation; loopback binding alone does not make a publicly proxied write safe.

**The former quiz path was inconsistent.** The displayed quiz used `getQuizForLesson` and a three-question bank/fallback, while the grading route used the curriculum JSON quiz directly. It continued to issue signed completion after failed/non-successful backend writes. Browser localStorage and existing completion flags are not acceptable substitutes for a verified assessment transaction.

**The old display gate was not a confidentiality gate.** A client component deciding whether to show server-provided children does not remove those children/props from the RSC payload. Initial lessons also lacked a server sequential-access check. Removing a body from visible DOM or adding `noindex` is not protection.

## Threat model and limits

Assume an attacker can download every public asset/source map; request HTML, RSC, prefetches and APIs directly; replay or alter cookies, query strings and request JSON; spoof user/account IDs, browser storage and completion claims; know the public curriculum; and reach any publicly proxied backend. Protect current lesson bodies and quiz keys from unauthenticated/locked responses, cross-user retrieval and client bundles, without allowing learning to imply automation consent.

Containment currently denies every protected read instead of attempting to distinguish trustworthy learners using untrustworthy state. All private source data is outside public/static roots and the client graph. No protected data is logged by the changed runtime path. Tests derive comparison strings only in memory and suppress private values/response contents on failure. Negative client-import builds delete their temporary source/build trees and do not retain compiler output.

This does **not** repair existing identity, progress-write or automation vulnerabilities elsewhere, certify membership enforcement, establish real authenticated access, prevent authorized learners from copying material, or erase previous disclosure. Source code/patches contain private curriculum data: do not publish them as web assets. If repository history or old deployments are public, those copies remain obtainable; an owner must decide whether access exclusivity requires private repository/history handling, CDN/cache cleanup and retirement of old deployments. This task does not perform those actions.

The scanner covers representative content fingerprints from all 30 lessons, quiz-question/explanation/answer-bank text and numeric answer-key structures, with HTML/JSON/JS escaping variants. It is finite regression evidence, not proof against every possible encoding, future code path, infrastructure misconfiguration or an independently exposed backend. The local frontend never receives private course data at all in this patch; that structural fact matters more than a passing substring test. No test suite is a security certification.

## Owner decisions required before restoring lessons

1. **Choose and implement identity proof.** Use a vetted authentication provider or a verified challenge/password/passkey flow with a stable internal principal ID. A matching email string, account number or partner attribution is not proof of identity. Bind broker accounts to that authenticated principal with verified ownership, independent of marketing eligibility.
2. **Define session and administrative policy.** Remove exposed/default credentials, rotate affected secrets, use scoped admin identities instead of a master-secret cookie, require valid finite expiry/schema and current revocation/membership checks. Define which requirements apply to lessons 1–5 versus 6–30, and whether any audited staff bypass is ever appropriate. Do not silently restore the old bypass.
3. **Choose the authoritative learning store/service.** Keep progress operations private behind authenticated service credentials or a direct server DAL, with deny-by-default access. Remove arbitrary public progress writes and derive account/principal from verified server identity, never request JSON/query/localStorage. Audit every writer, admin operation and the Python proxy; migrate existing client-writable progress as untrusted, not automatically grandfathered completion.
4. **Choose one versioned assessment bank and completion policy.** Reconcile displayed/graded quizzes, foundation-five versus full-thirty graduation rules, prerequisites, 100% pass threshold/reset/retry semantics and content rights. Grade submitted option choices server-side against keys that never leave the server. Apply rate/attempt limits and perform prerequisite check, grading and persistence atomically; confirm the transaction before acknowledging completion. Bind attempts to the authenticated principal and assessment version; do not issue completion on failed writes.
5. **Implement one fail-closed protected-content DAL.** On every read, validate current identity, eligibility and authoritative prerequisite state before loading/rendering that lesson. Return only the allowed lesson body and question/options DTO, never keys, explanations that reveal answers or the whole curriculum. Recheck on quiz submission; use private/no-store caching and appropriate CSRF/origin defenses on mutations. Do not cache private content in public static HTML, RSC, ISR or CDN objects.
6. **Prove the actual integration before reopening.** Against an isolated production build with genuine test identities and a private transactional store, test allowed retrieval, unauthenticated/expired/revoked/locked denial, cross-user attempts, forged claims, failed persistence, replay/concurrency, stale membership, cache separation and absence of keys in authorized responses too. Keep linking and affirmative automation activation separate and test that learning alone cannot activate trading.

Until those choices and implementations exist, **allowed authorized lesson retrieval cannot be demonstrated and is not claimed**. Locally HMAC-signed fixture cookies test only that asserted privilege cannot bypass containment; they do not prove real authentication or authorized delivery.

## Apply and validate

Base commit: `9ad38452e6a4b475dd5ef108d9cc14537b7b49fd`. Apply the prior `velarion-crawl-claims-review.patch` first, then `velarion-course-containment-review.patch`. If the prior patch is already present, do not reapply it; check this patch directly. The security patch is not intended to apply to the untouched base by itself. Review in a clean branch/copy, not automatically in the owner's working tree.

```sh
git apply --check /path/to/velarion-crawl-claims-review.patch
git apply /path/to/velarion-crawl-claims-review.patch
git apply --check /path/to/velarion-course-containment-review.patch
git apply /path/to/velarion-course-containment-review.patch
npm ci
# Use only an isolated local environment; do not source production/broker env files.
export AUTH_SECRET="$(openssl rand -hex 32)"
export COURSE_BOUNDARY_TEST_SECRET="$AUTH_SECRET"
export COURSE_BOUNDARY_BASE_URL=http://127.0.0.1:3217
npm run build
npm run start -- --hostname 127.0.0.1 --port 3217
# In a second shell with the same local test variables:
python3 -m unittest discover -s tests -p test_course_boundary.py -v
python3 -m unittest discover -s tests -p test_public_crawl_review.py -v
python3 scripts/check_course_server_only.py
npx tsc --noEmit
git diff --check
```

The development secret above is for the disposable local test frontend only, not deployment. Keep the Python/trading backend stopped for these tests. The full legacy trading/backend suite is deliberately not executed here because its scope includes services and side effects unrelated to this information boundary. Exact measured build/test counts and patch-application results accompany this file in `VALIDATION.txt` outside the checkout.
