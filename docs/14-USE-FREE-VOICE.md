# 14 — Use free speech controls

No payment card, provider account or API key is required for the existing device speech path. This does not install a voice or guarantee natural Egyptian pronunciation.

1. Unlock JARVIS and open **Voice lab**.
2. Choose your interface language, then keep **Automatic device voice** or select an available matching voice. Arabic prefers a reported local ar-EG voice before another local Arabic voice.
3. Press **Test voice**. Adjust **Speech rate** and test again. Changing language, voice, rate or network permission stops the current reading.
4. Return to **Overview** and use **Read my briefing**, or read an assistant reply aloud.
5. While reading, the compact **JARVIS is reading** bar shows the current part and total. **Stop speaking** works across application tabs. Starting a microphone session, locking or leaving the app stops the active queue. Late engine events cannot restart it.

Long readings are split at sentence/word boundaries where possible, up to 1,200 Unicode code points per part and 12,000 overall. This is an engineering bound, not a latency guarantee. The bar tracks browser speech events/parts, not measured audio activity or spoken-word position. Stop does not resume or replay a previous reading automatically.

If no suitable device voice exists, JARVIS shows the problem instead of silently using a network voice. Optional network voices require explicit session consent; text may leave the device. Revoking consent stops pending reading. Voice availability depends on your browser/OS. System voice quality, Egyptian dialect, mixed-language pronunciation and real audio latency remain unmeasured. No paid voice engine has been activated.

Microphone diagnostics only measure activity. Browser transcription and optional local Whisper are separate paths; review transcripts before sending. This update does not claim improved transcription accuracy.
