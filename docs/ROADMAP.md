# Roadmap

Status at 2026-10-27: M0 source discovery/design IMPLEMENTED with live-access limitations; M1 IN PROGRESS; M2 adapter IMPLEMENTED and synthetic TESTED only. No milestone is RELEASED.

| Milestone | State | Acceptance / remaining work |
| --- | --- | --- |
| M0 | IMPLEMENTED | Seven target repositories inspected, inventory and evidence matrix recorded, contracts/security/ADRs designed. Runtime/deployment facts not inferred from source. |
| M1 | IN PROGRESS | Responsive shell/core/local auth implemented. Remote repository and initial CI available; production auth, tenant model and persistence TODO. |
| M2 | IN PROGRESS | Selected-repository GET adapter and UI implemented with synthetic failure/auth tests. Session cache/ETags/status/cooldown implemented; OAuth app, live credential consent and pagination TODO. |
| M3 | IN PROGRESS | Delegated ProgressXX/WHOOP summaries, private Sheets reads, unified verified briefing, missing/stale state and account isolation acceptance. |
| M4 | TODO | Ollama/cloud provider adapters, read-only tool orchestration, attribution, memory controls and injection isolation. |
| M5 | IN PROGRESS (contracts/diagnostic only) | Push-to-talk STT, VAD, transcripts, correction, real benchmarks, selected neural TTS, audio-synchronized state. |
| M6 | TODO (launcher precursor available) | Tauri 2, credential vault, Windows Agent pairing/approval transport, tray, shortcuts, notifications/startup, Windows QA. |
| M7 | TODO | Delegated CloudHub metadata, Lexora optional progress bridge, factory approved actions and isolated corporate status. |
| M8 | TODO | Production auth/security, persistent audit, offline/PWA, accessibility/performance, cross-browser/devices, installer/signing, recovery, RC. |

## First implementation sprint

| Order | Task | Current evidence / completion gate |
| --- | --- | --- |
| S1-01 | Record actual repo/source pins and auth/storage | IMPLEMENTED: evidence JSON + audit. |
| S1-02 | Create private JARVIS-OS GitHub repo and publish foundation | IMPLEMENTED repository access and initial CI; supplied repository is public, private visibility not changed. |
| S1-03 | Shared time/freshness/tool/connector contracts | TESTED: unit tests. |
| S1-04 | Original responsive shell and animated core | IMPLEMENTED; Chromium synthetic E2E report is acceptance evidence only for covered flows. |
| S1-05 | Local dev owner sessions and fail-closed API | TESTED: HTTP/CSRF/expiry/revocation/rate-limit tests. Production authentication not complete. |
| S1-06 | GitHub safe read projection | TESTED: injected transport; live JARVIS runtime not connected. |
| S1-07 | Voice contracts and microphone activity diagnostic | IMPLEMENTED; browser synthetic microphone does not measure real voice accuracy. |
| S1-08 | CI source and traceability | IMPLEMENTED workflow; initial remote run 40495860032 passed; current batch exact-commit CI recorded separately. |

## Next sprint with no existing-project modifications

1. Publish the current workspace batch and confirm its exact-commit CI; no deployment. Supplied repository is public.
2. Implement production authentication design in an isolated local backend, persistent owner/domain schema and deletion/consent model with synthetic users. No production migration.
3. Connector metadata/cache/ETag/cooldown are implemented in the workspace batch. Add bounded pagination and a credential-wide budget after current acceptance.
4. Build Ollama read-only adapter and response source envelopes using synthetic context; no automatic tool execution from repository text.
5. Implement local voice sidecar prototype with model installation instructions, corrected transcript UI and synthetic audio corpus. Record measured limitations.
6. Resolve delegated integration contract designs and obtain approval before any existing repository change.

## Scope gates

No production database changes; no auto deploy/merge/destructive actions/credential rotation. Corporate and health live tests require explicit scope. Real-device and voice recordings acceptance are separate from synthetic automated tests.

## 2026-10-28 launcher delivery

One-window local startup and first-run setup implemented and tested on Linux. Windows CI added; result must be recorded separately. This is immediate local-browser access, not completion of M6. Continue provider adapters after launcher acceptance.

