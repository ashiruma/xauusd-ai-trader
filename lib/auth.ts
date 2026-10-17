import { cookies } from 'next/headers';

export const LEGACY_FALLBACK_SECRET = 'xauusd-velarion-secure-jwt-institutional-secret-2026';
export const AUTH_COOKIE_NAME = 'jm_auth_session';

let runtimeEphemeralSecret: string | null = null;

export function getAuthSecret(): string {
  const envSecret = process.env.AUTH_SECRET?.trim();
  if (envSecret && envSecret !== LEGACY_FALLBACK_SECRET) {
    return envSecret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: AUTH_SECRET environment variable is missing or set to insecure legacy default in production.');
  }
  if (!runtimeEphemeralSecret) {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    runtimeEphemeralSecret = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return runtimeEphemeralSecret;
}

export interface AuthSession {
  accountId: string;
  mt5Account: string;
  email: string;
  role: 'trader' | 'admin';
  partnerCode: string;
  verified: boolean;
  emailVerified?: boolean;
  partnerAttributed?: boolean;
  partnerPending?: boolean;
  depositVerified?: boolean;
  depositAmount?: number;
  accountTier?: 'standardCent' | 'standard' | 'pro' | 'rawSpread';
  schoolCompleted?: boolean;
  accountLinked?: boolean;
  tradingActivated?: boolean;
  consents?: {
    acceptMarketRisk: boolean;
    acceptExecutionRisk: boolean;
    acceptIbCompensation: boolean;
    acceptSimulationDisclaimer: boolean;
    activatedAt?: string;
  };
  exp: number;
}

function strToUint8(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export async function signSession(session: Omit<AuthSession, 'exp'>, expiresInSeconds: number = 86400 * 30): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullSession: AuthSession = { ...session, exp };
  const header = { alg: 'HS256', typ: 'JWT' };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullSession));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const secret = getAuthSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    strToUint8(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, strToUint8(dataToSign));
  const signatureBytes = Array.from(new Uint8Array(signatureBuffer))
    .map(b => String.fromCharCode(b))
    .join('');
  const encodedSignature = base64UrlEncode(signatureBytes);

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifySession(token: string): Promise<AuthSession | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const rawSig = base64UrlDecode(encodedSignature);
    const sigBytesArr = new Uint8Array(rawSig.length);
    for (let i = 0; i < rawSig.length; i++) {
      sigBytesArr[i] = rawSig.charCodeAt(i);
    }
    const sigBytes = sigBytesArr as unknown as BufferSource;

    // Reject tokens signed with legacy fallback key
    try {
      const legacyKey = await crypto.subtle.importKey(
        'raw',
        strToUint8(LEGACY_FALLBACK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const isLegacySigned = await crypto.subtle.verify('HMAC', legacyKey, sigBytes, strToUint8(dataToSign));
      if (isLegacySigned) {
        console.warn('[Security Warning] Rejected session signed with deprecated fallback secret.');
        return null;
      }
    } catch {
      // ignore
    }

    const secret = getAuthSecret();
    const key = await crypto.subtle.importKey(
      'raw',
      strToUint8(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, strToUint8(dataToSign));
    if (!isValid) return null;

    const payload: AuthSession = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function setServerSession(
  session: Omit<AuthSession, 'exp'>,
  expiresInSeconds: number = 86400 * 30
): Promise<string> {
  const token = await signSession(session, expiresInSeconds);
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expiresInSeconds,
    path: '/',
  });
  return token;
}

