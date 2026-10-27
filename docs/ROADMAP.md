# Roadmap

Status at 2026-10-27: M0 source discovery/design IMPLEMENTED with live-access limitations; M1 IN PROGRESS; M2 adapter IMPLEMENTED and synthetic TESTED only. No milestone is RELEASED.

| Milestone | State | Acceptance / remaining work |
| --- | --- | --- |
| M0 | IMPLEMENTED | Seven target repositories inspected, inventory and evidence matrix recorded, contracts/security/ADRs designed. Runtime/deployment facts not inferred from source. |
| M1 | IN PROGRESS | Responsive shell/core/local auth implemented. Remote repository and initial CI available; production auth, tenant model and persistence TODO. |
| M2 | IN PROGRESS | Selected-repository GET adapter and UI implemented with synthetic failure/auth tests. Session cache/ETags/status/cooldown implemented; OAuth app, live credential consent and pagination TODO. |
| M3 | TODO | Delegated ProgressXX/WHOOP summaries, private Sheets reads, unified verified briefing, missing/stale state and account isolation acceptance. |
| M4 | TODO | Ollama/cloud provider adapters, read-only tool orchestration, attribution, memory controls and injection isolation. |
| M5 | IN PROGRESS (contracts/diagnostic only) | Push-to-talk STT, VAD, transcripts, correction, real benchmarks, selected neural TTS, audio-synchronized state. |
| M6 | TODO | Tauri 2, credential vault, Windows Agent pairing/approval transport, tray, shortcuts, notifications/startup, Windows QA. |
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
