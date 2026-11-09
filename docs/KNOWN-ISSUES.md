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
