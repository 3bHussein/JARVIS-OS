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

## Repository blocker correction — 2026-10-27T14:25:50+03:00

K-001 is superseded: the user supplied JARVIS-OS, missing setup files were restored, and exact-commit CI passed (59e0bc4655cca1e4181532afe2a38931d8c977e3; run 40495860032). Status: VERIFIED for repository access and the recorded workflow only. No deployment.

## Workspace status correction — 2026-10-27T20:20:21+03:00

K-011 is superseded for preference persistence: locale/zone/motion/quiet now survive reload and can be reset. Automatic spoken greeting remains pending. K-012 is superseded for implemented connector status: authenticated metadata and last read/freshness are displayed, with configured versus ready separated. Non-GitHub sources remain disconnected/blocked. K-009 remains open for pagination and richer project health; session memory cache, ETags and cooldowns are implemented. No persistent source cache is desired in this slice.

Scope limitation: provider cooldown and serialization are per session; coordinating global credential rate budgets requires a later backend service design. This remains single-owner development auth, not a multi-user deployment.

## 2026-10-28 — run experience

The current app can be launched through Setup-JARVIS.bat and Start-JARVIS.bat. This does not resolve K-008 (Tauri/native packaging). Current combined launcher intentionally supports only default ports 4310/5173 and a valid local password hash. Initial npm dependency installation needs internet. Windows automation is pending CI; physical console/browser behavior still needs device acceptance.

## 2026-10-28 — personal workspace limits

M3 is partial: WHOOP password-account read bridge is implemented/synthetic-tested, but requires real local acceptance. Passwordless/MFA accounts, narrow delegated token issuance, automatic provider reauthentication and credential vault remain pending. ProgressXX nutrition/training sync is not implemented; manual inputs are labelled. Profile is explicit memory, not model training. Notes appear on open/while running, not closed-app notifications. No automatic book/movie retrieval yet.

Persistence is single-owner, local password-derived encryption. Losing/changing that password can lock old data. Multi-process vault writers are unsupported (the normal launcher prevents a second default-port instance); multi-tab revision guards are implemented. 90 daily entries/200 notes maximum, no silent rollover. Session-only changes do not erase older persistent files.
