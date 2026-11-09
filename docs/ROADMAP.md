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
