# Voice welcome and open-workspace reminders

Status: IMPLEMENTED; synthetic automated acceptance pending in this session's historical entry. This does not introduce a background Windows agent, persistent mobile push service or medical alarm.

## Voice welcome

Silent startup stays enabled by default. In Settings, uncheck **Silent startup** to opt in for the next unlock. Once Overview is visible and the personal context plus initial WHOOP read attempt are ready, JARVIS speaks the actual current briefing once. It uses a suitable voice reported by the browser as device-local, ignoring any network voice selection/consent for automatic output. No suitable local voice means no automatic speech. Browser playback rules can still prevent sound; use Read my briefing explicitly. Voice metadata is not an OS network sandbox or a voice-quality guarantee.

Source refreshes, tab changes, locale changes and voice-list events cannot repeat a completed greeting in the same unlock session. A manual speech attempt consumes that session's greeting, including if voice selection fails. Starting another interaction suppresses that pending session greeting rather than interrupting it later. A quiet session stays quiet even if the setting is changed mid-session; unlock again to apply. Lock/session expiry cancels synthesis and resets private data. The boot timer cannot overwrite a speaking/listening state. Existing microphone/recognition interruption controls still apply.

## Recorded reminders

Open **Reminders while this workspace is open** and enable the unlocked-session toggle. This is off by default and is not saved to device preferences or the personal vault. It examines saved open timed notes/tasks/workouts. Untimed notes, completed entries and times before enabling are not replayed. A due event may be delivered up to five minutes late; after that, it remains in Planner without a stale popup. Rescheduling creates a different occurrence. Receipts are session-memory only, bounded to 500; disabling/re-enabling establishes a new arming time. Nothing is scheduled on a server or registered as a browser service worker.

In-app notices contain only a count and a Review in Planner action. A separate **Allow generic desktop notifications** click requests browser permission. Desktop content contains a generic JARVIS title/body, with no note title, date, account name or health information. Delivery requests `silent: true`; actual OS rendering/sound behavior remains platform-dependent. Only one generic notification is retained at a time. Clicking it focuses the app and opens Planner. Turning delivery off or locking closes retained notifications. Browser permission itself can remain granted and is revoked from browser/site settings; it does not automatically enable JARVIS delivery next session.

Closing the workspace, locking, server-session expiry or browser suspension can stop/delay delivery. No closed-app/offline/mobile wake guarantee is made. Mobile browsers may not support constructor-based desktop notifications; in-app reminders remain available. These reminders must not be used as guaranteed safety or medication alarms.

## Evidence and references

REMIND-01 covers arming/grace/deduplication/completion/rescheduling. WELCOME-01/02 cover quiet/readiness/visibility/local-voice/interaction/session gates. UI-35/36 use synthetic notification and TTS objects and a virtual browser clock to test permission/privacy/cleanup/navigation and once-per-unlock behavior. They are control-flow tests, not actual Windows notification or speaker acceptance.

Primary platform references reviewed 2026-11-01:

- https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static
- https://developer.mozilla.org/en-US/docs/Web/API/Notification/silent
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak
