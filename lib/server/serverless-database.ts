import postgres from 'postgres';
import { createHash } from 'node:crypto';
import { BffError, validateConfig } from './core';
import type { SqlTag } from './db-core';
import { databaseTls } from './database-tls';

export type ServerlessDatabaseOptions = { env?: NodeJS.ProcessEnv; connect?: typeof postgres };
let warm: { custody: string; sql: ReturnType<typeof postgres> } | undefined;
export const SERVERLESS_DATABASE_OPTIONS = {
  ssl: 'verify-full' as const, max: 1, prepare: false, max_pipeline: 1,
  connect_timeout: 5, idle_timeout: 5, max_lifetime: 30,
  onnotice: () => {}, debug: () => {},
};

export async function withServerlessDatabase<T>(work: (sql: SqlTag) => Promise<T>, options: ServerlessDatabaseOptions = {}): Promise<T> {
  const env = options.env ?? process.env;
  const config = validateConfig(env);
  const connectionOptions = { ...SERVERLESS_DATABASE_OPTIONS, ssl: databaseTls(config, env) };
  const custody = createHash('sha256').update(JSON.stringify([config.databaseUrl, config.supabaseUrl,
    config.appOrigin, env.VELARION_RELEASE_ENVIRONMENT, connectionOptions.ssl, env.VELARION_ADMISSION_VAULT_KEY])).digest('hex');
  let isolated: ReturnType<typeof postgres> | undefined;
  try {
    let sql: ReturnType<typeof postgres>;
    if (options.connect || options.env) {
      isolated = (options.connect ?? postgres)(config.databaseUrl, connectionOptions);
      sql = isolated;
    } else {
      if (warm && warm.custody !== custody) throw new BffError('DATABASE_CONFIG_CHANGED', 503);
      warm ??= { custody, sql: postgres(config.databaseUrl, connectionOptions) };
      sql = warm.sql;
    }
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
