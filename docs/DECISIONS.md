# Architecture Decisions

Append-only historical decisions. Date: 2026-10-27 (Africa/Cairo).

| ID | Status | Decision | Reason / consequence |
| --- | --- | --- | --- |
| ADR-001 | IMPLEMENTED | Independent monorepo and read-only discovery | Preserve existing application behavior and production data. |
| ADR-002 | IMPLEMENTED | Personal, health and corporate are distinct domains | Corporate connector is disabled and absent from GitHub allowlist; no health-to-cloud AI data flow. |
| ADR-003 | IMPLEMENTED | React/Vite static client first, Next.js deferred | Tauri uses a static frontend; current shell does not need SSR. |
| ADR-004 | IMPLEMENTED | Minimal loopback API before NestJS/Postgres | Deliver an executable slice without pretending persistence/multi-user auth exists. Production remains blocked. |
| ADR-005 | IMPLEMENTED | All writes disabled at policy and HTTP boundaries | Confirmation alone is insufficient to authorize an unimplemented action. |
| ADR-006 | IMPLEMENTED | Existing WHOOP OAuth remains the source | Build delegated read access later, not a second token inventory or privileged DB coupling. |
| ADR-007 | IMPLEMENTED | Timesheet getState is not safe read-only | It initializes sheets/data; prefer private Sheets read scope later. |
| ADR-008 | IMPLEMENTED | Lexora launch-only | Browser-local progress has no established server API. |
| ADR-009 | IMPLEMENTED | No default AI memory/audio retention | Privacy, deletion and consent must precede persistence. |
| ADR-010 | IMPLEMENTED | Voice diagnostic before quality claims | Microphone visualization and system TTS are test tools, not measured STT/TTS delivery. |
| ADR-011 | IMPLEMENTED | No deployment in initial CI | User requires explicit deployment authorization. CI checks only. |
| ADR-012 | IMPLEMENTED | Upgrade Vite 7.1.7 → 7.3.7 | npm audit identified advisories; patched version returns zero known vulnerabilities in this environment. |
| ADR-013 | BLOCKED | New private GitHub repository creation | No create-repository connector tool; no gh or shell credentials. Keep independent local Git project and deliver complete source archive. |

## Voice engine evaluation — design only

| Candidate | Fit | Risks / required evaluation |
| --- | --- | --- |
| faster-whisper multilingual + Silero VAD | Local CPU int8 or CUDA; push-to-talk first | Model size/RAM/CPU latency, silence hallucination, Egyptian dialect, code-switching. Distil English examples are not Arabic evidence. |
| whisper.cpp | Native/local candidate for a Windows sidecar | Packaging, model licensing, CPU latency and thread budget need real Windows tests. Not installed. |
| Streaming wrapper / whisper_streaming | Incremental stabilized transcripts | Added scheduling and endpointing complexity; partial revisions and speech interruption must be handled. No performance claim. |
| Cloud streaming STT | Optional low-local-resource path | Explicit audio consent, provider retention/region, service cost and dialect benchmark needed. No provider selected or contacted. |
| Piper | Offline neural speech candidate | Exact Arabic voice availability, naturalness, model quality and GPL/model licenses must be reviewed before distribution. |
| Neural cloud TTS | Optional natural/streaming speech | Compare Arabic/Egyptian voice listening scores, first-audio latency, usage cost, privacy and cancellation. No paid call made. |
| Browser system TTS | Current diagnostic fallback | Voices/Arabic support vary by OS; no guaranteed quality or audio activity synchronization. |

M5 evaluation corpus: at least 30 synthetic script utterances plus user-approved recordings spanning Egyptian Arabic, English, mixed speech, ProgressXX/WHOOP/Lexora names and automotive product names. Record engine/model/version/hardware, word error rate with explicitly documented normalization, named-entity accuracy, p50/p95 time-to-final/first-audio, interruption result and human intelligibility rating. Suggested targets are hypotheses, not current measurements; choose release thresholds after baseline and user review.

## 2026-10-27 — workspace follow-up

| ID | Status | Decision | Consequence |
| --- | --- | --- | --- |
| ADR-014 | IMPLEMENTED | Session-owned short-lived GitHub cache and conditional reads | No source cache shared between sessions; ETag revalidation and provider cooldowns reduce repeated requests. |
| ADR-015 | IMPLEMENTED | Persist only validated device preferences | Language/timezone/motion/quiet survive reload; no user data or token persistence is added. |
| ADR-016 | IMPLEMENTED | Revocation checks on both sides of asynchronous reads | Server rejects revoked in-flight reads; client ignores prior-session responses and clears workspace on 401. |

