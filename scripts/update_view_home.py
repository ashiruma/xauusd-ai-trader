import sys
import os

INDEX_PATH = r"C:\Users\ADMIN\.gemini\antigravity\scratch\xauusd_ai_trader\dashboard\static\index.html"

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if '<div id="view-home" class="view-pane active">' in line:
        start_idx = i
        break

if start_idx is None:
    print("Could not find start_idx for view-home!")
    sys.exit(1)

for i in range(start_idx + 1, len(lines)):
    if '<div id="view-user-dashboard" class="view-pane">' in lines[i]:
        # The closing </div> for view-home is the previous non-empty line or i-1 / i-2
        # Let's inspect
        end_idx = i - 1
        while end_idx > start_idx and lines[end_idx].strip() == "":
            end_idx -= 1
        break

if end_idx is None:
    print("Could not find end_idx for view-home!")
    sys.exit(1)

print(f"Replacing lines {start_idx+1} to {end_idx+1}:")
print("START:", repr(lines[start_idx]))
print("END:  ", repr(lines[end_idx]))

NEW_VIEW_HOME = """            <div id="view-home" class="view-pane active">
                <!-- ============================================================== -->
                <!-- HERO SECTION: TRADE SMARTER. UNDERSTAND THE MARKET.            -->
                <!-- ============================================================== -->
                <section class="landing-hero-wrap">
                    <div class="landing-hero-container">
                        <!-- Left Hero Column -->
                        <div>
                            <div class="landing-eyebrow">
                                <span class="dot-indicator"></span>
                                <span>VELARION MARKETS &bull; SPOT GOLD &bull; XAUUSD</span>
                            </div>

                            <h1 class="landing-hero-title">
                                Trade Smarter.<br>
                                Understand the Market.
                            </h1>

                            <p class="landing-hero-subtitle">
                                Explore AI-assisted market analysis, quantitative trading strategies, and structured Forex education in one integrated platform.
                            </p>

                            <!-- Hero Call-to-Actions -->
                            <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                                <button onclick="handleLaunchCtaClick()" class="hero-cta-btn">
                                    <span>Explore Trading Terminal</span>
                                    <span>&rarr;</span>
                                </button>
                                <button onclick="switchMainView('view-academy')" class="btn btn-secondary" style="font-size:14px; padding:12px 24px; font-weight:600;">
                                    Start Learning
                                </button>
                            </div>

                            <!-- 3 Concise Trust & Product Facts -->
                            <div class="hero-trust-facts">
                                <div class="hero-fact-item">
                                    <div class="hero-fact-icon">&#10003;</div>
                                    <div>
                                        <strong>Spot Gold Specialization:</strong> Dedicated algorithmic execution calibrated exclusively for XAUUSD liquidity and macro drivers.
                                    </div>
                                </div>
                                <div class="hero-fact-item">
                                    <div class="hero-fact-icon">&#10003;</div>
                                    <div>
                                        <strong>4 Quantitative Models:</strong> Systematic rules for SMC liquidity sweeps, trend pullbacks, breakout expansions, and statistical mean reversion.
                                    </div>
                                </div>
                                <div class="hero-fact-item">
                                    <div class="hero-fact-icon">&#10003;</div>
                                    <div>
                                        <strong>30-Lesson Forex School:</strong> Structured curriculum with mandatory interactive quiz gating from foundations to institutional risk management.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Hero Column: Coherent Live HUD Trading Preview -->
                        <div style="display:flex; justify-content:center;">
                            <div class="hud-glass-card">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-default); padding-bottom:12px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="dot-indicator"></span>
                                        <strong style="font-size:13px; color:var(--text-primary); letter-spacing:0.04em;">XAUUSD SPOT MARKET</strong>
                                    </div>
                                    <span id="landing-hud-spread" class="status-badge status-completed">0.26 pips spread</span>
                                </div>

                                <div style="margin-bottom:16px;">
                                    <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Spot Gold / US Dollar</div>
                                    <div id="landing-hud-price" class="mono-nums" style="font-size:32px; font-weight:800; color:var(--text-primary); line-height:1.1;">$4,180.20</div>
                                </div>

                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
                                    <div style="background:var(--bg-surface-1); padding:10px 12px; border-radius:6px; border:1px solid var(--border-default);">
                                        <div style="font-size:10px; color:var(--text-secondary); text-transform:uppercase;">Live Bid Price</div>
                                        <div id="landing-hud-bid" class="mono-nums" style="font-size:17px; font-weight:700; color:var(--accent-green); margin-top:2px;">$4,180.20</div>
                                    </div>
                                    <div style="background:var(--bg-surface-1); padding:10px 12px; border-radius:6px; border:1px solid var(--border-default);">
                                        <div style="font-size:10px; color:var(--text-secondary); text-transform:uppercase;">Live Ask Price</div>
                                        <div id="landing-hud-ask" class="mono-nums" style="font-size:17px; font-weight:700; color:var(--text-primary); margin-top:2px;">$4,180.46</div>
                                    </div>
                                </div>

                                <div style="background:var(--bg-surface-1); padding:12px; border-radius:6px; border:1px solid var(--border-default); margin-bottom:14px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <span style="font-size:11.5px; color:var(--text-secondary); font-weight:600;">AI Market Regime</span>
                                        <span id="landing-hud-regime" class="status-badge" style="background:rgba(230,187,89,0.12); color:var(--accent-gold); border:1px solid rgba(230,187,89,0.25); font-weight:700;">TREND_UP</span>
                                    </div>
                                    <div style="font-size:12px; color:var(--text-secondary); line-height:1.45;">
                                        Multi-model alignment confirmed across session liquidity pools with hard stop-loss guardrails.
                                    </div>
                                </div>

                                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-secondary); padding-top:10px; border-top:1px solid var(--border-default);">
                                    <span>Broker: <strong style="color:var(--accent-green);">JustMarkets MT5</strong></span>
                                    <span>Partner Code: <strong class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ============================================================== -->
                <!-- SECTION A: TRADING TERMINAL (YOUR TRADING WORKSPACE)           -->
                <!-- ============================================================== -->
                <section id="landing-workspace" class="landing-section">
                    <div id="landing-why-gold" style="position:relative; top:-20px;"></div>
                    <div class="section-header">
                        <span class="section-eyebrow">LIVE EXECUTION WORKSPACE</span>
                        <h2 class="section-title">Your Trading Workspace</h2>
                        <p class="section-desc">
                            Access the market information and trading tools available through your account.
                        </p>
                    </div>

                    <div class="landing-feature-grid" style="margin-bottom:32px;">
                        <div class="landing-card">
                            <div class="landing-card-header">
                                <span class="landing-card-tag">INSTRUMENT</span>
                                <span class="status-badge status-completed">SPOT GOLD</span>
                            </div>
                            <h3 class="landing-card-title">XAUUSD Focus</h3>
                            <p class="landing-card-desc">
                                Dedicated exclusively to Spot Gold. Benefit from massive daily liquidity, tight bid/ask spreads, and macroeconomic driver clarity without currency noise.
                            </p>
                        </div>

                        <div class="landing-card">
                            <div class="landing-card-header">
                                <span class="landing-card-tag">EXECUTION</span>
                                <span class="status-badge status-completed">LOW LATENCY</span>
                            </div>
                            <h3 class="landing-card-title">Real-Time Data Feeds</h3>
                            <p class="landing-card-desc">
                                Live sub-second tick polling, real-time bid and ask quotes, and automated spread monitoring direct from institutional server gateways.
                            </p>
                        </div>

                        <div class="landing-card">
                            <div class="landing-card-header">
                                <span class="landing-card-tag">CHARTS</span>
                                <span class="status-badge status-completed">LIGHTWEIGHT</span>
                            </div>
                            <h3 class="landing-card-title">Interactive Charting</h3>
                            <p class="landing-card-desc">
                                Institutional-grade candle analysis with multi-timeframe overlays, automated session high/low markers, and dynamic support and resistance levels.
                            </p>
                        </div>

                        <div class="landing-card">
                            <div class="landing-card-header">
                                <span class="landing-card-tag">SECURITY</span>
                                <span class="status-badge status-completed">REGULATED MT5</span>
                            </div>
                            <h3 class="landing-card-title">Non-Custodial Capital</h3>
                            <p class="landing-card-desc">
                                Capital stays 100% inside your regulated JustMarkets MT5 account. Zero third-party pool risk, with full control over deposits and withdrawals.
                            </p>
                        </div>
                    </div>

                    <!-- Terminal Action Banner -->
                    <div style="background:var(--bg-surface-2); border:1px solid var(--border-default); border-radius:var(--radius-md); padding:24px 28px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                        <div>
                            <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">
                                Ready to inspect the live execution console?
                            </div>
                            <div style="font-size:13px; color:var(--text-secondary);">
                                Explore live candle charts, active order book data, and AI signal streams.
                            </div>
                        </div>
                        <button onclick="handleLaunchCtaClick()" class="hero-cta-btn">
                            <span>Launch Trading Terminal</span>
                            <span>&rarr;</span>
                        </button>
                    </div>
                </section>

                <!-- ============================================================== -->
                <!-- SECTION B: AI AND QUANTITATIVE STRATEGIES                     -->
                <!-- ============================================================== -->
                <section id="landing-ai-engine" class="landing-section-alt">
                    <div class="landing-section-inner">
                        <div class="section-header">
                            <span class="section-eyebrow">QUANTITATIVE MODELS</span>
                            <h2 class="section-title">Explore the Intelligence Behind the Strategies</h2>
                            <p class="section-desc">
                                Review the quantitative models and analytical tools available on the platform.
                            </p>
                        </div>

                        <div class="landing-feature-grid" style="margin-bottom:32px;">
                            <div class="landing-card">
                                <div class="landing-card-header">
                                    <span class="landing-card-tag" style="color:var(--accent-gold);">MODEL 01</span>
                                    <span class="status-badge" style="background:rgba(230,187,89,0.12); color:var(--accent-gold);">LIQUIDITY</span>
                                </div>
                                <h3 class="landing-card-title">SMC Liquidity Sweep</h3>
                                <p class="landing-card-desc">
                                    Identifies institutional liquidity pools beyond Asian session extremes and previous daily highs/lows with rapid confirmation pinbar rejections.
                                </p>
                            </div>

                            <div class="landing-card">
                                <div class="landing-card-header">
                                    <span class="landing-card-tag" style="color:var(--accent-green);">MODEL 02</span>
                                    <span class="status-badge status-completed">TREND</span>
                                </div>
                                <h3 class="landing-card-title">Dynamic Trend Pullback</h3>
                                <p class="landing-card-desc">
                                    Aligns with macro trend momentum (EMA 50/200) and executes entries into dynamic support zones with trailing ratchets to lock in profits.
                                </p>
                            </div>

                            <div class="landing-card">
                                <div class="landing-card-header">
                                    <span class="landing-card-tag" style="color:var(--accent-blue);">MODEL 03</span>
                                    <span class="status-badge" style="background:rgba(59,130,246,0.12); color:var(--accent-blue);">VOLATILITY</span>
                                </div>
                                <h3 class="landing-card-title">Session Range Breakout</h3>
                                <p class="landing-card-desc">
                                    Captures high-momentum volatility expansions at London (07:00 UTC) and New York (12:30 UTC) market liquidity opens.
                                </p>
                            </div>

                            <div class="landing-card">
                                <div class="landing-card-header">
                                    <span class="landing-card-tag" style="color:var(--accent-cyan);">MODEL 04</span>
                                    <span class="status-badge" style="background:rgba(6,182,212,0.12); color:var(--accent-cyan);">MEAN REVERSION</span>
                                </div>
                                <h3 class="landing-card-title">Statistical Mean Reversion</h3>
                                <p class="landing-card-desc">
                                    Monitors quiet and range-bound sessions, executing disciplined counter-trend entries at &plusmn;2.5 standard deviation Bollinger bands.
                                </p>
                            </div>
                        </div>

                        <!-- Consensus & Adaptive Risk Architecture Card -->
                        <div class="panel-card" style="padding:26px 30px; margin-bottom:0; background:var(--bg-surface-2);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
                                <div style="max-width:760px;">
                                    <div style="font-size:12px; font-weight:700; color:var(--accent-gold); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">
                                        AI CONSENSUS &bull; DYNAMIC RISK ALLOCATION
                                    </div>
                                    <h4 style="font-size:18px; font-weight:700; color:var(--text-primary); margin:0 0 10px;">
                                        Multi-Agent Consensus with Balance-Tiered Risk Calibration
                                    </h4>
                                    <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; margin:0 0 14px;">
                                        Signals are cross-checked through the AI Consensus Engine to prevent counter-trend friction. Furthermore, risk-to-reward ratios and lot sizing automatically calibrate according to your account balance tier ($10, $50, $100, $500, and $1,000+) so micro accounts preserve capital while larger accounts capture extended 200-pip trends.
                                    </p>
                                    <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:12.5px; color:var(--text-secondary);">
                                        <span>&bull; Micro Tier ($10&ndash;$50): Tight R:R 1.2&ndash;1.5</span>
                                        <span>&bull; Growth Tier ($100): Balanced R:R 2.0</span>
                                        <span>&bull; Institutional Tier ($1,000+): Extended R:R 3.0+ (200 pips)</span>
                                    </div>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <button onclick="switchMainView('view-strategies')" class="btn btn-secondary" style="font-size:13px; padding:12px 22px;">
                                        Inspect Quantitative Engine &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ============================================================== -->
                <!-- SECTION C: FOREX SCHOOL (BUILD YOUR TRADING KNOWLEDGE)         -->
                <!-- ============================================================== -->
                <section id="landing-school" class="landing-section">
                    <div class="section-header">
                        <span class="section-eyebrow">ACCREDITED CURRICULUM</span>
                        <h2 class="section-title">Build Your Trading Knowledge</h2>
                        <p class="section-desc">
                            Learn market fundamentals, technical analysis, risk management, and strategy development through structured lessons.
                        </p>
                    </div>

                    <div class="landing-school-grid" style="display:grid; grid-template-columns:1.15fr 0.85fr; gap:36px; align-items:center;">
                        <div>
                            <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px;">
                                <div class="landing-card" style="padding:18px 20px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <strong style="color:var(--accent-green); font-size:15px;">Tier 1: Beginner Foundations</strong>
                                        <span class="status-badge status-completed">12 LESSONS</span>
                                    </div>
                                    <p style="font-size:13.5px; color:var(--text-secondary); margin:0; line-height:1.5;">
                                        Currency mechanics, quote conventions, bid/ask spreads, pip calculations, lot sizing, order types, and MT5 terminal configuration.
                                    </p>
                                </div>

                                <div class="landing-card" style="padding:18px 20px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <strong style="color:var(--accent-gold); font-size:15px;">Tier 2: Intermediate Analysis &amp; Strategy</strong>
                                        <span class="status-badge status-intermediate">10 LESSONS</span>
                                    </div>
                                    <p style="font-size:13.5px; color:var(--text-secondary); margin:0; line-height:1.5;">
                                        Candlestick patterns, multi-timeframe market structure, support and resistance zones, economic news releases, and risk-to-reward ratios.
                                    </p>
                                </div>

                                <div class="landing-card" style="padding:18px 20px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <strong style="color:var(--accent-red); font-size:15px;">Tier 3: Advanced Risk &amp; Execution</strong>
                                        <span class="status-badge status-advanced">8 LESSONS</span>
                                    </div>
                                    <p style="font-size:13.5px; color:var(--text-secondary); margin:0; line-height:1.5;">
                                        Mathematical position sizing, trader psychology, quantitative backtesting protocols, and XAUUSD contract specifics.
                                    </p>
                                </div>
                            </div>

                            <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                                <button onclick="switchMainView('view-academy')" class="hero-cta-btn">
                                    <span>Enter Forex School (30 Lessons)</span>
                                    <span>&rarr;</span>
                                </button>
                                <span style="font-size:13px; color:var(--text-secondary);">
                                    Strict 80% passing grade required to advance
                                </span>
                            </div>
                        </div>

                        <!-- Right Card: Educational Quality & Calculators -->
                        <div class="panel-card" style="padding:28px; background:var(--bg-surface-2); margin-bottom:0;">
                            <div style="font-size:11px; font-weight:700; color:var(--accent-gold); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px;">
                                SYSTEMATIC LEARNING METHODOLOGY
                            </div>
                            <h4 style="font-size:17px; font-weight:700; color:var(--text-primary); margin:0 0 14px;">
                                Structured Knowledge with Practical Verification
                            </h4>
                            <p style="font-size:13.5px; color:var(--text-secondary); line-height:1.6; margin-bottom:18px;">
                                Each lesson includes interactive comprehension checks, practical XAUUSD calculators, and rigorous quiz evaluations to ensure solid retention before advancing.
                            </p>

                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-primary);">
                                    <span style="color:var(--accent-green); font-weight:bold;">&#10003;</span>
                                    <span>Locked progression ensures foundational mastery</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-primary);">
                                    <span style="color:var(--accent-green); font-weight:bold;">&#10003;</span>
                                    <span>Dedicated XAUUSD pip and margin calculators</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--text-primary);">
                                    <span style="color:var(--accent-green); font-weight:bold;">&#10003;</span>
                                    <span>100% subsidized with JustMarkets partner registration</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ============================================================== -->
                <!-- SECTION D: HOW THE PLATFORM WORKS (3-STEP ONBOARDING)          -->
                <!-- ============================================================== -->
                <section id="landing-justmarkets" class="landing-section-alt">
                    <div class="landing-section-inner">
                        <div class="section-header">
                            <span class="section-eyebrow">ONBOARDING &amp; VERIFICATION</span>
                            <h2 class="section-title">Get Started in Three Steps</h2>
                            <p class="section-desc">
                                Access is subsidized exclusively for traders registered under our official JustMarkets partner code <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code>.
                            </p>
                        </div>

                        <div class="landing-step-grid" style="margin-bottom:28px;">
                            <div class="landing-card" style="border-top:3px solid var(--accent-gold);">
                                <span class="landing-card-tag">STEP 01</span>
                                <h3 class="landing-card-title" style="margin-top:8px;">Open JustMarkets MT5</h3>
                                <p class="landing-card-desc" style="margin-bottom:16px;">
                                    Create your live trading account using our official partner link with code <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code>.
                                </p>
                                <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="font-size:12.5px; width:100%; justify-content:center;">
                                    Register on JustMarkets &rarr;
                                </a>
                            </div>

                            <div class="landing-card" style="border-top:3px solid var(--accent-green);">
                                <span class="landing-card-tag" style="color:var(--accent-green);">STEP 02</span>
                                <h3 class="landing-card-title" style="margin-top:8px;">Fund Your Account</h3>
                                <p class="landing-card-desc">
                                    Deposit $100+ to activate your live broker status. Capital remains 100% in your custody inside your regulated MT5 account with zero management fees.
                                </p>
                                <div style="margin-top:16px; font-size:12px; color:var(--text-muted); line-height:1.4;">
                                    Non-custodial &bull; Regulated broker &bull; Zero subscription fees
                                </div>
                            </div>

                            <div class="landing-card" style="border-top:3px solid var(--accent-blue);">
                                <span class="landing-card-tag" style="color:var(--accent-blue);">STEP 03</span>
                                <h3 class="landing-card-title" style="margin-top:8px;">Verify Account &amp; Access</h3>
                                <p class="landing-card-desc" style="margin-bottom:16px;">
                                    Enter your JustMarkets MT5 Account ID and email in our verification portal to unlock the complete Forex School and AI Terminal.
                                </p>
                                <button onclick="openJustMarketsLoginModal()" class="hero-cta-btn" style="width:100%; justify-content:center; font-size:13px;">
                                    Verify Account Now &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ============================================================== -->
                <!-- INSTITUTIONAL FINTECH FOOTER                                   -->
                <!-- ============================================================== -->
                <footer class="landing-footer">
                    <div class="landing-footer-container">
                        <div class="footer-legal-notice">
                            <strong>Risk Disclosure:</strong> Trading spot gold (XAUUSD), forex, and financial derivatives carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The information, educational curriculum, and quantitative models provided on this platform are for analytical and educational purposes only and do not constitute financial advice.
                        </div>

                        <div class="footer-bottom-bar">
                            <div>
                                &copy; 2026 Velarion Markets. All rights reserved. Subsidized exclusively via JustMarkets Partner Code <span class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</span>.
                            </div>
                            <div class="footer-links">
                                <a href="#view-trader" class="footer-link" onclick="handleNavAction('view', 'view-trader')">Trading Terminal</a>
                                <a href="#view-strategies" class="footer-link" onclick="handleNavAction('view', 'view-strategies')">AI Strategies</a>
                                <a href="#view-academy" class="footer-link" onclick="handleNavAction('view-academy', 'view-academy')">Forex School</a>
                                <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="footer-link">JustMarkets Partnership</a>
                                <button onclick="openSupportModal()" class="footer-link" style="background:none; border:none; padding:0; cursor:pointer; font-size:inherit; font-family:inherit;">Trader Support</button>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- Floating Cookie Banner -->
                <div id="landing-cookie-banner" style="position:fixed; bottom:20px; left:20px; background:rgba(14,22,37,0.96); border:1px solid var(--border-default); border-radius:8px; padding:16px; max-width:320px; z-index:999; box-shadow:0 10px 30px rgba(0,0,0,0.85);">
                    <h5 style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">This website uses cookies</h5>
                    <p style="font-size:11.5px; color:var(--text-secondary); line-height:1.45; margin-bottom:10px;">
                        We use secure local session storage to authenticate your JustMarkets MT5 credentials and verify partner compliance.
                    </p>
                    <div style="display:flex; gap:8px;">
                        <button onclick="dismissCookieBanner(false)" class="btn btn-secondary" style="font-size:11px; padding:6px 12px; flex:1; justify-content:center;">Deny</button>
                        <button onclick="dismissCookieBanner(true)" class="btn btn-gold" style="font-size:11px; padding:6px 12px; flex:1; justify-content:center;">Accept All</button>
                    </div>
                </div>

                <!-- Floating Live Support Widget -->
                <button onclick="openSupportModal()" style="position:fixed; bottom:24px; right:24px; width:46px; height:46px; border-radius:50%; background:var(--accent-green); color:#042013; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(25,184,120,0.45); z-index:999;" title="Live Trader Support">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
"""

new_lines = lines[:start_idx] + [NEW_VIEW_HOME] + lines[end_idx+1:]

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Successfully replaced view-home in index.html!")
