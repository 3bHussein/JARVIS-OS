# Architecture

Status: IMPLEMENTED design; only the local foundation slice is executable.

## System boundary

The shared React client runs on the web and will be bundled in Tauri 2. A backend-for-frontend handles sessions, provider credentials, orchestration and isolated connectors. The future Windows Agent is a distinct process with no arbitrary shell endpoint. It accepts only signed, short-lived, user-bound, device-bound, non-replayable requests for allowlisted operations, with explicit approval. That transport is not implemented.

Current topology: React/Vite browser → same-origin development proxy → loopback Node TypeScript API → optional read-only api.github.com. Existing applications remain independent and unmodified. No AI provider or personal backend is contacted.

## Framework evaluation

- **React + TypeScript + Vite selected for the first client.** Static output and one set of shared components fit Tauri and a later PWA. Next.js was evaluated: its server features cannot run inside a Tauri webview; official Tauri Next.js guidance requires static export. Current shell needs no SSR, so an extra framework/server adds little value. Revisit Next.js if authenticated web rendering or public routes need it.
- **Node native HTTP selected for loopback development API only.** Small audited route surface, no decorator/runtime dependencies. It is not the final production server. Move the same contracts into NestJS modules for production identity, integration jobs and persistence.
- **PostgreSQL planned**, not provisioned: users, account links, consent scopes, tool approvals, configurable memory, redacted audit metadata and connector freshness. No health payload or corporate secrets stored by default. All records require owner/domain scope and server-enforced authorization.
- **Redis/BullMQ deferred** until durable jobs, retries or webhook volume require them. No queue service merely to display a clock.
- **Docker deferred for this no-database slice**; introduce backend/PostgreSQL compose when persistence is implemented. No empty service is presented as functional infrastructure.
- **Tauri 2 planned** after static-client/auth boundary is stable. Secure credential vault/Windows Credential Manager or reviewed Stronghold adapter, tray, shortcuts and explicit startup preference require Windows QA. No Rust scaffold is being represented as an installer.

## Connector contracts

`packages/connectors/src/contracts.ts` defines capabilities, authentication, permissions, immutable writes=false, domain, freshness budget, audit events, launch URL and limitations. Runtime results contain status, safe projected data, normalized error and last successful observation. Success timestamps advance only on valid successful reads. Errors never use fake zeros or mark a connector healthy.

The implemented GitHub adapter uses a fixed repository/resource allowlist, GET-only requests, redirect rejection, timeout, response shape/URL validation and safe projection without bodies/comments. No corporate repository is allowlisted. It currently reads at most ten records; it does not claim comprehensive pagination or full project health. No public repo code is treated as trusted tool instructions.

## Identity and security

Local owner authentication: salted scrypt password hash configured outside source, 256-bit opaque session, server stores only token digest, one-hour expiry, bounded session count, restart revocation, HttpOnly SameSite=Strict cookie scoped to /api. Mutation routes require exact Origin, JSON and session CSRF token. Host allowlist blocks DNS rebinding. Login and GitHub reads have limits. Audit metadata is structured and redacted; no request body logs.

This local HTTP implementation is **not production authentication**. No multi-user identity, persistent sessions, MFA, device pairing, HTTPS edge, encrypted key vault or full audit persistence is claimed. Production startup must remain blocked until those controls exist. No backend listens outside loopback.

## Tool and approval model

All writes/critical requests return denied in the current slice. Future approvals must bind user, tool, exact arguments/digest, scope, expiration and one-time nonce. Confirmation cannot override missing authorization or expand a tool's capabilities. Critical operations require stronger explicit confirmation and separate execution authorization. Read requests still require domain consent and least privilege.

## AI and memory

Provider-agnostic interfaces will separate local Ollama from optional cloud adapters. Current chat is an explicit deterministic router for time, tasks-unavailable and connection status. It does not perform generative reasoning. Memory is off: no transcript persistence, embeddings or health/corporate long-term storage. Introduce editable/deletable personal memory with per-item consent, retention and source metadata; corporate contexts must be a separate authorization and retrieval domain.

## Voice boundary

Current microphone test only measures RMS in Web Audio; echoCancellation and noiseSuppression are requested, not certified. Audio is neither recorded nor uploaded. Tracks/context/animation frame are stopped on explicit stop, navigation, speech interruption and unmount. Browser permission prompts can resolve asynchronously; generation guards reject stale permission results.

STT/TTS interfaces and word-error-rate measurement exist. No STT engine is connected, partial/final transcription is not functional yet, and system speech events are not audio-synchronized output analysis. M5 will add push-to-talk/VAD, corrected transcript review, selected engines, interruption tests and measured real-utterance latency/accuracy.

