# Personal daily workspace preview

Status: IMPLEMENTED / automated synthetic acceptance. A coherent personal-use preview, not a v1.0 or production deployment.

## Daily flow

- **Today:** actual configured-zone greeting, source-labelled sleep/food/remaining metrics, conservative expandable sleep guidance, due reminders, next appointments, quick note/check-in/voice/briefing actions. Details stay out of the first view. The underlying briefing text still includes numerical context for read-aloud and deterministic local commands.
- **Planner:** selected-date agenda, open/completed entries, overlap warnings, add/edit/complete/reopen/snooze, search and eight-result pagination over all retained notes. A timed entry appears on its start date. Reservations crossing midnight still participate in overlap detection. No automatic reschedule or calendar-service write.
- **Check-in:** a date selects its own manual record. Missing remains unknown and numeric zero stays zero. Unsaved date drafts survive date switching and main navigation in the unlocked page session. Seven-day coverage shows recorded values, not a health/recovery verdict.
- **Sources:** existing WHOOP Intelligence session link and ProgressXX full-backup import. Credentials clear on leaving Sources/Overview. The connection itself remains authorized for its existing session until disconnect/logout/expiry. No new WHOOP vendor sync or source-app write is introduced.
- **You:** editable profile and explicit optional encrypted local storage. Save current data makes the storage choice concrete. Visible session/encrypted save status and conflict errors remain outside collapsed privacy controls.

The main Overview subtree now remains mounted while navigating Projects/Settings/Voice. Conversation history, typed chat draft, journal drafts and imported projection survive that navigation. Voice recording components still unmount/abort when leaving Voice. Lock/session expiry removes the private UI and imported/conversation/draft state. Page reload clears browser-only drafts/imports; saved server-session or encrypted records follow their existing lifecycle. Language/timezone changes clear model history; changing the timezone resets the entry editor's wall-time form to prevent silently reinterpreting a stale local time. No closed-app notification is claimed.

## Writes and conflicts

All record mutations are explicit local JARVIS operations through existing authenticated, CSRF-protected revision guards. External write tools stay denied. Duplicate in-flight personal saves are rejected by a UI guard; inputs disable during save. Failed saves retain fields. A note editor keeps its original record fingerprint: after an external update/reload it refuses to overwrite the changed record even when the enclosing personal revision has refreshed. The user can copy the draft, cancel and reopen the current record.

Delete uses a second confirmation click. Only the most recently deleted entry has an in-session undo; lock/reload discards that undo. Completed records remain searchable/reopenable. Snooze moves a timed open entry 15 minutes after the later of now or its current time, retaining duration/type. Unknown data, old records or notes beyond the visible page are not deleted to simplify the UI. The supported 200-note capacity now has HTTP/encrypted-envelope bounds that cover full multilingual text, with an encrypted save/reauthentication regression test. There is no encryption-format migration.

## Imported nutrition view

The ProgressXX projection remains browser-only. After a recent, valid file import, the user can explicitly select its recorded food/target for Home. The view overlays food arithmetic only; manual records, profile target, WHOOP facts and database state are not rewritten. Diary completeness is always unknown for that file view. Sleep continues to use the existing fresh WHOOP/manual rule.

Stale/missing imported food produces unknown values rather than silently falling back to manual values under a file label. Clear returns to the manual source. An imported file survives main-tab navigation, but not lock/reload. **Imported values are excluded from AI context**, even when selected on Home. AI health consent uses server-owned manual/already-read WHOOP summaries; deterministic local commands and explicit briefing read-aloud use the currently displayed view and label the file source.

This supersedes the earlier preview's navigation-clears-import behavior and manual-only Home display. It does not implement automatic ProgressXX synchronization or authenticated cloud provenance.

## Preview packaging

`npm run package:preview` creates a new uniquely named staging directory under test-results. It never deletes/reuses an older preview folder, which may contain user configuration. It includes only selected public source/runtime scripts, the validated compiled bundle and user guides. Root/nested private config/data, node_modules, model weights and test records are excluded. The runtime package has minimal metadata, source SHA when supplied by CI, generation time and a SHA-256 file manifest. Hashes support integrity comparison, not publisher signing.

Setup-JARVIS-Preview.bat uses the existing hidden-password setup in built-only mode, validates the bundle and skips npm installation. The preview still requires Node.js 24; optional AI/STT models/Python are separate. CI creates a downloadable artifact after successful Windows checks, retained for 14 days. No GitHub Release, installer, production deploy or native Tauri capability is implied.

## Acceptance scope

- PLAN-01..05: timezone/date/overlap/completion, source overlay immutability, journal coverage and invalid timestamp rejection.
- PREVIEW-01/02: private-file omission/hashes and preservation of older preview config.
- PERSON-HTTP-02: 200 maximum-length multilingual notes exceed old limits but save encrypted and reauthenticate successfully.
- START-05: actual packaged source/bundle setup and authenticated startup without node_modules; existing two lifecycle cases remain covered.
- UI-22..29: record lifecycle, dated drafts, transient imported Home values, navigation/repeated quick prompts, encrypted save/lock/restore, RTL mobile, all-record pagination and concurrent-edit protection.
- All previous auth, source, voice and built-runtime scenarios are retained.

No real owner health account, voice/model quality, physical Windows or clinician validation is inferred from synthetic checks. See TEST-REPORT.md and the one combined trial in USER-ACCEPTANCE.md.
