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
