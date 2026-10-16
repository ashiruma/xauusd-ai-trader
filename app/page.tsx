import React from 'react';
import Link from 'next/link';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import { getServerLiveQuote } from '@/lib/marketFeed';

export const metadata = {
  title: 'Velarion Markets | Learn XAUUSD. Follow the Market with a Plan.',
  description: 'Learn gold trading with a structured Forex School, then follow rule-based XAUUSD market insights and verified MT5 positions.',
};

export default function HomePage() {
  const initialQuote = getServerLiveQuote();
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container-main home-hero-grid">
          <div className="home-copy">
            <div className="home-kicker">XAUUSD education &amp; market insights</div>
            <h1 className="home-heading">Learn the market.<br /><span>Trade with a plan.</span></h1>
            <p className="home-description">Build your gold-trading skills in a structured School, then use clear, rules-based market insights to understand each setup. Your trading funds stay in your own broker account.</p>
            <div className="home-actions">
              <Link href="/academy" className="btn btn-primary">Start learning <span aria-hidden="true">→</span></Link>
              <Link href="/onboarding?redirect=/terminal" className="btn btn-secondary">Connect an MT5 account</Link>
            </div>
            <div className="home-trust-row" aria-label="Platform principles">
              <span><b aria-hidden="true">✓</b> 30 structured lessons</span>
              <span><b aria-hidden="true">✓</b> XAUUSD-focused insights</span>
              <span><b aria-hidden="true">✓</b> Non-custodial funds</span>
            </div>
          </div>
          <div className="home-market-column">
            <LiveSpotFeed initialQuote={initialQuote} />
            <div className="home-market-caption">Market data and trade ideas are informational; trading involves risk of loss.</div>
          </div>
        </div>
      </section>

      <section className="home-journey section-block" aria-labelledby="journey-title">
        <div className="container-main">
          <div className="section-heading-row">
            <div><span className="section-eyebrow">Your path</span><h2 id="journey-title">Learn first. Connect when you’re ready.</h2><p>Partner-sponsored access follows a simple, transparent path.</p></div>
          </div>
          <div className="journey-grid">
            <article className="journey-card"><span className="journey-number">01</span><h3>Register through our partner</h3><p>Create your MT5 account through the official JustMarkets referral link.</p><a className="text-link" href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer">Open partner account <span aria-hidden="true">↗</span></a></article>
            <article className="journey-card"><span className="journey-number">02</span><h3>Fund your broker account</h3><p>Deposit directly with JustMarkets. Velarion never receives or holds your trading capital.</p><span className="journey-note">Funds remain with your broker</span></article>
            <article className="journey-card"><span className="journey-number">03</span><h3>Build your trading knowledge</h3><p>Work through the School at your pace. Each lesson ends with a quiz; retry it until you pass.</p><Link className="text-link" href="/academy">Explore the 30 lessons <span aria-hidden="true">→</span></Link></article>
            <article className="journey-card"><span className="journey-number">04</span><h3>Review live trade context</h3><p>Verify your MT5 account to open the terminal, review available positions, and see the strategy context behind each setup.</p><Link className="text-link" href="/onboarding?redirect=/terminal">Verify MT5 account <span aria-hidden="true">→</span></Link></article>
          </div>
          <p className="home-partner-footnote">Partner access is subject to broker account eligibility and verification. A deposit is made with the broker, not with Velarion.</p>
        </div>
      </section>

      <section className="home-tools section-block" aria-labelledby="tools-title">
        <div className="container-main">
          <div className="section-heading-row"><div><span className="section-eyebrow">Explore the platform</span><h2 id="tools-title">Everything has a clear purpose.</h2></div></div>
          <div className="home-tools-grid">
            <Link className="home-tool-card" href="/academy"><span className="home-tool-icon" aria-hidden="true">01</span><div><h3>Forex School</h3><p>Foundations, market structure, risk, and strategy—with pass-to-progress quizzes.</p></div><span className="home-tool-arrow" aria-hidden="true">↗</span></Link>
            <Link className="home-tool-card" href="/strategies"><span className="home-tool-icon" aria-hidden="true">02</span><div><h3>Market insights</h3><p>Understand the rule set and evidence behind XAUUSD trade setups.</p></div><span className="home-tool-arrow" aria-hidden="true">↗</span></Link>
            <Link className="home-tool-card" href="/tools/growth-calculator"><span className="home-tool-icon" aria-hidden="true">03</span><div><h3>Risk calculator</h3><p>Explore position sizing and compounding scenarios before you trade.</p></div><span className="home-tool-arrow" aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="home-disclosure"><div className="container-main home-disclosure-inner"><strong>Trading risk</strong><p>Spot gold and leveraged products can result in the loss of some or all of your deposit. No signal or educational material guarantees a result. Only trade with money you can afford to lose.</p><Link href="/why-gold">Read the XAUUSD guide <span aria-hidden="true">→</span></Link></div></section>
    </div>
  );
}
