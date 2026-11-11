# JARVIS OS

An original personal AI command center, built as a separate hybrid application.

**Current status: personal preview 0.1.0 — not a production release.** A bilingual daily workspace combines a source-labelled briefing, planner, journal, optional WHOOP saved-record reads and a transient ProgressXX backup view. Optional Ollama conversation and reviewed speech are wired; real model/voice/device acceptance, durable background integrations and full PWA/native device acceptance remain open. An optional Tauri window host passed Windows build/CLI acceptance; actual WebView2 GUI/device acceptance remains open and it requires the existing step02 runtime.

## Open the current online preview

Use https://jarvis-os-henna-sigma.vercel.app/ — no ZIP/local setup is required for everyday web use. Unlock your existing JARVIS workspace. Current preference is **free operation without payment cards or API keys**.

- Saved-data questions work without a generative model; these are bounded answers, not general AI.
- Optional **Free device AI** runs Qwen3 0.6B in a WebGPU worker after you explicitly download it. No model download at startup. Hardware, memory/storage and internet for the initial download are required; real device performance and Arabic quality remain unverified.
- Cloud AI remains disabled. No paid credits, automatic recharge or new account are required for the device option.
- Voice still uses browser/device engines; natural Egyptian neural speech and actual accuracy/latency are not certified.

Start with [13 — Free device AI](docs/13-FREE-DEVICE-AI.md) and [12 — Daily-use readiness](docs/12-DAILY-USE-READINESS.md). Fitness connections remain read-only/session-limited and actual owner totals still need acceptance. Desktop development is deferred.

## Optional local previews

