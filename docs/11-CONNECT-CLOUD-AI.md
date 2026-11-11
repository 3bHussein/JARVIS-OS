# 11 — Connect cloud AI (not activated by this release)

The online workspace previously had no generative provider. The new server adapter supports Vercel AI Gateway Chat Completions, but it remains disabled until the owner configures it and verifies a real reply. No API key, credit purchase, live generation or billing change was performed during development.

## One-time owner setup

1. Open your Vercel team AI Gateway dashboard. Review account verification, credits and a spending budget first. Free-credit eligibility may require a payment method; do not assume unlimited free usage or enable automatic recharge without reviewing it.
2. Select a current language model from https://ai-gateway.vercel.sh/v1/models. `google/gemini-3.1-flash-lite` was present in the live catalog on 2026-11-11; it is an example, not a fixed future recommendation or tested quality claim.
3. In JARVIS project's Production environment variables, add Config `JARVIS_AI_MODEL` with the selected exact provider/model ID and Config `JARVIS_CLOUD_AI_ENABLED` with value `1`.
4. Vercel deployments can authenticate using their automatic `VERCEL_OIDC_TOKEN`. If using a Gateway API key instead, add `AI_GATEWAY_API_KEY` as a Secret directly in Vercel. Never paste a key in chat, source, screenshots or a public environment variable. No browser key is used. An invalid optional AI configuration leaves the workspace usable with AI disabled.
5. Redeploy the reviewed source after the environment change. Unlock JARVIS, expand **Assistant engine and privacy**, and check the configured model. Configured does not mean a response succeeded.
6. Enable **Send my messages to cloud AI**, then send a non-sensitive test such as “Reply with a short greeting in Egyptian Arabic.” Check the reply, model usage and budget in Gateway. Do not start with health/corporate data.

## Current boundaries

- Cloud chat sends only your submitted text and the current requested-language/clock instruction. It does not send profile, notes, saved health records, imported files or previous chat turns. Record-sharing controls are disabled in this first cloud phase; saved-data questions remain in the separate local question mode.
- Replies displayed earlier are not model conversation memory. Follow-up memory and consent-scoped cloud context remain TODO. No tools, external actions, autonomous tasks, file access or source writes are available to this model.
- Server limits: 2,000 input characters, 700 output-token request cap, 20-second provider timeout, one in-flight request per session, six attempts per minute/session and fifty attempts per rolling day/workspace. These limits are not a currency budget; set that in Gateway. No automatic retries or model fallback.
- Invalid, incomplete or tool-call responses are rejected. Gateway authentication/budget/account errors do not log JARVIS out and never expose upstream private bodies.
- Lock/revocation blocks delivery of an in-flight result. Cancellation can stop delivery without guaranteeing the upstream provider stops billing for work already started.
- Never type passwords, API keys or restricted corporate data. A cloud provider processes text you choose to submit; review its data handling separately.

Primary references: https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-compat and https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc.
