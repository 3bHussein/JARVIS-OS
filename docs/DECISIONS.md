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
