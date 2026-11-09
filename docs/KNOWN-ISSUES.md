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

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

ProgressXX preview is manual and disappears on navigation/lock; automatic fresh sync still unavailable. Backups containing incomplete legacy records can be rejected wholesale. No automatic import-to-home merging. Ollama is not bundled; engine unavailable/slow/model missing fails visibly and preserves draft. Cloud-disabled engine operation, actual model usefulness and Arabic quality require local acceptance. Browser local speech support and Arabic packs vary; remote fallback requires consent and has provider-specific privacy. No actual WER/latency/device results. Browser transcript/voice support is not a Tauri installer. Imported files are excluded from AI. Speech output can use a network voice unless a device voice is selected.

## Offline speech slice — 2026-10-30T10:01:35+02:00

Offline worker code is wired but optional dependencies/model were not installed or used in acceptance. No Egyptian Arabic WER or inference latency exists yet. Loading CPU model per recording may be slow. Transitive Python dependencies are not fully locked. Browser ScriptProcessorNode is deprecated and main-thread scheduling can drop audio under load. Linear resampling has no quality benchmark. Local STT is final-only and 30 seconds maximum. Cancellation and memory privacy require physical Windows/OS acceptance beyond synthetic fixtures.

## Built-runtime slice — 2026-10-30T11:06:04+02:00

Built mode requires npm run build after updates and restart. Generated dist is absent from Git/source ZIP. Runtime still needs Node 24 and API/shared source. Entry allowlist does not support arbitrary lazy chunks/fonts/icons yet. File-symlink fixture skips on Windows where unprivileged support varies. Tauri installer, physical Windows/default-browser and production identity are not certified.

## Daily-workspace preview — 2026-10-30T15:09:36+02:00

Daily preview is local/single-owner. Imports and unsaved drafts do not survive page reload/lock. Undo is only the latest deletion in that page session. Agenda groups entries by start date; midnight-spanning reservations still participate in overlap warnings. Changing timezone resets wall-time editor fields to avoid reinterpreting an old local time. AI health context excludes selected file nutrition. Preview needs Node24; no models or native installer bundled. Actual model/health/device/accessibility/performance acceptance and automatic integrations remain open.


## Session 010 — 2026-10-31T15:01:58+02:00

Portable backup requires its independent password; no reset. Browser memory/OS device compromise and completed-download persistence are outside automated guarantees. No merge or automatic backup schedule. Physical Windows restore and independent crypto review remain TODO.


## Session 011 — 2026-11-01T17:32:39+02:00

WHOOP open-cycle-only display can intentionally show unknown for closed cycles, cycles older than72h, unscored/missing records or stale sync; device energy is not a food target. HRV/RHR are displayed without personalized interpretation/baseline. Real source account acceptance still TODO. ProgressXX requires refreshed manual file import; no appointment time/session count/deload inferred. Real speech quality/native installer remain TODO.


## Session 012 — 2026-11-01T19:22:58+02:00

Browser timer throttling/suspension and app closure/lock prevent guaranteed reminder delivery. No service-worker/native scheduler. Desktop Notification constructor/silent support and actual audio playback vary; unsupported native delivery leaves in-app notices. A reported-local voice is metadata, not OS network attestation. Welcome may be blocked by autoplay or absent device voice; explicit Read my briefing remains available. Server expiry cleanup occurs when detected by existing session checks, not an OS-level immediate lock.


## Session013 — 2026-11-02T08:33:21+02:00

Wizard checks model-name metadata/file presence, not real inference/dependencies/voice quality. Cloud disable must be configured separately in Ollama and is not attested by JARVIS. Config changes require restarting JARVIS. Append-only overrides are bounded to256KiB; same-OS-user malicious races/power-loss leftovers are outside compare-before-rename guarantee. Unrepresentable quotes/control chars fail without save. Physical Windows interactive setup remains TODO.


## Session014 — 2026-11-02T13:31:37+02:00

