# One curriculum manifest, without reopening learning

## What changes

`lib/course-manifest.ts` is the public, typed source of curriculum identity, order, stable routes, content versions, publication state, sequential prerequisites, core requirements, named checkpoints and extension-track metadata. It contains no lesson bodies or assessment keys. Descriptive public titles/summaries remain in the existing allowlisted JSON; private lesson and quiz sources are unchanged.

Every original core lesson is mandatory. The approved mapping is `b1–b12 → lessons 1–12`, `i1–i10 → 13–22`, `a1–a8 → 23–30`. The five-lesson early checkpoint is a milestone only. It cannot graduate a learner or make them automation-eligible. All core summaries remain navigable after lesson five.

The planned optional extension track is primarily SMC / ICT. No lesson 31 or new lesson content is published in this patch. To add an extension later, append a new stable ID/number/route, declare its prerequisites and content version, and supply separately reviewed public summary text before marking its summary visible. Missing visible summary text fails the catalogue consistency check rather than producing a dead route. Draft entries stay out of public navigation. Publication metadata never releases a lesson body.

Catalogue totals, track ranges, navigation and legacy cache membership use manifest entries rather than arithmetic caps. Schema identifies the summary-only catalogue, not an available course instance or academic credits. The sitemap reads the publication selector, which returns no lesson URLs while delivery is suspended. Redundant numeric promises in marketing/help text are removed rather than maintained as competing counts.

## Core progress is not extension progress

The explicit original core ID set, `coreVersion` and `certificatePolicyId` remain independent of catalogue/extension versions. Pure projection helpers count exact core IDs with matching course/core/content versions, deduplicate them, and report optional progress separately. Adding an optional lesson changes neither the core denominator nor the original certificate policy. Old core progress does not award the optional lesson. These helpers and their evidence types do not establish identity, assess answers, issue certificates or authorize access.

Eligibility to study, sequential prerequisites, early milestones and core graduation are distinct concepts. Study eligibility does not require prior completion. The pure prerequisite helper checks the full prerequisite chain. No application path calls a pure helper on client claims to grant access.

## The security boundary stays closed

Full lessons, assessments, verified progress and awards remain unavailable. The progress/reward/quiz API containment responses are unchanged. The dormant client progress gate and lesson-five graduation modal are replaced by unavailable-state compatibility components; neither serializes keys nor releases children from browser progress.

`lib/learning-authority.ts` is server-only and unconditionally returns unavailable/not complete. Frontend school, overview, access, terminal and automation consumers no longer treat an owner role, session `schoolCompleted`, raw backend records or browser cache as core graduation. Activation and resume are denied before state I/O, including for claimed administrators. Pause and emergency-stop behavior is retained. Auth checks are not relaxed; a hardcoded admin fallback is also removed from the rewritten school page.

This deliberately makes activation unavailable in the review copy. It is not a functioning authenticated learning system or a complete platform security fix. Existing identity issuers, legacy completion flags, raw Python progress writers/proxy, other administration paths and already-running external automation still require the separately reviewed security work. This patch neither starts nor stops a trading service and does not revoke any real account/session.

## Review patch order

Base upstream commit: `9ad38452e6a4b475dd5ef108d9cc14537b7b49fd` (confirmed as current upstream HEAD during inspection).

Use a separate disposable review copy and inspect these patches in order:

1. `velarion-crawl-claims-review.patch` — public crawl/claims baseline.
2. `velarion-course-containment-review.patch` — private-source separation and summary-only lesson/assessment containment.
3. `velarion-secure-learning-rewards-review.patch` — unavailable progress/rewards boundary and unwired policy proposal.
4. `curriculum-manifest-review.patch` — this incremental manifest/consumer patch.

Do not reapply prerequisites already present. Patch 4 is not standalone against upstream. All application and patch-apply checks are confined to separate sandbox review clones; no user checkout, commit, push or deployment is changed. The review branch contains no new commits.

Reopening content requires a later approved genuine identity/session authority, transactional owner-bound completion store and grading service, migration/reassessment policy, reconciled private assessment bank, and adversarial integration tests. That later work must explicitly replace the unavailable authority and audit every alternate writer/activation path. Do not remove containment just because a manifest or pure policy test passes.

## Intentional fixed references

- The 30-ID required core set and approved legacy ID/route mapping are deliberate owner policy. They are explicitly listed and tested independently; optional lessons never redefine them.
- The five-ID early checkpoint is deliberate milestone policy, not a graduation threshold. The first-pass and core-midpoint checkpoints are named manifest policies; the midpoint derives from the fixed core set.
- `20` reward points per core first pass, and `3`/`7` streak thresholds, remain proposed reward policy, not curriculum caps. Core-only maximum points and badge counts derive from the manifest. Optional rewards require separate policy approval.
- Legacy private lesson/quiz banks, curriculum-generation history and source examples retain their original numeric content. They are not rewritten or reconciled here; both banks stay server-only and unused by delivery/grading.
- Python `api/app.py` still has its old five-lesson progress projection and unsafe raw writer; storage/auth issuers retain legacy flags. They are not trusted by the new frontend learning gate, are not an all-core certificate, and remain explicit backend remediation blockers—not an acceptable graduation implementation. No cross-language manifest duplicate is introduced to make those unsafe records appear authoritative.
- Five journey steps, six overall access requirements, consent counts, cookie lifetimes, time windows, CSS dimensions, trading limits and other unrelated numbers are not lesson counts and are left alone. Old test fixtures and historical validation reports retain snapshot-specific counts.

## Validation

Run on Node 24 with `npm ci`, `npm run test:curriculum`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`. The TypeScript configuration permits `.ts` imports for native Node test loading; no new package dependency or lockfile change is needed.

Focused HTTP tests run only against a disposable loopback production frontend with a fresh local signing key, no provider/broker environment, no backend listener and no Python application startup. They test containment under hostile signed fixtures, not genuine authentication. The inherited real identity/persistence/transaction tests remain explicitly blocked/skipped. Exact measured results are in the accompanying external `VALIDATION.md`; private review/source artifacts must not be copied into public/static hosting.
