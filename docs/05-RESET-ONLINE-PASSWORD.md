# 05 — Recover the online workspace password

## Everyday use: inside JARVIS

1. Open Settings → **Forgot your online password?**
2. Click **Email me a reset code**. Check your inbox and spam folder.
3. Enter the eight-digit code and your new password twice, then click **Save new password**.
4. Sign in with the new password. No download, terminal command or redeploy is needed for each reset.

The code expires after ten minutes and can be used only once. Five wrong attempts exhaust it. Sending is limited to one request per minute and three requests per hour for this single-owner workspace. Requests during cooldown count toward the hourly allowance. Verification has a separate hourly abuse limit. Codes and new passwords are not stored in browser persistence.

If email recovery is not enabled, the screen says so and sends nothing. A successful provider response means the provider accepted the request, not proof that it reached the inbox.

## One-time owner setup

Recovery is disabled unless these server-side Vercel Production variables are configured:

| Variable | Value |
| --- | --- |
| `JARVIS_RECOVERY_EMAIL` | Owner-controlled recovery mailbox; configure privately as a Secret |
| `JARVIS_EMAIL_FROM` | Bare sender email authorized by the Resend account |
| `RESEND_API_KEY` | Resend sending credential; save as a Secret |

The hosting owner must verify ownership of the mailbox before setting it. The mailbox is a credential-recovery authority: anyone able to read its codes can reset the workspace password. It cannot be set or changed by an unauthenticated visitor. Recipient selection never comes from request data or an imported profile.

Create/configure the email service in its own dashboard, meet its sender/domain requirements, enter the three values privately, and redeploy **once**. Do not paste API keys, passwords or reset codes into chat. No provider account, sender verification, or email address is provisioned by the code deployment. Real delivery requires an authorized owner acceptance test; automated tests use a fake mail transport only.

Provider API: [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email), checked 2026-11-08. The adapter sends only the configured recipient/from address, generic reset text and the code to `https://api.resend.com/emails`. It sends no health records, notes, tasks, workspace password or vault key. Requests are bounded and do not follow redirects or retry automatically.

## Data and deployment boundaries

**Preserve JARVIS_CLOUD_KEY, JARVIS_CLOUD_NAMESPACE and Redis variables.** The cloud encryption key is separate from login credentials. Email recovery changes only a salted scrypt password hash in Redis. The recovery proof is HMAC-protected and expires; it does not contain the plain code.

The Vercel `JARVIS_PASSWORD_HASH` is the bootstrap credential. Keep it stable after enabling recovery. The Redis override is scoped to that bootstrap hash: changing the environment hash deliberately starts another credential generation, overriding prior email-reset state. New function instances consult the shared current hash, so resets survive redeploys and invalidate earlier cookies on updated deployments. Consuming a code and updating the password use an atomic Redis script with a compare-and-set guard.

Older immutable deployment URLs can retain older code/configuration. Session invalidation on the current code is not global revocation of old deployments. Review Vercel Deployment Protection and old deployment access separately if compromise is suspected. No production secrets or records are changed by reading this guide.

## Owner emergency fallback

If the email service is unavailable, the hosting owner can replace only Production `JARVIS_PASSWORD_HASH` and redeploy. A current source checkout provides `npm run password:online` on Node 24+: hidden password entry twice, no `.env` mutation or network request. Keep the data key and namespace unchanged.

### Dated correction — 2026-11-08

The earlier inline PowerShell-to-`node -e` example failed on the owner's Windows native argument quoting and has been removed. Do not reuse it. The preferred flow is email recovery inside the app after one-time setup; the interactive source helper remains an emergency fallback.