Fresh GitHub source ZIPs exclude ignored apps/web/dist by design. Numbered setup now builds missing assets for a complete source copy; Internet/npm needed unless dependencies are already present. Incomplete preview without source cannot self-repair and requires full re-extraction. Local test uses installed dependencies, not a live npm download. Existing source edits with valid old dist still require an explicit rebuild. Owner D drive and physical Windows not accessed.


## Session015 — 2026-11-02T13:54:55+02:00

First-use progress counts recorded choices, not integration completeness or health quality. Session-only acknowledgement resets on reload/lock and does not erase older encrypted data. Encrypted save excludes unsaved form drafts. Quick capture needs explicit dates/times; no natural-language scheduling. Failed/stale previews retain drafts, but lock/reload clears them. No owner screenshot data used for synthetic acceptance.


## Session016 — 2026-11-02T14:45:01.942826+00:00

M6 native host requires existing02 runtime, Node24 and Windows WebView2; no automatic runtime lifecycle. Browser and native sessions/preferences differ. Save encrypted records before switching. External/new-window launches denied. GUI/microphone/TTS/downloads/notifications untested in WebView2. Initial Rust graph/CI build pending; no local Rust toolchain. Not an installer.


## Session016 final status — 2026-11-02T14:57:03.396000+00:00

Final automated build/package gates passed; initial missing local Rust is covered by exact-source Windows CI, not local native execution. Initial archive lock byte difference was Windows CRLF only, with identical normalized source/graph. Physical WebView2 GUI/audio/download/notification acceptance remains TODO. Host requires02 and separate unlock, blocks external windows and does not auto-lock or own runtime. See TEST-REPORT.md and docs/evidence/desktop-final-ci.json.


## Session031 — 2026-11-06T19:28:47.554395+00:00

Cloud WHOOP and model execution remain unavailable. Previous501 responses from status endpoints caused generic UI errors. Session031 provides explicit availability/inventory responses. Readiness health means configuration shape only, not Redis or model acceptance.


## Session 032 — Body buffering issue resolved locally

TESTED: oversized cloud request/Redis response streams no longer require complete buffering. Malformed owner JSON now reports a client error. Remaining: process concurrency/time limits and real owner persistence acceptance are not established by these tests. Cloud WHOOP/AI execution and cloud erase remain unavailable.


## Session 033 — Password recovery boundary

TESTED locally: password-hash-scoped cloud sessions reject prior credentials/cookies without changing vault encryption. Bilingual Settings recovery guidance and docs/05-RESET-ONLINE-PASSWORD.md describe owner-managed Production secret replacement and redeploy. Actual secret reset awaits owner entry; old immutable deployments retain their config. Local typecheck/build, 84 Node tests and built browser 39/39 plus cloud/PWA checks passed. CI runner pinned Ubuntu 24.04 after observed Playwright incompatibility with ubuntu-latest/26.04; exact-source remote CI pending. No production records accessed; desktop deferred.


## Session 034 — Email recovery

IMPLEMENTED/TESTED locally: optional in-app owner email recovery, bounded codes/HMAC/TTL, rate limits, atomic one-use/CAS password update, shared credential hash and revocable hash-scoped sessions; encrypted vault key unchanged. Bilingual UI has explicit missing-setup state and no automatic sending. Recovery email and Resend key/from must be configured by owner once; live setup/delivery remains BLOCKED, no production email sent. Older immutable deployments and bootstrap-hash rollback are separate security boundaries. Final local checks: 89 Node tests pass, one real-Redis CI test skipped locally; typecheck/build pass; built browser 39/39 plus recovery/cloud/PWA scenarios pass. Added Redis service in CI for actual Lua test; source CI/deployment pending. See docs/05-RESET-ONLINE-PASSWORD.md for everyday flow and setup. Removed failing inline PowerShell example with dated correction.


## Session 036 — Missing recovery email diagnosis (2026-11-09, Africa/Cairo)

