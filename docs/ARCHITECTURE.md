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


### Session 045 web verification and handoff — 2026-11-09T21:57:09.607399+02:00

VERIFIED automated web source ed182699221b7586ed8e024b817d9394ba62859d. GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42687861863: foundation 129399417107 SUCCESS, windows-launcher 129399417442 SUCCESS. Logs establish 110/110 Node tests with zero failures/skips, real isolated Redis cases retained, typecheck/build and launcher checks; development and built browser 39/39 baseline plus UX-08 navigation-without-write, source retry/isolation/RTL/PWA acceptance. Native job 129399417687 is still building at this entry; desktop product work remains deferred and physical acceptance is not claimed.

Vercel Production dpl_2dxP38uXuBaoUkk8gzEKCXY7nvBi READY at exact githubCommitSha ed182699221b7586ed8e024b817d9394ba62859d, primary alias https://jarvis-os-henna-sigma.vercel.app/. Guarded GitHub main publication, PR none; no duplicate manual deployment or env mutation. No owner account credentials, real health data, source-app changes, vendor synchronization or emails used. Runtime metadata/CI and synthetic UI are the evidence; actual owner-source acceptance remains TODO.

Delivered: compact Start here rows below metrics, explicit recorded-data-only provenance, safe source-aware gaps in read-aloud, and guide08. This is deterministic navigation support, not a new generative model, prescribed health plan or inferred availability. No hidden writes, memory persistence, external model calls or source reads are generated by it. Unknown/zero, selected-source failure behavior, user review/confirmation and motion/accessibility controls remain intact. Worktree matches published runtime, dependency symlink excluded. Logs/handoff updated append-only; final documentation commit uses [skip ci].

Next actions: observe native CI terminal status, append final result; owner can use Start here on Today and Sources for explicit account linking. If continuing engineering, prioritize read-only assistant queries that share the same source/availability logic, with synthetic tests before any real-data acceptance; durable source delegation, MFA/PKCE and actual voice accuracy remain separate TODOs. Never fabricate commitments, assume free time, expose corporate records, silently call a model with health data, trigger vendor sync or modify production schemas without authorization.


### Session 045 terminal evidence — 2026-11-09, Africa/Cairo

All three exact-source CI jobs in run 42687861863 completed SUCCESS: foundation 129399417107, windows-launcher 129399417442, desktop-windows 129399417687. Native automated packaging success is not physical Windows acceptance. Vercel error scan 2026-11-09T19:42:08.833Z–19:57:08.833Z returned no matching logs; no actual owner-data request was generated, so this is not proof of live source access. No remaining automated CI blocker for source ed182699221b7586ed8e024b817d9394ba62859d. Final docs-only evidence publication follows; owner acceptance and other v1 gaps remain as documented.


## Session 046 — Read-only saved-data conversation (2026-11-10T15:26:24.968977+02:00)

Requested continued development. Base fa84e0f530821b5039f8ed259e640787565f230d. Implemented a bounded Egyptian-Arabic/English query router for recorded priorities, selected food/remaining budget, usable sleep, next actual appointment/workout, open untimed notes and daily summary. Normalizes common Arabic variants; explicitly refuses create/edit/delete requests. Recomputes local date and freshness at question time, preserves selected-source unknown/zero behavior, never invents targets or appointment times from training labels. Unsupported input returns to existing help; no broad language/voice accuracy claim.

UI: draft-only question shortcuts, source-labelled read-only answer footer and existing opt-in read-aloud. Cloud engine help no longer tells online users to run a local Windows batch. The optional existing model branch receives no new automatic context and retains consent controls; shortcuts are hidden there. Personal query context is a private UI-held reference, not persisted or passed to a model, cleared on lock/unmount. Source data is withheld from query context during in-flight source reads.

Fixed asynchronous clear race: local chat messages clear immediately, epochs prevent an older clear acknowledgement from deleting a newer saved-data reply. Added explicit api/chat/clear.ts wrapper for existing authenticated/CSRF-protected cloud handler, following the validated nested route pattern; no new write capability or backend business logic.

