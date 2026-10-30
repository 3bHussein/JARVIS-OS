# Session File Manifest

All listed files were created in the independent project. Generated dependencies/build output excluded.

- `.env.example`
- `.github/workflows/ci.yml`
- `.gitignore`
- `README.md`
- `apps/api/src/auth.ts`
- `apps/api/src/main.ts`
- `apps/api/src/server.ts`
- `apps/web/index.html`
- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/style.css`
- `apps/web/vite.config.ts`
- `apps/windows-agent/src/policy.ts`
- `docs/ARCHITECTURE.md`
- `docs/CONNECTOR-CONTRACTS.md`
- `docs/DECISIONS.md`
- `docs/DEVELOPMENT-LOG.md`
- `docs/FILE-MANIFEST.md`
- `docs/INTEGRATION-AUDIT.md`
- `docs/KNOWN-ISSUES.md`
- `docs/PROJECT-HANDOFF.md`
- `docs/RELEASE-CHECKLIST.md`
- `docs/ROADMAP.md`
- `docs/TEST-REPORT.md`
- `docs/evidence/SESSION-COMMANDS.md`
- `docs/evidence/audit.json`
- `docs/evidence/browser.txt`
- `docs/evidence/check.txt`
- `docs/evidence/commit-pins.json`
- `docs/evidence/repository-inventory.json`
- `docs/evidence/repository-snapshots.json`
- `package-lock.json`
- `package.json`
- `packages/connectors/src/contracts.ts`
- `packages/connectors/src/github.ts`
- `packages/core/src/index.ts`
- `packages/voice/src/index.ts`
- `scripts/password.mjs`
- `tests/auth.test.ts`
- `tests/browser.mjs`
- `tests/core.test.ts`
- `tests/github.test.ts`
- `tsconfig.json`

## Repository publication addition

- `docs/evidence/github-foundation-ci.json` — exact-commit remote workflow evidence.

## Workspace batch additions

- `packages/core/src/preferences.ts`
- `packages/connectors/src/github-reader.ts`
- `tests/workspace.test.ts`
- `tests/status-api.test.ts`
- `docs/evidence/workspace-check.txt`
- `docs/evidence/workspace-build.txt`
- `docs/evidence/workspace-browser.txt`

- `docs/evidence/workspace-final-check.txt` — corrected provider error classification acceptance.
- `docs/evidence/workspace-final-browser.txt` — final 13-scenario browser result.

- `docs/evidence/workspace-github-ci.json` — timestamped remote CI checkpoint; not a completed-run claim.

## Launcher batch additions

- `.gitattributes`, `Setup-JARVIS.bat`, `Start-JARVIS.bat`
- `scripts/local-runtime.mjs`, `scripts/local-runtime.d.mts`, `scripts/setup.mjs`, `scripts/start.mjs`
- `tests/launcher.test.ts`, `tests/launcher-smoke.mjs`
- `docs/RUN-LOCALLY.md`
- `docs/evidence/startup-check.txt`, `docs/evidence/startup-smoke.txt`, `docs/evidence/workspace-ci-completed.json`

- `docs/evidence/startup-github-ci.json` — successful exact-source Linux/Windows workflow.

## Personal daily briefing additions

- `packages/personal/src/model.ts`, `packages/personal/src/briefing.ts`
- `packages/connectors/src/whoop.ts`
- `apps/api/src/personal-store.ts`, `apps/web/src/PersonalHome.tsx`
- `tests/personal.test.ts`, `tests/personal-api.test.ts`, `tests/whoop.test.ts`
- `docs/PERSONAL-BRIEFING.md`
- `docs/evidence/personal-check.txt`, `docs/evidence/personal-launcher.txt`, `docs/evidence/personal-browser.txt`, `docs/evidence/whoop-read-contract.json`

- `docs/evidence/personal-github-ci.json` — successful personal-briefing Linux/Windows CI.

## Assistant and snapshot slice — 2026-10-30T08:04:54+02:00

packages/ai/src/ollama.ts; packages/connectors/src/progress-backup.ts; apps/web/src/AIChat.tsx, ProgressImport.tsx, SpeechInput.tsx; tests/ai.test.ts, progress-backup.test.ts; docs/ASSISTANT-ENGINES.md, PROGRESSXX-IMPORT.md; docs/evidence/assistant-check.txt, assistant-browser.txt, assistant-launcher.txt, progress-backup-contract.json.

- `docs/evidence/assistant-github-ci.json` — exact-source successful Linux/Windows acceptance for 3c4f53f.

## Offline speech slice — 2026-10-30T10:01:35+02:00

apps/voice-worker/{worker.py,test_worker.py,requirements.txt}; apps/api/src/local-speech.ts; apps/web/src/LocalSpeechInput.tsx; packages/voice/src/audio.ts; tests/local-speech.test.ts; docs/LOCAL-SPEECH.md; docs/evidence/local-speech-{check,python,browser,launcher}.txt.
