// Pure request policy; production callers supply only server configuration, never request URLs.
export function checkMutationOrigin(request: Request, configured = process.env.VELARION_APP_ORIGIN): 403 | 413 | 503 | null {
  if (!configured) return 503;
  let origin: URL;
  try { origin = new URL(configured); } catch { return 503; }
  if (origin.protocol !== 'https:' || origin.origin !== configured || origin.username || origin.password) return 503;
  if (request.headers.get('origin') !== origin.origin) return 403;
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return 403;
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > 4096)) return 413;
  return null;
}