## Personal home milestone — 2026-10-28

Editable profile, private notes/check-ins, contextual home and session-only WHOOP saved-record reader implemented with synthetic acceptance. Automatic ProgressXX, task-service delegates, true live-account acceptance, background reminders, model-based personalization and sourced content recommendations remain TODO. No health data will be silently sent to future AI adapters.

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

M3: read-only ProgressXX full-backup preview IMPLEMENTED/TESTED; automatic sync remains TODO. M4: optional local Ollama conversation, scoped context and bounded editable/deletable session history IMPLEMENTED/TESTED; actual model quality and tool orchestration remain TODO. M5: browser on-device-first transcript review and speech output IMPLEMENTED/TESTED with synthetic events; local STT/VAD/TTS engines, accuracy/latency and device acceptance remain TODO. M6/M8 remain IN PROGRESS/TODO, not RELEASED.

## Offline speech slice — 2026-10-30T10:01:35+02:00

M5 offline STT adapter/capture/review/cancel IMPLEMENTED and synthetic contract TESTED. Actual faster-whisper dependency/model inference, VAD/Arabic quality, latency/CPU and physical device acceptance remain TODO. Local neural TTS, native Tauri/Agent/installer and automatic delegated integrations remain TODO.

## Built-runtime slice — 2026-10-30T11:06:04+02:00

Built frontend/API local runtime and no-node_modules lifecycle IMPLEMENTED/TESTED. M6 Tauri host, runtime bundling/installer, tray/shortcuts/startup, credential vault and scoped Agent remain TODO. Production identity/PWA and real voice/integration acceptance remain open.

## Daily-workspace preview — 2026-10-30T15:09:36+02:00

Large personal-preview batch IMPLEMENTED/TESTED locally: daily hub, planner/journal lifecycle, transient source selection, navigation context and ready-built packaging. One combined user trial follows exact-source CI. M3 automatic delegated sync, M4 real model/tool acceptance, M5 actual speech/VAD/latency, M6 Tauri/Agent and M8 production gates remain TODO/IN PROGRESS.


## Session 010 — 2026-10-31T15:01:58+02:00

IMPLEMENTED portable personal backup/restore. TESTED pure crypto roundtrip/tamper/bounds/capacity and development UI journey. M1/M3 overall IN PROGRESS; native packaging, real source integration/voice acceptance and multi-user production remain TODO.


## Session 011 — 2026-11-01T17:32:39+02:00

IMPLEMENTED Home WHOOP/ProgressXX daily source details and reviewable untimed notes/read-aloud. Local core64/64 TESTED; browser/remote verification pending at this entry. M3 remains IN PROGRESS: automatic delegated ProgressXX/Timesheet integration is still TODO. Native Windows/voice/model/production gates remain open.


## Session 012 — 2026-11-01T19:22:58+02:00

IMPLEMENTED optional one-shot voice welcome and session-only in-app/desktop-generic reminders. TESTED Node67/67 and dev36/36 at this entry; final built/remote evidence pending. M5/M6 remain IN PROGRESS: actual speech quality, native scheduling/tray/startup/installer and closed-app notification acceptance are TODO.


## Session013 — 2026-11-02T08:33:21+02:00

IMPLEMENTED local engine wizard and Settings configuration-readiness panel. Core70/70 and development37/37 TESTED at entry; remote acceptance pending. Actual engine/voice quality, native installer and delegated live integration milestones remain open.


## Session014 — 2026-11-02T13:31:37+02:00

IMPLEMENTED numbered setup/start/configuration sequence and source-ZIP missing-dist recovery. Local70/70 core/build and5/5 launcher TESTED; exact-source Windows and archive audit pending. Native installer/voice/automatic integration milestones unchanged.


## Session015 — 2026-11-02T13:54:55+02:00

IMPLEMENTED first-use recorded-input checklist/storage choice and reviewed local Home capture. Local72/72 core,39/39 dev+39/39 built and5/5 launchers TESTED. Exact-source remote/archive verification pending. M3/M4/native/voice/production completion is not inferred.


