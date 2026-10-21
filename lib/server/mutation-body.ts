import { BffError } from './core';

// Service routes do not accept email, subject, issuer, learner IDs or scope from
// browser JSON. The only identity input is the server-verified host cookie.
export async function requireEmptyMutationBody(request: Request, timeoutMs = 5000): Promise<void> {
  if (new URL(request.url).search) throw new BffError('UNEXPECTED_MUTATION_INPUT', 400);
  if (!request.body) return;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = Date.now() + timeoutMs;
  try {
    for (;;) {
      let timer: ReturnType<typeof setTimeout>;
      const timeout = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new BffError('BODY_TIMEOUT', 408)), Math.max(0, deadline - Date.now()));
      });
      const { value, done } = await Promise.race([reader.read(), timeout]).finally(() => clearTimeout(timer));
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        throw new BffError('BODY_TOO_LARGE', 413);
      }
      chunks.push(value);
    }
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  if (size === 0) return;
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new BffError('JSON_REQUIRED', 415);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body: unknown;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new BffError('INVALID_JSON', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 0) {
    throw new BffError('UNEXPECTED_MUTATION_INPUT', 400);
  }
}