## 2026-10-28 — local launcher

ADR-017 (IMPLEMENTED): keep the current browser foundation runnable through setup/start BAT wrappers and a Node supervisor before Tauri packaging. Use hidden stdin password prompts, immutable existing-config handling and fixed loopback endpoints. No auto-install at normal startup, no elevation, global startup policy changes or unrelated-process termination. Windows CI and physical Windows acceptance are distinct gates.

## 2026-10-28 — core personal context

ADR-018 (IMPLEMENTED): explicit editable profile and transparent deterministic rules before model personalization; no deep-learning claim. ADR-019 (IMPLEMENTED): optional password-derived encrypted local notes/check-ins, separate from transient health tokens/records. ADR-020 (IMPLEMENTED): reuse existing WHOOP read path through session consent/sign-in; no second OAuth or vendor sync. ADR-021 (IMPLEMENTED): calories use entered target minus recorded intake, and free slots require declared schedule completeness; unknown data remains unknown.

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

ADR-006: prefer a clearly labelled owner-selected ProgressXX snapshot over guessing authoritative cloud merges. Reject incomplete imported data rather than silently generating partial totals; no overwrite of JARVIS manual entries. ADR-007: introduce optional local AI without tools, with server-selected least-context scopes, revocable bounded history and separate health consent. Generated source envelopes establish supplied context, not truth. ADR-008: implement on-device-first browser speech with reviewed drafts; fail closed for unsupported local packs, never silently upload. Browser-service speech remains explicit and separately consented. Native local engines and measurements remain separate milestones.

## Offline speech slice — 2026-10-30T10:01:35+02:00

ADR-009: use a bounded one-shot offline Python worker with strict PCM input instead of opening an unauthenticated inference port. Require an existing converted local model and explicit optional installation. Favor final-only review for this first worker; no fake streaming partials. ScriptProcessorNode is a measured-fixture fallback, not the final audio architecture; AudioWorklet and real-device DSP/latency acceptance remain TODO.

## Built-runtime slice — 2026-10-30T11:06:04+02:00

ADR-010: keep development startup intact; add explicit build + single-service local runtime. Use an in-memory entry allowlist, not repository-directory serving or Vite preview. No implicit rebuild or private API caching. Future chunks/assets require a tested manifest extension.

## Daily-workspace preview — 2026-10-30T15:09:36+02:00

ADR-011: deliver a coherent daily workflow and one combined trial. Keep management forms in five daily sections and preserve unlocked drafts across navigation. ADR-012: imported nutrition is an explicit transient Home view, never a silent merge or AI context. ADR-013: publish a clean built preview artifact with built-only first-run setup; no runtime npm installation, models or credentials bundled, no reuse/deletion of an older preview directory. Preserve revision checks and reject stale editors even after reload.


## Session 010 — 2026-10-31T15:01:58+02:00

ADR: independent portable password and versioned Web Crypto envelope instead of copying the server vault or exporting plaintext. Explicit replacement rather than implicit merge. Reported timestamp is metadata, not source authentication. No secret recovery claim.


## Session 011 — 2026-11-01T17:32:39+02:00

ADR: show actual source fields with compact details instead of inferring prescriptions from recovery. Open WHOOP physiological cycle is labelled as such; no calendar-day or cumulative workout-energy claim. Missing data stays unknown. Deduplicate source IDs before status filtering to avoid using obsolete scored versions. Untimed notes remain owner-authored notes, not invented appointments.


## Session 012 — 2026-11-01T19:22:58+02:00

ADR: implement open-workspace reminders rather than claim a closed-app scheduler before native/PWA infrastructure. Default off, five-minute lateness limit and no pre-arming replay. Desktop payload is generic and silent-requested; privacy takes priority over displaying note text on the lock screen. Automatic welcome uses only reported device-local voices even if explicit speech has network consent.


## Session013 — 2026-11-02T08:33:21+02:00

ADR: use a local terminal wizard rather than add an HTTP endpoint that writes .env or starts arbitrary executables. Append validated overrides to preserve owner text/unknown credentials; reject unsafe env quoting and detected concurrent changes. No automatic model pull, Python execution or global Ollama setting mutation.


## Session014 — 2026-11-02T13:31:37+02:00