Download **JARVIS-OS-Personal-Preview** from the [tested preview download](https://github.com/3bHussein/JARVIS-OS/actions/runs/41465987871#artifacts), extract into a new folder, install Node.js 24+ if needed, then read **00-READ-FIRST.md**, run **01-Setup-JARVIS.bat**, then **02-Start-JARVIS.bat**. Optional AI/voice setup is **03-Configure-AI-Voice.bat**. The artifact needs no npm install or build. Unlock from Settings with the local password you chose. No account credentials, models or personal data are bundled.

Follow the [single combined acceptance journey](docs/USER-ACCEPTANCE.md). This is a local browser preview, not an EXE/Tauri installer. Keep the launcher open; Ctrl+C stops it. Preserve an older installation's private config/data/password instead of overwriting it.

From a fresh source checkout or Code → Download ZIP: run **01-Setup-JARVIS.bat**; it detects the missing compiled web folder, installs locked dependencies and builds it. Then run **02-Start-JARVIS.bat**. A source setup needs Internet/npm on the first run. Legacy Setup-JARVIS-Preview.bat now also handles a complete source copy instead of exposing a raw ENOENT. The original Start-JARVIS.bat remains the development launcher. [Run guide](docs/RUN-LOCALLY.md).

Optional Windows native host: download **JARVIS-OS-Windows-Desktop-Preview** from the [tested Windows build](https://github.com/3bHussein/JARVIS-OS/actions/runs/41465987871#artifacts), then see [desktop preview scope and steps](docs/DESKTOP-PREVIEW.md). It requires the separate Windows Desktop Preview artifact, WebView2 and the existing step02 runtime; it is not an installer. Browser sessions do not migrate automatically.

## Run the foundation

Requirements: Node.js 24+, npm, a modern browser. No database is needed for this slice.

```sh
npm ci --ignore-scripts
```

Create a private `.env` from `.env.example`. Generate a salted hash using `npm run password`: it reads a password from stdin. Use at least 12 characters. Do not put passwords into shell history, commits, screenshots or chat. The helper also supports `node scripts/password.mjs --write-env` and refuses to overwrite an existing file. On Windows PowerShell a hidden prompt can supply stdin:

```powershell
$credential = Get-Credential -UserName local-owner -Message 'Choose a local JARVIS password (12+ characters)'
$credential.GetNetworkCredential().Password | node scripts/password.mjs --write-env
Remove-Variable credential
```

Run these in two terminals from the repository root:

```sh
npm run api
npm run dev
```

Open http://127.0.0.1:5173, select Settings and unlock the local workspace. This is a **single-owner, loopback-only development service**. Do not expose it to a LAN, internet or reverse proxy. Sessions last one hour, are memory-only and are invalidated by restart. The local HTTP cookie intentionally lacks Secure; an HTTPS production identity system is a release gate.

Optionally configure `GITHUB_TOKEN` in `.env`, restricted to the selected personal repositories and read-only metadata/contents/issues/pull requests/Actions permissions. JARVIS performs GET requests only. No corporate repository is allowlisted. Do not paste tokens into the UI. OAuth consent and encrypted credential vault are not implemented.

## Available now

- Original navy/cyan interface, animated core, Arabic RTL/English LTR, IANA-zone clock and reduced/off motion.
- Five daily sections: Today, Planner, Check-in, Sources, and profile/privacy. Core facts remain deterministic and source-labelled.
- Create/edit/complete/reopen/snooze notes, tasks and workouts; dated agenda, overlap warnings, all-record search/filter/pagination and confirmed delete with session undo.
- Date-specific manual journal with retained unsaved date drafts and a seven-day coverage view. Missing values stay unknown.
- Optional encrypted local profile/notes/manual entries; visible save status, revision conflicts and explicit erase. Personal UI clears on lock.
- Separate WHOOP Intelligence session link using existing saved records, and local ProgressXX v3 file preview. Imported nutrition can be selected on Home without replacing manual data or entering AI context. No new source-app sync or database writes.
- Optional local Ollama conversation with separate context scopes; session history/drafts survive navigation. Quick prompts and reviewed voice text are drafts until Send.
- On-device-first browser transcription, optional bounded offline faster-whisper worker, review/correction and system speech. Actual accuracy/latency is unmeasured.
- Authenticated read-only GitHub repository/PR/Issue/Actions views with bounded results/cache/provenance. Corporate data and external writes remain blocked.
- Built UI/API local runtime, clean preview packaging and lifecycle/browser/permission tests. Node 24 is still required.

## Validation

```sh
npm run check
npx playwright install chromium --only-shell
npm run test:e2e
npm run test:e2e:built
npm run test:launcher
npm run package:preview
npm audit
```

See [test evidence](docs/TEST-REPORT.md), [integration audit](docs/INTEGRATION-AUDIT.md), [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md) and [handoff](docs/PROJECT-HANDOFF.md).

## Layout

| Path | Purpose |
| --- | --- |
| apps/web | React/TypeScript static client |
| apps/api | Loopback development API and opaque sessions |
| apps/windows-agent | Deny-by-default launch policy only |
| packages/core | Time, briefing, freshness, authorization, redaction |
| packages/connectors | Read-only contracts, manifests, GitHub adapter |
| packages/voice | Voice contracts, uncertainty review, WER metric |
| tests | Synthetic unit/HTTP/browser acceptance |
| docs | Append-only history, evidence, decisions and remaining work |

JARVIS is deployed separately. Its connectors do not modify source-application repositories or production schemas. No license or commercial reuse claim is made for the existing integrated projects.

## Personal daily home

After local sign-in, complete the editable profile on Overview. Choose optional encrypted persistence in the privacy controls, add timed notes/tasks, and connect the existing WHOOP Intelligence account with explicit health-read consent. Local preview uses labelled manual/file input; online source-account reads require separate consent and session linking. No source-app synchronization is started. See [Personal briefing](docs/PERSONAL-BRIEFING.md) for calculations, sources, privacy and limitations.

## Optional conversation, speech and ProgressXX snapshot

The current development build includes optional local Ollama conversation with separate personal/health context consent, reviewed speech transcription where the browser supports it, system-voice replies, and a read-only ProgressXX full-backup preview. These are not automatic ProgressXX sync, measured Egyptian-Arabic accuracy, or a finished Windows installer.

See [Assistant engines](docs/ASSISTANT-ENGINES.md) and [ProgressXX import](docs/PROGRESSXX-IMPORT.md). Keep the existing local password and encrypted data when updating; restart Start-JARVIS.bat after updating source.

Optional offline recording/STT worker: [Local speech setup and acceptance limits](docs/LOCAL-SPEECH.md). It requires a separately installed Python environment and local multilingual model; no automatic download or measured accuracy is claimed.

## Run the compiled local app

After setup, run `npm run build`, then `Start-JARVIS-Built.bat` (or `npm run start:built`). UI/API share one loopback service without Vite. Node 24 and API source still required; not an EXE. [Built runtime](docs/BUILT-RUNTIME.md). Existing Start-JARVIS.bat remains the development launcher.

Portable recovery: [Encrypted personal backups](docs/PORTABLE-BACKUP.md) includes independent-password export and reviewed replacement. Preview only; real-device acceptance remains open.

For daily setup and source limitations: [Daily quickstart](docs/DAILY-QUICKSTART.md). Home now includes recorded WHOOP cycle/recovery details, ProgressXX file context and untimed-note review. Online saved-row reads are available for the unlocked session; unattended background synchronization remains unconnected. See [fitness account connection](docs/07-CONNECT-FITNESS-ACCOUNTS.md).

Assistant experience: [Voice welcome and recorded reminders](docs/WELCOME-AND-REMINDERS.md). Optional device-voice greeting and session-only reminders; no closed-app/native scheduler claim.

Run Configure-JARVIS.bat for local engine selection without editing .env. [Engine setup](docs/ENGINE-SETUP.md) preserves your password and requires restart. Settings shows configuration flags, not inference certification.

Home [first-use guidance and reviewed quick capture](docs/FIRST-USE.md) makes storage choices explicit and saves local notes/tasks only after preview and confirmation. No external action or automatic integration is implied.


## Online password recovery

Settings includes email-code password recovery. It requires one-time owner configuration of a recovery mailbox and Resend sending service; no email is sent while unconfigured. See [05 — Recover the online workspace password](docs/05-RESET-ONLINE-PASSWORD.md). After setup, resets happen inside the app without downloading files or redeploying each time.


## Everyday online use

Start with [06 — Use JARVIS online](docs/06-USE-JARVIS-ONLINE.md): sign in, finish one setup step, record your day, review before saving, and find your connected apps. The online version does not require downloading or running the local preview.

### Connect your fitness accounts online

Follow [07 — Connect WHOOP and ProgressXX](docs/07-CONNECT-FITNESS-ACCOUNTS.md). The online app can read saved source data for the current unlocked session with explicit consent. This is not unattended background synchronization; source credentials and live owner-data acceptance are separate from synthetic automated tests.

For recorded next steps and source-labelled read-aloud: [08 — Read your daily briefing](docs/08-READ-YOUR-DAILY-BRIEFING.md).

For supported read-only Egyptian Arabic/English questions: [09 — Ask about saved data](docs/09-ASK-ABOUT-SAVED-DATA.md).

For visible primary-source controls and troubleshooting: [10 — Home data sources](docs/10-HOME-DATA-SOURCES.md). Online Home defaults to cloud food and WHOOP sleep; unavailable reads never silently replace them with manual records.

Online Home now starts secondary health readings, quick capture and open-note lists collapsed. Core daily facts/sources/agenda stay visible; native details preserve unsaved capture drafts until lock/reload and retain normal save confirmation. See [online use](docs/06-USE-JARVIS-ONLINE.md).

Functional readiness: [12 — Daily-use release gates](docs/12-DAILY-USE-READINESS.md). Optional first-phase cloud AI adapter: [11 — Connect cloud AI](docs/11-CONNECT-CLOUD-AI.md); disabled until owner configuration, stateless/text-only, no private records supplied. Synthetic acceptance is not proof of provider connectivity or natural voice quality.

Current free path: [13 — Device AI without a card or API key](docs/13-FREE-DEVICE-AI.md). Optional explicit model download/WebGPU hardware required; real GPU performance and Arabic quality remain unverified. Saved-data questions continue on unsupported devices. Cloud billing remains disabled.
