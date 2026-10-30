# Offline speech worker

Status: IMPLEMENTED / synthetic contract tests only. Actual faster-whisper inference, model loading, VAD quality, Egyptian-Arabic accuracy and physical Windows recording are not VERIFIED.

## Optional Windows setup

The ordinary JARVIS launcher still works without Python. To opt in:

1. Install Python 3.12 from a trusted official distribution. From the repository directory, create a dedicated environment:

   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r apps/voice-worker/requirements.txt
   ```

2. Obtain an appropriate **multilingual faster-whisper/CTranslate2 model** from a trusted model source and place its complete converted directory on this computer. It needs `model.bin` and its tokenizer/configuration files, not an original PyTorch checkpoint. Follow https://github.com/SYSTRAN/faster-whisper#model-conversion or its model download instructions. Review model size, licensing and hardware fit. English-only `.en` models do not meet Arabic requirements. JARVIS never downloads weights at runtime.
3. Set these optional values in the private local `.env`, using absolute paths (forward slashes work on Windows):

   ```dotenv
   JARVIS_STT_PYTHON=C:/path/to/JARVIS-OS/.venv/Scripts/python.exe
   JARVIS_STT_MODEL=C:/path/to/your/converted-multilingual-model
   ```

4. Restart Start-JARVIS.bat, unlock, and open Voice lab → Local Whisper. Configuration availability is not a readiness/model-health attestation.
5. Choose Arabic, English or experimental auto detection. Click Record locally, speak for up to 30 seconds, then Stop and transcribe locally. Inspect/correct the final transcript, choose Use reviewed local text, and press Send separately. Chat accepts at most 2,000 characters; a longer transcript must first be shortened manually.
6. Cancel, navigate away or lock to release recording/abort the request. If a model is missing, dependencies are incompatible or transcription times out, JARVIS shows a failure and does not silently use a cloud service.

Linux/macOS can use their Python 3.12 virtual environment executable (`.venv/bin/python`) with absolute paths. This does not certify those platforms' physical recording behavior.

## Data and process boundary

The browser captures mono microphone audio with echo cancellation/noise suppression requested. The Web Audio fallback uses ScriptProcessorNode (deprecated, tested in the pinned Chromium fixture); it can be affected by busy main threads. No monitoring audio is played. Chunks stay in browser memory, are capped at 30 seconds and linearly resampled to 16 kHz 16-bit mono PCM WAV. Linear resampling is a practical initial transport, not a measured studio-quality DSP filter. Audio is not saved to disk by JARVIS.

An authenticated same-origin POST with CSRF sends this bounded recording to the local JARVIS API. Recording/Stop is the explicit user action for this local processing. The server accepts only canonical bounded base64 and the exact PCM WAV header; no arbitrary filename, URL, command, model or executable is supplied by browser clients. Audio/transcripts never enter audit metadata or personal/AI context automatically. This does not prevent someone explicitly submitting a reviewed transcript to an enabled model.

The Node adapter invokes a fixed repository Python script with `shell:false`, Python isolated mode and only administrator/user-configured absolute executable/model paths. Environment inheritance excludes JARVIS passwords, GitHub tokens and proxy variables. The model path must contain model.bin, config.json and tokenizer.json. Missing tokenizer.json is explicitly rejected: faster-whisper 1.2.1 otherwise calls a pretrained-tokenizer fallback that does not take local_files_only directly. Python sets HF_HUB_OFFLINE and TRANSFORMERS_OFFLINE and uses local_files_only=True. No fallback, download or inference HTTP service is created. A trusted Python environment and model files remain part of the trust boundary; these flags are not an OS network sandbox.

The worker validates mono 16 kHz PCM and a 30-second maximum before loading the optional model. It uses CPU int8, two CPU threads, one worker, beam size three, task=transcribe, condition_on_previous_text=False and Silero VAD filtering. It returns a bounded final text only; no streaming partials or confidence percentages are claimed. Model initialization happens for each recording, so cold-start latency may be substantial. The model/dependency install is separate and optional. requirements.txt pins faster-whisper 1.2.1 but transitive packages are not yet a fully locked, audited distribution.

One transcription runs at a time per API process; a session has three attempts per minute. A 120-second deadline, cancel, response disconnect, logout and personal-data erase terminate the owned child. An aborted/expired session cannot receive a late result. This does not certify instantaneous OS/native-thread cleanup. Microphone diagnostic/browser recognizer/local recorder interrupt one another rather than intentionally recording concurrently. Recordings and transcripts are ephemeral JavaScript/Python memory, not guaranteed secure memory erasure or protection from OS swap/crash dumps.

## Acceptance evidence and remaining gates

- LOCAL-STT-01: encoder/resampling/header/base64 limits and invalid audio rejection.
- LOCAL-STT-02: actual process-launch failure and pre-abort behavior; no real model.
- LOCAL-STT-HTTP-01: authentication, CSRF, exclusive logical worker, cancellation, no audio/transcript in audit; injected worker.
- Python unittest: four tests for PCM/request/model guards, review/empty results, bounded lazy segments and a real one-shot subprocess returning a sanitized error with no traceback/path. Engine inference is injected, dependencies are not installed by tests.
- UI-21: Chromium fake microphone → real browser PCM encoder → HTTP → synthetic STT response → reviewed draft, no automatic AI send.

Run `python -m unittest discover -s apps/voice-worker -p test_worker.py`, `npm run check`, `npm run test:launcher`, `npm run test:e2e`. CI tests the Python contract with Python 3.12 on Linux and Windows; it does not install/run the optional model.

Before voice release, evaluate real local inference on consented recordings: Egyptian Arabic, English, mixed words, ProgressXX/WHOOP/GitHub names, quiet/noisy audio, silence and short commands; record uncorrected WER and corrections separately. Measure recording-to-final and cold/warm latency, microphone interruption/permission refusal/offline behavior, CPU/memory and native child cancellation on physical Windows. Do not invent benchmark scores. TTS remains the selected browser/system voice; Piper/local neural TTS and Tauri packaging are still separate TODOs.

Primary references reviewed on 2026-10-30:

- https://github.com/SYSTRAN/faster-whisper/blob/master/README.md
- https://github.com/SYSTRAN/faster-whisper/blob/master/faster_whisper/transcribe.py
- https://pypi.org/project/faster-whisper/1.2.1/