ADR: preserve legacy filenames and add ordered aliases rather than break existing shortcuts. Repair complete source downloads through the same preview setup; fail with extraction guidance when source/build inputs are incomplete. Normalize missing-dist errors before password/setup or API spawn. Repeated nested folder names are supported; do not tell users to delete private files to repair a missing build.


## Session015 — 2026-11-02T13:54:55+02:00

ADR: expose clear save-versus-session choice instead of silently enabling storage. Five recorded-input steps are not readiness/health scoring. Quick capture uses explicit form fields and review, not guessed natural-language dates or model writes. Stale local previews require another review even if only another field changed.


## Session016 — 2026-11-02T14:45:01.942826+00:00

ADR016: use a no-IPC fixed-origin Tauri2 host first, preserving the tested Node runtime and encrypted file format. This reduces native surface but requires step02 and separate WebView login; external app launches are blocked in the native preview. No installation/signing/tray/Agent claims. Direct Rust crates pinned; generated transitive lock must be captured and committed after bootstrap CI.


## Session016 final status — 2026-11-02T14:57:03.396000+00:00

ADR016 acceptance: the fixed-origin no-IPC host compiled and passed Rust/EXE probes on Windows CI. Retain separately owned Node runtime for this preview; add sidecar lifecycle/secure Agent only with dedicated tests. Windows checkout CRLF is normalized only when comparing lock to Git source; archive manifest hashes remain byte-exact. See TEST-REPORT.md and docs/evidence/desktop-final-ci.json.


## Session031 — 2026-11-06T19:28:47.554395+00:00

Online Settings describes hosted capabilities rather than local setup commands. The cloud API returns authenticated explicit availability metadata for unsupported optional services, with no invented sync dates or health facts. Server chat-clear acknowledges absence of retained cloud conversation state.


## Session 032 — Enforce limits while reading

Adopt one streaming UTF-8 reader for cloud request and Redis response boundaries. Check Content-Length when present, but independently count actual bytes for missing or misleading lengths. Cancel on failure. Keep upstream failure details out of client responses. Retain existing encrypted vault and session design.


## Session 033 — Password recovery boundary

TESTED locally: password-hash-scoped cloud sessions reject prior credentials/cookies without changing vault encryption. Bilingual Settings recovery guidance and docs/05-RESET-ONLINE-PASSWORD.md describe owner-managed Production secret replacement and redeploy. Actual secret reset awaits owner entry; old immutable deployments retain their config. Local typecheck/build, 84 Node tests and built browser 39/39 plus cloud/PWA checks passed. CI runner pinned Ubuntu 24.04 after observed Playwright incompatibility with ubuntu-latest/26.04; exact-source remote CI pending. No production records accessed; desktop deferred.


## Session 034 — Email recovery

IMPLEMENTED/TESTED locally: optional in-app owner email recovery, bounded codes/HMAC/TTL, rate limits, atomic one-use/CAS password update, shared credential hash and revocable hash-scoped sessions; encrypted vault key unchanged. Bilingual UI has explicit missing-setup state and no automatic sending. Recovery email and Resend key/from must be configured by owner once; live setup/delivery remains BLOCKED, no production email sent. Older immutable deployments and bootstrap-hash rollback are separate security boundaries. Final local checks: 89 Node tests pass, one real-Redis CI test skipped locally; typecheck/build pass; built browser 39/39 plus recovery/cloud/PWA scenarios pass. Added Redis service in CI for actual Lua test; source CI/deployment pending. See docs/05-RESET-ONLINE-PASSWORD.md for everyday flow and setup. Removed failing inline PowerShell example with dated correction.


## Session 040 — Explicit recovery function routes

Production nested recovery dispatch was found to return Vercel 404 before reaching the application, despite available:true configuration. Added explicit request.ts/complete.ts function entries reusing the shared handler. Local typecheck/build and 89 Node tests pass (one real-Redis test reserved for CI). No credential/key rotation performed. Source CI/live nested GET and authorized send acceptance pending publication; actual password entry remains owner-only. Earlier synthetic/UI evidence did not establish platform routing. See Session 040 in Development Log.


## Session 042 — Simplified daily web workspace

