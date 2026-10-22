import postgres from 'postgres';
import { validateConfig } from './core';
import { SERVERLESS_DATABASE_OPTIONS } from './serverless-database';

const ORIGIN = 'https://velarion-git-staging-first-client-log-7929e9-ashirumas-projects.vercel.app';
const BRANCH = 'staging/first-client-login-2026-10-21';
const PATH = '/api/diagnostics/temporary-db-probe';
type Category = 'SUCCESS' | 'TLS_TRUST' | 'TLS_VERIFICATION' | 'NETWORK' | 'AUTH_PERMISSION' | 'SQL_RUNTIME';
const TLS_TRUST = new Set(['SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'UNABLE_TO_GET_ISSUER_CERT']);
const TLS_VERIFY = new Set(['ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID', 'CERT_REVOKED']);
const NETWORK = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH', 'CONNECT_TIMEOUT', 'CONNECTION_CLOSED', 'CONNECTION_ENDED', 'CONNECTION_DESTROYED']);
const AUTH = new Set(['28000', '28P01', '42501']);
export function probeCategory(error: unknown): { category: Category; code?: string } {
  // Never read message, stack, detail, query, parameters, nested causes or arbitrary property values.
  const descriptor = error && typeof error === 'object' ? Object.getOwnPropertyDescriptor(error, 'code') : undefined;
  const code = descriptor && 'value' in descriptor && typeof descriptor.value === 'string' ? descriptor.value : '';
  if (TLS_TRUST.has(code)) return { category: 'TLS_TRUST', code };
  if (TLS_VERIFY.has(code)) return { category: 'TLS_VERIFICATION', code };
  if (NETWORK.has(code)) return { category: 'NETWORK', code };
  if (AUTH.has(code)) return { category: 'AUTH_PERMISSION', code };
  // Only numeric SQLSTATEs are emitted; unknown/alphanumeric values are suppressed.
  return { category: 'SQL_RUNTIME', ...(/^\d{5}$/.test(code) ? { code } : {}) };
}
export type ProbeOptions = { env?: NodeJS.ProcessEnv; connect?: typeof postgres };
export function createTemporaryDbProbe(options: ProbeOptions = {}) {
  return async function probe(request: Request): Promise<Response> {
    const env = options.env ?? process.env;
    const response = (status: number, body: object) => Response.json(body, { status, headers: {
      'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    } });
    if (env.VERCEL_ENV !== 'preview' || env.VERCEL_GIT_COMMIT_REF !== BRANCH ||
        env.VELARION_RELEASE_ENVIRONMENT !== 'staging' || env.VELARION_APP_ORIGIN !== ORIGIN ||
        env.VELARION_STAGING_APP_ORIGIN !== ORIGIN || request.url !== ORIGIN + PATH ||
        request.method !== 'POST' || request.headers.get('origin') !== ORIGIN ||
        request.headers.get('sec-fetch-site') !== 'same-origin' ||
        !['cors', 'same-origin'].includes(request.headers.get('sec-fetch-mode') ?? '') ||
        request.headers.get('sec-fetch-dest') !== 'empty' ||
        ![null, '0'].includes(request.headers.get('content-length')) || request.headers.has('transfer-encoding')) {
      return response(404, { ok: false });
    }
    // Next may represent even an empty POST as a stream. Inspect at most two chunks,
    // never decode, parse, echo, or log content; reject any nonempty/unfinished body.
    if (request.body) {
      const reader = request.body.getReader();
      try {
        let chunk = await reader.read();
        if (!chunk.done && chunk.value.byteLength === 0) chunk = await reader.read();
        if (!chunk.done) { void reader.cancel().catch(() => {}); return response(404, { ok: false }); }
      } catch { return response(404, { ok: false }); }
      finally { reader.releaseLock(); }
    }
    let sql: ReturnType<typeof postgres> | undefined;
    let reserved: Awaited<ReturnType<ReturnType<typeof postgres>['reserve']>> | undefined;
    let began = false;
    let result: { category: Category; code?: string } = { category: 'SUCCESS' };
    try {
      const config = validateConfig(env);
      // Same runtime URL/host/port/credentials and strict TLS options. No startup catalog SQL.
      sql = (options.connect ?? postgres)(config.databaseUrl, { ...SERVERLESS_DATABASE_OPTIONS, fetch_types: false });
      reserved = await sql.reserve();
      await reserved`BEGIN READ ONLY`;
      began = true;
      await reserved`SELECT 1`;
    } catch (error) {
      result = probeCategory(error);
    } finally {
      if (reserved && began) {
        try { await reserved`ROLLBACK`; } catch (error) { if (result.category === 'SUCCESS') result = probeCategory(error); }
      }
      reserved?.release();
      if (sql) await sql.end({ timeout: 2 }).catch(() => {});
    }
    // One fixed-category log only. No exception, request, URL, data or code logging.
    console.info(`[velarion.temporary-db-probe] ${result.category}`);
    return response(result.category === 'SUCCESS' ? 200 : 503, { ok: result.category === 'SUCCESS', ...result });
  };
}
