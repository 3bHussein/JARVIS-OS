# 05 — Reset the online workspace password

This is the Vercel single-owner recovery procedure. It does not reset the Vercel account password. There is no default JARVIS password and no email recovery service.

## 1. Generate the new hash privately

With Node.js installed, open PowerShell on your own computer. You do not need to download the project. Paste:

```powershell
$jarvisSecret = Read-Host 'New JARVIS password (12-256 characters)' -AsSecureString
$jarvisCredential = [System.Net.NetworkCredential]::new('', $jarvisSecret)
$jarvisCredential.Password | node -e 'const fs=require("node:fs"),c=require("node:crypto");const p=fs.readFileSync(0,"utf8").replace(/\r?\n$/,"");if(p.length<12||p.length>256){console.error("Use 12-256 characters");process.exit(1)}const s=c.randomBytes(16).toString("hex");console.log(s+":"+c.scryptSync(p,s,64).toString("hex"))'
Remove-Variable jarvisCredential,jarvisSecret
```

The password is hidden at entry and is passed through stdin, not a command argument. Copy the resulting hash privately. Do not paste passwords, hashes, encryption keys, or tokens into chat. Use an ASCII password if using Windows PowerShell 5.1's default pipe encoding; PowerShell 7 supports UTF-8. The helper below supports Unicode directly.

Alternatively, from a current source checkout with Node 24+, run `npm run password:online`. It asks twice with hidden input and prints the hash only. It does not edit `.env`, call a network service, or change production automatically.

## 2. Replace one Vercel secret

Open the jarvis-os project, Environment Variables. Edit the existing **JARVIS_PASSWORD_HASH**, scoped to **Production**, and save the new hash as **Secret**. Copy the hash value only, not a `JARVIS_PASSWORD_HASH=` prefix.

**Keep JARVIS_CLOUD_KEY, JARVIS_CLOUD_NAMESPACE and Redis variables unchanged.** The cloud vault encryption key is separate from the login password. Changing it can make saved records unreadable.

## 3. Redeploy and verify

Redeploy production after saving the variable. Once the deployment is Ready, open the primary production domain, then sign in with the new password. Check that your saved profile/notes are still present. Do not create a second namespace to fix a login issue.

The current cloud handler binds sessions to the password hash: cookies from an earlier hash fail authentication against the updated deployment, without changing the vault key. Existing Redis session records expire after their original one-hour TTL.

Older deployment URLs retain their own configuration. This is not a global revocation of immutable old deployments. If recovery follows a suspected compromise, review Vercel Deployment Protection and older deployments separately. Do not roll back to an old password configuration expecting revocation to persist.

If you see `cloud_setup_required`, check the variable name/environment and redeploy. If login is rate limited, wait at least one minute before trying again. If records fail to load, preserve the original encryption key and namespace rather than generating replacements.