Files: new packages/personal/src/queries.ts, tests/personal-queries.test.ts, api/chat/clear.ts, docs/09-ASK-ABOUT-SAVED-DATA.md; modified main.tsx, PersonalHome.tsx, AIChat.tsx, style.css, tests/browser.mjs, README and nine tracking docs. No new dependency, provider key, model call, source-app change, production schema change or desktop engineering. Only synthetic test data used; no credentials, owner health record or email operation.

Commands: git fetch/worktree, source/route inspection, npm run typecheck, npm run check, built-browser acceptance, git diff --check. Initial import insertion preceded the existing Vite triple-slash reference and broke ImportMeta.env typing; moved the reference back to file start and checks passed. Final local check: 116 registered Node tests, 114 pass/two intentional CI-only Redis skips, typecheck/build PASS. Built browser PASS 39/39 baseline plus UX-09 draft-only bilingual read queries/no model/no writes, UX-10 delayed-clear race, cloud selected-food arithmetic, and retained RTL/source/PWA cases. No runtime edits after final acceptance.

Commit/PR/remote CI/deployment pending. Next: publish guarded source, inspect exact-source CI/Vercel/log metadata, append final evidence/handoff. Actual owner-account source acceptance remains TODO. Do not claim a generative AI engine, full dialect understanding, background sync or physical desktop acceptance.


### Session 046 final query disambiguation and local verification — 2026-11-10, Africa/Cairo

Final review tightened current-clock matching and added workout/appointment time variants plus code-switching; a question about a workout time must not be mistaken for the current clock. This supersedes only the earlier no-further-runtime-edits statement. Re-ran npm run check PASS (116 registered, 114 pass/two isolated CI Redis skips, typecheck/build) and built browser PASS 39/39 baseline plus UX-09/10 and all retained cloud/RTL/PWA cases on the updated source. QUERY-01 now also covers clock versus workout-time separation and mixed Arabic/English. No additional runtime edits after this verification. Publication/remote results pending.


### Session 046 final chat lifecycle polish — 2026-11-10, Africa/Cairo

Source 27259753f843a54abe23d7bc55893772aba6afde published and Vercel dpl_DVbv7wNaJrEsTuThyRJKGyU581Cj READY. Its CI run 42825033525 is still in progress at this entry. Final review added an alive guard to late chat authentication failures so an unmounted old chat cannot close a newer workspace, and changed unsupported-question help to advertise supported saved-data questions. Final follow-up typecheck/build and built-browser 39/39 baseline plus UX-09/10, cloud selected-food arithmetic and retained source/RTL/PWA cases PASS (session046-release-browser.log). No backend business logic, permission or data-retention changes. Final source commit/CI/deployment follow.


### Session 046 final verification and handoff — 2026-11-10T15:37:07.052367+02:00

VERIFIED automated source 94bb14f3b89237b0e75842de6bfdc38326fe12e9. Exact-source GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42825727543 completed SUCCESS in all three jobs: foundation 129862399413, desktop-windows 129862399563, windows-launcher 129862400067. Foundation logs confirm 116/116 Node tests, zero failures/skips, retained real isolated Redis tests, typecheck/build and launcher checks, development/built browser 39/39 baseline plus UX-09 bounded bilingual saved queries/draft-only shortcuts/no model or writes, UX-10 delayed-clear response race, and retained source/RTL/PWA cases. The final delayed-clear test waits for response-body completion and two presentation frames before checking that the newer answer remains. Native automated build success does not establish physical Windows acceptance.

Production dpl_Gy7NZUNsAaWSYB4NC3NHKZ9St2ru READY at exact githubCommitSha 94bb14f3b89237b0e75842de6bfdc38326fe12e9; primary alias https://jarvis-os-henna-sigma.vercel.app/. Earlier source 27259753f843a54abe23d7bc55893772aba6afde also passed all CI jobs, but this newer source is the final accepted runtime. Publication used guarded main updates; PR none, no manual duplicate deployment, provider key or env mutation. Error-log metadata was scanned separately; absence of matching logs is not live-account acceptance. No actual owner credentials, real health records, production schema/source-app changes or email/vendor sync actions performed.

