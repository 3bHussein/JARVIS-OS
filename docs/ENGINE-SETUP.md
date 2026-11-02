# Local engine setup wizard

Run `Configure-JARVIS.bat` in the extracted preview, or `node scripts/configure.mjs` from the source checkout. Existing local setup and Node24+ are required. `--help` does not read configuration; `--check` prints only configured/not-configured flags, never passwords, tokens or configured paths.

The wizard can:

1. List already installed eligible model names from fixed loopback `GET http://127.0.0.1:11434/api/tags`, then choose one by number. Redirects, oversized lists/responses, unsafe names, names containing cloud and known remote-model fields are excluded. No inference, prompt, personal data, pull or installation request is sent.
2. Disable JARVIS's optional AI adapter.
3. Accept absolute paths to an existing Python executable and a faster-whisper model directory containing model.bin/config.json/tokenizer.json. This checks file presence/type, not executable trust, installed dependencies, model compatibility or accuracy. It never runs Python or installs anything.
4. Disable the offline speech adapter.

For AI, disable cloud in the **separately running Ollama service**, restart Ollama and check its logs before selecting a model. The wizard asks for explicit confirmation of that prerequisite; neither a name nor a loopback address attests the engine's internal routing. Official references: https://docs.ollama.com/api/tags and https://docs.ollama.com/faq . Actual model inference/quality remains a separate acceptance step.

Before writing, the wizard lists the only keys it will change and requires typing SAVE. It appends restricted engine-key assignments as overrides; comments, password hash, unknown settings and earlier text are retained. Node's env parser is roundtrip-checked, including Windows backslashes; unsafe control characters/unrepresentable quoting fail without saving. Empty assignments disable adapters. No password change or vault migration occurs. Settings only apply after restarting JARVIS.

The writer refuses symlink/oversized configuration files, writes a new restrictive temporary file, rechecks the original content and renames into place. A detected concurrent change aborts without overwrite. This is not a lock against a malicious process running as the same OS user or a full filesystem-race guarantee. Temporary files are cleaned on ordinary failures; a power loss can leave an ignored `.env.pending-*` file. No extra secret backup is created. The env file has a 256KiB limit; repeated override history may eventually require owner-reviewed maintenance rather than silent truncation.

After restart, Settings → Make JARVIS ready shows the server's current configured flags. Refresh only reads status endpoints; it does not run the engines or transmit health context. Enable AI for messages separately in the conversation, choose each context scope explicitly and use Voice lab for a reviewed speech test. Optional engines are not prerequisites for the daily planner/briefing.

Automated evidence: CONFIG01..03 cover preservation, Windows quoting, unsafe input, fixed bounded model discovery, path validation and conflict refusal. START05 runs the packaged wizard's read-only check without dependencies; Windows CI checks BAT help. UI37 confirms configuration-only status and no inference on refresh. Synthetic fixtures only; no real engine or physical Windows interactive wizard acceptance is claimed.
