# Run JARVIS OS now

This is the current **local browser application**, not a Tauri installer or EXE. You can use the interface, clock, preferences, local sign-in, app links, optional GitHub reader and voice diagnostics now. AI reasoning, speech transcription, personal health/task integrations and Windows native features are not connected yet.

## Windows: first run

1. Install **Node.js 24 LTS or newer**, including npm, from https://nodejs.org/en/download. Reopen your terminal after installation if it was already open.
2. Download https://github.com/3bHussein/JARVIS-OS/archive/refs/heads/main.zip (or use GitHub **Code → Download ZIP**).
3. Right-click the ZIP and choose **Extract All**. Open the extracted `JARVIS-OS-main` folder. Do not run the files from inside the ZIP.
4. Double-click **Setup-JARVIS.bat**. Choose a local password containing 12–256 characters and enter it twice. Input is hidden: letters do not appear while typing. The setup saves a salted hash, preserves an existing `.env`, and installs dependencies from the lockfile. Internet is needed for that installation.
5. When setup reports success, double-click **Start-JARVIS.bat**. The browser opens after both local services are ready. If it does not, open **http://127.0.0.1:5173** yourself.
6. Select **Settings → Local workspace password**, enter the password you chose, and press **Unlock local workspace**.

Keep the launcher window open while using JARVIS. Use **Ctrl+C** in that window to stop its API and interface. Stop the launcher before closing the window. Do not run setup on every launch: use **Start-JARVIS.bat** for normal use.

No Docker, PostgreSQL, Supabase configuration, OpenAI API key or GitHub token is required to open this foundation. Optional integrations require their own explicit configuration later. Do not put real secrets into chat or Git commits.

## Terminal alternative

Open a terminal in the extracted project root:

```sh
npm run setup
npm start
```

The first command asks for the password and installs locked dependencies. The second keeps both services in one terminal. On Windows, the BAT files also avoid the common PowerShell `npm.ps1` execution-policy issue without changing machine policy.

If you prefer the original manual workflow, install dependencies with `npm ci --ignore-scripts`, create your private `.env` as described in README, and run `npm run api` and `npm run dev` in separate terminals. The combined launcher intentionally uses the default ports/origin. Custom port setups require the manual workflow and corresponding proxy configuration.

## What is available

| Feature | Current behavior |
| --- | --- |
| Greeting and clock | Uses actual time in your chosen timezone |
| Interface | English/Arabic, responsive navigation, motion preferences |
| Preferences | Language/timezone/motion/silent-start preference saved on this device |
| Local account | One owner password, memory-only one-hour sessions |
| App shortcuts | Open the original applications independently |
| GitHub | Optional server-configured read-only token; otherwise disconnected |
| Daily tasks/health | Unavailable until the personal connectors are authorized |
| Chat | Limited local command router, not a connected AI model |
| Voice lab | Microphone activity and system speech diagnostic, not transcription |

The running application remains on loopback only. This development authentication is not intended for LAN/public hosting.

## Troubleshooting

| Message / symptom | Action |
| --- | --- |
| Node is missing or too old | Install Node.js 24 LTS and reopen the launcher. Check with `node --version`. |
| Dependency installation failed | Check the internet connection and run Setup again. Existing `.env` is preserved. |
| No characters appear while entering password | Expected: the password prompt hides your input. Type it and press Enter. |
| Passwords do not match / too short | Setup writes no new config for a mismatch; rerun and use 12+ characters. |
| `.env` is missing | Run Setup first. |
| Existing `.env` has an empty or invalid hash | Preserve a private copy, then use the documented password helper or rerun setup after renaming the invalid file. Never upload the original config. |
| Port 4310 or 5173 is in use | Stop the earlier JARVIS window. The launcher refuses to kill an unrelated process. |
| Browser did not open | Manually open http://127.0.0.1:5173 after `JARVIS_READY` appears. |
| GitHub says not connected | Opening JARVIS does not copy your ChatGPT GitHub connection. Configure a separate read-only server token only if you want that integration. |
| Forgot the local password | Stop JARVIS. Preserve/rename your private `.env` to `.env.backup`, then run Setup to choose a new password. Optional settings/tokens need to be restored privately; do not publish that backup. No existing application data is reset. |

## Validation scope

The launcher has automated tests for configuration validation, occupied ports, an isolated first-run configuration, paths with spaces, readiness through the UI/API proxy, authentication, second-instance rejection and owned-child shutdown. Windows CI runs the actual BAT help entry points and Node launcher lifecycle. Physical Windows double-click behavior, system browser selection and console Ctrl+C remain manual acceptance items until tested on a user's device. Automated IPC shutdown is not a claim of physical-console acceptance.

Automated result recorded on 2026-10-28: [Windows and Linux launcher CI passed](https://github.com/3bHussein/JARVIS-OS/actions/runs/40592161891) for source 48a9439. Physical user-device acceptance remains separate.

## Personal home update

The authenticated home now has profile setup, notes, manual food/schedule check-ins and a WHOOP Intelligence saved-record connection. Follow PERSONAL-BRIEFING.md. If retaining personal notes across sessions, opt in to encrypted saves and keep the original local password and private data directory during code updates. Resetting the login password does not decrypt old personal data; do not discard the original password expecting recovery automatically.