Delivered: supported local saved-data questions and query-time source/date checks, source-labelled answers, bounded notes/actual appointment dates, no target/time inference from missing input, write refusal, draft-only shortcuts and guarded clearing; online help and guide09 updated. Main private context is reference-held only and cleared on lock/unmount. Optional model mode stays separate with existing explicit context consent; this is not general generative intelligence, measured dialect transcription, medical advice or a new cloud AI provider. No new dependency. Worktree matches published runtime, dependency symlink excluded. All tracking docs appended; final docs-only evidence commit uses [skip ci].

Remaining: actual owner source login/coverage acceptance in Sources; durable background delegation/MFA/PKCE; measured voice accuracy/latency and native physical testing. Next authorized engineering can improve source-aware briefing follow-ups and query coverage using synthetic cases. Any real-data test, new external model processing, original-app/schema change or new write execution needs its own appropriate authorization. Never request credentials/sign-in links in chat, fabricate readings/tasks, infer calendar times from labels or silently persist/send health context.


## Session 047 — Investigate manual-only Home and make cloud sources explicit (2026-11-10T16:26:52.145574+02:00)

Requested: Home is showing manual input rather than WHOOP/ProgressXX; inspect and improve general usability. Base 9f834618655f59553d451fc35ad2c68214982a7d. Read provided screenshot without publishing its personal/health values. Production runtime metadata in a recent supported window showed ProgressXX account connect accepted, while WHOOP reads had no connected grant. This verifies authentication/connection state only, not actual source-row reading or complete sync. No owner medical values, source credentials or raw tokens read. Browser inventory had no existing authenticated user tab, so no owner login was attempted.

Confirmed code defect: source connect/reload did not select ProgressXX nutrition; useCloudFood initialized false and the second optional checkbox was not visible near primary metrics. WHOOP absence silently fell back to manual sleep (labelled manual but easy to mistake for integrated data). Implemented cloud-first online defaults for food and WHOOP sleep, explicit top-of-Home selectors/status/read timestamps/connect/refresh controls, source-specific metric headings, and no silent manual substitution. Manual values stay saved and are used only when chosen in online mode. Connecting a source selects its cloud source; disconnect preserves the selection and unavailable metrics stay unknown. Local preview retains legacy auto/manual behavior. Source choices are propagated to conversation/read-aloud, including explicit sleep preference.

Backend fix: ProgressXX HTTP401 was classified with HTTP502, preventing source-grant expiry handling. It now returns source-session expiry to the connector, which clears only that grant without logging out JARVIS. HTTP403 and missing endpoint/field responses get bounded permission/schema codes. Failed ProgressXX HTTP dataset is identified by food/workouts/weight/schedule in safe logs/response, never raw upstream bodies or data. No source schema/permission changes or privileged database reads.

Files: new HomeSources.tsx; changed PersonalHome.tsx, CloudConnections.tsx, briefing.ts, queries.ts, account-reader.ts, account-status.ts, cloud-handler.ts, style.css and focused tests/browser suite. Tests include explicit WHOOP vs manual selection, source-aware queries, dataset/auth failure diagnostics and ProgressXX expiry handling. No dependency, account secret, email, external model or source-app repository changes; desktop deferred.

Commands/attempts: git fetch/worktree, source and log inspection, CUA inventory only, npm run typecheck/check/browser. Log request initially used invalid warn level (corrected to warning); one-hour window exceeded retention (corrected to recent fifteen-minute window); these are tool-query failures, not application failures. First browser run lacked an explicit exact accessible select label; added localized aria-labels. A test type assertion then blocked rebuild, so an old bundle was exercised; corrected the assertion using AccountError narrowing and sequenced checks before browser. Current check PASS: 120 registered, 118 pass/two CI-only Redis skips, typecheck/build. Fresh built browser is running. Commit/PR/CI/deployment pending.

