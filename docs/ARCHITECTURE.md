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
