# Windows desktop host preview — M6 foundation

This is the first Tauri2 native window around the existing loopback workspace. It is **not** a runtime-bundled installer or the complete Windows Agent. Browser mode and steps01/02/03 remain available.

## Run

Use the JARVIS-OS-Windows-Desktop-Preview Actions artifact on Windows x64 with Microsoft WebView2 and Node24+. Extract the full folder and run step 01 once. Run `04-Open-Desktop.bat` to start the local service and open the window. Closing the window stops the service launched by step 04. If step 02 is already serving the intended installation, run `04-Open-Desktop.bat --attach` to use it. Close the step 02 terminal with Ctrl+C when done. No Rust installation is needed to use the compiled host artifact.

Save existing session records encrypted or export a portable backup **before** switching windows/installations. WebView2 has separate cookies/preferences from Chrome/Edge browser mode, so unlock again with the same local password and choose timezone/language. Imports, WHOOP login and unsaved session drafts do not transfer automatically. This host does not read/copy .env/vault files or migrate records. Run the launcher from the installation whose data you intend to use. The health probe recognizes the expected service shape, not a cryptographic server identity or installation path.

In attach mode, use Lock before closing the window. The existing service remains running. Remote/new-window links are blocked: use browser mode for original-app launches. Microphone, TTS/STT, blob downloads, browser notifications, accessibility and actual WebView rendering need device acceptance; Chromium browser tests do not certify these APIs in WebView2.

## Native boundary

No registered renderer commands, no shell/filesystem/HTTP/opener plugins, no global Tauri bridge and no capability files/permissions granted. The native menu can only navigate to static help, probe/navigate to fixed127.0.0.1:5173 or quit the window. Navigation is bounded to that origin and known embedded help URLs; new windows are denied. The Rust health probe sends a bounded, timeout-limited HTTP1.0 GET to /api/health only, with no credentials. CLI accepts version/help/probe only; no user-supplied endpoint, path or command. The existing Node API password/CSRF/freshness/connector protections remain unchanged. Same-OS-user compromised services and WebView internals are outside the probe guarantee.

## Build and evidence

Pinned direct crates: tauri2.12.5, tauri-build2.7.4, serde_json1.0.145. `node scripts/desktop-icon.mjs` generates the original geometric icon without downloaded assets. On a Windows Rust/MSVC/WebView2 build environment, run cargo test/build with `--manifest-path apps/desktop/src-tauri/Cargo.toml --release --locked`, then node tests/desktop-smoke.mjs and node scripts/package-desktop.mjs. The successful bootstrap captured Cargo.lock; the reviewed408-package crates.io-only graph is committed. CI requires that file and both cargo commands use --locked.

Native tests cover health response validation, bounded loopback request and navigation origin restrictions. Compiled EXE smoke checks fixed-endpoint behavior against the actual local Node API without creating a window. Native GUI/physical Windows/device acceptance remains TODO. No signature, installer, autostart, tray, OS credential vault, native notification scheduler or bundled Node runtime is claimed. Build artifacts are previews, not a deployment or GitHub Release.

Primary references reviewed: https://v2.tauri.app/security/capabilities/ , https://v2.tauri.app/start/prerequisites/ , https://v2.tauri.app/learn/sidecar-nodejs/ , https://docs.rs/tauri/2.12.5/tauri/webview/struct.WebviewWindowBuilder.html .
