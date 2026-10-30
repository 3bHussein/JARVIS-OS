# JARVIS OS

An original personal AI command center, built as a separate hybrid application.

**Current release: local foundation 0.1.0, not production-ready.** Repository discovery is documented; the React interface, local-development authentication and read-only GitHub adapter are implemented. AI, speech recognition, automatic ProgressXX integration, installable PWA and Windows packaging remain pending. A session-only WHOOP saved-record bridge and optional private local profile/notes are available for local acceptance.

## Windows quick start

Install Node.js 24 LTS, download/extract this repository, run **Setup-JARVIS.bat** once, then **Start-JARVIS.bat**. Setup asks for a hidden local password; the launcher opens http://127.0.0.1:5173 when ready. Unlock from Settings. Keep its window open; Ctrl+C stops both services. This is the local browser foundation, not the Tauri installer.

Full walkthrough and troubleshooting: [Run locally](docs/RUN-LOCALLY.md). Terminal alternative: `npm run setup`, then `npm start`.

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

- Original navy/cyan responsive command center and animated core.
- Actual IANA-zone clock, time-sensitive greeting and Cairo DST support.
- English/Arabic interface direction, simple navigation, explicit disconnected states.
- Full/reduced/off motion; OS reduced-motion preference is respected. Language/timezone/motion/silent-start preferences persist locally and can be reset.
- Honest task briefing with zero invented tasks and freshness utilities.
- Local deterministic commands for time and source availability, visibly labelled as not an AI model.
- Optional authenticated read-only GitHub repository/PR/Issue/Actions views, session-owned cache, ETag revalidation, cooldowns and real last-read/status metadata. Views explicitly stop at ten results.
- Microphone activity test with echo cancellation requested, RMS visualization, stop/cleanup and no recording/upload.
- System speech test with available browser voices. This is not evaluated neural TTS or audio-synchronized animation.
- Locked write tools and local-agent launch policy prototype with **no OS execution**.
- Offline indicator; focus/minute session revalidation and protection against delayed results after logout.

## Validation

```sh
npm run check
npx playwright install chromium --only-shell
npm run test:e2e
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

No production database, application repository or external deployment was modified. No license or commercial reuse claim is made for the existing integrated projects.

## Personal daily home

After local sign-in, complete the editable profile on Overview. Choose optional encrypted persistence in the privacy controls, add timed notes/tasks, and connect the existing WHOOP Intelligence account with explicit health-read consent. Food and workout schedule input is currently manual and labelled; no ProgressXX sync is implied. See [Personal briefing](docs/PERSONAL-BRIEFING.md) for calculations, sources, privacy and limitations.

## Optional conversation, speech and ProgressXX snapshot

The current development build includes optional local Ollama conversation with separate personal/health context consent, reviewed speech transcription where the browser supports it, system-voice replies, and a read-only ProgressXX full-backup preview. These are not automatic ProgressXX sync, measured Egyptian-Arabic accuracy, or a finished Windows installer.

See [Assistant engines](docs/ASSISTANT-ENGINES.md) and [ProgressXX import](docs/PROGRESSXX-IMPORT.md). Keep the existing local password and encrypted data when updating; restart Start-JARVIS.bat after updating source.

Optional offline recording/STT worker: [Local speech setup and acceptance limits](docs/LOCAL-SPEECH.md). It requires a separately installed Python environment and local multilingual model; no automatic download or measured accuracy is claimed.