IMPLEMENTED/TESTED locally: prominent focused workspace sign-in; compact one-step onboarding/checklist disclosure; functional pre-profile daily navigation; sticky responsive navigation; optional note scheduling; local app search; corrected cloud install instructions and WHOOP manual fallback without unusable credential form. Original source provenance, explicit save consent, review/confirm, conflict/draft handling, RTL and reduced-motion support retained. Readable navy/cyan style; no extra dependencies or backend/data mutations. Local typecheck/build and 90 Node tests pass (one real-Redis test reserved for CI); built baseline 39/39 plus UX/cloud/recovery/PWA passed before an added final 320px probe, pending at this entry. Exact-source CI/live acceptance pending publication; physical device/native/real health connection acceptance not claimed. Session 041 provider acceptance does not establish owner reset completion. Desktop deferred. See Session 042 Development Log for files, commands, failures and next steps.


### Session 042 CI follow-up — 2026-11-09

Source 556b2e709016691098abb970f81a7e079d5072da deployed READY (dpl_9q9SeWMDkz1SQXBHYC6FXv19M9Dc), but GitHub run 42611912523 foundation failed at the immediate English 320px document-width assertion in tests/browser.mjs:188. This corrects any inference that local success established remote acceptance. Windows launcher passed; desktop status is recorded separately, with desktop product work deferred.

Three additional local built-browser reproductions passed, including an explicit 45-degree decorative orbit probe; no remote cause was established from the old boolean-only assertion. The narrow-screen test now waits two animation frames after resize/language changes before measuring rendered layout and includes element bounds on failure. This is test synchronization, not a claimed CSS root-cause fix. No assertion was removed, widened or replaced with page overflow hiding. Exact-source CI must pass before final acceptance. Added docs/06-USE-JARVIS-ONLINE.md and README link for six simple everyday steps and honest online/source limitations. No owner data or recovery email used.


### Session 042 narrow-screen root cause and fix — 2026-11-09

GitHub run 42612973436 for e9596ea3ff70b898f8d66671f1431e97c51e948f failed the retained 320px assertion after resize synchronization. Diagnostics establish a real layout defect, not a resize race: document width 347px for a 320px viewport; .daily-side children (next-agenda/quick-capture/captured-notes) extended from x16 to x347.03125. The implicit grid track used its children's minimum-content width, including the calendar heading/button. The earlier synchronization-only change did not resolve the remote failure.

Implemented explicit minmax(0,1fr) sidebar track, shrinkable child panels, wrapping calendar/notes headings and long names/text. No document-level overflow hiding. A separate local anonymous-entry 320px probe found a one-pixel decorative overflow; confined the animated core effects to their own decorative stage and kept glow inset inside it. Added UX-07 anonymous narrow-entry acceptance with a forced 45-degree core angle. Existing UX-06 retains English/Arabic authenticated document-width assertions and failure geometry. No backend/auth/credential/mail changes. npm run check and built-browser acceptance are being rerun; exact-source remote result remains pending.


### Session 042 web acceptance and deployment — 2026-11-09, 14:02 Africa/Cairo

VERIFIED web source: 1e1900d378e9c48425f048de1c95a5ac67817435 (fix: constrain daily sidebar and decorative core on narrow screens). GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42613399749: foundation SUCCESS and windows-launcher SUCCESS. Foundation job 129147229318 logs establish 91/91 Node tests, zero failures/skips (including real Redis), typecheck/build, five launcher tests, development browser 39/39 and built browser 39/39. Additional UX-01 through UX-07, synthetic recovery/cloud and PWA cases passed; exact-source English/Arabic 320px assertions now pass after the grid fix. Native Windows CI is still running at this entry; no new desktop engineering or physical-device acceptance claimed.

Vercel Production dpl_3XcE17NeDa7BpbmLMFUvfoGkVyW1 READY, exact githubCommitSha 1e1900d378e9c48425f048de1c95a5ac67817435; primary alias https://jarvis-os-henna-sigma.vercel.app/ confirmed in native deployment metadata. GitHub publication used guarded main ref updates; PR none. No manual duplicate deployment needed. Earlier 556b2e/e9596e CI failures are retained above and superseded only by this exact-source successful web evidence.

Local final npm run check PASS (90 pass plus CI-only Redis skip); npm run test:e2e:built PASS including UX-07; git diff --check PASS. Visual review: latest synthetic desktop Home is readable, summary no longer stretches to sidebar height, quick capture visible, details collapsed; no real owner records inspected. Built JS 341.88 kB (109.88 kB gzip), CSS 34.00 kB (8.28 kB gzip); no new dependency. These are build sizes, not measured runtime performance scores. Worktree synchronized to published source; untracked node_modules symlink is dependency-only and not committed.