Next: verify default source selection, successful cloud auto-display/reload, no manual fallback on failure/disconnect, explicit manual switching without writes, RTL/mobile bounds and safe diagnostics. Publish guarded source, inspect exact-source CI/deployment and append final evidence. Actual WHOOP account must be linked by owner in the web form; never ask for credentials or links in chat. Actual ProgressXX source-row availability is not established by connect success alone.


### Session 047 supplement — independent source sections (2026-11-10T14:36:41.444059+00:00)

IMPLEMENTED: ProgressXX uses parallel settled section reads. Food, exercises, weights and schedule fail independently; usable food survives an unrelated legacy exercise validation/schema error. Invalid/duplicate/capped food makes the whole food section unknown. Any section's HTTP401 expires the source grant; all-HTTP-failure retains the original bounded error. Safe section issues are projected, encrypted in the existing short cache, logged without record content and explained in collapsed UI details. No source schema, authentication permission or production database changes.

TESTED locally: npm run check — TypeScript PASS, 121 registered tests / 119 PASS / two Redis integration tests skipped locally (CI-only), production build PASS. ACCT-04/07/08 cover incomplete food rejection, section isolation, safe HTTP diagnostics and mixed-success source401; CLOUD-ACCT-07 verifies grant expiry; PERSON-07 and QUERY-07 verify explicit source choice and no silent manual sleep substitution. React review: hooks remain unconditional, source selection is local derived UI state, source reads stay parallel and existing request/cache isolation is unchanged, native labelled controls and reduced-motion styles retained, no new dependencies.

Browser attempt: all 39 numbered UI checks reached PASS; cloud flow then timed out after a deliberate reload because source details were collapsed. Corrected the test to open those details before disconnect; application disconnect behavior was not bypassed. Fresh built browser rerun pending. Guides 06/07/09 corrected, numbered guide10 added, README updated. Source publication, exact-source CI/deployment and owner source-row acceptance remain pending. PR: none (authorized direct main workflow).


### Session 047 final delivery — 2026-11-10T14:41:08.328448+00:00

Source commit: 5a54a2f99781a62448619ad1129698411fe040d7. PR: none; authorized guarded direct main update, expected parent9f83461. CI https://github.com/3bHussein/JARVIS-OS/actions/runs/42836054715: foundation, windows-launcher and desktop-windows all SUCCESS. Foundation job129898420356 logs: 121/121 Node tests PASS, zero skipped (including real Redis account/recovery Lua races); five launcher checks PASS; development browser39/39 and built browser39/39 PASS, built UX-11 PASS. Windows native build/probe success is automated evidence, not physical desktop acceptance; desktop development remains deferred. Local119/121 with two CI-only skips was accurate earlier; remoteCI now covers both.

Deployment dpl_E3e5ek2qqTVzWPiGkES65k4EafBR: production READY, exact source5a54a2f, primary alias https://jarvis-os-henna-sigma.vercel.app/ assigned. No manual redeploy, source database migration or credential change. Post-deploy bounded fifteen-minute error/fatal log count query for this deployment returned no groups; absence of logged errors does not establish private source-data acceptance or complete vendor sync.

VERIFIED synthetic: cloud-first source controls, automatic ProgressXX choice after connect/reload, explicit manual choice, no silent manual substitution on failure/disconnect, retained manual records, bounded section diagnostics, independent ProgressXX sections, fail-closed food totals and source401 revocation. Source read-only/session/cache/CSRF boundaries retained. Numbered guide10 and guides06/07/09/README document current flow. Local tree matched published source (dependency symlink only untracked). Documentation append-only; final evidence published in follow-up docs commit, its own SHA is discoverable in Git history.

