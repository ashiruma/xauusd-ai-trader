'use client';
import { useState } from 'react';
export default function StagingSessionActions() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function act(operation: 'recover' | 'refresh' | 'logout' | 'revoke-all') {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const r = await fetch(`/api/auth/${operation}`, { method: 'POST', cache: 'no-store' });
      const data = await r.json();
      if (operation === 'logout' || operation === 'revoke-all') {
        setMessage(data.success ? 'Application sessions revoked and provider sign-out confirmed. This browser is cleared.' : 'This browser was cleared. Remote application revocation or provider sign-out was not confirmed; do not assume other sessions are signed out.');
      } else if (r.ok && data.success) window.location.reload();
      else setMessage('Access could not be confirmed. Sign in again; no permission was granted.');
    } catch { setMessage('The request could not be confirmed. No remote sign-out or new permission is assumed.'); }
    finally { setBusy(false); }
  }
  return <section aria-label="Session controls">
    <button disabled={busy} onClick={() => act('recover')}>Recover interrupted login</button>{' '}
    <button disabled={busy} onClick={() => act('refresh')}>Refresh existing session</button>{' '}
    <button disabled={busy} onClick={() => act('logout')}>Sign out this session</button>{' '}
    <button disabled={busy} onClick={() => act('revoke-all')}>Revoke all app sessions and sign out provider-wide</button>
    <p role="status">{message}</p>
  </section>;
}
