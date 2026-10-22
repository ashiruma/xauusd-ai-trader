import postgres from 'postgres';
import { validateConfig, BffError, type VerifiedContext } from './core';
import { queryIdentity, type IdentityAdapters } from './identity-core';
import { databaseTls } from './database-tls';

export type DatabaseOptions = { env?: NodeJS.ProcessEnv; connect?: typeof postgres };

/** One short-lived, TLS-verified connection per service call; no query/value logging. */
export async function withIdentityDatabase<T>(work: (query: IdentityAdapters['query']) => Promise<T>, options: DatabaseOptions = {}): Promise<T> {
  const env = options.env ?? process.env;
  const config = validateConfig(env);
  const makeConnection = options.connect ?? postgres;
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = makeConnection(config.databaseUrl, {
      ssl: databaseTls(config, env), max: 1, prepare: false,
      connect_timeout: 5, idle_timeout: 5, max_lifetime: 30,
      connection: { options: '-c statement_timeout=5000' },
      onnotice: () => {}, debug: () => {},
    });
    const query: IdentityAdapters['query'] = async (operation, context: VerifiedContext) => queryIdentity(sql as any, operation, context);
    return await work(query);
  } catch (error) {
    if (error instanceof BffError) throw error;
    throw new BffError('IDENTITY_DATABASE_UNAVAILABLE', 503);
  } finally {
    if (sql) await sql.end({ timeout: 2 }).catch(() => {});
  }
}
