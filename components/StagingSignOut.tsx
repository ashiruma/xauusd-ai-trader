'use client';
import { useState } from 'react';
export default function StagingSignOut() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <section><button disabled={busy} onClick={async () => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store' });
      const data = await response.json();
      if (data.success) { window.location.assign('/login'); return; }
      setMessage(data.browserCleared ? 'Browser cookies cleared. Server-side sign-out could not be fully confirmed.' : 'Sign-out could not be confirmed.');
    } catch { setMessage('Sign-out could not be confirmed.'); }
    finally { setBusy(false); }
  }}>Sign out</button><p role="status">{message}</p></section>;
}
