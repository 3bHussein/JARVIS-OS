# Known Issues

| ID | Status | Limitation / risk | Next action |
| --- | --- | --- | --- |
| K-001 | BLOCKED | No remote JARVIS repository or remote CI | Create private repo and include it in GitHub installation. |
| K-002 | TODO | Local auth is single-owner, HTTP/loopback, memory-only | Production OIDC/passkeys/MFA decision, HTTPS, durable secure sessions, tenant enforcement. |
| K-003 | TODO | No encrypted runtime credential vault | Do not deploy with env-only secret storage as final design; use reviewed host vault/envelope keys. |
| K-004 | TODO | Health/task integrations not connected | Delegated account consent and read contracts; do not infer data from inventory. |
| K-005 | TODO | No AI model adapter or long-term memory | Build source-aware read-only orchestration, editable/deletable opt-in memory. |
| K-006 | TODO | No STT/VAD/neural TTS; system voice diagnostic only | Evaluate engines on actual approved corpus; no current WER/latency measurements. |
| K-007 | TODO | No PWA offline install/service worker | Cache shell only; never cache account API/health data by default; test logout purging. |
| K-008 | TODO | No Tauri installer/native execution | Windows toolchain and physical device acceptance needed. |
| K-009 | TODO | GitHub results limited to first ten records, no persistent freshness/cache | Pagination, ETags, retry-after and rate-budget tests. |
| K-010 | TODO | Interface mixes English technical labels in Arabic mode | Full translation pass, screen-reader and keyboard acceptance. |
| K-011 | TODO | Preferences are session-only; quiet toggle does not auto-speak | Persist non-sensitive preferences safely; implement actual greeting opt-in in M5. |
| K-012 | TODO | Connector catalog displays disconnected metadata; not live per-connector health | Replace with authenticated status and last-read state without implying config=healthy. |
| K-013 | TODO | Audit is redacted stdout, not append-only durable audit store | Protected metadata sink, retention and tamper evidence. |
| K-014 | TODO | No physical microphone, voice quality, Windows, Safari/Firefox or full WCAG/performance benchmark | Follow release checklist; do not extrapolate Chromium synthetic evidence. |
| K-015 | TODO | GitHub response size check occurs after text buffering | Stream-bound response bytes and constrain Content-Length; current GitHub fixed endpoint/pagination reduces but does not eliminate risk. |

## Resolved during this session

- TypeScript widened chat role literals to string; fixed literal typing and reran checks.
- Vite initial dependency had known security advisories; pinned 7.3.7 and audited again.
- Icon text polluted navigation accessible names; added explicit localized aria-labels.
- Motion select's implicit label included option text; explicit label added after browser evidence.

No issue is marked resolved solely on code edits; see final test evidence for passing checks.

## Dated correction — 2026-10-27T13:23:24+03:00

K-015 is superseded: response bytes are now bounded during stream reading and Content-Length is checked before buffering. GH-05 passes for both cases. Status: TESTED for synthetic oversized responses. Also corrected a late microphone-permission race after AudioContext.resume and the stale unlocked notification after logout; browser acceptance passes. Repository/resource selection is disabled during a GitHub request to prevent a result/selection race.
