import { createClient } from '@supabase/supabase-js';
import { BffError, verifyAccessToken, checkCurrentUser, type VerifiedContext } from './core';
import { validateAuthConfig } from './auth-client-core';
export type ProviderTokens = { accessToken: string; refreshToken: string };
export type ProviderStorage = Record<string, string>;
export type FreshProvider = {
  signup(input: { email: string; password: string }): Promise<ProviderStorage>;
  login(input: { email: string; password: string }): Promise<ProviderTokens>;
  callback(code: string, storage: ProviderStorage): Promise<ProviderTokens>;
  refresh(refreshToken: string): Promise<ProviderTokens>;
  verify(token: string): Promise<VerifiedContext>;
  signOut(token: string, scope: 'local' | 'global'): Promise<boolean>;
};
/** PKCE verifier and provider tokens never enter browser storage/cookies or JSON. */
export function createFreshProvider(env: NodeJS.ProcessEnv = process.env, fetcher: typeof fetch = fetch): FreshProvider {
  const config = validateAuthConfig(env);
  function client(seed: ProviderStorage = {}) {
    const storage = { ...seed };
    const sdk = createClient(config.url, config.key, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
        storage: { getItem: key => storage[key] ?? null, setItem: (key, value) => { storage[key] = value; }, removeItem: key => { delete storage[key]; } } },
      global: { fetch: (input, init) => fetcher(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(5000) }) },
    });
    return { sdk, storage };
  }
  function tokens(result: any): ProviderTokens {
    const s = result?.data?.session;
    if (result?.error || typeof s?.access_token !== 'string' || !s.access_token || s.access_token.length > 8192 ||
        typeof s.refresh_token !== 'string' || !s.refresh_token || s.refresh_token.length > 8192) throw new BffError('PROVIDER_EXCHANGE_REJECTED', 401);
    return { accessToken: s.access_token, refreshToken: s.refresh_token };
  }
  return {
    async signup(input) {
      const c = client();
      const r = await c.sdk.auth.signUp({ ...input, options: { emailRedirectTo: `${config.origin}/auth/confirm` } });
      if (r.error || r.data.session || !Object.keys(c.storage).some(k => k.endsWith('-code-verifier'))) throw new BffError('SIGNUP_CONFIRMATION_UNAVAILABLE', 400);
      // A provider that disables confirmation must not accidentally admit a signup.
      return Object.fromEntries(Object.entries(c.storage).filter(([k]) => k.endsWith('-code-verifier')));
    },
    async login(input) { return tokens(await client().sdk.auth.signInWithPassword(input)); },
    async callback(code, storage) {
      if (!Object.keys(storage).some(k => k.endsWith('-code-verifier'))) throw new BffError('PKCE_BROWSER_REQUIRED', 401);
      return tokens(await client(storage).sdk.auth.exchangeCodeForSession(code));
    },
    async refresh(refreshToken) { return tokens(await client().sdk.auth.refreshSession({ refresh_token: refreshToken })); },
    async verify(token) {
      const context = await verifyAccessToken(token, config.url);
      await checkCurrentUser(context, { supabaseUrl: config.url, publishableKey: config.key }, fetcher);
      return context;
    },
    async signOut(token, scope) {
      try { return !(await client().sdk.auth.admin.signOut(token, scope)).error; } catch { return false; }
    },
  };
}
