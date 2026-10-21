import { BffError } from './core';
export async function readCredentials(request: Request, signup: boolean, timeoutMs = 5000): Promise<{ email: string; password: string }> {
  if (new URL(request.url).search) throw new BffError('UNEXPECTED_MUTATION_INPUT', 400);
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new BffError('JSON_REQUIRED', 415);
  if (!request.body) throw new BffError('CREDENTIALS_REQUIRED', 400);
  const reader = request.body.getReader();
  const deadline = Date.now() + timeoutMs;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      let timer: ReturnType<typeof setTimeout>;
      const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new BffError('BODY_TIMEOUT', 408)), Math.max(0, deadline - Date.now())); });
      const { value, done } = await Promise.race([reader.read(), timeout]).finally(() => clearTimeout(timer));
      if (done) break;
      size += value.byteLength;
      if (size > 4096) throw new BffError('BODY_TOO_LARGE', 413);
      chunks.push(value);
    }
  } catch (error) { void reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body: any;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new BffError('INVALID_JSON', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).sort().join(',') !== 'email,password' ||
      typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.email.length > 254 ||
      typeof body.password !== 'string' || body.password.length < (signup ? 12 : 1) || body.password.length > 1024) throw new BffError('CREDENTIALS_INVALID', 400);
  return { email: body.email, password: body.password };
}
