/** Server-selected scopes only. Existing budgets are unchanged; confirmation adds a longer email budget. */
export function authRateBudget(scope: string, now: number) {
  const max = scope === 'begin' ? 60 : 6;
  const windowMs = scope.startsWith('confirmation-email:') ? 15 * 60000 : 60000;
  const bucket = Math.floor(now / windowMs);
  return { max, bucket, expiresAt: (bucket + 1) * windowMs };
}