Remaining TODO: owner connects WHOOP Intelligence in the visible source form and confirms real source dates/rows after refresh; actual ProgressXX food-row availability not proven by earlier connect-accepted metadata. No real health records/credentials were inspected. If data remains absent, use per-section safe diagnostics to investigate existing owner permissions/schema/upload state; never bypass RLS or silently replay ProgressXX pending writes. One-hour session grants and five-minute saved-read cache remain limitations, not durable background sync. Exact next action: open online Today, confirm Sleep sourceWHOOP/Food sourceProgressXX cloud, connect/review accounts and refresh saved data; selected unavailable source stays unknown. Manual source remains a deliberate alternative, preserving saved journal.


## Session 048 — Investigate a food-total mismatch (2026-11-10T15:07:55.316355+00:00)

Milestone M3, IN PROGRESS. Requested: ProgressXX food total differs from the owner's original app. Do not hardcode the reported number or silently change manual/source data. Base dfdf2ffe8a2d962f6b01cea7ba40a3824b034290. Inspected ProgressXX-Web index.html pinned to26f96d24045a896688c69e7acc3083013d97dc9f; pinned contents match discovery. Its __pxLoadFoodDiary maps pxlegacy:<id> client_id to original diary identity and otherwise uses row UUID. Its nutritionTotals sums that logical diary. JARVIS previously summed every distinct database UUID without client_id projection; a legacy UUID plus migrated alias could be double-counted. This is a confirmed code discrepancy, NOT proof of the owner's specific mismatch. Pending edits/deletes, cache, selected day/timezone and source upload state remain other possible causes. No private source rows, credentials or actual owner's meal data read.

IMPLEMENTED: select only one additional source field client_id; collapse equivalent legacy aliases before the date-specific calorie/macronutrient sum. Distinct records with identical calories/time remain separate; differing values for the same logical identity make food unavailable with safe source_food_identity_conflict rather than arbitrarily choosing a number. Invalid/capped food remains wholly unavailable. No food names/UUIDs/client IDs added to projections, AI context or logs. Added collapsed read-window alias count and today's time/calorie breakdown; visible date/timezone, bounded scroll and original-app save/sync guidance. Empty food remains unknown, never fabricated zero. Existing manual values and source writes untouched.

Cache: encrypted projection cache version2 invalidates old derived totals without revoking grants, rotating keys or changing upstream data. Existing thirty-second manual cooldown/five-minute cache applies to new-version reads. UI read-only diagnostics remain private to unlocked session. React review: native details/list, no extra fetch or effect, text escaped, stable primitive state unchanged; only one zone prop added. No dependencies.

Files modified: account-reader.ts, account-status.ts, cloud-accounts.ts, LiveProgress.tsx, PersonalHome.tsx, style.css, focused account-reader/browser tests and tracking/docs. Commands: git worktree add; read source via GitHub connector and pinned ref; npm run check (initial/expanded/final); built browser pending; git diff --check pending. Supabase changelog fetched/read; no applicable Data API breaking change identified. Web markdown fetch unsupported, initial filter-doc URL404; corrected to REST introduction markdown. No Supabase API/library/schema/auth feature change or database query performed. No existing source-app repository changed.

TESTED: final check PASS TypeScript/production build,122 registered Node tests,120 PASS/two CI-only Redis skips. ACCT-09 tests logical alias reconciliation, legitimate repeated meals, safe time/calorie projection, no raw identities, disagreeing aliases and malformed client_id; built UX-12 pending for the visible counted-entry breakdown. Source/PR/CI/deployment pending; no PR in authorized direct-main workflow. Exact next: complete built browser; publish guarded JARVIS source; inspect exact-source CI/deployment; append results. Actual owner-row confirmation remains TODO and must not be inferred from a synthetic fix.


## Session 049 — Local-day refresh and clearer source status (2026-11-11T06:26:54.940841+00:00)

