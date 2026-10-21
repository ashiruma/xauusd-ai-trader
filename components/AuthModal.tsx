'use client';
import React from 'react';
import Link from 'next/link';
interface AuthModalProps { isOpen: boolean; onClose: () => void; onSuccess?: () => void; initialCallbackUrl?: string }
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;
  return <div className="modal-overlay"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="connection-heading">
    <h2 id="connection-heading">Staging sign-in</h2>
    <p>Use your JustMarkets-associated email and a separate Velarion password. The MT5 trading account ID is mandatory for the planned verification step, but ID submission and verification are not enabled here. Sign-in establishes identity only; access remains pending. Never enter broker passwords.</p>
    <Link href="/login">Sign-in options</Link> <button onClick={onClose}>Close</button>
  </section></div>;
}
