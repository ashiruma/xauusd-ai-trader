'use client';
import React from 'react';
import Link from 'next/link';
interface AuthModalProps { isOpen: boolean; onClose: () => void; onSuccess?: () => void; initialCallbackUrl?: string }
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;
  return <div className="modal-overlay"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="connection-heading">
    <h2 id="connection-heading">Staging sign-in</h2>
    <p>Sign-in establishes your identity only. Learner access remains pending until independently approved. Do not enter broker credentials here.</p>
    <Link href="/login">Sign-in options</Link> <button onClick={onClose}>Close</button>
  </section></div>;
}