Milestone M3, IN PROGRESS. Requested: continue web-first development after food-total reconciliation. Base2285d9f3188642bba48ba80617cb23f24faa9929 confirmed as remote main before work; isolated jarvis-day-refresh worktree, prior session docs changes left untouched in their worktree. No real owner-record mismatch claim: FOOD-OWNER-01 still TODO.

IMPLEMENTED: saved-source projection cache now requires the same configured local calendar day as its observation in addition to version/zone/age. A midnight transition bypasses even the thirty-second manual cooldown; no new token/grant or source write. A captured server read start time is passed consistently to projection. Home source effects respond to local-day changes, and a visible-tab resume refreshes saved reads under the existing five-minute server cache/rate/lock policy. On a resumed new day, the date dependency triggers a single new-day source cycle rather than a competing old-day read. Event listeners clean up on unmount; existing epoch guards still prevent late data after disconnect/lock.

UI: explicit diary date/IANA zone and localized last-read time in ProgressXX; the secondary duplicate cloud-food checkbox moves into optional Home display details while top source controls remain visible. Successful reads without today's food or usable WHOOP sleep are labelled unavailable instead of green recent-data status; zero recorded values remain available. Future observation timestamps no longer display nutrition in the detail panel. No sources silently switch to manual. No dependencies, secrets, database/schema, original-app repository or corporate changes. React review: stable primitive day dependencies, listener cleanup, no effect-trigger loop (date strings stable within day), native details/labels and existing read isolation retained.

Files: cloud-accounts.ts, HomeSources.tsx, PersonalHome.tsx, LiveProgress.tsx, style.css, cloud-accounts/browser tests, guide10 and nine tracking docs. Commands: git status/log, GitHub main ref, git fetch/worktree, source inspection, npm run check (initial/final), built browser pending, git diff --check pending. One discovery search referenced a nonexistent WhoopOverview.tsx; no edits made to that path.

TESTED locally: TypeScript PASS,123 registered Node tests /121 PASS /two Redis CI-only skips, production build PASS. CLOUD-ACCT-08 simulates Cairo midnight within twenty-five seconds: same-day cache/cooldown retained, next-day saved read without reconnect, repeat read cached and different zone separated. Browser UX-13 added for visible-tab saved read, successful empty diary status and no manual substitution; existing UX-11/12 provenance/reconciliation retained. PR none (authorized direct-main flow). Source commit/CI/deployment pending. Exact next: complete built browser, publish guarded source, inspect exact-source CI/production and append final evidence. Owner source-data reconciliation remains open; no actual health records or credentials read.


## Session 050 — Compact online Home — 2026-11-11T06:43:00.544116+00:00

Milestone M1/M3 usability, IN PROGRESS. Requested: continue practical web-first development; selected improvement reduces daily scrolling without hiding primary facts/provenance. Remote maina20aa06df82c5e601ae0b21156dbe3ff958d5ffa confirmed; isolated jarvis-compact-home worktree. Owner-specific food discrepancy remains unverified; no private records read.

IMPLEMENTED: online Home groups secondary WHOOP/ProgressXX readings, quick capture and open-note list into three initially closed native details sections. Primary sleep/food/remaining metrics, DailyFocus, source controls/status, agenda and existing actions stay visible. Local preview keeps those sections initially open. Opening sections sends no new fetch/model call; existing authorized source-read cadence unchanged. Components remain mounted while collapsed, preserving unsaved capture drafts. A draft is not saved by closing/opening the section; normal preview/confirmation remains required. Lock/unmount still clears session UI. Compact state is session DOM state only, not localStorage or a new profile field. No dependency, backend, auth, source schema, original-app repository, secret or corporate changes.

Files: PersonalHome.tsx, style.css, browser tests, guides/README and tracking docs. React review: native keyboard disclosure and focus-visible styling; existing stable component identities/keys retained; no new hooks/effects, no data writes or new request surface. Mobile-specific spacing and normal readable labels; existing reduced-motion behavior unchanged. Commands: git status/log, GitHub main ref, git fetch/worktree, source/CSS inspection, npm run typecheck, npm run check, built browser pending. Current check TypeScript/build PASS;123 registered Node tests /121 PASS/two Redis CI-only skips.