Status: VERIFIED configuration blocker; email delivery BLOCKED on sending-provider setup. User reported no recovery email. Connected Vercel tools now available. Read project environment metadata with decrypt=false (no secret values read): all three recovery variables were absent. Fetched public /api/recovery through the Vercel connector: HTTP 200, {available:false}, cache-control no-store. This is disabled configuration, not evidence of spam filtering or provider rejection. Created only JARVIS_RECOVERY_EMAIL as a sensitive Production variable using the mailbox the owner explicitly supplied in chat; mailbox value excluded from repository logs. Re-listed metadata and confirmed its presence/target/type. RESEND_API_KEY and JARVIS_EMAIL_FROM remain absent. No request-code/send action, password reset, data-key change, API-key generation or service-account creation performed. No new approval to create/use Resend has been provided since Session 035 review rejection; do not retry the blocked signup without explicit authorization. No source-code changes/tests rerun; read-only health plus environment metadata are the supporting evidence. Commands/tools: read Vercel environment/marketplace guidance; filter_project_envs(decrypt=false); web_fetch_vercel_url(/api/recovery); create_project_env (single sensitive Production mailbox variable); metadata verification; GitHub tracking update. Commit: this tracking commit, discover through Git history. PR none, CI skipped by message; no complete live delivery/deployment acceptance claimed. Next: owner authorizes/finishes email-service account setup and authorized sender; enter provider API key privately in hosting, then redeploy once. Verify /api/recovery available:true and owner-authorized real delivery/reset while preserving JARVIS_CLOUD_KEY/namespace. Desktop deferred.


## Session 040 — Explicit recovery function routes

Production nested recovery dispatch was found to return Vercel 404 before reaching the application, despite available:true configuration. Added explicit request.ts/complete.ts function entries reusing the shared handler. Local typecheck/build and 89 Node tests pass (one real-Redis test reserved for CI). No credential/key rotation performed. Source CI/live nested GET and authorized send acceptance pending publication; actual password entry remains owner-only. Earlier synthetic/UI evidence did not establish platform routing. See Session 040 in Development Log.


### Session 040 current verified state and retry authorization blocker — 2026-11-09

Current runtime source 9d7d8f42cd62ef62822d58eec7814409b54f9045; deployment dpl_4QWouTu4jL9iwAdnZ1sUXwjfV8Mv READY (Production). Exact-source CI https://github.com/3bHussein/JARVIS-OS/actions/runs/42605354806 SUCCESS, all three jobs; Foundation logs confirm 91/91 Node tests including real Redis and redacted-diagnostic regression, development/built browser 39/39 each. Local checks: typecheck/build pass, 90 Node pass plus one CI-only Redis skip. Additional fileless synthetic fetch-adapter check passed root health/nested auth/Origin with global network disabled.

Important dated correction: connector HTTP 401 results from the earlier nested probes were Vercel Deployment Protection share-link failures, not proof of application authentication. Full connector response exposed deployment_authentication_required at share_link; no unchanged retry/bypass or protection weakening attempted. Project protection metadata is enabled/all_except_custom_domains. A separate read-only browser GET on the actual production /api/recovery/request showed {"error":"authentication_required"}, which DOES establish application dispatch for that GET. This did not send email. Complete POST/code delivery remains unverified.

An additional UI send attempt after the earlier single retry was REJECTED by automatic approval review for exceeding the explicitly authorized single retry. No further consequential send or indirect workaround performed. Await explicit owner approval for one further reset-code send. No code/password value, API key or vault key read; no production password reset or personal-record access. Earlier failed UI POSTs have no observed provider acceptance or inbox delivery; do not claim success. Next: owner approves one further send, inspect clarified error or accepted code form, resolve remaining POST failure if any, then hand over owner-only code/password entry. Record receiving and retained-data checks only after evidence. PR none. This docs-only follow-up uses [skip ci].


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
