# ProgressXX read-only backup bridge

Status: IMPLEMENTED, synthetic tests only. Automatic authenticated sync remains TODO.

In the original ProgressXX app choose Settings → Backup & recovery → Download full backup. In authenticated JARVIS Overview, expand Read a ProgressXX backup and select that JSON file. JARVIS accepts the existing `app: ProgressX`, `backup_version: 3` full-backup format, up to 10 MiB and 50,000 rows per collection. Legacy history-only/other versions fail explicitly.

The browser projects recorded food calories/macros, workout date/exercise/day/status, weight measurements and weekday schedule labels. Images, credentials, products, notes, private preferences and arbitrary backup properties are discarded from the retained projection. Malformed records or duplicate nonempty IDs reject the whole import rather than invent a partial total. Required macro fields must be present; numeric zero is distinct from missing. No-today-entries means unknown rather than zero. Valid exports may contain incomplete legacy records and be rejected; do not modify your original backup to satisfy JARVIS. Future work can expose a reviewed partial-import policy.

The summary is a separate, explicitly labelled snapshot. It does not replace the manual home check-in, alter personal totals, persist to disk/localStorage, enter AI context, authenticate to ProgressXX, contact its database, replay queues or modify either app. Clear, lock, tab closure or navigating away from Overview removes the retained projection. The source file itself is not deleted. Import processing is cancelled on unmount/clear. Use only your own file; this is an owner-supplied local snapshot, not authenticated cloud provenance.

Export time is displayed, over 24 hours is labelled old, and cloud sync is always unknown because the existing export lacks an authoritative queue/sync acknowledgement. Local pending work on other devices is not present. Refresh means exporting and selecting a new file. Food diary completeness is unknown. Remaining calories are exported target minus logged file calories, clamped at zero, not a new diet recommendation. Schedule labels have no invented appointment time.

Weight shows the last seven calendar dates through today and the preceding seven, averaging daily means equally. Coverage is displayed, missing days are not zero, future measurements are excluded. This is a rolling-window description, not the original app's calendar-week coach. No physiological or body-fat inference. Workouts show five latest exercise records, not five distinct completed sessions or a new deload prescription.

Evidence: the existing production root `index.html` at ProgressXX commit `26f96d24045a896688c69e7acc3083013d97dc9f`, `buildFullBackup` at lines 5941–5985; food totals at 7224. Re-read on 2026-10-30. No source repo modifications or database calls. See evidence/progress-backup-contract.json.

A future automatic bridge needs the source application's owner-approved delegated summary and merge contract spanning visible snapshot state, confirmed rows, pending edits/tombstones and device drafts. Direct privileged database access is not an acceptable substitute.