UX-15 added: online disclosures initially collapsed, keyboard Enter toggles, captured text survives close/reopen, no POST to personal records, expanded height exceeds compact by300px. Cloud source browser flow explicitly opens health details when exercising reads; local legacy acceptance retains initial-open behavior. Existing source provenance, bounded food breakdown, resume/midnight tests retained. Next: complete built browser and inspect synthetic compact screenshot; publish guarded source, inspect exact-source CI/production, append evidence/handoff. Source SHA/PR/CI/deployment pending; PR none in authorized direct-main workflow. Desktop remains deferred.


## Session 051 — Functional AI/voice readiness, not cosmetic completion — 2026-11-11T07:18:16.897941+00:00

Milestone M4/M5, IN PROGRESS. Requested: continue and explain remaining work for complete daily use; owner reports voices wrong and AI not connected. Confirmed online handler unconditionally returned configuredfalse for AI/speech; only deterministic saved-data replies and optional local Ollama existed. Vercel Production environment metadata inspected with decryptfalse; no AI-specific keys/model configuration present. Only variable names/targets inspected, no secret values. No actual generation, health records, new credentials, billing/account/budget changes or private records read. Base34fce6d0c80dd0b393d0b0386dfd77f44e54149f, isolated jarvis-assistant-connect worktree.

IMPLEMENTED cloud AI first phase: fixed-host Gateway adapter using existing provider interface and direct compatible HTTP (no SDK/dependency changes), bounded input/output/timeout, no redirects/tools/retries/fallback, safe credentials/budget/account/rate errors. Authenticated CSRF-protected explicit-consent stateless text route; six/minute/session and50/rollingday/workspace attempts; per-session distributed in-flight lock; session recheck before delivery. No automatic profile/health/notes/history sharing. UI distinguishes configured from successful reply, explains text-only/no-memory limits, keeps drafts on failure, and disables unsupported cloud record context. Existing local Ollama consent/history remains. Environment enable/model/auth gate is optional; invalid optional AI configuration cannot take workspace offline. Explicit api/chat route and package includeFiles added. No production activation or live provider verification claimed.

Voice fix: previous explicit voice choice could ignore requested language. Now rejects wrong-language voice, prefers exact local locale (ar-EG before other Arabic when available), keeps network consent and device-first policy. Voice setup/sample/rate controls are visible rather than buried; only current-language voices listed; language change resets prior choice. Online browser speech controls start visible; local worker setup is optional details. Device voices are not claimed to be natural Egyptian neural TTS; no actual voice quality/accuracy/latency measured.

Commands: git fetch/worktree, source/config audit, Vercel env-name metadata; read Gateway/AI guidance and current compatibility docs; complete model catalog fetched (google/gemini-3.1-flash-lite present), no paid request. npm run typecheck/check and built browser. Unit129 registered/127 PASS/two Redis CI-only skips, typecheck/build PASS. GATEWAY-01..03 cover fixed host/bounds/errors/no tools/incomplete responses, CLOUD-AI-01..02 consent/context/rate/session-revocation and VOICE-03 language routing. First browser run closed the newly grouped local STT details before querying reviewed text; corrected test to reopen it. Final full built39/39 plus CLOUD-AI-UI-01 (mocked reply/budget/draft/no sharing) and VOICE-UI-01 (synthetic Arabic locale/rate) PASS. These are not real provider/voice acceptance.

Files: new Gateway/status modules, api/chat route, focused cloud/gateway tests and numbered guides11/12; changed cloud handler/entry, AIChat, main voice UI, voice selector, Vercel includeFiles, browser tests and tracking docs. No dependencies, source schema/auth privileges or original-app repositories changed. React review: local state only, language reset on locale change, existing cancellation/generation guards retained; no new automatic model request.

