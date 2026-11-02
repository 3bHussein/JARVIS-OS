# JARVIS OS — start here

Requires Node.js 24+. Keep all extracted files together. You may use a folder with spaces or nested JARVIS-OS-main folders; open the numbered files beside this document. Do not move individual BAT files out of the app folder.

1. **01-Setup-JARVIS.bat** — run once. Choose a local password if none exists. Existing password/private data are preserved. A source-code download has no apps/web/dist: setup installs the locked dependencies and builds the web app (Internet/npm required). A complete ready-built preview skips installation/build.
2. **02-Start-JARVIS.bat** — open the app. Keep its terminal open; Ctrl+C stops it. In Settings, unlock with your local password. Use this file each day.
3. **03-Configure-AI-Voice.bat** — optional. Choose an already installed local AI model or existing offline speech paths. It does not install models or execute Python. Restart step02 afterward. The daily workspace works without this step.

If setup reports an incomplete copy, re-extract the complete preview download into a new folder. Do not delete or overwrite an existing .env or .jarvis-data to fix a missing build. Preserve your original password and export an encrypted portable backup before moving personal records. A new folder starts with its own private setup; no automatic data migration is performed.

Source downloaded with GitHub's Code → Download ZIP requires the build in step01. The JARVIS-OS-Personal-Preview artifact includes the build already. Setup-JARVIS-Preview.bat remains a compatible alias that can also prepare a complete source download. Other legacy filenames are retained for existing users.

More: docs/DAILY-QUICKSTART.md, docs/ENGINE-SETUP.md, docs/USER-ACCEPTANCE.md. This is a personal preview, not the final native Windows installer.

Optional desktop host: only the JARVIS-OS-Windows-Desktop-Preview artifact includes JARVIS-OS-Desktop.exe and04-Open-Desktop.bat. Read DESKTOP-README.md there, start02 first, then04. Source/browser-only copies do not include the native EXE. Save records encrypted before switching; browser and WebView sessions differ. The host is not a bundled installer.
