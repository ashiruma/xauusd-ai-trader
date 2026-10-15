// app/tools/growth-calculator/page.tsx
'use client';

import { useState } from 'react';

export default function GrowthCalculatorPage() {
  const [startBalance, setStartBalance] = useState<number>(10);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2);
  const [pipsPerWin, setPipsPerWin] = useState<number>(20);

  const calculateGrowth = () => {
    let balance = startBalance;
    const steps = [];
    for (let i = 1; i <= 10; i++) {
      const profit = balance * (riskPerTrade / 100) * (pipsPerWin / 20);
      balance += profit;
      steps.push({ trade: i, balance: balance.toFixed(2) });
    }
    return steps;
  };

  const projection = calculateGrowth();
  const finalBalance = parseFloat(projection[projection.length - 1].balance);
  const multiplier = (finalBalance / startBalance).toFixed(1);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-slate-100">
      {/* Broker Sponsorship Banner */}
      <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
        <p className="text-sm text-amber-300">
          <strong>100% Free Platform:</strong> Subsidized by our official broker partner, <strong>JustMarkets</strong>. Unlock full AI terminal access by funding an MT5 account via partner code <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-400">tohstb0d83</code>.
        </p>
      </div>

      <div className="text-center mb-10">
        <span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Free XAUUSD Tool</span>
        <h1 className="text-4xl font-extrabold mt-2 mb-4">200-Pip Growth Engine Calculator</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Simulate how risk management compounds a small account from ${startBalance} to over ${finalBalance}.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Starting Balance ($)</label>
            <input
              type="number"
              value={startBalance}
              onChange={(e) => setStartBalance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400"
              min={10}
              max={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Risk Per Trade (%)</label>
            <input
              type="number"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400"
              min={0.5}
              max={5}
              step={0.5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Pips Per Trade</label>
            <input
              type="number"
              value={pipsPerWin}
              onChange={(e) => setPipsPerWin(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400"
              min={10}
              max={200}
              step={5}
            />
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-amber-400 text-sm font-semibold">Projected Growth Multiplier</div>
            <div className="text-3xl font-extrabold text-white mt-1">{multiplier}x Return</div>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4">10-Trade Compounding Projection</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {projection.map((step) => (
                <div key={step.trade} className="flex justify-between items-center py-2 border-b border-slate-900 text-sm">
                  <span className="text-slate-400">Trade #{step.trade}</span>
                  <span className="font-mono font-bold text-amber-400">${step.balance}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/onboarding"
            className="mt-6 w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            Unlock Free Access via JustMarkets &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
