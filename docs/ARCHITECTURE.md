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