Files: six UI components/main/CSS, browser suite, README, docs/06-USE-JARVIS-ONLINE.md and nine tracking documents. Session status: IMPLEMENTED/TESTED/VERIFIED for listed web behavior only; not RELEASED v1. Remaining: cloud automatic WHOOP access and live ProgressXX sync unavailable; current supported paths remain manual sleep and explicit backup import. Real owner email receipt/password reset completion is unverified from Session 041; no new mail sent. Corporate integrations remain isolated; desktop deferred. Production authenticated owner-data acceptance intentionally not performed with real records.

Next actions: observe native CI terminal status and append result; owner can use online link directly without downloading. Next development sprint should prioritize a secure read-only cloud WHOOP adapter reusing the existing application backend after inspecting its actual deployment/authentication constraints, with synthetic connector tests before owner-authorized real-data acceptance. Do not invent health readings, send more recovery codes, change vault keys or expose credentials. This final evidence documentation commit uses [skip ci]; runtime and test artifacts remain the exact tested source above.


### Session 042 terminal CI evidence — 2026-11-09

GitHub run 42613399749 now has all three jobs completed SUCCESS: foundation 129147229318, windows-launcher 129147229269, desktop-windows 129147229047. This verifies automated checks for source 1e1900d378e9c48425f048de1c95a5ac67817435, not physical Windows behavior or new desktop functionality. No remaining CI blocker for this web sprint. Final docs-only commit follows; production runtime already READY at the exact tested source.


## Session 043 — Read-only cloud account connectors (2026-11-09, Africa/Cairo)

IN PROGRESS, M3 web integration. Owner confirmed password recovery worked and requested WHOOP/ProgressXX synchronization. Only JARVIS repository modified; no source-app repository, production schema, auth configuration or WHOOP OAuth deployment changed. No real health records, sign-in credentials or email dispatch used in engineering tests.

Discovery: inspected current source through GitHub: WHOOP tree 22f16886dc3fca87220fcc8ee11352deb5a3bd33, functions/whoop-data and index.html; ProgressXX tree 26f96d24045a896688c69e7acc3083013d97dc9f, index.html and SUPABASE-SECURITY-AUDIT.md. WHOOP index uses existing Supabase email sign-in; whoop-data action read returns saved payloads and sync_history, whereas action sync writes/refreshes vendor state and is deliberately never called. ProgressXX uses password-based app auth and owner-RLS tables; food_entries contains already calculated food macros, legacy_workout_entries uses pxlog: IDs, weight_checkins contains weight rows, schedule's saved snapshot remains authoritative. Local pending edits/conflicts cannot be inferred from cloud rows.

Architecture choice: per-JARVIS-session encrypted access-only grants, maximum one hour/source expiry, no refresh-token or password retention, no durable/background account delegation. WHOOP can verify an unused existing app sign-in email link through its fixed Supabase verify endpoint; JARVIS does not request that email or follow arbitrary URLs. Fixed projects/public publishable keys only, owner filters plus existing RLS, no service-role key or database writes. Source tokens inherit existing account privileges; JARVIS server allowlist enforces read-only operations, not a newly minted provider read-only OAuth scope. MFA unsupported and fails closed.

Implemented pending acceptance: /api/integrations connect/status/disconnect/refresh with JARVIS auth/CSRF/explicit health consent; /api/whoop and /api/progress reads, five-minute encrypted projection cache, distributed read lock, request limits, CAS and disconnect tombstones to discard late results. Disconnect/logout removes usable local grants without signing out the original app. ProgressXX totals fail closed for invalid/duplicate or >=500-row bounded responses; food uses configured local date, no-food unknown differs from zero. Schedule labels are not appointments. Thirty-day workout-table scope excludes older snapshot-only history, weight scope fifteen days. No local outbox replay or write to original tables.

Frontend: original-account forms, optional WHOOP unused email-link verification, credential fields cleared before await/on navigation, explicit session-only consent/expiry, cloud ProgressXX metrics and optional transient nutrition on Home without overwriting manual records or imported files. Existing file import retained. Last read is labelled separately from WHOOP's last completed upstream sync. Source health data is not silently sent to AI memory.

Commands/attempts: git fetch/worktree from 0a9e7c8cb3499f2d8b771e36af9563053be3ae74, rg/source reads, npm run typecheck, targeted Node tests and npm run check; browser test attempt initially lacked Chromium cache, installing pinned headless binary to workspace. Supabase changelog markdown fetched via curl after search tool unsupported markdown; relevant current auth docs consulted. Initial TypeScript parameter properties were incompatible with erasableSyntaxOnly, replaced with declared fields; fake Redis test initially lacked DEL support, corrected test transport. These were development failures, not production defects.

