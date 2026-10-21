# Velarion: referral signup and manual admin review

This local review candidate upgrades the existing journey and admin route. It is not deployed, and no account, admin binding, database setting or broker operation has been created or changed.

## The member journey

1. Visit the existing School or member entry point. Restricted access explains the partner-signup requirement; it is not a fabricated HTTP rate limit.
2. Register using the website’s fixed [JustMarkets partner link](https://one.justmarkets.link/a/tohstb0d83), then create a demo MT5 account at JustMarkets.
3. Return with the email associated with that broker account and separate Velarion credentials. Submit the required demo MT5 trading account ID, broker server and a minimal evidence reference when the review workflow is separately configured. Never give Velarion a broker master, investor or trading password, PIN or broker verification code.
4. A securely authorized admin independently checks ownership and referral attribution. A referral click, matching email or account ID is not proof. The configured alphanumeric referral ID `tohstb0d83` identifies the website’s partner link; it is not a member’s MT5 account ID. MT5 IDs remain normalized strings with leading zeroes intact.
5. The intended course grants the first five lessons after demo/referral verification, then pauses before lesson 6 for live-account ownership and current referral verification plus trustworthy evidence of at least USD 50 cash deposited into that live account. Broker authentication happens only at the broker. The USD 50 threshold is a Velarion eligibility rule, not a broker minimum or safe-capital recommendation.
6. All 30 lessons and authoritative assessments remain required for graduation. Five lessons are a checkpoint, not graduation. Live funding, admin verification and graduation never independently activate trading.

## What is implemented locally

The existing admin URL now has a server-authorized real-data queue and review controls; the path itself provides no security. The member onboarding page gains an availability-gated evidence submission panel. New APIs use the current admitted, freshly verified server session, exact request schemas, same-origin mutation checks, bounded JSON bodies and fixed parameterized database calls. Neither the browser nor a request payload can select a learner identity or reviewer identity.

The proposed isolated review schema stores immutable issuer/subject ownership, distinct demo and live submissions, declared broker email, MT5 ID, broker server, fixed partner provenance, evidence references, revision-controlled decisions and append-only audit history. No user fixtures or admin bindings are inserted. Reviews distinguish submitted, needs evidence, verified, rejected and revoked. Admin permissions are checked against an enabled, immutable Auth identity binding on every admin operation; new flags, URL knowledge, email addresses and legacy cookies cannot supply that authority.

The SQL file is a review artifact only. It is not executed. Both BFF configuration flags, approved migration/grants, valid admitted sessions and separately approved per-user admin bindings are prerequisites. Until then the admin page is unavailable and review APIs fail closed. Existing legacy admin, activation and trading endpoints remain denied.

## What remains blocked

The current schema/routines do not provide the complete review ledger or the first-five-before-funding entitlement. This candidate adds an isolated advisory eligibility workflow, not a replacement of sealed course/session routines. No review decision modifies enrollments, authoritative progress, existing onboarding gates, lesson delivery, execution-account linking, automation consent or worker acknowledgement. A later approved entitlement integration must check demo verification for lessons 1–5, current live verification for lessons 6–30 and full authoritative completion for graduation, on every server-side content/assessment request.

Freshly confirmed but unbound/unadmitted Auth registrants cannot currently submit evidence: the secure session path deliberately does not manufacture their app identity or enrollment. A separately approved registration admission/bootstrap design is needed; do not work around this with browser-supplied subject IDs or weakening current admission checks. Admin Auth binding has not been provisioned either.

Deposit evidence policy needs approval before launch. The review proposal is deliberately USD-only and requires an independently evidenced qualifying cash deposit; it does not equate balance, credit, bonus, demo funds or trading gains with deposits. Aggregation, withdrawals/refunds, freshness, non-USD conversion, rechecks and lawful access to partner evidence must be settled before operational reliance. Do not collect full broker statements or identity documents in text fields; references point to a separately controlled evidence case system with its own access and retention policy.

See `MANUAL-REVIEW-SCHEMA.md` for the locally inspected schema evidence and migration restrictions, and `MANUAL-REVIEW-IMPLEMENTATION.md` for the implementation map, validation limits and launch blockers.

## Free access and risk disclosures

Velarion platform use is 100% free on condition that the member joins through the website’s JustMarkets link and referral attribution is verified, subject to the other access gates. Broker spreads, commissions, swaps, other fees, required deposits and market losses remain the member’s responsibility. Deposits and withdrawals stay under the member’s control at the broker.

Automation can lose money, including the entire deposit. No cash, income while studying, earnings or profitability is promised. IB referral compensation and volume-based rebates create a conflict of interest. Kenya legal and regulatory review remains a pre-launch requirement; no local authorization is implied. Execution requires independently verified ownership, separate explicit account/environment-scoped consent, operational/regulatory approval and exact authenticated worker acknowledgement. Automation is never enabled by default.
