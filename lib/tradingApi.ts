/**
 * Trading API client helper for server-side Next.js route handlers.
 * Resolves the backend base URL and attaches authentication headers.
 */

export function getTradingApiBase(): string {
  const url = process.env.NEXT_PUBLIC_TRADING_API_URL || process.env.TRADING_API_URL || 'http://localhost:8000';
  return url.replace(/\/$/, '');
}

export function getTradingApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const internalKey = process.env.VELARION_INTERNAL_API_KEY || process.env.TRADING_API_KEY;
  if (internalKey) {
    headers['x-velarion-key'] = internalKey;
    headers['Authorization'] = `Bearer ${internalKey}`;
  }

  return headers;
}