Priorities recorded in guide12: actual AI activation/budget/reply; online STT/neural TTS/device measurement; consent-scoped selected-source AI context/follow-up; actual source-total reconciliation; durable opt-in linking; background notification delivery; release journey/security/performance/accessibility. No more UI-only completion claims. Source/PR/CI/deployment pending; PR none in authorized direct-main flow. Next: publish/test exact source, then owner activation/real acceptance before marking AI or voices ready.


## Session 052 — Continue without cards, keys or paid credits — 2026-11-11T14:44:59.146924+00:00

Milestone M4, IN PROGRESS. Owner explicitly declined entering payment/account details and requested free continuation. No Gateway activation, credentials, billing change, account creation or paid model request. Base3e7bbc750910d413778b871ac2b145bb7a5b946c; isolated jarvis-free-browser worktree with its own dependencies. Evaluated official WebLLM and Chrome Prompt API docs; Chrome's currently documented Prompt API languages exclude Arabic. Selected optional on-device WebLLM Qwen3 0.6B path, not a public keyless inference proxy or a promise of universal device support.

IMPLEMENTED: optional Free device AI disclosure inside chat, explicit download/run after WebGPU shader-f16 adapter check, progress, dedicated worker, stateless generation with no health/profile/notes/history supplied, bounded input/output and ninety-second generation cancellation. Stop, lock/unmount, main clear and language change terminate/clear model replies; no automatic download or cloud fallback. Model cache deletion is explicit. SDK crash-resumable prompt generation disabled. Saved-data deterministic questions remain available on unsupported devices, without pretending to be general AI. Existing optional server model adapter remains disabled.

Dependency: pinned @mlc-ai/web-llm0.2.88/package-lock. Installed with ignore-scripts in isolated worktree. Public model index only fetched: nine shards,335372288 weight bytes; no actual weights downloaded or real GPU inference. Official catalog lists1403.34MB GPU memory plus runtime overhead. Arabic quality, actual driver/mobile compatibility and latency unverified. Runtime and worker are each roughly6MB uncompressed, lazy after user activation; main about394kB/126kB gzip. Build warns about optional large chunks; not suppressed. npm audit --omitdev found zero known vulnerabilities.

Build/runtime: explicit hashed-asset manifest now covers lazy modules/workers, bounded32entries/16MB each/32MB total, excludes arbitrary/private/source/map paths, retains symlink guards. Manifest is itself packaged so clean local previews retain worker assets. CSP allows same-origin scripts/workers, WASM compilation and fixed HuggingFace/hf/GitHub download host families; generic JS unsafe-eval remains denied. Same policy added to Vercel static responses. No wildcard filesystem serving or remote JS script execution added.

Tests/attempts: initial upstream declarations exposed implicit callback-any under NodeNext; annotated boundary callback shapes. Initial browser had an ambiguous .ai-chat summary selector after adding device disclosure; changed to exact engine-summary label. npm run check final133 registered/131 PASS/two Redis CI-only skips, typecheck/build PASS. DEVICE-01..03 cover no implicit initialization, bounds/progress, cancelled initialization cleanup, no late reply/concurrency and answer limits. BUNDLE-03 covers manifest/packaging/path rejection. DEVICE-UI-01 added for unsupported GPU, disabled send/download, no external model requests and built lazy asset HTTP200; final built rerun pending. Real GPU generation/cache deletion and device performance remain TODO. No source-app repository, corporate data, secrets or production database changes.

Files: new BrowserModel controller, DeviceAIChat/runtime/worker, device tests and numbered guide13; changed AIChat, web asset loader/CSP/build config, manifest tests, browser tests, package/lock, README/guides and nine tracking documents. React review: component remains key-free and optional; no load effect, state/epoch guards and worker termination on cleanup; dynamic import only after user GPU check. Exact next: finish built browser/new bundle/csp tests, verify preview packaging, publish guarded source, inspect exact-source CI/deployment and append handoff. PR none in authorized direct-main workflow; commit/CI/deployment pending.
