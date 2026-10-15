// app/onboarding/page.tsx
'use client';

import { useState } from 'react';

export default function OnboardingPage() {
  const [mt5Id, setMt5Id] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mt5AccountId: mt5Id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setStatus('success');
      setTimeout(() => {
        window.location.href = '/terminal';
      }, 1500);
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setErrorMessage(msg);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-slate-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-3">Unlock Velarion Markets for Free</h1>
        <p className="text-slate-400">
          Our entire AI terminal, quant strategies, and 30-lesson Forex School are 100% free, subsidized by our official partner <strong className="text-amber-400">JustMarkets</strong>.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-8">
        {/* Step 1 */}
        <div className="flex gap-4 items-start">
          <div className="bg-amber-500 text-slate-950 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
          <div>
            <h3 className="font-bold text-lg text-white">Create &amp; Fund Your JustMarkets Account</h3>
            <p className="text-slate-400 text-sm mt-1">
              Register using our official partner link with partner code <code className="text-amber-400 font-mono">tohstb0d83</code> and make your trading deposit.
            </p>
            <a
              href="https://one.justmarkets.link/a/tohstb0d83"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-500/20 transition"
            >
              Open JustMarkets Partner Link &rarr;
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 items-start">
          <div className="bg-amber-500 text-slate-950 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
          <div className="w-full">
            <h3 className="font-bold text-lg text-white">Verify Your MT5 Account ID</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Enter your live MT5 account number below for instant verification.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. 1200533810"
                value={mt5Id}
                onChange={(e) => setMt5Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
              >
                {status === 'loading' ? 'Verifying with Broker...' : 'Verify & Unlock Instant Access'}
              </button>

              {status === 'success' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg text-center">
                  Verified successfully! Redirecting to terminal...
                </div>
              )}

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