## Performance and accessibility

CSS/SVG-free circular core, no WebGL/particle runtime. Desktop sidebar and compact mobile bottom navigation; explicit focus outlines; labelled controls; live notification/chat statuses; EN/AR dir switching; reduced-motion and off settings. System fonts avoid remote font requests. Animation performance, full WCAG review and real-device scrolling remain acceptance gates.

## Primary references checked

- https://v2.tauri.app/start/frontend/nextjs/ — static export constraint.
- https://nextjs.org/docs/pages/guides/static-exports — server features versus static output.
- https://supabase.com/docs/reference/javascript/auth-getuser — authenticated server identity validation.
- https://github.com/SYSTRAN/faster-whisper — VAD and model/runtime options.
- https://github.com/ufal/whisper_streaming — streaming orchestration candidate.
- https://github.com/OHF-Voice/piper1-gpl — local TTS candidate; review GPL distribution and individual voice-model licenses before shipping.

Supabase changelog markdown retrieval was attempted but the search fetcher rejected its content type. No new Supabase feature or schema was implemented, and this failure is not a security certification.

## Workspace state refinement — 2026-10-27

GitHubReader is owned by one authenticated session via server WeakMap, caches at most 28 fixed repository/resource combinations (seven repositories by four resources), and never persists source payloads. Same-key requests share an in-flight promise; other requests are serialized to reduce secondary rate-limit pressure. Cache hits retain original observation time; ETag 304 responses are successful revalidations and advance validation time. HTTP 401 invalidates cache and success history. Other failures retain historical success time but return no new data. Cooldown applies to all resources in that session; provider credential-wide budgets across sessions remain a future scalability item.

GET /api/connectors exposes authenticated metadata only. Configured is not healthy/ready. UI updates metadata after reads and checks session on focus/minutely; this polls only the local backend, not GitHub. UI computes stale display against the actual current clock. A missed network refresh shows unavailable status feedback rather than claiming a successful sync.

Preferences use a single versioned device-local key, validated into exactly locale/zone/motion/quiet. Corrupt storage, blocked storage and invalid timezone are handled. They are not account memory. Chat/auth/source responses are session memory only. A browser session epoch prevents stale responses after logout; the server also rechecks revocation after awaiting GitHub.

Primary reference reviewed: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api (conditional requests, serial requests, rate-limit response handling). Pagination remains deliberately bounded to the first ten results; no complete-inventory claim.

## Local startup supervisor — 2026-10-28

Node setup/start scripts are maintenance entry points, not AI tools or the Windows Agent. Setup creates only the local .env with a salted password hash and installs lockfile dependencies on explicit invocation. Start spawns only fixed API/Vite child entry points, validates loopback config and port availability, and waits for authenticated-configuration health through the UI proxy. No secret is printed or passed through argv. Windows browser launch uses a fixed URL and no caller-provided executable/URL. A parent-only IPC stop hook permits Windows lifecycle tests without equating it to physical Ctrl+C behavior.

## Personal workspace — 2026-10-28

PersonalData is schema-projected, bounded, date-validated and independent of connector caches. PersonalStore is optional single-owner local encrypted persistence with per-session derived keys, explicit consent, disk/base revisions and typed deletion. Its ciphertext directory is Git-ignored and Vite-denied. It is not a production database or OS vault.

WHOOP connection state is a separate WeakMap keyed by JARVIS session. Credentials go to the fixed existing project Auth endpoint; only access token and bounded sleep/recovery records remain transiently. read mode calls the existing user-authorized Edge Function, not direct privileged database access. No health records enter personal persistence or an AI prompt. POST personal edits are intentionally scoped user-owned records; external tool writes remain denied.

Personal briefing rules, provenance, freshness, local time handling and encryption/recovery limitations are specified in PERSONAL-BRIEFING.md.

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

Added AIProvider interface, fixed loopback Ollama completion adapter and authenticated chat endpoints. Server owns context and four-turn history; no client system prompt/history/tools. Context permissions default off and scope changes clear history. No model has a tool executor. ProgressXX v3 backup projection stays in browser memory, separate from vault/home totals/model context. Speech recognition is browser-selected with local-only default and separate consent for browser-service routing; supported local languages depend on installed browser packs. See ASSISTANT-ENGINES.md and PROGRESSXX-IMPORT.md for exact boundaries.

## Offline speech slice — 2026-10-30T10:01:35+02:00

