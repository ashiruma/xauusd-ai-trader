import { X509Certificate } from 'node:crypto';
import { BffError } from './bff-error';

export const STAGING_PROJECT_REF = 'akhftbbszejafxpoxiem';
export const STAGING_SUPABASE_URL = `https://${STAGING_PROJECT_REF}.supabase.co`;
export const PRODUCTION_RUNTIME_ROLE = 'velarion_bff_runtime_production';
const unavailable = (): never => { throw new BffError('PRODUCTION_RELEASE_NOT_CONFIGURED', 503); };
const invalid = (): never => { throw new BffError('PRODUCTION_CONFIG_INVALID', 503); };

export type ReleaseProfile = {
  mode: 'staging' | 'production';
  projectRef: string;
  supabaseUrl: string;
  production?: {
    origin: string;
    databaseHost: string;
    databasePort: string;
    databaseName: string;
    databaseUser: string;
    caPem: string;
    caSha256: string;
  };
};

/** Pure configuration validation. No network, SQL, credential creation or SMTP mutation.
 * Missing release remains compatible with existing lower-level Staging adapters/tests;
 * the integrated Staging runtime still requires its explicit release/origin guard.
 * Vercel Production can NEVER take that compatibility branch.
 */
export function releaseProfile(env: NodeJS.ProcessEnv = process.env): ReleaseProfile {
  const release = env.VELARION_RELEASE_ENVIRONMENT;
  if (env.VERCEL_ENV !== 'production' && release !== 'production') {
    if (release !== undefined && release !== 'staging') throw new BffError('RELEASE_CONFIG_INVALID', 503);
    return { mode: 'staging', projectRef: STAGING_PROJECT_REF, supabaseUrl: STAGING_SUPABASE_URL };
  }
  if (env.VERCEL_ENV !== 'production' || release !== 'production') unavailable();

  const projectRef = env.VELARION_PRODUCTION_PROJECT_REF_ALLOWLIST;
  const origin = env.VELARION_PRODUCTION_APP_ORIGIN;
  const host = env.VELARION_PRODUCTION_DB_HOST;
  const port = env.VELARION_PRODUCTION_DB_PORT;
  const name = env.VELARION_PRODUCTION_DB_NAME;
  const caPem = env.VELARION_PRODUCTION_DB_CA_PEM;
  const caSha256 = env.VELARION_PRODUCTION_DB_CA_SHA256;
  const mailRef = env.VELARION_PRODUCTION_MAIL_PROJECT_REF;
  const mailDomain = env.VELARION_PRODUCTION_MAIL_DOMAIN;
  const mailFrom = env.VELARION_PRODUCTION_MAIL_FROM;
  const mailApproval = env.VELARION_PRODUCTION_MAIL_APPROVAL;
  const databaseUrl = env.VELARION_BFF_DATABASE_URL;
  const key = env.VELARION_SUPABASE_PUBLISHABLE_KEY;
  const vaultKey = env.VELARION_ADMISSION_VAULT_KEY;
  if (![projectRef, origin, host, port, name, caPem, caSha256, mailRef, mailDomain,
    mailFrom, mailApproval, databaseUrl, key, vaultKey, env.VELARION_APP_ORIGIN,
    env.VELARION_SUPABASE_URL].every(v => typeof v === 'string' && v.length > 0)) unavailable();
  if (!/^[a-z]{20}$/.test(projectRef!) || projectRef === STAGING_PROJECT_REF) invalid();
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  if (env.VELARION_SUPABASE_URL !== supabaseUrl || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key!) || key!.length > 4096) invalid();
  let app: URL, db: URL;
  try { app = new URL(origin!); db = new URL(databaseUrl!); } catch { return invalid(); }
  if (app.protocol !== 'https:' || app.origin !== origin || app.username || app.password ||
      origin !== env.VELARION_APP_ORIGIN || env.VELARION_STAGING_APP_ORIGIN !== undefined) invalid();
  if (host !== `db.${projectRef}.supabase.co` && !/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.pooler\.supabase\.com$/.test(host!)) invalid();
  if (!/^(?:5432|6543)$/.test(port!) || !/^[a-z][a-z0-9_]{0,62}$/.test(name!)) invalid();
  const databaseUser = host === `db.${projectRef}.supabase.co` ? PRODUCTION_RUNTIME_ROLE : `${PRODUCTION_RUNTIME_ROLE}.${projectRef}`;
  let user: string, dbName: string;
  try { user = decodeURIComponent(db.username); dbName = decodeURIComponent(db.pathname.slice(1)); } catch { return invalid(); }
  if (!['postgres:', 'postgresql:'].includes(db.protocol) || db.hostname !== host || db.port !== port ||
      user !== databaseUser || !db.password || dbName !== name || db.search || db.hash) invalid();
  if (!/^[a-f0-9]{64}$/.test(caSha256!) || (caPem!.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length !== 1 ||
      !/^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----\s*$/.test(caPem!)) invalid();
  try {
    const ca = new X509Certificate(caPem!);
    if (!ca.ca || ca.fingerprint256.replaceAll(':', '').toLowerCase() !== caSha256 ||
        Date.parse(ca.validFrom) > Date.now() || Date.parse(ca.validTo) <= Date.now()) invalid();
  } catch { return invalid(); }
  if (!/^(?:[A-Za-z0-9+/]{43}=|[A-Za-z0-9_-]{43})$/.test(vaultKey!)) invalid();
  const normalized = vaultKey!.replace(/-/g, '+').replace(/_/g, '/') + (vaultKey!.length === 43 ? '=' : '');
  if (Buffer.from(normalized, 'base64').length !== 32 || Buffer.from(normalized, 'base64').toString('base64') !== normalized) invalid();
  if (mailRef !== projectRef || mailApproval !== 'smtp-signup-code-v1' ||
      !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(mailDomain!) ||
      /(?:^|\.)(?:vercel\.app|supabase\.co)$/.test(mailDomain!) ||
      !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/.test(mailFrom!) ||
      mailFrom!.split('@')[1] !== mailDomain) invalid();
  if (env.VELARION_MANUAL_REVIEW_ENABLED === 'true' || env.VELARION_MANUAL_REVIEW_SCHEMA) invalid();
  return { mode: 'production', projectRef: projectRef!, supabaseUrl, production: {
    origin: origin!, databaseHost: host!, databasePort: port!, databaseName: name!,
    databaseUser, caPem: caPem!, caSha256: caSha256!,
  } };
}