Files created: packages/connectors/src/account-reader.ts; apps/api/src/cloud-accounts.ts; apps/web/src/CloudConnections.tsx, LiveProgress.tsx; api/integrations.ts, api/progress.ts; tests/account-reader.test.ts, cloud-accounts.test.ts. Modified cloud-handler.ts, PersonalHome.tsx, style.css, connector manifests, browser acceptance and tracking docs. No dependencies added. Tests/CI/deployment for final source remain pending. PR none; no commit yet. Exact next: finish source-failure/cache/session/RTL browser acceptance, validate new Lua with CI Redis, complete typecheck/Node/build/browser checks, publish guarded GitHub source, verify exact-source CI and deployment, update log/handoff. Actual source-account login and source-row availability remain owner acceptance, not yet verified.


### Session 043 local acceptance — 2026-11-09

TESTED local final npm run check: typecheck/build PASS, 104 registered Node tests, 102 pass, two intentional CI-only Redis skips, zero failures. Built browser acceptance PASS 39/39 baseline plus UX-01..07, synthetic cloud password/email-link linking, explicit consent, cloud WHOOP projection, 777-kcal ProgressXX cloud food selection, RTL/English 320px bounds, recovery and PWA cases. Synthetic fixtures only. Added real-loopback Redis account test for CI to exercise the actual CAS/TTL/lock/disconnect Lua. Real source-user login, deployed source-table availability and email-link delivery are not established by these tests.

Added docs/07-CONNECT-FITNESS-ACCOUNTS.md and README link. Clarified session duration, direct-app credentials versus JARVIS/vendor passwords, no new email send, original-app pending-change limits, no source writes. Source refs confirmed by GitHub main refs: WHOOP 22f16886dc3fca87220fcc8ee11352deb5a3bd33; ProgressXX 26f96d24045a896688c69e7acc3083013d97dc9f. Earlier discovery labels called them trees; these are also the returned main commit refs. No source repo modifications.

Review: no conditional hooks/new dependencies/secret browser persistence; async request generations discard old responses, disconnect tombstones prevent resurrection, AES-GCM AAD binds provider/session/namespace, source tokens/health projections are encrypted and TTL capped to remaining source lifetime. Independent ProgressXX reads run in parallel; errors fail closed; source errors do not invalidate JARVIS auth. Health records remain outside ordinary personal backups. Global source logs contain only allowlisted action/outcome/error code, no emails, links, IDs, credentials or health values. Existing WHOOP data projection remains the reference. Desktop work deferred. Next: publish reviewed source and inspect exact-source GitHub/Vercel results; record failures rather than imply remote acceptance.


### Session 043 first published source acceptance — 2026-11-09T16:28:02+02:00

Source 76a680029c35c5d9707f230caaf38f71a4022703 published by guarded main update, PR none. Exact-source GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42634560862: all three jobs SUCCESS (foundation 129219169087, windows-launcher 129219169619, desktop-windows 129219169606). Foundation logs establish 104/104 Node tests, zero skips/failures, both real Redis cases including account CAS/TTL/lock/disconnect race, typecheck/build, five launcher tests, development and built browser 39/39 baseline plus cloud linking/RTL/PWA cases. VERIFIED automated behavior, not actual source-account access.

Production dpl_E3MR2sHxn6znK5wsG4q6WZomBM9P READY at exact githubCommitSha 76a680029c35c5d9707f230caaf38f71a4022703, primary alias https://jarvis-os-henna-sigma.vercel.app/. Runtime error scan 2026-11-09T14:13:01.821Z–14:28:01.821Z returned no matching logs; this is not proof of authenticated source reads. Initial log-tool level argument expected an array, corrected without any application action. No new env variables, provider emails, database/schema mutations or real source-health reads.

Final documentation review found obsolete online guidance still claiming cloud WHOOP/ProgressXX reads were unavailable. Updated current guide06/README/import guide while retaining all historical logs. Small Home cleanup hides the empty file-import panel in cloud mode until a file exists, keeping the live connection panel primary; Sources still offers import fallback. Final source checks/publication follow, with exact-source evidence to be appended.


### Session 043 final source follow-up — 2026-11-09T16:32:30.343327+02:00