Optional offline STT uses a fixed one-shot Python subprocess behind authenticated CSRF API, not a public sidecar port. Browser records bounded mono PCM; configured absolute executable/model paths are server-owned. Worker excludes unrelated environment credentials and forces local-only model load. CPU int8/VAD produces final text requiring review. No audio persistence or automatic model submission. See LOCAL-SPEECH.md.

## Built-runtime slice — 2026-10-30T11:06:04+02:00

Built runtime serves compiled UI and API from one loopback service with a supervising launcher. Only preloaded index/hashed JS/CSS entries are public; no filesystem web root. API boundaries unchanged. Node 24 and API source still required. See BUILT-RUNTIME.md.

## Daily-workspace preview — 2026-10-30T15:09:36+02:00

Added daily planner/journal components and pure date/agenda/transient-nutrition helpers. Overview remains mounted while hidden across main navigation; lock removes it. Import state stays client-only; server health/model context remains separate. Personal writes use existing revision guards plus editor fingerprint/UI write guard. Clean preview packaging creates new directories, selected runtime files and validated bundle only. No source-app coupling/production schema change. See DAILY-WORKSPACE.md.


## Session 010 — 2026-10-31T15:01:58+02:00

Portable backup is a browser-local boundary separate from the API vault. Fixed KDF parameters and bounded authenticated envelopes; validated owner-entered personal fields only. Restore uses the existing authenticated CSRF/revision-checked personal save route. No new endpoint or network provider.


## Session 011 — 2026-11-01T17:32:39+02:00

Home health projection consumes the existing read response, retaining four bounded collections server-session-only. Latest versions are deduplicated before SCORED filtering. WHOOP details use current observation/upstream freshness gating; only open scored cycles <=72h old contribute cycle values. Expenditure remains separate from diet arithmetic. New health details and ProgressXX snapshots are not added to AI context.


## Session 012 — 2026-11-01T19:22:58+02:00

Voice welcome is a client session gate over validated personal briefing readiness, document visibility, active tab and reported-local voice selection. Quiet by default; user interaction/manual synthesis consumes the gate. Reminders are an opt-in client-session poll with occurrence receipts, separate browser notification permission and generic payload. No persistent/background delivery service or new backend endpoint.


## Session013 — 2026-11-02T08:33:21+02:00

Local engine configuration stays outside the browser/API write surface. Terminal wizard permits only three engine keys, fixed loopback installed-model read and existing path validation, then explicit SAVE and restart. Current runtime configuration remains immutable during a running process. Settings reads existing authenticated flags only; no inference readiness claim.


## Session014 — 2026-11-02T13:31:37+02:00

Installation preflight separates valid compiled preview, complete source with missing web bundle and incomplete copy. Complete source fallback uses locked npm installation and local pinned Vite CLI, not another app or arbitrary remote code. Preview runtime remains Node24 with selected source modules/no npm dependencies. Built launcher validates the same bounded bundle reader before spawning the service.


## Session015 — 2026-11-02T13:54:55+02:00

First-use presentation derives only from validated data and existing fresh Home values. Persistence promotion passes remember=true explicitly on the existing owner save request; no new endpoint. Session acknowledgement stays in React memory. Quick capture stages one PersonalNote with revision and requires explicit confirmation; current API validation/limits/CSRF/conflict rules remain authoritative.


## Session016 — 2026-11-02T14:45:01.942826+00:00

M6 IMPLEMENTED source: optional Tauri2 host restricted to127.0.0.1:5173 and static help. No renderer IPC/capabilities/plugins. Native menu only; existing Node runtime remains independently owned by step02. WebView storage differs from browser. No sidecar, Agent, OS vault or native scheduler yet. See DESKTOP-PREVIEW.md.


## Session016 final status — 2026-11-02T14:57:03.396000+00:00

M6 optional fixed-origin Tauri host now has compiled Windows x64 evidence and a committed crates.io dependency lock. Existing Node/API/vault architecture and browser mode unchanged. No renderer IPC, plugins or OS action permissions introduced; no bundled runtime/installer. See TEST-REPORT.md and docs/evidence/desktop-final-ci.json.


## Session031 — 2026-11-06T19:28:47.554395+00:00

Cloud status endpoints use existing connector manifests with disconnected/blocked states. Vercel packaging explicitly includes connector TypeScript source alongside API/personal source. TypeScript checks now include api/**/*.ts.


## Session 032 — Streaming transport boundary

Cloud request JSON is read through a shared byte-limited reader (1 MiB); Redis response limit is 1 MiB + 256 bytes. Oversized streams are cancelled before remaining content is buffered. Decoder rejects invalid UTF-8. Request parse failures return 400/413; upstream body failures remain generic service failures. This is a per-message boundary, not a process memory/concurrency guarantee.


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
