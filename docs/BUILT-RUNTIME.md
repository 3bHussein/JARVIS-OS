# Local built-app runtime

Status: IMPLEMENTED / local synthetic acceptance. This is a local personal runtime, not a production multi-user deployment or a Tauri installer.

## Run on Windows

1. Keep Node.js 24+ installed. Run Setup-JARVIS.bat if local configuration/dependencies do not exist yet.
2. In the repository directory, run `npm run build` after each source update. The generated apps/web/dist directory is not committed to Git or included in the source ZIP.
3. Double-click Start-JARVIS-Built.bat, or run `npm run start:built`.
4. Open http://127.0.0.1:5173, unlock with your existing local password and keep the launcher window open. Ctrl+C stops its owned service. Optional `--no-browser` skips opening the default Windows browser.

The original Start-JARVIS.bat / npm start remains the development launcher. Both launchers use the same UI origin, so do not run them simultaneously. Built mode uses port 5173 only; it does not start Vite, open the development API port 4310, build automatically or install dependencies. It refuses an occupied 5173 without stopping the process that owns it.

The built service loads index/assets once at startup. Rebuild, then restart to use changes; do not rebuild while launching. Never delete private .env, .jarvis-data or your original encryption password during an update. Switching launch modes preserves the same origin, configuration and encrypted personal storage. Optional Ollama/Python/model setup remains separate.

## Boundary

One Node API process serves both the compiled React UI and the API on loopback. A supervising Node launcher manages that service; browser and optional speech subprocesses are separate. Node.js and repository API/shared source are still needed. npm dependencies are needed to build; the current compiled UI/API runtime was smoke-tested in a copied directory without node_modules. This is not a self-contained EXE, offline model bundle, Windows tray app, secure OS credential vault or native Agent.

No broad filesystem web root exists. On startup, the bundle loader reads only index.html and the explicitly referenced hashed JS/CSS entry filenames, subject to file/count/total-size limits and symlink/realpath checks. It keeps bounded in-memory buffers. It does not list directories or expose .env, .jarvis-data, source files, source maps, unrelated assets or arbitrary SPA fallback paths. The current Vite build has one JS/CSS entry pair; future lazy chunks/fonts/icons will need an explicit manifest extension and tests before use. Build artifacts are trusted code, not sanitized untrusted HTML; do not use an untrusted build directory. File checks are not a defense against an already-compromised OS user racing the startup filesystem.

Public index HTML contains the shell, not owner API data. API authentication, CSRF, origin/host guards, no-store headers, session revocation and external-write denial remain in force. Cross-origin requests are rejected before either static or API handling. Index is no-store; hashed JS/CSS are immutable-cacheable. CSP limits scripts/connections to self, denies framing/objects and permits inline styles needed by React animation properties. No unsafe-eval is permitted. Microphone is self-only; camera/geolocation are disabled. System/browser speech provider behavior remains outside ordinary fetch CSP and requires its existing consent controls. Loopback HTTP is not production HTTPS identity.

## Tests

- BUNDLE-01: explicit loaded allowlist, in-memory snapshot and invalid entries.
- BUNDLE-02: outside-file symlink is rejected (Linux test; Windows unprivileged file-symlink fixture explicitly skipped).
- BUNDLE-HTTP-01: public HTML/JS/HEAD/cache/CSP, denied private/map/source paths, cross-origin rejection and API authentication.
- START-04: real built process from a path with spaces without node_modules, UI/JS/login, occupied-port refusal and owned shutdown. Existing development START-03 remains covered.
- `npm run test:e2e:built`: same 21 synthetic browser scenarios against the real built assets and restrictive headers, without Vite. Development browser suite is also rerun separately.

Physical Windows double-click/default browser, Tauri packaging, installer signing, full accessibility/performance/mobile install and real model/health acceptance remain separate gates. No deployment is performed by these commands.

References reviewed: https://vite.dev/guide/static-deploy and https://nodejs.org/api/fs.html. Vite preview is not used as a production server.
