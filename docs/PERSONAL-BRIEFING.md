# Personal daily briefing

This slice turns the signed-in home page into a source-labelled daily workspace. It is an editable profile and deterministic decision-support rules, **not deep-learning training, a connected LLM or a medical assessment**.

## Use it

1. Update your existing local project without overwriting its private configuration or encrypted personal-data directory. Start the app and unlock Settings with your local password.
2. On Overview, complete **First: tell JARVIS about you**: preferred name, stated goal, learning interests, chosen sleep target, optional existing calorie target and planning window.
3. Open the privacy controls if you want encrypted local persistence. Otherwise changes are session-only. Press Save after choosing the mode. Unchecking persistence does not erase previous encrypted saves.
4. In **Connect WHOOP Intelligence**, use the email/password for that application's account, **not WHOOP vendor credentials**, and explicitly allow read-only health data for this JARVIS session. The account must already be linked to WHOOP in the original app. Passwordless/MFA linking is not supported by this prototype; verified MFA factors are rejected.
5. The adapter reads already-saved records through the existing `whoop-data` action=`read`. It never invokes WHOOP OAuth, token refresh, sync, disconnect or database writes. Refreshing this view is not a WHOOP vendor sync. If source records are old, refresh them in the original application.
6. Until a safe delegated ProgressXX summary contract exists, use the explicitly labelled manual food/sleep check-in and timed task/workout entries. This does not claim a ProgressXX connection or mirror its queues/snapshots.

## Facts and arithmetic

- Sleep is the latest scored, non-nap main sleep ending on the configured timezone's current date. Time asleep is light + slow-wave + REM stage milliseconds; awake time is not counted. Sleep intervals and numeric bounds are validated; a previous day is never silently substituted.
- Estimated WHOOP need uses the four supplied need components with the nap component's negative sign. Missing/invalid components mean unknown. A manually chosen target is distinctly labelled as your target, not WHOOP need.
- A recorded recovery value must match the selected sleep ID and have scored status. It is not a medical diagnosis and does not automatically select exercises/loads.
- Health decision support requires a current-date record, read observation no older than 15 minutes and a complete upstream sync no older than 24 hours. Unknown/future/stale metadata is not used for automatic suggestions. Manual input can be used separately and remains labelled self-reported.
- Calories remaining = max(0, user-entered target − recorded food). Missing food is unknown rather than zero. Incomplete diary status is shown. Over-target amount is shown separately. WHOOP expenditure is never used as food intake or automatically added to the food budget.
- Goal ranges are input-validation guards, not prescribed diets. This version does not calculate a calorie prescription, macros, electrolyte dose or exact training reduction.

## Reminders and time

Notes can have a reminder time; tasks/workouts require one. Inputs use the configured IANA timezone and reject nonexistent/ambiguous daylight-saving times. Due and overdue items remain visible until marked done or deleted. The page updates while open and shows reminders when reopened. Closed-app/background/OS notifications are not implemented.

An optional learning suggestion uses your stated interests and an unbooked interval only after you explicitly mark today's recorded commitments complete. It is described as unbooked in the recorded schedule, not proof that you are free. This version does not fabricate book/movie titles or browse personal history for preferences.

## Science and scope

- CDC adult sleep guidance: https://www.cdc.gov/sleep/about/index.html (general adult reference, not an individual sleep prescription).
- Primary study: https://pubmed.ncbi.nlm.nih.gov/28247026/ (partial sleep deprivation and recovery after HIIT in cyclists; limited sample/population, not a formula for resistance-training loads).
- AIS electrolyte guidance: https://www.ausport.gov.au/ais/nutrition/supplements/group_a/sports-foods2/electrolyte-supplement2/how-and-when-do-i-use-it (individual sweat/fluid-loss context, not a blanket strength recommendation).

The short-sleep suggestion is a cautious heuristic: check sleepiness and warm-up readiness, consider comfortable activity and defer maximal efforts if not ready. It does not infer a fixed percentage reduction, session duration, specific muscle group or treatment from sleep hours alone. No automatic high-sodium recommendation is generated.

## Privacy and persistence

- Profiles, notes and manual check-ins are session-only by default. Optional explicit persistence writes AES-256-GCM encrypted local data, using a scrypt-derived key from the local workspace password and a random per-store salt. The key is held in server session memory, not written to disk.
- This is password-protected local storage, **not** a Windows Credential Manager/OS vault or a production multi-user implementation. Protect the computer and choose a strong password. Changing/losing the original password can make existing encrypted data inaccessible; do not follow the old password-reset instructions expecting old personal data to unlock automatically.
- `.jarvis-data/` is ignored by Git and denied by Vite's file server. Keep the encrypted file and original password if retaining notes during project updates. No automatic backup/cloud export is created.
- WHOOP credentials are sent only to the fixed existing account-auth endpoint. Password/refresh token/email are not retained. The access token, sleep and recovery records are transient in the JARVIS session. No health data or personal notes are sent to an AI/cloud model.
- The upstream user token itself is not a specially narrowed delegated token. This client only exposes a fixed read operation; issuing narrower long-lived integration grants remains future work. Sessions expire; reconnect is explicit.
- Saves use revisions to reject stale edits. Session-only edits may later be persisted without confusing their revision with the last disk save. Genuine concurrent changes are not overwritten; reload is explicit and drafts remain in the form after failure.
- Delete all personal data requires typing `DELETE PERSONAL DATA`; it erases this local store, invalidates its personal contexts and revokes the current JARVIS session. It does not delete or disconnect records in WHOOP/ProgressXX.
- Current limits: 90 dated check-ins and 200 notes. There is no silent rollover/deletion.

## Integration evidence

Reviewed WHOOP Intelligence main at `22f16886dc3fca87220fcc8ee11352deb5a3bd33`. Relevant file blobs: `supabase/functions/whoop-data/index.ts` f1390788bd756ebcf91ec46c156f2883e919ac22, `assets/dashboard.js` 565d8cd7222c20c8bd31bf52a827945c7284bff0, `assets/daily-home.js` ba220ae17686c2c5ae435eb2037c153e06a24952. Only its already-public project URL/publishable key are reused. No service-role credential is used and no existing repository/schema was changed.

Supabase Auth password documentation and current changelog were reviewed. The markdown changelog endpoint rejected its content type; the HTML changelog was inspected instead, including the announced TLS cipher deprecation. This Node 24 HTTPS client does not opt into obsolete CBC ciphers. No schema/config migration was made.

All acceptance tests use synthetic credentials, provider transports and records. Live sign-in and correctness with your real account still require your local acceptance; no one should paste credentials into this chat.
