/** Read at most limit bytes; do not buffer an untrusted body before checking it. */
export class BodyReadError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(status === 413 ? 'payload_too_large' : 'invalid_request');
    this.status = status;
  }
}

export async function readBoundedText(message: Request | Response, limit: number): Promise<string> {
  const declared = message.headers.get('content-length');
  if (declared !== null && /^\d+$/.test(declared) && Number(declared) > limit) {
    await message.body?.cancel().catch(() => {});
    throw new BodyReadError(413);
  }
  if (!message.body) return '';
  const reader = message.body.getReader();
  const decoder = new TextDecoder('utf-8', {fatal: true});
  let size = 0;
  let text = '';
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new BodyReadError(413);
      text += decoder.decode(value, {stream: true});
    }
    return text + decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (error instanceof BodyReadError) throw error;
    throw new BodyReadError(400);
  } finally {
    reader.releaseLock();
  }
}