IMPLEMENTED/TESTED: connected-source Read saved records returns Home without clearing its nutrition selection; stale component auth callbacks are guarded after unmount; empty cloud file panel hidden until a file is imported. Added browser acceptance for disconnect clearing cloud food and wiping a password draft when leaving Sources. Final follow-up typecheck/build PASS and built-browser 39/39 baseline plus cloud/password/email-link/RTL/credential-cleanup/PWA cases PASS (test-results/session043-frozen-browser.log). Backend unchanged from the 104/104 exact-source CI-successful 76a6800 revision. Final source commit/remote CI/deployment pending at this entry. No new real-data test or email send.


### Session 043 final web handoff — 2026-11-09T16:35:56.649296+02:00

VERIFIED automated web source b91e2351557408737a464fc39c019a5d66c69a61; GitHub https://github.com/3bHussein/JARVIS-OS/actions/runs/42635715490. Foundation job 129223198231 SUCCESS, windows-launcher 129223199065 SUCCESS. Foundation logs: 104/104 Node tests, zero failures/skips including real Redis account CAS/TTL/lock and recovery race tests; typecheck/build and five launcher tests; dev browser 39/39 and built browser 39/39 baseline plus source linking/credential navigation cleanup/nutrition reset/English-Arabic mobile/PWA acceptance. Native CI job 129223198663 remains in progress at this entry; native product work is deferred and physical Windows acceptance is not claimed.

Production dpl_74Zv9KTCSnR1wxpuEHTbVW6puWXW READY, exact githubCommitSha b91e2351557408737a464fc39c019a5d66c69a61; primary alias https://jarvis-os-henna-sigma.vercel.app/ confirmed. Scoped error log scan 2026-11-09T14:20:04.655Z–14:35:04.655Z returned no matching logs. No useful production source-read signal was generated; this is not proof of owner source login/table availability. No owner password, sign-in link, real health record, recovery-code send, new vendor OAuth, source repo change or production schema migration performed. Commit publication guarded against expected parent, PR none. README and numbered guides06/07 updated; nine tracking docs append-only. Worktree synchronized to published runtime; dependency-only node_modules symlink excluded.

Status: session-scoped saved cloud reads IMPLEMENTED/TESTED/VERIFIED with synthetic and CI Redis evidence, not RELEASED v1 or verified real-owner synchronization. Data scopes/freshness/consent boundaries are described in docs/07-CONNECT-FITNESS-ACCOUNTS.md. UI is available under Sources: ProgressXX original app password or WHOOP Intelligence original account password/unused email sign-in link, explicit read consent, Connect read-only; Read saved records retries without reconnecting. Periodic saved reads every five minutes while visible; access expires with source session (<=one hour) and lock clears it. Home cloud food is an explicit transient choice; no manual-data overwrite.

Remaining and exact next actions: owner enters source credentials/unused source-app link only in the web form and grants consent, then validate live account connection, WHOOP upstream freshness and actual ProgressXX saved-row coverage. Never request credentials/links in chat. Failed table/auth/schema availability must be diagnosed with redacted metadata and synthetic reproduction before any schema/source-app change; such changes need explicit authorization. Durable background delegation/refresh, MFA/PKCE support, full older snapshot/workout reconciliation and owner data acceptance remain TODO. Inspect native CI terminal status if still running at handoff. Do not replace vault keys, trigger WHOOP vendor sync, write source tables, replay ProgressXX pending queues or expose corporate data.


### Session 043 terminal CI — 2026-11-09, Africa/Cairo

All three jobs in exact-source run 42635715490 are now completed SUCCESS: foundation 129223198231, windows-launcher 129223199065, desktop-windows 129223198663. This supersedes only the pending native CI status above; physical device/owner source-data acceptance remains unverified. Final docs-only evidence commit uses [skip ci]; tested production runtime remains b91e2351557408737a464fc39c019a5d66c69a61.


## Session 044 — Source status and recovery usability (2026-11-09T16:50:03.327717+02:00)

IN PROGRESS, M3 web synchronization usability. Requested continuation after session-scoped connectors. Base cd584380a0c6874dfefa05c600e84f2c906ae7be. No source app repositories, production schema, credentials, mail or real health records accessed/changed. Desktop deferred.

