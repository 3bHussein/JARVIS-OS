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
