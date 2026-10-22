import { BffError, validateConfig } from './core';
import { releaseProfile } from './release-config';

export function runtimeConfig(env: NodeJS.ProcessEnv = process.env) {
  const config = validateConfig(env);
  const profile = releaseProfile(env);
  if (profile.mode === 'staging' && (env.VELARION_RELEASE_ENVIRONMENT !== 'staging' ||
      !env.VELARION_STAGING_APP_ORIGIN || env.VELARION_STAGING_APP_ORIGIN !== config.appOrigin)) {
    throw new BffError('STAGING_RELEASE_NOT_CONFIGURED', 503);
  }
  return config;
}

/** Historical export for existing internal Staging consumers; no implicit Staging profile. */
export const stagingRuntimeConfig = runtimeConfig;
