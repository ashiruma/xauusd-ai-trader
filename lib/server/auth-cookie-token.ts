import { combineChunks, stringFromBase64URL } from '@supabase/ssr';
import { AUTH_COOKIE } from './auth-client-core';
import { BffError } from './core';
/** Transport decoding is deliberately NOT authentication. Call getBffContext/identity services next. */
export async function accessTokenCandidate(cookies: { name: string; value: string }[]): Promise<string> {
  const selected = cookies.filter(c => c.name === AUTH_COOKIE || new RegExp(`^${AUTH_COOKIE}\\.\\d+$`).test(c.name));
  if (selected.length > 16 || selected.reduce((size, c) => size + c.value.length, 0) > 32768 || new Set(selected.map(c => c.name)).size !== selected.length) throw new BffError('AUTHENTICATION_REQUIRED', 401);
  const values = new Map(selected.map(c => [c.name, c.value]));
  try {
    const raw = await combineChunks(AUTH_COOKIE, name => values.get(name));
    if (!raw) throw new Error();
    const session = JSON.parse(raw.startsWith('base64-') ? stringFromBase64URL(raw.slice(7)) : raw);
    if (typeof session?.access_token !== 'string' || !session.access_token || session.access_token.length > 8192) throw new Error();
    return session.access_token;
  } catch { throw new BffError('AUTHENTICATION_REQUIRED', 401); }
}
