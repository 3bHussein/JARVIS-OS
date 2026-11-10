# 10 — Fix Home data sources

1. Open the online app and unlock your workspace.
2. On **Today**, find **Choose what powers your day** above your briefing. Check **Sleep source** and **Food source**. Online defaults are WHOOP Intelligence and ProgressXX cloud.
3. Click **Connect / review accounts**. Connect each original application account with the consent form in JARVIS. Follow [07 — Connect fitness accounts](07-CONNECT-FITNESS-ACCOUNTS.md). Never send passwords or email sign-in links in chat.
4. Return to Today. Use **Refresh connected data** if necessary. Reads have a five-minute cache and thirty-second manual cooldown. Check each provider's last successful read and detailed status.
5. If remaining calories are blank, choose your own usable calorie target in your profile. A target alone cannot supply a missing food total.

## What the labels mean

| Label | Action |
| --- | --- |
| Account not connected / reconnect required | Connect that source for this unlocked session; JARVIS login alone does not connect source accounts |
| Recent saved read | JARVIS read saved records; check their date and the original app's upstream sync separately |
| Partial read | Open details. Healthy sections can display independently; failed sections stay unavailable |
| Permission / source schema unavailable | Review source permissions/schema; JARVIS never bypasses them or changes a source database |
| Food total unavailable | Empty, invalid or capped diary cannot become a fabricated zero or incomplete sum |

Manual records remain saved separately. Choose **Manual check-in** explicitly if you want to use them. A disconnected, stale or failed cloud source never silently substitutes manual input. Reload/lock returns online Home to cloud-first defaults. Local preview keeps its existing manual/file behavior.

WHOOP reads the existing Intelligence backend's saved data; it does not start a new vendor OAuth flow or device sync. ProgressXX reads only uploaded, authorized owner rows; pending local edits and sync conflicts must be resolved in ProgressXX. Current source grants last up to one hour and do not provide unattended background sync.
