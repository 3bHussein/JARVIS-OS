# 07 — Connect WHOOP and ProgressXX online

Open https://jarvis-os-henna-sigma.vercel.app/ and unlock your online workspace. Open **Sources** in the daily navigation.

## 1. Connect ProgressXX

1. Expand **ProgressXX** under **Connect once for this session**.
2. Enter the email and password you use in the original ProgressXX app. This is not your JARVIS password unless you independently chose the same one.
3. Read and select the session-only fitness-data consent checkbox.
4. Click **Connect read-only**. Password controls clear immediately.
5. Return to **Today**. The **Cloud read** section shows saved food, protein, weight trend when enough measured days exist, recent exercise rows and weekday training labels where available.
6. Optionally select **Use cloud food on Home for this session**. JARVIS uses its own profile calorie target and does not overwrite your manual food entry. Imported-file and cloud-food selections are mutually exclusive. The choice resets when the workspace is locked/reloaded.

## 2. Connect WHOOP Intelligence

Use the account for your existing **WHOOP Intelligence** application, not your WHOOP vendor password. Its existing vendor connection must already be authorized in that application.

- If that app account has a password, enter its email/password and select session-only health consent, then **Connect read-only**.
- If you use its email sign-in link, expand **My WHOOP Intelligence uses an email link**. Open the original app, request its sign-in email, copy the sign-in link from the email **without opening it**, and paste it into the masked field in JARVIS. Select consent and connect. Do not paste the link in chat. JARVIS verifies the token only with the fixed existing application's Supabase Auth endpoint; it never follows the supplied redirect URL or requests another email.
- Used, expired, recovery, foreign-host or unsupported PKCE links are refused. MFA accounts are not supported by this connector yet. Use the original application if linking fails; do not disable MFA.

## 3. Understand automatic updates

- In a connected account panel, **Read saved records** returns you to Today with the latest permitted read. You do not need to disconnect/re-enter credentials to retry.
- While the unlocked web page is visible, JARVIS checks saved source data every five minutes. The server shares a five-minute cache across instances for that JARVIS session; manual refresh has a 30-second cache cooldown.
- Access is limited to the current unlocked JARVIS session, up to one hour or the source token's earlier expiry. Reconnect after expiry. Passwords and refresh tokens are not retained. This release does not offer unattended background sync or durable account linking.
- **Last successful read** means JARVIS read saved source records. It is not proof that the original app uploaded every edit or that WHOOP synced its device. WHOOP's last complete upstream sync is shown separately. Missing/stale readings do not drive health suggestions.
- Locking or **Disconnect from JARVIS** removes the local session grant. It does not disconnect WHOOP vendor authorization, revoke other source-app sessions or delete the original app's records.

## 4. What is included

| Source | Read scope | Limits |
| --- | --- | --- |
| WHOOP Intelligence | Saved sleep, recovery, current cycle, completed workouts, sync history through its existing `whoop-data` read action | No new vendor OAuth or `sync` action; device freshness depends on original app |
| ProgressXX food | Owner's saved `food_entries`, selected by configured local date | No pending device edits; empty means unknown, zero only when explicitly recorded |
| ProgressXX exercise | Owner's `legacy_workout_entries` with `pxlog:` source IDs, last 30 days | Older snapshot-only history and local pending changes excluded |
| ProgressXX weight | Owner's last 15 days of weight rows | Trend requires at least three measured days in each seven-day comparison |
| ProgressXX schedule | Only the saved weekly schedule field from the app snapshot | A weekday label has no appointment time or proof of a completed session |

Bounded reads refuse incomplete totals when a 500-row cap is reached. Invalid records, duplicates, failed permissions or unavailable source tables produce an unavailable state rather than invented/partial totals. Resolve paused sync or conflicts inside ProgressXX first; JARVIS never replays its outbox or modifies its conflict-handling system.

The original ProgressXX file import remains available as a separate fallback. Health data is not silently added to long-term AI memory.
