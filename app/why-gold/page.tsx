import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  title: 'Why Spot Gold (XAUUSD) Only | Institutional Macro Advantage',
  description: 'Discover why Velarion Markets trades Spot Gold exclusively: $130B+ daily liquidity, central bank sovereign accumulation, clean session expansions, and clear macro drivers.',
  openGraph: {
    title: 'Why Spot Gold (XAUUSD) Only | Velarion Markets',
    description: 'Detailed breakdown of the macroeconomic and mathematical advantages of trading Spot Gold over retail currency pairs.',
    url: 'https://velarionmarkets.com/why-gold'
  }
};

export default function WhyGoldPage() {
  return (
    <div className="herbaria-page" style={{ minHeight: '100vh', padding: '48px 24px 96px', borderTop: '1px solid var(--hb-hairline-amber)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Navigation / Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--hb-hairline-amber)', paddingBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--hb-accent-amber)' }}>
            <Link href="/" style={{ color: 'var(--hb-text-cream)', textDecoration: 'none' }}>VELARION</Link>
            <span style={{ margin: '0 8px', color: 'var(--hb-hairline-amber)' }}>/</span>
            <span style={{ color: 'var(--hb-accent-citron)' }}>WHY SPOT GOLD</span>
          </div>
          <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--hb-accent-vermillion)' }}>
            DOSSIER REF: XAU-848-INSTITUTIONAL
          </div>
        </div>

        {/* Section 01: Hero Manifesto */}
        <header style={{ marginBottom: '64px' }}>
          <div className="herbaria-plate-kicker">
            <span>&sect; 01</span>
            <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
            <span>SOVEREIGN MONETARY THESIS</span>
          </div>

          <h1 className="herbaria-title">
            Why Spot Gold (XAUUSD): The Sovereign Quantitative Advantage
          </h1>

          <div className="herbaria-italic-quote">
            &ldquo;In a global regime of sovereign fiat debasement and fragmented multi-pair noise, Spot Gold remains the singular non-dilutable reserve asset with $130B+ in daily execution depth.&rdquo;
          </div>

          <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#CBD5E1', maxWidth: '820px', marginBottom: '36px' }}>
            In retail Forex, traders routinely spread attention across 20+ currency crosses, falling victim to hidden correlated beta, central bank intervention surprises, and unpredictable bilateral geopolitics. Velarion Markets concentrates 100% of our algorithmic intelligence on a single sovereign asset: Spot Gold.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="herbaria-btn-citron"
            >
              Open JustMarkets MT5 Account &rarr;
            </a>
            <Link href="/tools/growth-calculator" className="herbaria-btn-secondary">
              Launch 200-Pip Growth Engine
            </Link>
            <Link href="/academy" className="herbaria-btn-underline" style={{ marginLeft: '8px' }}>
              Read 30-Lesson Curriculum Folio &rarr;
            </Link>
          </div>
        </header>

        {/* Section 02: Three-Column Specimen Triptych (Plate II) */}
        <section style={{ marginBottom: '72px' }}>
          <div className="herbaria-plate-kicker">
            <span>&sect; 02</span>
            <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
            <span>THREE SPECIMEN PILLARS OF SPOT GOLD ASYMMETRY</span>
          </div>

          <div className="herbaria-triptych">
            {/* Column 1: Deep Navy Panel */}
            <article className="herbaria-triptych-col herbaria-panel-green">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'rgba(234, 177, 103, 0.15)', color: '#eab167', border: '1px solid rgba(234, 177, 103, 0.35)' }}>
                  PILLAR 01
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: '#eab167' }}>
                  LIQUIDITY DEPTH
                </span>
              </div>

              <div className="herbaria-numeral" style={{ marginBottom: '12px' }}>
                $130B+
              </div>

              <h2 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '24px', fontWeight: 500, color: '#F8FAFC', margin: '0 0 12px', lineHeight: 1.2 }}>
                Continuous Daily Turnover
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#CBD5E1', flex: 1 }}>
                Spot Gold is one of the deepest financial instruments on earth. Deep institutional order books ensure immediate execution with zero dealer re-quotes and minimal slippage during high-impact US economic releases.
              </p>

              <table className="herbaria-dossier-table">
                <tbody>
                  <tr>
                    <td>Fill Latency</td>
                    <td>&lt; 5ms Direct ECN</td>
                  </tr>
                  <tr>
                    <td>Re-Quote Guarantee</td>
                    <td>0.00% Zero Dealer Intercept</td>
                  </tr>
                  <tr>
                    <td>Raw ECN Spreads</td>
                    <td>Avg 2.6 Pips</td>
                  </tr>
                  <tr>
                    <td>Market Structure</td>
                    <td>24/5 Continuous Tier-1 Liquidity</td>
                  </tr>
                </tbody>
              </table>
            </article>

            {/* Column 2: Elevated Midnight Navy Panel */}
            <article className="herbaria-triptych-col herbaria-panel-cream">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'rgba(56, 189, 248, 0.14)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                  PILLAR 02
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: '#eab167', fontWeight: 600 }}>
                  SOVEREIGN RESERVES
                </span>
              </div>

              <div className="herbaria-numeral" style={{ color: '#eab167', marginBottom: '12px' }}>
                1,000+ T
              </div>

              <h2 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '24px', fontWeight: 500, color: '#F8FAFC', margin: '0 0 12px', lineHeight: 1.2 }}>
                Central Bank Accumulation
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#CBD5E1', flex: 1 }}>
                Sovereign central banks are systematically reallocating reserves from fiat foreign treasuries into physical bullion, providing structural, non-cyclical institutional demand floor under every pull-back.
              </p>

              <table className="herbaria-dossier-table">
                <tbody>
                  <tr>
                    <td style={{ color: '#94A3B8' }}>Annual Inflow</td>
                    <td style={{ color: '#eab167' }}>1,000+ Metric Tonnes / Year</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#94A3B8' }}>Credit Default Risk</td>
                    <td style={{ color: '#eab167' }}>0.00% Non-Debasable</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#94A3B8' }}>Sanction Invariance</td>
                    <td style={{ color: '#eab167' }}>100% Physical Sovereign</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#94A3B8' }}>Institutional Buyer</td>
                    <td style={{ color: '#eab167' }}>Global Central Bank Treasuries</td>
                  </tr>
                </tbody>
              </table>
            </article>

            {/* Column 3: Dark Obsidian Panel */}
            <article className="herbaria-triptych-col herbaria-panel-dark">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'rgba(16, 185, 129, 0.14)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                  PILLAR 03
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: '#eab167' }}>
                  MACRO REGIME
                </span>
              </div>

              <div className="herbaria-numeral" style={{ marginBottom: '12px' }}>
                -0.82
              </div>

              <h2 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '24px', fontWeight: 500, color: '#F8FAFC', margin: '0 0 12px', lineHeight: 1.2 }}>
                Real Yield Sensitivity
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#CBD5E1', flex: 1 }}>
                Gold acts as a zero-coupon perpetual sovereign asset. Its mathematical trajectory is driven cleanly by US 10-Year TIPS real yields and the broad Dollar Index (DXY), allowing rule-based models to compute high-conviction entries.
              </p>

              <table className="herbaria-dossier-table">
                <tbody>
                  <tr>
                    <td>TIPS 10Y Correlation</td>
                    <td>-0.82 Statistically Significant</td>
                  </tr>
                  <tr>
                    <td>Session Expansion</td>
                    <td>London (07:00) / NY Overlap</td>
                  </tr>
                  <tr>
                    <td>Average Range</td>
                    <td>200+ Pips Daily Trajectory</td>
                  </tr>
                  <tr>
                    <td>Risk Boundary</td>
                    <td>Strict 2.0% Account Governor</td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* Section 03: Evidence Dossier & Comparative Ledger (Plate III) */}
        <section style={{ marginBottom: '72px', border: '1px solid var(--hb-hairline-amber)', padding: '36px 32px', backgroundColor: 'var(--hb-bg-dark-card)' }}>
          <div className="herbaria-plate-kicker">
            <span>&sect; 03</span>
            <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
            <span>SYSTEM COMPARATIVE LEDGER: SPOT GOLD VS MULTI-PAIR FX</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '28px', color: '#F2EADA', margin: '0 0 16px', fontWeight: 400 }}>
            Eliminating Correlated Multi-Pair Drawdown Ruins
          </h2>

          <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: '#CBD5E1', maxWidth: '860px', marginBottom: '28px' }}>
            When a retail trader holds positions across EURUSD, GBPUSD, AUDUSD, and USDJPY, they are not diversified. They are taking on quadruple-leveraged US Dollar beta. A single Federal Reserve rate surprise hits all four positions simultaneously. By focusing exclusively on Spot Gold, Velarion Markets isolates single-asset purity and eliminates multi-pair drawdown contagion.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-herbaria-mono)', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hb-hairline-amber)', color: 'var(--hb-accent-amber)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px 12px 0' }}>EXECUTION METRIC</th>
                  <th style={{ padding: '12px 14px', color: 'var(--hb-accent-citron)' }}>VELARION SPOT GOLD (XAUUSD)</th>
                  <th style={{ padding: '12px 14px' }}>RETAIL MULTI-PAIR FX (20+ PAIRS)</th>
                  <th style={{ padding: '12px 0 12px 14px' }}>CRYPTO SPECULATION (BTC/ETH)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px dotted var(--hb-hairline-amber)' }}>
                  <td style={{ padding: '12px 14px 12px 0', color: '#F2EADA' }}>Correlation Hazard</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-citron)', fontWeight: 700 }}>Single Isolated Sovereign Asset</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-vermillion)' }}>Severe Hidden Beta Overlap</td>
                  <td style={{ padding: '12px 0 12px 14px', color: '#94A3B8' }}>High Altcoin Contagion</td>
                </tr>
                <tr style={{ borderBottom: '1px dotted var(--hb-hairline-amber)' }}>
                  <td style={{ padding: '12px 14px 12px 0', color: '#F2EADA' }}>Execution Liquidity</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-citron)', fontWeight: 700 }}>$130B+ Daily Turnover</td>
                  <td style={{ padding: '12px 14px', color: '#CBD5E1' }}>Fragmented Across Crosses</td>
                  <td style={{ padding: '12px 0 12px 14px', color: '#94A3B8' }}>Thin Books on Flash Crashes</td>
                </tr>
                <tr style={{ borderBottom: '1px dotted var(--hb-hairline-amber)' }}>
                  <td style={{ padding: '12px 14px 12px 0', color: '#F2EADA' }}>Sovereign Floor</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-citron)', fontWeight: 700 }}>Central Bank Official Reserves</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-vermillion)' }}>Zero (Fiat Debasement Driven)</td>
                  <td style={{ padding: '12px 0 12px 14px', color: '#94A3B8' }}>None (Speculative Retail Flows)</td>
                </tr>
                <tr style={{ borderBottom: '1px dotted var(--hb-hairline-amber)' }}>
                  <td style={{ padding: '12px 14px 12px 0', color: '#F2EADA' }}>Broker Custody</td>
                  <td style={{ padding: '12px 14px', color: 'var(--hb-accent-citron)', fontWeight: 700 }}>100% Regulated Broker (JustMarkets)</td>
                  <td style={{ padding: '12px 14px', color: '#CBD5E1' }}>Broker Dependent</td>
                  <td style={{ padding: '12px 0 12px 14px', color: 'var(--hb-accent-vermillion)' }}>Unregulated Offshore Exchanges</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 04: Non-Custodial Architecture & Action Plate */}
        <section style={{
          border: '1px solid var(--hb-accent-citron)',
          backgroundColor: 'var(--hb-bg-primary)',
          padding: '40px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--hb-accent-citron)', textTransform: 'uppercase', marginBottom: '8px' }}>
              &sect; 04 / NON-CUSTODIAL EXECUTION DEPLOYMENT
            </div>
            <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '26px', color: '#F2EADA', margin: '0 0 10px', fontWeight: 400, lineHeight: 1.2 }}>
              Execute Systematic Gold Strategies on JustMarkets MT5
            </h3>
            <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6, margin: 0 }}>
              Traders maintain 100% direct custody over all deposits, equity, and withdrawals through regulated broker partner JustMarkets. Velarion Markets never touches client capital.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="herbaria-btn-citron"
            >
              Open JustMarkets MT5 Account &rarr;
            </a>
            <Link href="/onboarding" className="herbaria-btn-secondary">
              Link Existing MT5 Account
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
