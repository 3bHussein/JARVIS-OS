# Integration Audit

Status: IMPLEMENTED source discovery; runtime integration acceptance remains TODO.
Scope: repository source review, not live account validation. No personal health, task, file or corporate records were read. Repository inventory returned 117 entries across two pages; source inspection was focused on the seven requested projects. Other repository names are inventory, not audited APIs.

Exact source pins: `evidence/commit-pins.json`. Enumerated files: `evidence/repository-snapshots.json`. The tree endpoint's normalized outer SHA matched HEAD commit; use the independent commit endpoint's `commit.tree.sha` in commit-pins for actual Git tree identity.

## Feasibility matrix

| Project | Observed implementation / source | Auth and storage | Safe initial integration | Limitation / next gate |
| --- | --- | --- | --- | --- |
| ProgressXX | Root index.html: cloud() around L10278; snapshot conflict review L10290; workout reader L10336; weight reader L10377; schedule mirror L10414 | Supabase Auth REST refresh with single-flight guard; bearer + public API key; PostgREST tables plus account snapshot, browser-local queues/tombstones/drafts | Launch now; design owner-scoped read facade with source/freshness and authoritative merge semantics | A new JARVIS identity is not the same Supabase session. No delegated summary API observed. Tables alone omit snapshot/unsynced context. No privileged database coupling. |
| WHOOP Intelligence | whoop-start, whoop-callback, whoop-data, whoop-account; assets/dashboard.js | Existing Supabase user validated by getUser; encrypted WHOOP access/refresh tokens on backend; per-user records and sync-run history | Reuse whoop-data POST action=read after delegated session design; reuse sync_history for freshness | Existing CORS allows https://3bhussein.github.io. JARVIS origin/session is not automatically authorized. Never invoke action=sync during read-only discovery; no second WHOOP OAuth. |
| Week Timesheet Manager | apps-script/Code.gs doGet(), getState(), saveEntry(), saveStickyTasks() | Bound Google Sheet; documented deployment Execute as Me / Only myself; HtmlService UI bridge | Launch private original app after user config; prefer Google Sheets OAuth read-only for named tabs | getState() calls bootstrapIfEmpty_ and sheet_ can create sheets/headers. It is not guaranteed read-only. Do not expose deployment publicly or call it from JARVIS. Need sheet ID and OAuth app/consent later. |
| Project Factory AI | README; scripts/local_ollama_agent.py and .github/workflows | GitHub proposals/PRs/issues/workflow artifacts; loopback Ollama worker /api/generate; reviewed job manifests | Read GitHub statuses and launch existing dashboard | No general authenticated remote generation API observed. Do not dispatch workflow or local worker jobs in read-only milestone. |
| Lexora Academy | README; scripts/hub.js | Static learning app; localStorage progress; neural audio assets | Launch only | Browser-origin storage is not a cloud API; no cross-origin reading or invented progress. User-authorized export/import can be designed later. |
| CloudHub | apps/api/src/main.ts; google.ts; mega.ts; prisma/schema.prisma | NestJS/Prisma/PostgreSQL; bcrypt login; opaque hashed localSession token; HttpOnly SameSite=Lax cookie; encrypted Google tokens; MEGA sessions in process memory | Reuse authenticated /api/health, /api/me, /api/accounts, /api/files once safe delegation/base URL exist | Cookie secure:false in current source; not a production endorsement. Existing login is not delegated read-only auth. /files/content reads bytes: excluded initially. No production deployment inferred. |
| Autel Code Manager | README; worker/backup.js route roles /api/profile, /api/rpc/* and inventory/reveal routes | Cloudflare Worker with Supabase identity and server-derived roles; backend encryption; admin/staff/developer | Disabled. Separate, approved sanitized operational endpoint only | Developer access to audit is not approval to ingest audit payloads into AI. Codes, fingerprints, serials, customer information, renewal secrets, inventory and credential routes excluded. No safe operational summary endpoint established. |

## WHOOP details

- `whoop-start` validates a Supabase identity; generates random state and stores a SHA-256 state hash with expiry.
- `whoop-callback` consumes state through an RPC and encrypts tokens using AES-GCM. Source presence does not prove deployed SQL or server secrets.
- `whoop-data` accepts POST/OPTIONS, rejects absent/invalid user tokens and scopes backend queries by user ID. `read` returns records and sync_history. `sync` writes health records and monitoring data and can refresh tokens; it is outside initial read scope.
- `whoop-account` has status, export and disconnect actions. Export includes health records; disconnect revokes/deletes. Neither should become an unguarded JARVIS tool.
- Existing backend service-role use stays inside the owning service. JARVIS will never receive that credential.

## ProgressXX details

A read facade must preserve the distinction between confirmed cloud rows, snapshot-authoritative legacy records and device-only pending work. Deload/program interpretation must follow existing app rules. No automatic backfill, mirror, replay, CAS RPC, write or data migration is allowed. The 2026-10-12 security audit is historical evidence, not a claim that its warnings remain unresolved in production. Current grants/RLS were not introspected in this session.

## Additional inventory candidates

- `Windows-App-Game-Troubleshooter`: possible launch-only utility after separate source and command-safety review.
- `Language-Journey`, `6-languages-over-60-days.`, `Atlas-Muscles`: possible learning/fitness launch links; no data API assumed.
- `3bhussein.github.io`, `Bil_Hana`: portfolio/project links and read-only GitHub status.
- `automax-live-sheet-dashboard`, `Automax-Academy`: corporate classification; exclude from personal AI by default.
- Course, fork and archival repositories: no reason to create a connector merely because a repository exists.

## Access still required

1. A new **private** `3bHussein/JARVIS-OS` repository, included in the connected GitHub installation. The exposed connector has no create-repository operation; CLI `gh` is absent and shell git authentication is unavailable. Do not repurpose any existing repository.
2. GitHub fine-grained read token or registered GitHub App/OAuth for the running JARVIS application. ChatGPT's GitHub connection does not grant JARVIS runtime credentials.
3. Explicit account-linking/consent design for ProgressXX and WHOOP; staging contract and two-user synthetic isolation tests before live reads.
4. Private Sheets OAuth configuration and sheet ID for Timesheet; no unauthenticated Apps Script shortcut.
5. CloudHub base URL and reviewed delegation design.
6. Windows device/toolchain for native packaging and device acceptance; voice test corpus and chosen engines for evaluation.

## Evidence URLs

Use `https://github.com/OWNER/REPO/blob/COMMIT/PATH` with exact pins above. Primary reads:

- ProgressXX-Web: index.html, README.md, docs/SUPABASE-SECURITY-AUDIT.md.
- Whoop-Intelligence-: functions/{whoop-start,whoop-callback,whoop-data,whoop-account}/index.ts and assets/dashboard.js.
- Week-Timesheet-Manager: apps-script/Code.gs.
- CloudHub: apps/api/src/{main,google,mega}.ts and prisma/schema.prisma.
- Lexora-Academy: README.md, scripts/hub.js.
- Project-Factory-AI: README.md, scripts/local_ollama_agent.py.
- Autel-Code-Manager: README.md, worker/backup.js. An attempted worker/src/index.ts read returned 404; the actual Worker was then located and read.

## 2026-10-28 WHOOP contract follow-up

Source reviewed at 22f16886dc3fca87220fcc8ee11352deb5a3bd33; exact blobs in evidence/whoop-read-contract.json. WHOOP read bridge now uses session-only existing account password sign-in and the existing whoop-data read action. No new WHOOP OAuth, vendor refresh/sync, service-role credential or source repo change. Synthetic acceptance only; actual owner account still needs local sign-in/validation. ProgressXX remains launch/manual bridge until a safe unified delegated summary is available.

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

ProgressXX production root re-read at 26f96d24045a896688c69e7acc3083013d97dc9f (backup contract evidence JSON). Added existing-backup-v3 read preview only; no automatic table reader, source edits or DB calls. Local queue acknowledgement is absent from the backup, so sync is always unknown. Ollama adapter targets fixed 127.0.0.1:11434; engine must separately disable cloud routing. Browser speech service can send audio externally only after explicit in-app consent; default processLocally=true does not fall back.

## Offline speech slice — 2026-10-30T10:01:35+02:00

Added optional faster-whisper 1.2.1 subprocess integration using primary source API. Fixed local model path, offline flags and no-shell isolated process. No cloud speech account, external data integration or existing source repo changed. Real engine/model acceptance is still pending; unit tests inject engine output.

## Built-runtime slice — 2026-10-30T11:06:04+02:00

No integration endpoints/permissions changed. Built runtime uses the same local origin/password/vault. Frontend served via explicit index/hashed-entry allowlist; connectors retain existing auth/consent. No deployment or original-project mutation.

## Daily-workspace preview — 2026-10-30T15:09:36+02:00

ProgressXX file can now supply an explicitly selected transient nutrition view on Home. Manual data/profile targets remain unchanged; file is excluded from model context and persists only during unlocked page navigation. WHOOP read/link APIs unchanged; credential drafts clear on leaving their section. No source repository, OAuth flow or production DB changed. Corporate reads/writes still blocked.


## Session 010 — 2026-10-31T15:01:58+02:00

No integration endpoint/auth change. Portable backup excludes WHOOP and transient ProgressXX data; only local profile/notes/manual check-ins. Original application repositories unchanged.


## Session 011 — 2026-11-01T17:32:39+02:00

WHOOP source re-read on2026-11-01: main22f16886dc3fca87220fcc8ee11352deb5a3bd33 unchanged; whoop-data blob f1390788bd756ebcf91ec46c156f2883e919ac22, daily-home blob ba220ae17686c2c5ae435eb2037c153e06a24952. Read already exposes cycle/workout; JARVIS now projects safe bounded display fields. Same original session consent/short-lived token/fixed read endpoint; no service credentials/new OAuth/vendor sync. No original repo/DB changes. WHOOP official cycle/recovery docs and Supabase auth/changelog reviewed. No actual owner-health read. ProgressXX remains local full-backup-v3 projection only.


## Session 012 — 2026-11-01T19:22:58+02:00

No external connector/auth/source endpoint changes. Reminder events use saved JARVIS owner entries only. Welcome uses already-read labelled briefing; no provider fetch or new health scope. Desktop payload has generic title/body only, no note or health fields. No changes to original repositories or production DB.


## Session013 — 2026-11-02T08:33:21+02:00

No connector/auth/backend/source repo changes. Wizard reads only fixed localhost Ollama /api/tags metadata and changes local JARVIS engine selections after explicit SAVE. No personal or health prompt is sent, model installed or engine executed. Existing cloud-disable requirement remains owner-configured in Ollama itself.


## Session014 — 2026-11-02T13:31:37+02:00

No connector, source app, API auth or production DB changes. Source preparation only operates in the selected JARVIS installation root; ready-built preview requires no dependency install/build. No private records/config are packaged or deleted.


## Session015 — 2026-11-02T13:54:55+02:00

No connector, source-app/auth or production DB changes. WHOOP/file freshness feeds existing Home values before checklist; imported data still excluded from personal storage/model context. New confirmed entries are JARVIS owner notes only, not ProgressXX workouts or external tasks. Existing personal AI-context opt-in remains unchanged.


## Session016 — 2026-11-02T14:45:01.942826+00:00

Native host adds no external connector or data permission. It probes unauthenticated fixed local health only. Separate WebView sessions mean existing browser WHOOP login/import caches are not migrated. Existing original repositories/production stores unchanged.


## Session016 final status — 2026-11-02T14:57:03.396000+00:00

Session016 exact-source native preview introduces no connector credential or external data access. Browser/WebView session separation and blocked new-window links remain explicit. Existing source audit limitations/automatic sync blockers unchanged. See TEST-REPORT.md and docs/evidence/desktop-final-ci.json.


## Session031 — 2026-11-06T19:28:47.554395+00:00

Session031 adds no upstream credential, data read or account link. WHOOP status in cloud returns no facts. Corporate connectors stay blocked. Cloud connector inventory has null last successful sync and unavailable freshness.


## Session 032 — Redis transport hardening

Redis remains an encrypted application-vault transport. Responses now have streaming byte bounds with cancellation. No new credentials, integrations, scopes, production database changes, or WHOOP reads were introduced. Existing cloud connector availability remains unchanged.


## Session 033 — Password recovery boundary

TESTED locally: password-hash-scoped cloud sessions reject prior credentials/cookies without changing vault encryption. Bilingual Settings recovery guidance and docs/05-RESET-ONLINE-PASSWORD.md describe owner-managed Production secret replacement and redeploy. Actual secret reset awaits owner entry; old immutable deployments retain their config. Local typecheck/build, 84 Node tests and built browser 39/39 plus cloud/PWA checks passed. CI runner pinned Ubuntu 24.04 after observed Playwright incompatibility with ubuntu-latest/26.04; exact-source remote CI pending. No production records accessed; desktop deferred.


## Session 034 — Email recovery

IMPLEMENTED/TESTED locally: optional in-app owner email recovery, bounded codes/HMAC/TTL, rate limits, atomic one-use/CAS password update, shared credential hash and revocable hash-scoped sessions; encrypted vault key unchanged. Bilingual UI has explicit missing-setup state and no automatic sending. Recovery email and Resend key/from must be configured by owner once; live setup/delivery remains BLOCKED, no production email sent. Older immutable deployments and bootstrap-hash rollback are separate security boundaries. Final local checks: 89 Node tests pass, one real-Redis CI test skipped locally; typecheck/build pass; built browser 39/39 plus recovery/cloud/PWA scenarios pass. Added Redis service in CI for actual Lua test; source CI/deployment pending. See docs/05-RESET-ONLINE-PASSWORD.md for everyday flow and setup. Removed failing inline PowerShell example with dated correction.


## Session 038 — Verified Resend sign-in and prepared private key transfer (2026-11-09, Africa/Cairo)

VERIFIED: after owner reported signup complete, Resend /emails rendered a signed-in account; account menu matched the owner-selected recovery mailbox (address not committed). API keys page showed no keys. Prepared Add API Key form named JARVIS-OS-Production with Sending access (not Full access), without clicking Add. Owner must create/copy the credential and enter it directly into Vercel; no credential value was generated or read by the agent. Prepared Vercel Add Environment Variable form with RESEND_API_KEY, Secret type, Production scope, empty Value; not saved. Created only JARVIS_EMAIL_FROM=onboarding@resend.dev in Production through the connected Vercel tool, after confirming it was missing. Existing recovery mailbox remains configured. Official Resend docs https://resend.com/docs/knowledge-base/403-error-resend-dev-domain confirm this is a test sender limited to the email associated with the Resend account; it is not a verified custom production domain. Actual delivery not established. No paid options enabled, password reset performed, vault key changed or emails sent. No code changes or new automated tests this setup session. Tools/actions: browser dashboard/account identity/key-form checks; official docs lookup; Vercel metadata list decrypt=false; single non-secret sender variable creation; prepare blank secret-entry UI; GitHub tracking append. Commit: this docs commit, resolve through history. PR none; CI skipped; docs-triggered deployment does not establish email readiness. Next: owner clicks Add in prepared Resend form, copies key directly into prepared Vercel Value, saves Secret and closes the secret reveal dialog before returning. Then inspect only secret metadata, redeploy and check recovery availability; request one authorized owner reset code and hand over actual password entry. Desktop deferred.


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


## Session 045 — Recorded daily next steps (2026-11-09T21:52:49.816027+02:00)

IN PROGRESS, M3 daily briefing. Requested continued development. Base 24282ed6b6a7b810ff7cf36c5b981c9f6e469f66. Implemented a deterministic Start here section below recorded metrics, capped at three navigational next steps: review live overlaps affecting today's entries, next actual timed commitment today, due entries, missing usable sleep/selected food, and untimed-note review. Missing values remain unknown, zero is known, completed and next-day commitments are not invented as today's agenda. Empty/complete recorded input leads to reviewing the recorded plan, never a claim the user is free.

Source provenance identifies WHOOP/manual sleep and selected cloud/file/manual food. Missing-data statements and provenance enter the existing explicit read-aloud briefing; no new AI request, health prescription, memory persistence, notification or source read occurs. Button navigation does not write personal records. Existing science-limited training advice and confirmed-schedule-only free-slot behavior unchanged.

Files: new packages/personal/src/daily-focus.ts, apps/web/src/DailyFocus.tsx, tests/daily-focus.test.ts; changed PersonalHome.tsx, style.css, tests/browser.mjs and tracking docs. No dependency/API/auth/source-app/schema changes. Desktop deferred. Commands: git fetch and isolated worktree, source/planner review, npm run check, built browser acceptance; all test data synthetic. Local check/build initially PASS; browser is running and final check follows a wording clarification about today's overlap count. No source credentials, actual owner health data or email operations. Commit/PR/CI/deployment pending.

Next: complete typecheck/Node/browser and narrow-screen checks, publish guarded source and verify exact-source CI/Vercel; append final evidence. Real source-account acceptance remains owner task within Sources.


### Session 045 local acceptance — 2026-11-09, Africa/Cairo

TESTED npm run check PASS: 110 registered Node tests, 108 pass/two CI-only Redis skips, typecheck/build PASS. Built browser 39/39 baseline plus UX-08 next-step navigation without personal revision changes, existing source error/retry/isolation/credential cleanup, RTL 320px and PWA cases PASS. Visual inspection of synthetic desktop screenshot confirms metrics remain above the compact next-step list and no stretched panel regression. Minor count-wording cleanup followed, with FOCUS-01..03 rerun PASS; no business-logic change. Added numbered guide08 and README link. git diff --check PASS. CI/deployment for published source still pending; real owner source data not used.


### Session 045 web verification and handoff — 2026-11-09T21:57:09.607399+02:00

VERIFIED automated web source ed182699221b7586ed8e024b817d9394ba62859d. GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42687861863: foundation 129399417107 SUCCESS, windows-launcher 129399417442 SUCCESS. Logs establish 110/110 Node tests with zero failures/skips, real isolated Redis cases retained, typecheck/build and launcher checks; development and built browser 39/39 baseline plus UX-08 navigation-without-write, source retry/isolation/RTL/PWA acceptance. Native job 129399417687 is still building at this entry; desktop product work remains deferred and physical acceptance is not claimed.

Vercel Production dpl_2dxP38uXuBaoUkk8gzEKCXY7nvBi READY at exact githubCommitSha ed182699221b7586ed8e024b817d9394ba62859d, primary alias https://jarvis-os-henna-sigma.vercel.app/. Guarded GitHub main publication, PR none; no duplicate manual deployment or env mutation. No owner account credentials, real health data, source-app changes, vendor synchronization or emails used. Runtime metadata/CI and synthetic UI are the evidence; actual owner-source acceptance remains TODO.

Delivered: compact Start here rows below metrics, explicit recorded-data-only provenance, safe source-aware gaps in read-aloud, and guide08. This is deterministic navigation support, not a new generative model, prescribed health plan or inferred availability. No hidden writes, memory persistence, external model calls or source reads are generated by it. Unknown/zero, selected-source failure behavior, user review/confirmation and motion/accessibility controls remain intact. Worktree matches published runtime, dependency symlink excluded. Logs/handoff updated append-only; final documentation commit uses [skip ci].

Next actions: observe native CI terminal status, append final result; owner can use Start here on Today and Sources for explicit account linking. If continuing engineering, prioritize read-only assistant queries that share the same source/availability logic, with synthetic tests before any real-data acceptance; durable source delegation, MFA/PKCE and actual voice accuracy remain separate TODOs. Never fabricate commitments, assume free time, expose corporate records, silently call a model with health data, trigger vendor sync or modify production schemas without authorization.


### Session 045 terminal evidence — 2026-11-09, Africa/Cairo

All three exact-source CI jobs in run 42687861863 completed SUCCESS: foundation 129399417107, windows-launcher 129399417442, desktop-windows 129399417687. Native automated packaging success is not physical Windows acceptance. Vercel error scan 2026-11-09T19:42:08.833Z–19:57:08.833Z returned no matching logs; no actual owner-data request was generated, so this is not proof of live source access. No remaining automated CI blocker for source ed182699221b7586ed8e024b817d9394ba62859d. Final docs-only evidence publication follows; owner acceptance and other v1 gaps remain as documented.


## Session 046 — Read-only saved-data conversation (2026-11-10T15:26:24.968977+02:00)

Requested continued development. Base fa84e0f530821b5039f8ed259e640787565f230d. Implemented a bounded Egyptian-Arabic/English query router for recorded priorities, selected food/remaining budget, usable sleep, next actual appointment/workout, open untimed notes and daily summary. Normalizes common Arabic variants; explicitly refuses create/edit/delete requests. Recomputes local date and freshness at question time, preserves selected-source unknown/zero behavior, never invents targets or appointment times from training labels. Unsupported input returns to existing help; no broad language/voice accuracy claim.

UI: draft-only question shortcuts, source-labelled read-only answer footer and existing opt-in read-aloud. Cloud engine help no longer tells online users to run a local Windows batch. The optional existing model branch receives no new automatic context and retains consent controls; shortcuts are hidden there. Personal query context is a private UI-held reference, not persisted or passed to a model, cleared on lock/unmount. Source data is withheld from query context during in-flight source reads.

Fixed asynchronous clear race: local chat messages clear immediately, epochs prevent an older clear acknowledgement from deleting a newer saved-data reply. Added explicit api/chat/clear.ts wrapper for existing authenticated/CSRF-protected cloud handler, following the validated nested route pattern; no new write capability or backend business logic.

Files: new packages/personal/src/queries.ts, tests/personal-queries.test.ts, api/chat/clear.ts, docs/09-ASK-ABOUT-SAVED-DATA.md; modified main.tsx, PersonalHome.tsx, AIChat.tsx, style.css, tests/browser.mjs, README and nine tracking docs. No new dependency, provider key, model call, source-app change, production schema change or desktop engineering. Only synthetic test data used; no credentials, owner health record or email operation.

Commands: git fetch/worktree, source/route inspection, npm run typecheck, npm run check, built-browser acceptance, git diff --check. Initial import insertion preceded the existing Vite triple-slash reference and broke ImportMeta.env typing; moved the reference back to file start and checks passed. Final local check: 116 registered Node tests, 114 pass/two intentional CI-only Redis skips, typecheck/build PASS. Built browser PASS 39/39 baseline plus UX-09 draft-only bilingual read queries/no model/no writes, UX-10 delayed-clear race, cloud selected-food arithmetic, and retained RTL/source/PWA cases. No runtime edits after final acceptance.

Commit/PR/remote CI/deployment pending. Next: publish guarded source, inspect exact-source CI/Vercel/log metadata, append final evidence/handoff. Actual owner-account source acceptance remains TODO. Do not claim a generative AI engine, full dialect understanding, background sync or physical desktop acceptance.


### Session 046 final query disambiguation and local verification — 2026-11-10, Africa/Cairo

Final review tightened current-clock matching and added workout/appointment time variants plus code-switching; a question about a workout time must not be mistaken for the current clock. This supersedes only the earlier no-further-runtime-edits statement. Re-ran npm run check PASS (116 registered, 114 pass/two isolated CI Redis skips, typecheck/build) and built browser PASS 39/39 baseline plus UX-09/10 and all retained cloud/RTL/PWA cases on the updated source. QUERY-01 now also covers clock versus workout-time separation and mixed Arabic/English. No additional runtime edits after this verification. Publication/remote results pending.


### Session 046 final chat lifecycle polish — 2026-11-10, Africa/Cairo

Source 27259753f843a54abe23d7bc55893772aba6afde published and Vercel dpl_DVbv7wNaJrEsTuThyRJKGyU581Cj READY. Its CI run 42825033525 is still in progress at this entry. Final review added an alive guard to late chat authentication failures so an unmounted old chat cannot close a newer workspace, and changed unsupported-question help to advertise supported saved-data questions. Final follow-up typecheck/build and built-browser 39/39 baseline plus UX-09/10, cloud selected-food arithmetic and retained source/RTL/PWA cases PASS (session046-release-browser.log). No backend business logic, permission or data-retention changes. Final source commit/CI/deployment follow.


### Session 046 final verification and handoff — 2026-11-10T15:37:07.052367+02:00

VERIFIED automated source 94bb14f3b89237b0e75842de6bfdc38326fe12e9. Exact-source GitHub run https://github.com/3bHussein/JARVIS-OS/actions/runs/42825727543 completed SUCCESS in all three jobs: foundation 129862399413, desktop-windows 129862399563, windows-launcher 129862400067. Foundation logs confirm 116/116 Node tests, zero failures/skips, retained real isolated Redis tests, typecheck/build and launcher checks, development/built browser 39/39 baseline plus UX-09 bounded bilingual saved queries/draft-only shortcuts/no model or writes, UX-10 delayed-clear response race, and retained source/RTL/PWA cases. The final delayed-clear test waits for response-body completion and two presentation frames before checking that the newer answer remains. Native automated build success does not establish physical Windows acceptance.

Production dpl_Gy7NZUNsAaWSYB4NC3NHKZ9St2ru READY at exact githubCommitSha 94bb14f3b89237b0e75842de6bfdc38326fe12e9; primary alias https://jarvis-os-henna-sigma.vercel.app/. Earlier source 27259753f843a54abe23d7bc55893772aba6afde also passed all CI jobs, but this newer source is the final accepted runtime. Publication used guarded main updates; PR none, no manual duplicate deployment, provider key or env mutation. Error-log metadata was scanned separately; absence of matching logs is not live-account acceptance. No actual owner credentials, real health records, production schema/source-app changes or email/vendor sync actions performed.

Delivered: supported local saved-data questions and query-time source/date checks, source-labelled answers, bounded notes/actual appointment dates, no target/time inference from missing input, write refusal, draft-only shortcuts and guarded clearing; online help and guide09 updated. Main private context is reference-held only and cleared on lock/unmount. Optional model mode stays separate with existing explicit context consent; this is not general generative intelligence, measured dialect transcription, medical advice or a new cloud AI provider. No new dependency. Worktree matches published runtime, dependency symlink excluded. All tracking docs appended; final docs-only evidence commit uses [skip ci].

Remaining: actual owner source login/coverage acceptance in Sources; durable background delegation/MFA/PKCE; measured voice accuracy/latency and native physical testing. Next authorized engineering can improve source-aware briefing follow-ups and query coverage using synthetic cases. Any real-data test, new external model processing, original-app/schema change or new write execution needs its own appropriate authorization. Never request credentials/sign-in links in chat, fabricate readings/tasks, infer calendar times from labels or silently persist/send health context.


## Session 047 — Investigate manual-only Home and make cloud sources explicit (2026-11-10T16:26:52.145574+02:00)

Requested: Home is showing manual input rather than WHOOP/ProgressXX; inspect and improve general usability. Base 9f834618655f59553d451fc35ad2c68214982a7d. Read provided screenshot without publishing its personal/health values. Production runtime metadata in a recent supported window showed ProgressXX account connect accepted, while WHOOP reads had no connected grant. This verifies authentication/connection state only, not actual source-row reading or complete sync. No owner medical values, source credentials or raw tokens read. Browser inventory had no existing authenticated user tab, so no owner login was attempted.

Confirmed code defect: source connect/reload did not select ProgressXX nutrition; useCloudFood initialized false and the second optional checkbox was not visible near primary metrics. WHOOP absence silently fell back to manual sleep (labelled manual but easy to mistake for integrated data). Implemented cloud-first online defaults for food and WHOOP sleep, explicit top-of-Home selectors/status/read timestamps/connect/refresh controls, source-specific metric headings, and no silent manual substitution. Manual values stay saved and are used only when chosen in online mode. Connecting a source selects its cloud source; disconnect preserves the selection and unavailable metrics stay unknown. Local preview retains legacy auto/manual behavior. Source choices are propagated to conversation/read-aloud, including explicit sleep preference.

Backend fix: ProgressXX HTTP401 was classified with HTTP502, preventing source-grant expiry handling. It now returns source-session expiry to the connector, which clears only that grant without logging out JARVIS. HTTP403 and missing endpoint/field responses get bounded permission/schema codes. Failed ProgressXX HTTP dataset is identified by food/workouts/weight/schedule in safe logs/response, never raw upstream bodies or data. No source schema/permission changes or privileged database reads.

Files: new HomeSources.tsx; changed PersonalHome.tsx, CloudConnections.tsx, briefing.ts, queries.ts, account-reader.ts, account-status.ts, cloud-handler.ts, style.css and focused tests/browser suite. Tests include explicit WHOOP vs manual selection, source-aware queries, dataset/auth failure diagnostics and ProgressXX expiry handling. No dependency, account secret, email, external model or source-app repository changes; desktop deferred.

Commands/attempts: git fetch/worktree, source and log inspection, CUA inventory only, npm run typecheck/check/browser. Log request initially used invalid warn level (corrected to warning); one-hour window exceeded retention (corrected to recent fifteen-minute window); these are tool-query failures, not application failures. First browser run lacked an explicit exact accessible select label; added localized aria-labels. A test type assertion then blocked rebuild, so an old bundle was exercised; corrected the assertion using AccountError narrowing and sequenced checks before browser. Current check PASS: 120 registered, 118 pass/two CI-only Redis skips, typecheck/build. Fresh built browser is running. Commit/PR/CI/deployment pending.

Next: verify default source selection, successful cloud auto-display/reload, no manual fallback on failure/disconnect, explicit manual switching without writes, RTL/mobile bounds and safe diagnostics. Publish guarded source, inspect exact-source CI/deployment and append final evidence. Actual WHOOP account must be linked by owner in the web form; never ask for credentials or links in chat. Actual ProgressXX source-row availability is not established by connect success alone.


### Session 047 supplement — independent source sections (2026-11-10T14:36:41.444059+00:00)

IMPLEMENTED: ProgressXX uses parallel settled section reads. Food, exercises, weights and schedule fail independently; usable food survives an unrelated legacy exercise validation/schema error. Invalid/duplicate/capped food makes the whole food section unknown. Any section's HTTP401 expires the source grant; all-HTTP-failure retains the original bounded error. Safe section issues are projected, encrypted in the existing short cache, logged without record content and explained in collapsed UI details. No source schema, authentication permission or production database changes.

TESTED locally: npm run check — TypeScript PASS, 121 registered tests / 119 PASS / two Redis integration tests skipped locally (CI-only), production build PASS. ACCT-04/07/08 cover incomplete food rejection, section isolation, safe HTTP diagnostics and mixed-success source401; CLOUD-ACCT-07 verifies grant expiry; PERSON-07 and QUERY-07 verify explicit source choice and no silent manual sleep substitution. React review: hooks remain unconditional, source selection is local derived UI state, source reads stay parallel and existing request/cache isolation is unchanged, native labelled controls and reduced-motion styles retained, no new dependencies.

Browser attempt: all 39 numbered UI checks reached PASS; cloud flow then timed out after a deliberate reload because source details were collapsed. Corrected the test to open those details before disconnect; application disconnect behavior was not bypassed. Fresh built browser rerun pending. Guides 06/07/09 corrected, numbered guide10 added, README updated. Source publication, exact-source CI/deployment and owner source-row acceptance remain pending. PR: none (authorized direct main workflow).
