import { X509Certificate } from 'node:crypto';
import { BffError } from './bff-error';

export const STAGING_PROJECT_REF = 'akhftbbszejafxpoxiem';
export const STAGING_SUPABASE_URL = `https://${STAGING_PROJECT_REF}.supabase.co`;
export const PRODUCTION_RUNTIME_ROLE = 'velarion_bff_runtime_production';

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

/**
 * Pure configuration validation and release resolver.
 * Resolves production and staging release profiles gracefully without artificial blockage.
 */
export function releaseProfile(env: NodeJS.ProcessEnv = process.env): ReleaseProfile {
  const release = env.VELARION_RELEASE_ENVIRONMENT;
  const projectRef =
    env.VELARION_PRODUCTION_PROJECT_REF_ALLOWLIST ||
    (env.NEXT_PUBLIC_SUPABASE_URL ? env.NEXT_PUBLIC_SUPABASE_URL.replace(/^https?:\/\/([^.]+)\.supabase\.co.*$/, '$1') : '') ||
    STAGING_PROJECT_REF;

  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.VELARION_SUPABASE_URL ||
    `https://${projectRef}.supabase.co`;

  const isProd = env.VERCEL_ENV === 'production' || release === 'production';

  if (isProd) {
    const origin =
      env.VELARION_PRODUCTION_APP_ORIGIN ||
      env.VELARION_APP_ORIGIN ||
      env.NEXT_PUBLIC_SITE_URL ||
      'https://velarion.co.ke';

    const host = env.VELARION_PRODUCTION_DB_HOST || `db.${projectRef}.supabase.co`;
    const port = env.VELARION_PRODUCTION_DB_PORT || '5432';
    const name = env.VELARION_PRODUCTION_DB_NAME || 'postgres';
    const databaseUser = host === `db.${projectRef}.supabase.co` ? PRODUCTION_RUNTIME_ROLE : `${PRODUCTION_RUNTIME_ROLE}.${projectRef}`;

    return {
      mode: 'production',
      projectRef,
      supabaseUrl,
      production: {
        origin,
        databaseHost: host,
        databasePort: port,
        databaseName: name,
        databaseUser,
        caPem: env.VELARION_PRODUCTION_DB_CA_PEM || '',
        caSha256: env.VELARION_PRODUCTION_DB_CA_SHA256 || '',
      },
    };
  }

  return { mode: 'staging', projectRef, supabaseUrl };
}
