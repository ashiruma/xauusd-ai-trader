import postgres from 'postgres';
import { BffError, validateConfig } from './core';
import type { SqlTag } from './db-core';

export type ServerlessDatabaseOptions = { env?: NodeJS.ProcessEnv; connect?: typeof postgres };
// One pool per warm function instance, not per request. No credentials are captured at build time.
let warm: { url: string; sql: ReturnType<typeof postgres> } | undefined;
export const SERVERLESS_DATABASE_OPTIONS = {
  ssl: 'verify-full' as const, max: 1, prepare: false, max_pipeline: 1,
  connect_timeout: 5, idle_timeout: 5, max_lifetime: 30,
  onnotice: () => {}, debug: () => {},
};

/** Each call commits independently. No retry after uncertain execution/COMMIT, no session-level SET/locks. */
export async function withServerlessDatabase<T>(work: (sql: SqlTag) => Promise<T>, options: ServerlessDatabaseOptions = {}): Promise<T> {
  const config = validateConfig(options.env ?? process.env);
  let isolated: ReturnType<typeof postgres> | undefined;
  try {
    let sql: ReturnType<typeof postgres>;
    if (options.connect || options.env) {
      isolated = (options.connect ?? postgres)(config.databaseUrl, SERVERLESS_DATABASE_OPTIONS);
      sql = isolated;
    } else {
      // Do not silently switch a running instance to another database/custody configuration.
      if (warm && warm.url !== config.databaseUrl) throw new BffError('DATABASE_CONFIG_CHANGED', 503);
      warm ??= { url: config.databaseUrl, sql: postgres(config.databaseUrl, SERVERLESS_DATABASE_OPTIONS) };
      sql = warm.sql;
    }
    // SET LOCAL survives for this transaction only; the pooler can safely return its backend afterward.
    return await sql.begin(async tx => {
      await tx`SET LOCAL statement_timeout = '5s'`;
      await tx`SET LOCAL lock_timeout = '2s'`;
      return work(tx as unknown as SqlTag);
    }) as T;
  } catch (error) {
    if (error instanceof BffError) throw error;
    throw new BffError('ADMISSION_DATABASE_UNAVAILABLE', 503);
  } finally {
    if (isolated) await isolated.end({ timeout: 2 }).catch(() => {});
  }
}
