# Start using the personal preview

This is the local personal preview. It is not the complete hybrid desktop/cloud release.

## First opening

1. Download `JARVIS-OS-Personal-Preview` from the tested Actions run linked in the repository README. Extract into a **new** folder. Keep any older installation and its private files intact.
2. Install Node.js 24 or later if unavailable. Read `00-READ-FIRST.md`. Run `01-Setup-JARVIS.bat`, choose your own local password, then run `02-Start-JARVIS.bat`. Keep the terminal open. No npm install or build is required in this download.
3. In the browser, open Settings, unlock with that password and select Arabic/English plus your IANA timezone. Overview opens your private daily workspace.
4. Enter your profile. Use Save current data encrypted on the session-only Home banner, or choose encrypted local storage in You & privacy and press Save current data, if you want it after closing. Otherwise edits are session-only. Keep the original local password; changing it does not decrypt an older vault.

## Make Home useful

| Information | Where to provide it | What Home actually knows |
|---|---|---|
| Sleep and recovery | Sources → Connect WHOOP Intelligence | Your existing account's saved records, after explicit session consent; no new WHOOP OAuth or provider sync |
| Food, macros, exercise history, weekday training label and weight | Export a full JSON v3 backup from ProgressXX, then import it in Sources | A local file snapshot; automatic ProgressXX sync is not connected |
| Home food budget | Explicitly select recent imported nutrition, or enter food/target manually | Entered target minus logged food only; expenditure is kept separate |
| Workout appointment and tasks | Planner | Only the times and durations you record; a weekday training label has no appointment time |
| Notes to revisit | Planner → note without time | Latest three open untimed notes appear on Home and in explicit read-aloud; review them or use All notes |
| Unknown/missing source data | No input needed | A dash or explanation, never sample personal readings |

For WHOOP, use the account you use to sign in to **WHOOP Intelligence**, not the WHOOP vendor password. Enter credentials only in the local application's form. Sessions are temporary, so reconnect after expiry. If source sync is old, synchronize through the original WHOOP Intelligence app first, then choose Read saved records in JARVIS. This action does not trigger vendor sync.

WHOOP energy/strain refer to its physiological cycle. JARVIS shows an eligible open scored cycle, not a claimed midnight-to-midnight total. Missing/old data is not replaced with yesterday's score. Heart/sleep readings are device estimates, not a diagnosis or an exercise prescription. ProgressXX file data does not enter AI context and is forgotten on lock/reload; reimport when needed.

## Everyday flow

Open 02-Start-JARVIS.bat → unlock → Overview. Review sleep/food, current WHOOP metrics and upcoming real appointments. Use Planner to add a task or workout time, Check-in to record manual values, and Sources to reconnect or replace a file. Details stay collapsed until requested. Notes remain until you review them. Read my briefing needs a suitable device voice, or your separate explicit permission for network speech voices. Silent startup is on by default. Uncheck it before the next unlock to opt into a once-per-unlock greeting with a suitable reported device voice. Open the session-only reminders control to opt in; desktop delivery needs a separate permission click. Closing/locking or browser suspension can stop reminders. See WELCOME-AND-REMINDERS.md.

Run 03-Configure-AI-Voice.bat to choose an existing local model or offline speech paths without editing files. Restart afterward and check Settings → Make JARVIS ready. Chat and speech engines are separate optional configuration, not prerequisites for the daily workspace. See ENGINE-SETUP.md. See ASSISTANT-ENGINES.md and LOCAL-SPEECH.md. Their real Egyptian-Arabic accuracy, latency and quality remain untested. Voice review never sends a recognized command automatically. There is no wake word or native Windows automation in this preview.

## Preserve your work

Save with encrypted local storage before closing. Export an independently password-protected portable backup from You & privacy when needed; see PORTABLE-BACKUP.md. Keep its password separately. It includes personal profile, manual entries and notes, not WHOOP/imported files/chat/tokens. Restore previews the data and requires typing RESTORE before replacement. Never overwrite `.env` or `.jarvis-data` in an old installation while updating. A backup download request is not proof of completed disk storage; check Downloads.

## If a feature is unavailable

- Server does not start: close an earlier JARVIS instance, verify Node24+, read the terminal error. Do not expose port5173 outside loopback.
- WHOOP sign-in fails: verify the existing Intelligence account; accounts requiring MFA are not supported by this linking flow. No bypass is provided.
- No current WHOOP values: source/observation freshness, matching scored sleep/recovery and eligible cycle may be absent. Open details for limitations; do not interpret a dash as zero.
- ProgressXX file rejected: use the existing full v3 export. Invalid/incomplete legacy fields can reject the file. Do not edit irreplaceable backups to satisfy a parser.
- New preview folder is empty: each installation has its own local config/vault. Keep the old installation, or use an encrypted portable export/restore. There is no automatic migration.
- Browser on phone cannot reach the app: this loopback-only preview is not yet a hosted/mobile deployment.

Use USER-ACCEPTANCE.md only for one combined review when ready. No real account, physical Windows device, voice engine or medical recommendation has been certified by synthetic CI.


Source ZIP note: missing apps/web/dist is expected in a fresh source download. Step01 builds it from the complete source and lockfile. A ready-built preview already includes it. An incomplete preview cannot build itself without source; re-extract the complete artifact into a new folder. Existing private config/data must be preserved.

Home quick capture lets you preview and explicitly confirm a note/task/workout without leaving Home. Confirmed entries appear in Planner; no model executes the save. See FIRST-USE.md.
