# Hosting and updates

JARVIS currently runs on loopback and accepts local origins only. The API keeps an encrypted vault on disk and optionally calls Ollama and speech recognition on the host machine. A static deployment cannot provide those features.

## Update one installation without downloading another ZIP

Install Git once and clone the repository:

```powershell
git clone https://github.com/3bHussein/JARVIS-OS.git
cd JARVIS-OS
```

Run 01-Setup-JARVIS.bat and 02-Start-JARVIS.bat. If moving from an existing preview, transfer records using an encrypted portable backup in You & privacy.

For future updates, stop JARVIS with Ctrl+C and run these commands inside the same clone:

```powershell
git pull --ff-only
npm ci --ignore-scripts
npm run build
```

Run 02-Start-JARVIS.bat again. Keep the same local password and vault. If Git reports local changes or diverged history, stop and review them before proceeding.

## Hosting options

GitHub Pages can serve a separate static demo. Render Free can run Node, but its ephemeral filesystem is unsuitable for the current vault. An independent personal cloud instance needs an HTTPS entry point, secure session configuration, durable encrypted storage and restart/restore acceptance.

A private Tailscale Serve route would keep storage and AI engines on your machine and provide an HTTPS address to your own devices. The machine must stay online. JARVIS needs a separately tested private proxy mode before enabling Serve because its current Host and Origin checks require loopback.

References: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Render Free](https://render.com/docs/free), [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve).

## Single-owner cloud pilot

Use a Linux VM with a persistent disk and a DNS name pointing to it. An eligible Oracle Always Free VM is one option, subject to account and region capacity. Run the application as a dedicated non-root user. Keep the repository and persistent vault in separate directories. Allow public HTTPS at the proxy and restrict administrative SSH to trusted addresses.

1. Clone the repository, run `npm ci --ignore-scripts` and `npm run build` with Node 24.
2. Create the vault directory on the persistent disk, owned by the service user with mode 0700. Create a mode 0600 environment file outside the repository. Generate the password hash with `npm run password` and put the hash in that file. Use a unique password.
3. Configure these values with your actual DNS name and disk path:

   ```dotenv
   JARVIS_HOSTED=1
   JARVIS_BUILT_WEB=1
   JARVIS_ORIGIN=https://jarvis.example.com
   JARVIS_PORT=4310
   JARVIS_VAULT_DIRECTORY=/var/lib/jarvis
   JARVIS_PASSWORD_HASH=replace-with-generated-hash
   ```

4. Configure a service manager to run `node --env-file=/etc/jarvis.env apps/api/src/main.ts` from the repository as the dedicated user. Restart it after building each update. The app listens on loopback.
5. Configure the HTTPS proxy. Example Caddy site block:

   ```caddy
   jarvis.example.com {
       reverse_proxy 127.0.0.1:4310
   }
   ```

   Preserve the public Host header. Keep port 4310 private. Confirm DNS, TLS and the service status before entering your password.

Validate with synthetic records first: unlock, explicitly save encrypted, restart the process, unlock and verify the record. Test a portable encrypted export and restore before migrating personal data. Local AI and speech engines would require separately installed server-side runtimes and models. This is a single-owner pilot configuration.

## Vercel migration

The target is one Vercel project connected to the GitHub repository, with the built React UI and a same-origin API. The HTTP request handler is now separate from the local Node listener. The listener continues to serve the local and VM variants.

Vercel Functions can replace the listener only after the state migration. The current encrypted disk vault, unlocked key and session-local contexts depend on the lifetime of one process. Function instances cannot share that state through memory or a local file. A cloud implementation needs durable encrypted records, atomic revision checks, revocable expiring sessions and a defined encryption-key lifecycle across instances. WHOOP connection secrets must be excluded from portable backups and protected independently if persisted. Local Ollama and speech subprocesses need a separate provider in hosted mode.

Acceptance before enabling Git deployment:
- Verify sign-in and CSRF across independent function instances and session revocation on logout.
- Verify encrypted save, conflict handling, restart/redeploy retention and portable restore with synthetic records.
- Verify exact production origin, secure cookies and preview isolation from production data.
- Link the approved Vercel account and its durable datastore, then verify the deployment URL.

Reference: [Vercel Functions runtimes](https://vercel.com/docs/functions/runtimes).
