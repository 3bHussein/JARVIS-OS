# One combined personal-preview trial

This is one review after the internally tested batch, not a request to test each commit.

## Start once

The GitHub Actions **JARVIS-OS-Personal-Preview** artifact contains compiled UI/API source but no Node runtime, models, account tokens or personal records. Download and extract into a **new folder**. With Node.js 24+ installed, double-click Setup-JARVIS-Preview.bat, choose your local password, then Start-JARVIS-Built.bat. Open http://127.0.0.1:5173 and unlock in Settings. Do not overwrite an older installation's private .env/.jarvis-data or change its original encryption password.

If using the source repository instead: run Setup-JARVIS.bat and npm run build first, then Start-JARVIS-Built.bat.

## One everyday journey

1. **You (profile & privacy):** enter your preferred name, current goal and reading interests. Choose encrypted local storage if desired and press Save current data. Default is session-only. This is an editable profile, not model training.
2. **Check-in:** record today's actual sleep/food or leave unknown fields blank. Pick a past date to review its own values. Switching dates keeps unfinished journal drafts during the unlocked page session; Save is explicit.
3. **Planner:** add a real task or workout time, edit it, complete/reopen it, or snooze it 15 minutes. Review overlapping reservations rather than assuming the app rescheduled them. Search and filters include all retained records, with eight results per page. Delete uses confirmation and a one-record undo in the current page session.
4. **Sources → Today:** optionally link your existing WHOOP Intelligence account in-app (never in chat), or choose your own ProgressXX full-backup JSON v3. A recent imported food snapshot can be selected for Home without overwriting manual data. It is a file, not live sync, and is excluded from AI context. Clear or lock forgets the import.
5. **Today / conversation:** review the greeting, data sources, next appointments and due reminders. Use Read my briefing or Discuss my day. Quick prompts create a draft; sending remains explicit. The conversation/draft and imported file survive navigation between main tabs, but are cleared on lock or page reload. Optional AI/health scopes remain separate controls; AI health context still uses server-owned manual/WHOOP records, not the selected imported file.
6. **Voice:** optional local STT requires separately installed Python/model; browser on-device recognition depends on supported language packs. Correct a transcript, move it to the chat draft and Send separately. Device/network voices are labelled. Voice accuracy is not certified by the synthetic tests.
7. **Lock and reopen:** encrypted profile/notes/manual check-ins should return after reauthentication; unsaved drafts/imports and conversation should not. Closed-app/background notifications are not implemented.

## Feedback after this journey

Send one grouped report: what made the daily briefing useful or confusing; any wrong data/source/date; steps for any save/edit problem; and one screenshot of a layout issue after removing private data. Do not send passwords, tokens, real health exports or recordings into chat.

The daily interface is original and bilingual, with reduced-motion support. Remaining product gates include automatic delegated integrations, actual model/voice/device benchmarks, Tauri/installer/Agent, multi-user production identity and PWA release. No v1.0 or deployment is claimed.

Read-aloud privacy update: JARVIS now selects only voices reported local by default and does not use an unspecified system default. Remote/unknown voices require explicit network-speech consent in Voice lab for the unlocked session; lock resets it. If no suitable device voice exists, no text is submitted. Voice metadata is not an OS traffic sandbox or a quality guarantee. Reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService.
