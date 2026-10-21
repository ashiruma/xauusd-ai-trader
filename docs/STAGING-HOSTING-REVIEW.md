# Staging login: hosting review

This candidate is based on `9ad38452e6a4b475dd5ef108d9cc14537b7b49fd`. It is for a separately approved, restricted staging deployment, not a production release or a working first-client login URL.

## Database state already completed

The existing Supabase Staging project is `akhftbbszejafxpoxiem`. The four files in `sql/review/` mirror the exact payloads already committed, in this order:

| Phase | File | SHA-256 |
| --- | --- | --- |
| Generation | `staging_auth_generation.sql.review` | `227de59743828be42960fc1ccd0c26fdeea7b0a5947fe37e9e160166421efd97` |
| Admission | `session-admission-extension.sql.review` | `3022e89b67c2d406d48c75a138fafdf01cdbf40aa10d19ba967922550c35b40a` |
| Onboarding waiver | `onboarding-waiver-extension.sql.review` | `a9f8318349650e8346208349cada9f809d399143b985a5bced2145ac9f5d0572` |
| Encrypted session vault | `session-vault-extension.sql.review` | `4483c6b328cc39ad6e5151d0d0f11ce1d7ee9d4eb0a822b27b4d4afc3322c5c7` |

**Do not reapply these files.** They are first-install review mirrors, not repeatable migrations. No new SQL or database redesign is needed for this reconciliation.

Prior staging evidence confirms the dedicated `velarion_bff_runtime` login authenticates over certificate/hostname-verified TLS on the shared pooler's port **5432**. Its inherited application authority is only the BFF envelope: 16 intended API RPCs, no private helper execution, no direct application-table access and no RLS bypass. The provider-created ADMIN-only edge from postgres is retained with INHERIT=false and SET=false; it does not give the runtime access to postgres.

The successful outer runtime verifier protects `has_sequence_privilege` with `CASE WHEN c.relkind='S' THEN ... ELSE FALSE END`. This prevents evaluation on non-sequence catalog rows regardless of predicate reordering. It changes no SQL payload or application routine. The review package preserves that corrected read-only query and exact one-line diff under `evidence/`; provisioning code is deliberately not copied into this application.

## Configuration and deployment still require approval

The blank `.env.staging.example` is documentation, not installed configuration. Separately approve and provision:

- The canonical staging HTTPS URL, with identical `VELARION_APP_ORIGIN` and `VELARION_STAGING_APP_ORIGIN`, and `VELARION_RELEASE_ENVIRONMENT=staging`.
- The exact staging Supabase URL, its publishable key only, and a server-only database URL using the dedicated runtime login, database `postgres`, no URL query parameters and the approved pooler host.
- The intended serverless transaction-pooler route on port **6543**. Prior successful port-5432 authentication does **not** prove port-6543 connectivity, role routing or hosted Node TLS trust. Validate the intended route read-only with the same driver and strict verification before treating login as operational.
- An independent random 32-byte canonical-base64 vault key, shared only by the approved staging instances; key custody, rotation/invalidation and restore-safety procedures. Never use public-prefixed variables or an administrator/service-role credential.
- Auth email-confirmation requirements, exact Site URL and `/auth/callback` allowlist, without broad wildcard callback approval.
- Staging deployment, runtime CA trust, capacity limits and a bounded ciphertext cleanup/tombstone-retention plan. Never disable TLS verification, retry uncertain writes, or delete replay tombstones casually.

The driver already uses max=1, prepare=false, max_pipeline=1 and transaction-local timeouts. Session authority resides in the encrypted Supabase vault, never a local PostgreSQL database, local directory, browser provider-token cookie or additional KV service.

## First-client and two-admin status

No Auth users/UUIDs for the two nominated admin emails are available in the supplied state. The code's staging priority registry remains empty; the database waiver state was empty in the saved postflight. The requested two exceptions are therefore **unbound and inactive**, not two working passes. Email strings are not authorization, and no placeholder UUIDs or environment overrides are introduced.

A future separately approved binding must use the exact verified issuer and immutable Auth UUID, with explicit expiry/scope. It may waive only referral, deposit and the all-30 course-completion prerequisite. It must not waive account linking/ownership, separate automation consent or trading activation. It must not manufacture lesson completions or turn on course delivery, automation or trading. These remain disabled/pending independently.

A real first-client login still needs separately authorized Auth account handling and, for BFF-authorized access, issuer/identity/learner enrollment. A confirmed but unenrolled user can at most reach authenticated pending-access. Deployment alone cannot complete that onboarding. No invitation, email, user creation, enrollment, pass activation or real-user smoke test is authorized by this review.

## Validation boundary

Fresh typecheck, production build and Node/loopback HTTP results are in the accompanying package's `validation/`. Mocked provider responses are not real Supabase Auth login evidence. SQL-backed tests requiring the old local Unix-socket fixture are skipped; no local PostgreSQL is installed, started or used in this task. Historical SQL/role evidence is labeled as historical, not rerun. Legacy Python tests are outside this login review and were previously collection-blocked, not passed.

Subject to the outstanding approvals and successful environment/transaction-route checks, this is a staging-hosting candidate with fail-closed access controls. It is not yet a live-ready first-client service, and it is not cleared for production or trading.
