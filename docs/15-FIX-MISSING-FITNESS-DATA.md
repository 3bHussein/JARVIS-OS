# 15 — Understand missing WHOOP or ProgressXX data

1. Unlock JARVIS and open Today.
2. Under **Choose what powers your day**, check **Home uses**. Manual entries, an imported file and a connected cloud source are separate choices. An imported snapshot is not automatic synchronization.
3. Open **Understand or fix missing source data**. Each source has its own reading status and action.
4. Follow the applicable step below. Do not paste passwords, tokens or sign-in links into chat.

| Display | Next step |
| --- | --- |
| Account not connected / Reconnect required | **Review connection**, then explicitly authorize that original app account for this session |
| Original WHOOP link needs attention | **Open original app**, finish WHOOP linking/sync there, then read here |
| No current reading | Check today's date and completed sync in the original app, then **Read this source again** |
| Read completed · value unavailable | Check whether today's relevant saved value exists in the original app; unavailable is not zero |
| Source records need review | Review the original app; bounded/invalid/conflicting rows cannot safely produce a total |
| Some sections are unavailable | Inspect reading details; available exercise/weight/food sections are handled separately |
| Please wait before retrying | Wait a minute and retry deliberately; repeated clicks do not speed up source sync |
| Recent saved reading | Available saved data is recent; this does not prove every device edit has synchronized |

**Read this source again** refreshes only the chosen connector. It does not change Home source selection, grant access, edit either original application, or start a new WHOOP device/vendor sync. Normal connector rate limits and in-flight locks still apply. **Refresh connected data** retains its existing two-source behavior.

If food totals differ, confirm ProgressXX completed saving/syncing before retrying. JARVIS does not change the total to a number supplied in chat. Real account-row reconciliation remains an owner acceptance step. The software tests use synthetic data.

Sources remain read-only and session-limited. This update adds diagnosis and navigation, not durable background authorization or a new source API.
