'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  async function signOut() {
    if (busy) return;
    setBusy(true);
    try { await createClient().auth.signOut(); } finally { window.location.assign('/login'); }
  }
  return <button disabled={busy} onClick={signOut}>{busy ? 'Signing out' : 'Sign out'}</button>;
}
