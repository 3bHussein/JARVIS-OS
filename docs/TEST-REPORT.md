# Test Report

Session: 2026-10-27, Africa/Cairo. Synthetic fixtures only. No destructive or production-account tests.

## Executed evidence

- Node.js 24.22.1 / TypeScript 5.9.3 / React 19.1.1 / Vite 7.3.7.
- `npm run check`: typecheck PASS, 14 unit/HTTP tests PASS, static production build PASS.
- `npm audit --json`: zero known vulnerabilities after Vite upgrade; not proof of absence of all security bugs.
- `npm run test:e2e`: final result is appended below after completion. Early attempts exposed accessible-name/label issues and were not passing acceptance runs.
- Build output at the initial passing build: JS 209.93 kB (67.00 kB gzip), CSS 15.59 kB (4.56 kB gzip). Bundle size is not an animation performance benchmark.
- CI workflow authored, not run remotely. No deployment or Windows installer test.

Raw sanitized command output: `docs/evidence/check.txt`, `audit.json`, `browser.txt` after final capture.

## Requirement-to-test traceability

| Requirement | Test ID / evidence | Status / scope |
| --- | --- | --- |
| Actual greeting and IANA time | TIME-01, TIME-02 | TESTED boundaries, Cairo DST/date rollover, invalid zone/date |
| No invented tasks, freshness | DATA-01, UI-01 | TESTED synthetic empty/current/stale/future |
| Deny writes, isolate corporate domain | SEC-01, AUTH-02 | TESTED local policy and HTTP |
| Safe logs/redaction | SEC-02, AUTH-02 | TESTED nested metadata and no password/CSRF in captured audit |
| Expiring/revocable auth | AUTH-01, AUTH-02, AUTH-03 | TESTED local sessions, hash, rate limit, CSRF/origin, unconfigured deny |
| GitHub capabilities/read allowlist | GH-01..04 | TESTED no credential call, invalid scope, issue filtering, URL projection, errors |
| Windows allowlisted policy | AGENT-01 | TESTED policy only; no Windows execution |
| Voice uncertainty metric | VOICE-01 | TESTED WER utility and confidence review only; no actual transcription accuracy measured |
| Original desktop shell and local commands | UI-01, UI-02 | Browser acceptance pending final result |
| Login/disconnected source/logout | UI-03, UI-04, UI-06 | Browser acceptance pending final result |
| Microphone lifecycle | UI-05 | Synthetic fake device; physical microphone and echo cancellation untested |
| Motion off/system reduced motion | UI-07, UI-09 | Browser acceptance pending final result |
| Arabic RTL/mobile no horizontal overflow | UI-08 | Browser acceptance pending final result; not full translation/accessibility certification |
| Browser runtime errors | UI-10 | Browser acceptance pending final result |
| Real personal connector data | Not executed | BLOCKED on account-linking/consent design |
| AI provider orchestration/memory | Not executed | TODO |
| Speech accuracy/latency/TTS quality | Not executed | TODO |
| Tauri/tray/startup/installer/agent transport | Not executed | TODO |
| PWA/offline/multi-user production security | Not executed | TODO |

## Terminology

IMPLEMENTED means code exists. TESTED means the specific recorded test passed. VERIFIED requires a named evidence artifact/command and is always scoped. RELEASED requires release gates and actual distribution; no current feature is labelled RELEASED.

## Final acceptance — 2026-10-27T13:23:24+03:00

**15/15 unit/HTTP tests PASS; 10/10 Chromium synthetic browser checks PASS; TypeScript PASS; production build PASS.** GH-05 additionally proves that declared and streamed oversized responses fail closed. Full outputs are stored in evidence/check.txt and evidence/browser.txt. Final bundle: JS 210.20 kB / gzip 67.04 kB, CSS 15.59 kB / gzip 4.56 kB.

UI-01..10 are TESTED for the listed scopes. The desktop screenshot was inspected internally for layout; it is not a user deliverable and is excluded from the archive. No actual AI, real STT, voice quality, live integration, Windows or PWA release acceptance was performed.

Local source Git commit SHA is recorded in DEVELOPMENT-LOG after the source commit; no PR/CI/deployment URL exists.
