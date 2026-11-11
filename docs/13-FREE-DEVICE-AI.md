# 13 — Free device AI: no card or API key

Current owner preference: no card, paid credits or credential setup. Vercel Gateway remains disabled. No billing/account changes were made.

## Use it

1. Open and unlock the online JARVIS workspace.
2. In the conversation area, expand **Free device AI · no account or card**.
3. Read the device/download notice. Nothing is downloaded automatically. If WebGPU is unavailable, the download button is disabled and saved-data questions remain available.
4. On a supported device, click **Download and run device model**. This checks an adapter and shader-f16 before importing the runtime/loading weights. Qwen3 0.6B is experimental; expect weaker answers than larger cloud models.
5. Wait for load progress. Model weights were approximately335 MB across nine shards in the inspected public index on2026-11-11, plus tokenizer/config/WASM and optional runtime code. The package's listed GPU memory requirement is1403.34 MB before additional runtime overhead. These are not measured performance/compatibility promises for your device.
6. Ask a short question in **Ask device AI**. The device model receives only that question and a bounded system instruction, not your saved health/profile/notes or earlier turns. Each reply starts with reset model context. Arabic/Egyptian quality and latency remain unmeasured.
7. **Stop and clear device reply** terminates the worker. Lock/unmount, language change and main conversation clear also unload the model/clear its reply. The current typed draft is kept until lock/reload. **Delete downloaded model** removes that model's cache through the SDK; browser site-storage controls are an alternative.

## Boundaries

- No API credit, API key, external account or payment form. Downloads still use internet/data, disk storage, GPU memory, electricity and browser resources.
- Inference runs in a dedicated same-origin worker. Public model assets are downloaded from MLC's Hugging Face/GitHub hosts; those hosts receive normal download metadata. JARVIS does not send the question to an inference API. No automatic cloud fallback, model tools or source writes.
- Model-weight cache may persist in browser storage. Prompt/answer persistence and crash-resumable generation are disabled in this implementation. Do not confuse public model caching with saved conversation memory.
- Input2000 characters, output request384 tokens, answer12000 characters, ninety-second generation limit; cancellation terminates the worker and late results are discarded. Loading can take minutes and has explicit cancellation.
- Real GPU loading/generation, mobile memory behavior and Arabic voice/model quality require owner-device acceptance. Synthetic tests verify gating, lifecycle and unsupported-device behavior, not model intelligence.
- The website still requires network authentication/source reads. Cached model files do not make the complete JARVIS PWA an offline application.

## Technical evidence

Pinned @mlc-ai/web-llm0.2.88. Selected official model ID Qwen3-0.6B-q4f16_1-MLC. Runtime/worker chunks are lazy and large (about6 MB each uncompressed); main bundle remains about394 kB uncompressed/126 kB gzip. Production/local-built allow only named hashed JS/CSS assets through an emitted build manifest. CSP permits WASM compilation, not general JS unsafe-eval, and fixed model download host families.

References: https://webllm.mlc.ai/docs/user/get_started.html and the installed SDK's model catalog. Chrome's built-in Prompt API was evaluated but its currently documented language list does not include Arabic, so it was not selected as the primary no-key Arabic path.