## Session016 — 2026-11-02T14:45:01.942826+00:00

M6 IN PROGRESS: native-host source, bilingual help, policy tests and Windows CI packaging implemented. TODO: exact native compilation/probe acceptance, committed Cargo.lock, physical WebView2 GUI/device tests; later owned runtime, installer/signing, tray and allowlisted Windows Agent.


## Session016 final status — 2026-11-02T14:57:03.396000+00:00

M6 IN PROGRESS: Windows native build, Rust3/3, EXE CLI5/5 and downloaded58-file artifact audit TESTED on exact source674106f. Physical GUI/device, owned runtime, installer/signature, tray/autostart and Agent remain TODO. M8 not released. See TEST-REPORT.md and docs/evidence/desktop-final-ci.json.

2026-11-03: M8 web install foundation IMPLEMENTED. Worker handles only same-origin workspace navigation and shows a bilingual offline fallback without caching private data. Browser CI and real-device installation are separate gates. Desktop work deferred until core completion.


## Session031 — 2026-11-06T19:28:47.554395+00:00

Online capability states IMPLEMENTED. Authenticated cloud inventory and unavailable engine/WHOOP states use consistent responses. Cloud login UI regression and exact-source delivery acceptance in progress.

Session031 delivery VERIFIED for synthetic automated scope: three GitHub jobs succeeded, Vercel deployment status succeeded and public online Settings readiness observed. Source dbc79f2. Actual owner data and upstream source/engine acceptance remain open.


## Session 032 — Web cloud hardening

TESTED locally: streaming payload limits, explicit malformed/oversized request responses, six synthetic regression scenarios; all 84 tests pass. Next acceptance gate remains real owner cloud save/reload followed by cloud integrations. Desktop deferred per user direction.


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


## Session 045 — Recorded daily next steps (2026-11-09T21:52:49.816027+02:00)

IN PROGRESS, M3 daily briefing. Requested continued development. Base 24282ed6b6a7b810ff7cf36c5b981c9f6e469f66. Implemented a deterministic Start here section below recorded metrics, capped at three navigational next steps: review live overlaps affecting today's entries, next actual timed commitment today, due entries, missing usable sleep/selected food, and untimed-note review. Missing values remain unknown, zero is known, completed and next-day commitments are not invented as today's agenda. Empty/complete recorded input leads to reviewing the recorded plan, never a claim the user is free.

Source provenance identifies WHOOP/manual sleep and selected cloud/file/manual food. Missing-data statements and provenance enter the existing explicit read-aloud briefing; no new AI request, health prescription, memory persistence, notification or source read occurs. Button navigation does not write personal records. Existing science-limited training advice and confirmed-schedule-only free-slot behavior unchanged.

Files: new packages/personal/src/daily-focus.ts, apps/web/src/DailyFocus.tsx, tests/daily-focus.test.ts; changed PersonalHome.tsx, style.css, tests/browser.mjs and tracking docs. No dependency/API/auth/source-app/schema changes. Desktop deferred. Commands: git fetch and isolated worktree, source/planner review, npm run check, built browser acceptance; all test data synthetic. Local check/build initially PASS; browser is running and final check follows a wording clarification about today's overlap count. No source credentials, actual owner health data or email operations. Commit/PR/CI/deployment pending.

Next: complete typecheck/Node/browser and narrow-screen checks, publish guarded source and verify exact-source CI/Vercel; append final evidence. Real source-account acceptance remains owner task within Sources.


### Session 045 local acceptance — 2026-11-09, Africa/Cairo

TESTED npm run check PASS: 110 registered Node tests, 108 pass/two CI-only Redis skips, typecheck/build PASS. Built browser 39/39 baseline plus UX-08 next-step navigation without personal revision changes, existing source error/retry/isolation/credential cleanup, RTL 320px and PWA cases PASS. Visual inspection of synthetic desktop screenshot confirms metrics remain above the compact next-step list and no stretched panel regression. Minor count-wording cleanup followed, with FOCUS-01..03 rerun PASS; no business-logic change. Added numbered guide08 and README link. git diff --check PASS. CI/deployment for published source still pending; real owner source data not used.
