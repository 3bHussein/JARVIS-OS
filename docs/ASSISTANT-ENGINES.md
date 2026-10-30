# Assistant engines and private context

Status: IMPLEMENTED; automated synthetic acceptance is recorded in TEST-REPORT.md. This is not completion of M4/M5 or production v1.0.

## Deterministic mode

Without an AI model the conversation supports local time, connected-source availability and the current personal daily briefing. It does not execute writes. The home briefing remains deterministic and source-labelled even when a model is enabled.

## Optional Ollama

1. Install Ollama separately from https://ollama.com/ and select an already installed local model with `ollama list`. JARVIS never pulls or installs models automatically. Model size, hardware, Arabic quality and licensing require your own choice and acceptance.
2. Disable Ollama cloud features in the **Ollama service's** environment using `OLLAMA_NO_CLOUD=1`, then restart Ollama. Alternatively merge `"disable_ollama_cloud": true` into its existing `~/.ollama/server.json` and restart; preserve any other settings. Setting this variable only in JARVIS's `.env` does not configure a separately running Ollama service. Confirm Ollama's log says cloud is disabled.
3. Put `JARVIS_OLLAMA_MODEL=your-installed-model-name` in the local JARVIS `.env`. Do not use a cloud model. Restart Start-JARVIS.bat (or npm start). Leave the setting empty to disable the adapter.
4. Unlock JARVIS, open Overview → Assistant engine and privacy → Use local AI for messages.
5. Profile/notes and sleep/food have **separate unchecked consent controls**. Enable only the context you want. Your typed message is always sent to the selected engine; never type passwords or corporate records.

The fixed server-side destination is `http://127.0.0.1:11434/api/chat`. Browser clients cannot supply another endpoint, model, system prompt, history or tools. Names containing `cloud` are rejected, but a loopback URL/name alone cannot attest the engine's internal routing; configure and trust the engine separately. No JARVIS cloud AI provider is enabled.

Requests are non-streaming, bounded at 60 seconds, with a 256 KiB response byte limit and a 12,000-character content limit. Redirects, tool-call responses, malformed/incomplete responses and unavailable models fail closed. Maximum two active model requests server-wide, one per session and six attempts per minute per session. The UI retains a failed draft and offers cancel/clear. Closing a response, logout, personal-data erase or clear aborts pending inference; generation guards prevent stale completions restoring cleared history. Abort requests do not attest immediate GPU resource release inside the separate engine.

## Context and history

- Server selects owner-session context. Client requests cannot inject another user's data or privileged tools.
- Personal scope: preferred name, stated goal, interests and up to 30 open notes. This is user-entered text, not verified facts or instructions.
- Health scope: labelled manual sleep/food arithmetic and only already-read WHOOP sleep facts meeting existing freshness rules. It does not cause an additional upstream health read. Profile goals may themselves be sensitive; choose personal scope accordingly.
- Imported ProgressXX files, corporate data, passwords, tokens and raw WHOOP records are excluded.
- Up to four previous question/answer pairs remain in server session memory. No chat history file is written. Scope/language/timezone changes, clear and logout remove history from the active JARVIS context. Navigating back to the conversation starts a cleared conversation and requires re-enabling consent. An external engine may have its own lifecycle/policies; JARVIS cannot erase its internal memory or third-party retained data.
- The source envelope lists supplied context, **not verification of model claims**. The model is fallible; deterministic home totals remain the reference. No model output executes a tool. Prompt wording is not a substitute for this execution boundary.

## Speech input and output

Voice lab provides click-to-start/click-to-stop, partial/final text and correction. A final transcript is moved to a chat **draft** only when you choose Use reviewed text; Send is a separate action. The recognizer stops after at most 60 seconds plus a three-second finalization grace, cancels on navigation/diagnostic interruption and never restarts automatically. This is not an acoustic VAD/Whisper pipeline or wake word.

On-device recognition is the default and requires `processLocally` support and an already installed language pack. Unsupported language/device fails without switching to a remote service. Arabic availability varies; no language-pack download is triggered. Browser-service mode requires separate explicit consent and may upload audio to the browser's provider; it is unsuitable for health/corporate/secrets without a separately assessed authorization. JARVIS does not record audio or choose that provider's retention policy. Language is selected explicitly; code-switching accuracy is not guaranteed.

Read reply aloud uses only an explicitly selected/reported-local suitable voice by default. Device versus network voices are labelled; remote/unknown voices require separate unlocked-session network-speech consent. If no suitable voice is available, no text is submitted. Speaking animation follows speech events, not sampled audio. Listening animation indicates recognizer state; the separate microphone RMS test measures amplitude only. Neither establishes recognition accuracy. No Piper/Whisper local sidecar or measured neural-voice quality is claimed.

## Manual acceptance still required

Test Egyptian Arabic, English, mixed product names, silence, interrupted speech, permission refusal, unavailable language packs, offline use and microphone contention on the actual Windows/browser combination. Record reference, final corrected hypothesis, uncorrected hypothesis, first-partial/final latency and corrections separately. Do not publish personal recordings. The existing normalizedWordErrorRate utility can score a consented corpus; no real WER, latency, model quality or physical-device acceptance was measured here.

Primary implementation references reviewed:

- https://github.com/ollama/ollama/blob/main/docs/api.md
- https://github.com/ollama/ollama/blob/main/docs/faq.mdx (cloud-disable configuration)
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally

## 2026-10-30 offline STT addition

A separate optional faster-whisper/VAD one-shot worker and local microphone capture are now wired. This supersedes the earlier statement that no local STT worker exists, while retaining the limitation that no actual engine/model/accuracy acceptance has run. Browser recognition and system TTS remain available. See [LOCAL-SPEECH.md](LOCAL-SPEECH.md).

## Daily-preview update — 2026-10-30T15:09:36+02:00

Conversation/history/typed draft now survive main-tab navigation in the unlocked page. Repeated voice/quick prompts reseed a draft, never auto-send. Clear/scope/language/timezone/lock still clear history. Selected imported Home nutrition remains excluded from AI; model health context is server-owned manual/WHOOP data. This supersedes the earlier navigate-back-clears-conversation behavior.

Read-aloud privacy update: JARVIS now selects only voices reported local by default and does not use an unspecified system default. Remote/unknown voices require explicit network-speech consent in Voice lab for the unlocked session; lock resets it. If no suitable device voice exists, no text is submitted. Voice metadata is not an OS traffic sandbox or a quality guarantee. Reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService.