Implemented: connected grant versus successful saved read are distinguished; source expiry and last-read timestamps use configured IANA timezone; locally expired metadata no longer displays Connected. Source metadata refreshes on opening Sources, visible-page return and once/minute while Sources is open, without generating upstream data reads. Request epochs ignore stale metadata responses and controls clear on navigation. Source failures have bounded bilingual explanations (expiry, missing vendor link, busy, rate limits, row limit, invalid fields); unknown server text is not echoed. Retry saved read is available from Home after failures.

Fixed a cross-source UX bug: changing WHOOP used to clear selected ProgressXX cloud nutrition and refetch both sources. Change callbacks are now provider-specific; changing/disconnecting WHOOP preserves ProgressXX food, while changing/disconnecting ProgressXX clears its selection to avoid using another account's food. A failed ProgressXX refresh hides unavailable totals, keeps the explicit selection, and a successful retry restores that source without overwriting manual data.

Files: new packages/connectors/src/account-status.ts and tests/account-status.test.ts; modified CloudConnections.tsx, PersonalHome.tsx, LiveProgress.tsx, HealthOverview.tsx and tests/browser.mjs; tracking docs and guide07. No backend/auth/grant-lifetime/dependency changes. Commands: isolated worktree/git fetch, rg/source review, npm run check and built-browser acceptance. First local check passed 107 registered Node tests, 105 pass/two CI Redis skips; initial browser pass 39/39 plus UX/cloud/PWA. Added subsequent source-error/retry assertions; final rerun pending. Tests are synthetic only. PR/commit/CI/deployment pending for this source.

Next: finish checks for error masking/retry and cross-source nutrition preservation, publish guarded source, inspect exact-source CI and Vercel, append final log/handoff. Owner source-login acceptance remains TODO; no credentials/links in chat, no vendor sync or original table writes.


### Session 044 final local checks — 2026-11-09, Africa/Cairo

TESTED npm run check PASS: 107 registered Node tests, 105 pass/two intentional CI-only Redis skips, zero failures; typecheck/build PASS. Final built browser PASS 39/39 baseline plus source UX/PWA/recovery cases. Extended UX-06 verifies a synthetic row-limit failure hides 777-kcal cloud totals, retry restores them with selection intact, WHOOP disconnect leaves ProgressXX selection/food intact, and ProgressXX disconnect clears it; existing credential navigation cleanup and bilingual 320px bounds still pass. STATUS-01..03 exercise expiry/malformed metadata, last-read boundaries, configured Cairo/Dubai times and bounded bilingual failures. git diff --check PASS. No runtime edits after this run. Remote source/CI/deployment pending.


### Session 044 final evidence and handoff — 2026-11-09T16:54:56.586847+02:00

VERIFIED automated source 3ab5726d69bea911b868ad9687b9c6777272ee8a. GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42638797812 completed SUCCESS, all three jobs: foundation 129234013830, desktop-windows 129234014223, windows-launcher 129234014369. Foundation logs confirm 107/107 Node tests, zero failures/skips, real isolated Redis tests retained, typecheck/build, launcher tests, development/built browser 39/39 each plus extended cloud retry/isolation/credential/RTL/PWA cases. This verifies synthetic behavior and automated packaging, not actual owner source login or physical Windows operation.

Production dpl_3HAvnrjsk7hGYYMSjxyqnZHMRWJV READY at exact githubCommitSha 3ab5726d69bea911b868ad9687b9c6777272ee8a; primary alias https://jarvis-os-henna-sigma.vercel.app/. Error scan 2026-11-09T14:39:27.856Z–14:54:27.856Z returned no matching logs; not proof of authenticated live-data access. No new mail/keys/env/schema/source-repo operations. GitHub guarded main update succeeded, PR none. Log/handoff and all tracking docs appended. Docs-only final evidence commit uses [skip ci]. No extra deployment requested.

Final scope: source status/expiry/read dates use configured timezone; source-only metadata refresh and stale-response guards; bounded bilingual failure explanations/retry; changing WHOOP preserves ProgressXX nutrition selection, and source-read failures hide totals until successful retry. Session-scoped access still expires within one hour, with no durable background refresh or MFA/PKCE support. Owner acceptance of actual source sign-in and saved data coverage remains TODO. Exact next: owner uses Sources and original-app account credentials/unused WHOOP app sign-in link in the web form only; inspect redacted errors if unavailable, reproduce synthetically before modifying any source app or schema. Never ask for passwords/links in chat or infer missing health readings. Desktop remains deferred. Next product sprint can improve briefing/voice usefulness using only verified available sources; real health tests need explicit owner authorization.
