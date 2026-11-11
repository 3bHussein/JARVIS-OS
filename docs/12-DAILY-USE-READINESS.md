# 12 — Daily-use readiness and release gates

Current preference: no payment card, API keys or paid setup. Start with [13 — Free device AI](13-FREE-DEVICE-AI.md); cloud activation is deferred.

Status as of 2026-11-11: personal preview, not a finished voice-enabled assistant. Automated tests verify synthetic behavior, not live owner-data or voice quality. Desktop remains deferred and is not a prerequisite for a useful personal web release.

| Priority | Area | Current evidence | Required to call it ready |
| --- | --- | --- | --- |
| P0 | Free generative AI | Optional device WebLLM path implemented; no card/key; GPU/download required | Real owner-device loading/reply/Arabic quality; unsupported-device fallback acceptance. Cloud Gateway remains disabled |
| P0 | Personal AI context | Bounded saved-data router works; first cloud mode is text-only/stateless | Source-selected, dated context with separate health consent; follow-up history, clear/revocation, missing-data and prompt-injection acceptance |
| P0 | Speech output | Device/browser voice matching corrected, Arabic locale preference, visible test and speed | Select and integrate a tested Arabic/English neural engine where desired; owner listening tests, mixed-language pronunciation, interruption and latency measurements |
| P0 | Speech input | Browser permission/review and optional local Whisper worker wired | Working online engine on actual devices; Egyptian Arabic/code-switching corpus, transcription corrections, measured accuracy/latency and echo/interruption tests |
| P0 | Fitness data correctness | Read-only session connectors, bounded projections, provenance and local-day handling; synthetic tests pass | Compare actual WHOOP and ProgressXX dates/rows/totals with originals; earlier owner food discrepancy still unconfirmed |
| P1 | Durable integration | Explicit session grants up to one hour | Design provider-supported long-lived opt-in authorization, encrypted refresh-token lifecycle, revocation and multi-device acceptance; do not silently extend session consent |
| P1 | Daily reminders | Planner and visible/open-workspace reminders | Consent-scoped closed-app/push notifications and delivery acceptance; no current background scheduler claim |
| P1 | Assistant usefulness | Recorded daily facts/priorities and manual profile | Contextual recommendations with sources/limits, editable/deletable memory, read-only tools first and separately approved writes |
| P1 | Web release | Encrypted vault, password recovery, synthetic CI/browser/PWA checks | Full real-account journey, mobile/browser/device acceptance, backup/recovery exercise, security/performance/accessibility review and release checklist |
| Later | Expansion | Desktop prototype and connector contracts | Native desktop acceptance, other personal apps and isolated corporate integration; no corporate secrets in personal AI |

## Work order

1. Accept the optional free browser model on supported owner hardware; no card/key or automatic download. Keep cloud disabled.
2. Make online speech input/output work on the owner's actual browser before promising natural Egyptian speech.
3. Add selected-source AI context and bounded follow-up conversations with explicit consent.
4. Reconcile actual fitness totals and complete a full daily journey (briefing → question → voice → reviewed task/reminder → next-day return).
5. Finish durable linking, notification delivery and release security/performance/device acceptance.

Further cosmetic work must not substitute for these functional gates. No completion percentage or delivery date is inferred from code volume or passing synthetic tests.
