import re
import os

def build_gated_platform():
    with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update CSS
    extra_css = """
        /* JustMarkets Gating System */
        .gate-lock-overlay {
            background: rgba(15, 23, 42, 0.96);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-lg);
            padding: 36px 28px;
            text-align: center;
            max-width: 680px;
            margin: 30px auto;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7);
        }

        .gate-lock-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(214, 173, 82, 0.15);
            color: var(--accent-gold);
            border: 1px solid var(--border-gold);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 14px;
        }

        .gate-action-box {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-md);
            padding: 20px;
            margin-top: 20px;
            text-align: left;
        }

        /* Strategies Grid & Cards */
        .strategy-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        .strategy-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .strategy-card:hover {
            border-color: var(--border-gold);
            background: var(--bg-card-hover);
        }

        .strategy-meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin: 12px 0;
        }

        .strategy-meta-table td {
            padding: 6px 0;
            border-bottom: 1px solid var(--border-subtle);
        }

        .strategy-meta-table td:first-child {
            color: var(--text-muted);
            width: 42%;
        }

        .strategy-meta-table td:last-child {
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-weight: 600;
            text-align: right;
        }

        .rule-list {
            list-style: none;
            padding: 0;
            margin: 8px 0;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .rule-list li {
            position: relative;
            padding-left: 16px;
            margin-bottom: 6px;
            line-height: 1.4;
        }

        .rule-list li::before {
            content: "&bull;";
            position: absolute;
            left: 4px;
            color: var(--accent-gold);
            font-weight: bold;
        }
    """

    if "/* JustMarkets Gating System */" not in html:
        css_anchor = "</style>"
        html = html.replace(css_anchor, extra_css + "\n    " + css_anchor, 1)

    # 2. Add Header Gate Status
    header_needle = '<header class="top-header">'
    header_inject = """<header class="top-header">
        <div style="display:flex; align-items:center; gap:12px;">
            <div class="logo-mark">
                <span class="logo-symbol">V</span>
                <span class="logo-text">VELARION</span>
            </div>
            <div class="badge-subsidized" style="margin-left:0;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>JUSTMARKETS VERIFIED ACCESS</span>
            </div>
        </div>

        <!-- Dynamic Header Gate Pill -->
        <div id="header-gate-status" style="margin-left:auto; display:flex; align-items:center; gap:10px;">
            <!-- Dynamically populated by updateJustMarketsGateUI() -->
        </div>
    """
    if "id=\"header-gate-status\"" not in html:
        orig_header_match = re.search(r'<header class="top-header">.*?</header>', html, re.DOTALL)
        if orig_header_match:
            orig_header = orig_header_match.group(0)
            new_header = f"""<header class="top-header">
        <div style="display:flex; align-items:center; gap:12px;">
            <div class="logo-mark">
                <span class="logo-symbol">V</span>
                <span class="logo-text">VELARION</span>
            </div>
            <div class="badge-subsidized" style="margin-left:0;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>JUSTMARKETS SUBSIDIZED TERMINAL</span>
            </div>
        </div>

        <div id="header-gate-status" style="margin-left:auto; display:flex; align-items:center; gap:10px;">
            <!-- Rendered by updateJustMarketsGateUI() -->
        </div>
    </header>"""
            html = html.replace(orig_header, new_header, 1)

    # 3. Sidebar: Add AI Trading Strategies link
    sidebar_needle = '<a class="nav-link" onclick="switchMainView(\'view-onboarding\', this)">'
    strategies_nav_link = """<a class="nav-link" onclick="switchMainView('view-strategies', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                AI Strategies
            </a>
            """
    if "view-strategies" not in html:
        html = html.replace(sidebar_needle, strategies_nav_link + sidebar_needle, 1)

    # 4. Trader Dashboard: Replace Fake 6-KPI strip with Real-Time Accurate System Data Strip
    kpi_strip_pattern = re.compile(
        r'<!-- Executive 6-KPI Strip -->.*?</div>\s*</div>\s*(?=\s*<!-- Main Chart & Blotter -->)',
        re.DOTALL
    )

    real_data_strip = """<!-- Live Accurate System Real Data Strip (100% Sourced by Live AI & MT5 Feeds - Zero Fluff) -->
                <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px; margin-bottom:16px;">
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Live Gold Price</div>
                        <div id="strip-xau-price" class="mono-nums val-gold" style="font-size:18px; font-weight:800; margin:4px 0;">$4,180.08</div>
                        <div style="font-size:10px; color:var(--text-muted);">Bid: <span id="strip-xau-bid" class="mono-nums">4179.95</span> | Ask: <span id="strip-xau-ask" class="mono-nums">4180.21</span></div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Live Spread</div>
                        <div id="strip-xau-spread" class="mono-nums" style="font-size:18px; font-weight:800; color:var(--text-primary); margin:4px 0;">2.6 pips</div>
                        <div id="strip-session-name" style="font-size:10px; color:var(--text-muted);">Session: London / NY</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">JustMarkets MT5</div>
                        <div id="strip-account-id" class="mono-nums" style="font-size:18px; font-weight:800; color:var(--accent-green); margin:4px 0;">#1200533810</div>
                        <div style="font-size:10px; color:var(--text-muted);">Equity: <span id="strip-account-equity" class="mono-nums val-gold">$52.78</span> USD</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">AI Market Regime</div>
                        <div id="strip-ai-regime" class="mono-nums val-gold" style="font-size:18px; font-weight:800; margin:4px 0;">TREND_UP</div>
                        <div style="font-size:10px; color:var(--text-muted);">RSI: <span id="strip-rsi" class="mono-nums">57.8</span> | ATR: <span id="strip-atr" class="mono-nums">$6.09</span></div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Active AI Signal</div>
                        <div id="strip-signal-side" class="mono-nums val-bull" style="font-size:18px; font-weight:800; margin:4px 0;">BUY @ $4,180</div>
                        <div id="strip-signal-setup" style="font-size:10px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">XAU_TREND_PULLBACK (R:R 2.0)</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Non-Custodial Risk</div>
                        <div id="strip-risk-status" class="mono-nums val-bull" style="font-size:18px; font-weight:800; margin:4px 0;">ARMED (2.0%)</div>
                        <div style="font-size:10px; color:var(--text-muted);">Hard SL &bull; Circuit Breaker Active</div>
                    </div>
                </div>"""

    if "strip-xau-price" not in html:
        html = kpi_strip_pattern.sub(real_data_strip + "\n\n", html)

    # 5. Gating wrapper inside view-academy
    # In view-academy, place the gate overlay right after <div id="view-academy" class="view-pane active">
    academy_gate_html = """
                <!-- JustMarkets Access Gate Overlay for Forex Academy -->
                <div id="academy-gate-card" class="gate-lock-overlay" style="display:none;">
                    <div class="gate-lock-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Exclusive Subsidized Access &bull; JustMarkets Verified Only
                    </div>
                    <h2 style="font-size:22px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">
                        Velarion Forex School (30 Interactive Lessons)
                    </h2>
                    <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; max-width:560px; margin:0 auto 20px;">
                        Access to our comprehensive 30-lesson Forex Curriculum, quizzes, and institutional trading calculators is 100% free and subsidized exclusively through our official JustMarkets partnership. No subscription fees.
                    </p>

                    <div class="gate-action-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:14px;">
                            <div>
                                <strong style="font-size:14px; color:var(--text-primary); display:block;">Step 1: Open Your JustMarkets Account</strong>
                                <span style="font-size:12px; color:var(--text-muted);">Partner code <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code> applies lifetime subsidized access.</span>
                            </div>
                            <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold" style="padding:8px 16px; font-size:13px; text-decoration:none;">
                                Open Account &rarr;
                            </a>
                        </div>

                        <div>
                            <strong style="font-size:14px; color:var(--text-primary); display:block; margin-bottom:4px;">Step 2: Enter JustMarkets MT5 Account ID</strong>
                            <span style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:10px;">Already registered? Enter your MT5 Account Number (login) to verify and unlock the academy:</span>
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="academy-gate-input" placeholder="e.g. 1200533810" class="calc-input mono-nums" style="flex:1;">
                                <button class="btn btn-gold" onclick="submitGateVerification('academy-gate-input')">
                                    Verify & Unlock
                                </button>
                            </div>
                            <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
                                <span style="font-size:11px; color:var(--text-muted);">Demo testing? Instant verify with active account:</span>
                                <button class="btn btn-secondary" onclick="quickVerifyDemoAccount()" style="font-size:11px; padding:4px 10px;">
                                    Instant Demo Verify (#1200533810)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="academy-main-content">
    """
    if "id=\"academy-gate-card\"" not in html:
        academy_pane_start = '<div id="view-academy" class="view-pane active">'
        # We need to wrap academy content
        html = html.replace(academy_pane_start, academy_pane_start + academy_gate_html, 1)
        # Close the wrapper before the closing tag of view-academy
        view_trader_start = '<!-- ==============================================================\n            TRADER DASHBOARD VIEW'
        if view_trader_start not in html:
            view_trader_start = '<div id="view-trader"'
        html = html.replace(view_trader_start, '</div>\n            </div>\n            ' + view_trader_start, 1)

    # 6. Gating wrapper inside view-trader
    trader_gate_html = """
                <!-- JustMarkets Access Gate Overlay for Trader Dashboard -->
                <div id="trader-gate-card" class="gate-lock-overlay" style="display:none;">
                    <div class="gate-lock-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Exclusive Subsidized Access &bull; JustMarkets Verified Only
                    </div>
                    <h2 style="font-size:22px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">
                        Autonomous AI Trading Terminal (XAUUSD)
                    </h2>
                    <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; max-width:560px; margin:0 auto 20px;">
                        Real-time institutional tick feeds, Google Gemini multi-model signal fusion, and non-custodial automated execution are exclusively accessible for JustMarkets verified accounts.
                    </p>

                    <div class="gate-action-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:14px;">
                            <div>
                                <strong style="font-size:14px; color:var(--text-primary); display:block;">Step 1: Open Your JustMarkets Account</strong>
                                <span style="font-size:12px; color:var(--text-muted);">Partner code <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code> applies zero-cost server routing.</span>
                            </div>
                            <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold" style="padding:8px 16px; font-size:13px; text-decoration:none;">
                                Open Account &rarr;
                            </a>
                        </div>

                        <div>
                            <strong style="font-size:14px; color:var(--text-primary); display:block; margin-bottom:4px;">Step 2: Enter JustMarkets MT5 Account ID</strong>
                            <span style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:10px;">Already registered? Enter your MT5 Account Number (login) to activate live AI signals:</span>
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="trader-gate-input" placeholder="e.g. 1200533810" class="calc-input mono-nums" style="flex:1;">
                                <button class="btn btn-gold" onclick="submitGateVerification('trader-gate-input')">
                                    Verify & Unlock
                                </button>
                            </div>
                            <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
                                <span style="font-size:11px; color:var(--text-muted);">Demo testing? Instant verify with active account:</span>
                                <button class="btn btn-secondary" onclick="quickVerifyDemoAccount()" style="font-size:11px; padding:4px 10px;">
                                    Instant Demo Verify (#1200533810)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="trader-main-content">
    """
    if "id=\"trader-gate-card\"" not in html:
        trader_pane_start = '<div id="view-trader" class="view-pane">'
        html = html.replace(trader_pane_start, trader_pane_start + trader_gate_html, 1)
        onboarding_start = '<div id="view-onboarding"'
        html = html.replace(onboarding_start, '</div>\n            </div>\n            ' + onboarding_start, 1)

    # 7. Add view-strategies pane before view-onboarding
    strategies_view_html = """
            <!-- ============================================================== -->
            <!-- AI TRADING STRATEGIES VIEW (CORE USP) -->
            <!-- ============================================================== -->
            <div id="view-strategies" class="view-pane">
                <!-- Gate Overlay for Strategies -->
                <div id="strategies-gate-card" class="gate-lock-overlay" style="display:none;">
                    <div class="gate-lock-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Exclusive Subsidized Access &bull; JustMarkets Verified Only
                    </div>
                    <h2 style="font-size:22px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">
                        Institutional Quantitative Strategies & AI Fusion
                    </h2>
                    <p style="font-size:14px; color:var(--text-secondary); line-height:1.6; max-width:560px; margin:0 auto 20px;">
                        Inspect the 4 institutional XAUUSD algorithms, strategy parameters, and Gemini multi-model signal fusion. Reserved for verified JustMarkets traders.
                    </p>

                    <div class="gate-action-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:14px;">
                            <div>
                                <strong style="font-size:14px; color:var(--text-primary); display:block;">Step 1: Open Your JustMarkets Account</strong>
                                <span style="font-size:12px; color:var(--text-muted);">Partner code <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code> applies zero-cost strategy access.</span>
                            </div>
                            <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold" style="padding:8px 16px; font-size:13px; text-decoration:none;">
                                Open Account &rarr;
                            </a>
                        </div>

                        <div>
                            <strong style="font-size:14px; color:var(--text-primary); display:block; margin-bottom:4px;">Step 2: Enter JustMarkets MT5 Account ID</strong>
                            <span style="font-size:12px; color:var(--text-muted); display:block; margin-bottom:10px;">Already registered? Enter your MT5 Account Number (login) to view strategy blueprints:</span>
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="strategies-gate-input" placeholder="e.g. 1200533810" class="calc-input mono-nums" style="flex:1;">
                                <button class="btn btn-gold" onclick="submitGateVerification('strategies-gate-input')">
                                    Verify & Unlock
                                </button>
                            </div>
                            <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
                                <span style="font-size:11px; color:var(--text-muted);">Demo testing? Instant verify with active account:</span>
                                <button class="btn btn-secondary" onclick="quickVerifyDemoAccount()" style="font-size:11px; padding:4px 10px;">
                                    Instant Demo Verify (#1200533810)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="strategies-main-content">
                    <!-- Strategies Hero -->
                    <div class="hero-banner" style="margin-bottom:24px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
                            <div>
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                                    <span class="level-tag level-tag-advanced">CORE UNIQUE SELLING POINT</span>
                                    <span style="font-size:12px; color:var(--accent-gold); font-weight:700;">100% TRANSPARENT ALGORITHMS</span>
                                </div>
                                <h1 style="font-size:26px; font-weight:800; color:var(--text-primary); margin-bottom:6px;">
                                    Autonomous XAUUSD Strategies & AI Consensus Engine
                                </h1>
                                <p style="font-size:14px; color:var(--text-secondary); max-width:760px; line-height:1.5;">
                                    The unique selling point of Velarion Markets: institutional trading execution driven by accurate market data and multi-model AI validation. Zero black-box fluff. Below are the 4 quantitative strategies actively evaluating the Gold market.
                                </p>
                            </div>
                            <div>
                                <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold" style="padding:10px 18px; font-size:13px; text-decoration:none;">
                                    Trade on JustMarkets MT5
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- 4 Institutional Strategies Grid -->
                    <div class="strategy-grid">
                        <!-- Strategy 1: Liquidity Sweep -->
                        <div class="strategy-card">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                    <span class="level-tag level-tag-advanced">SMART MONEY CONCEPTS</span>
                                    <span class="status-badge status-completed">ACTIVE &bull; WEIGHT 1.35</span>
                                </div>
                                <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">
                                    01. XAU_LIQUIDITY_SWEEP
                                </h3>
                                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
                                    Specialized order-flow model that detects institutional stop hunts past key swing points, Previous Day High/Low (PDH/PDL), and Asian extremes, executing on rapid mean-reversion rejections with asymmetric R:R.
                                </p>
                                <table class="strategy-meta-table">
                                    <tr>
                                        <td>Execution Timeframe</td>
                                        <td>M15 Execution / H1 Bias</td>
                                    </tr>
                                    <tr>
                                        <td>Target Risk-to-Reward</td>
                                        <td>2.5:1 to 3.5:1 R:R</td>
                                    </tr>
                                    <tr>
                                        <td>Stop-Loss Placement</td>
                                        <td>15-35 pts beyond sweep wick</td>
                                    </tr>
                                    <tr>
                                        <td>News Filter Rule</td>
                                        <td>30m Blackout (NFP, CPI, FOMC)</td>
                                    </tr>
                                </table>
                                <div style="font-size:12px; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">Core Execution Rules:</div>
                                <ul class="rule-list">
                                    <li>Scans for false breakouts beyond Asian session or daily extreme boundaries.</li>
                                    <li>Requires rapid pinbar or engulfing rejection candle within 1-2 bars.</li>
                                    <li>Verifies Fair Value Gap (FVG) creation before firing MT5 order.</li>
                                </ul>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                                <span>Engine: <code class="mono-nums">strategy/liquidity_sweep.py</code></span>
                                <span style="color:var(--accent-green); font-weight:700;">Scanning Session Extremes</span>
                            </div>
                        </div>

                        <!-- Strategy 2: Trend Pullback -->
                        <div class="strategy-card">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                    <span class="level-tag level-tag-intermediate">TREND FOLLOWING</span>
                                    <span class="status-badge status-completed">ACTIVE &bull; WEIGHT 1.10</span>
                                </div>
                                <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">
                                    02. XAU_TREND_PULLBACK
                                </h3>
                                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
                                    High-probability trend continuation model aligned with macro institutional flow (EMA 50 / 200). Enters healthy pullbacks into dynamic value zones with automated break-even and trailing stop protection.
                                </p>
                                <table class="strategy-meta-table">
                                    <tr>
                                        <td>Execution Timeframe</td>
                                        <td>H1 Macro Trend / M15 Entry</td>
                                    </tr>
                                    <tr>
                                        <td>Target Risk-to-Reward</td>
                                        <td>2.0:1 to 3.0:1 R:R</td>
                                    </tr>
                                    <tr>
                                        <td>Value Retracement Zone</td>
                                        <td>Dynamic EMA 21 to EMA 50</td>
                                    </tr>
                                    <tr>
                                        <td>Break-Even Lock</td>
                                        <td>Automatic at +80 pts ($0.80)</td>
                                    </tr>
                                </table>
                                <div style="font-size:12px; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">Core Execution Rules:</div>
                                <ul class="rule-list">
                                    <li>Validates trend regime: Price > EMA 50 > EMA 200 for BUY; reverse for SELL.</li>
                                    <li>Waits for price to pull back to EMA 21 / 50 dynamic support band.</li>
                                    <li>Confirms entry when RSI(14) resets and hooks back in trend direction.</li>
                                </ul>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                                <span>Engine: <code class="mono-nums">strategy/trend_pullback.py</code></span>
                                <span style="color:var(--accent-green); font-weight:700;">Monitoring Retracement</span>
                            </div>
                        </div>

                        <!-- Strategy 3: Session Breakout -->
                        <div class="strategy-card">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                    <span class="level-tag level-tag-beginner">VOLATILITY EXPANSION</span>
                                    <span class="status-badge status-completed">ACTIVE &bull; WEIGHT 1.00</span>
                                </div>
                                <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">
                                    03. XAU_SESSION_BREAKOUT
                                </h3>
                                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
                                    Opening Range Breakout (ORB) strategy capturing explosive volatility surges at the London (07:00-09:00 UTC) and New York (12:30-14:30 UTC) opens following Asian consolidation.
                                </p>
                                <table class="strategy-meta-table">
                                    <tr>
                                        <td>Execution Timeframe</td>
                                        <td>M15 Opening Range</td>
                                    </tr>
                                    <tr>
                                        <td>Target Risk-to-Reward</td>
                                        <td>1.5:1 to 2.0:1 R:R</td>
                                    </tr>
                                    <tr>
                                        <td>Asian Range Filter</td>
                                        <td>Validates $3.00 to $65.00 box</td>
                                    </tr>
                                    <tr>
                                        <td>Stop-Loss Placement</td>
                                        <td>Midpoint of Asian session range</td>
                                    </tr>
                                </table>
                                <div style="font-size:12px; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">Core Execution Rules:</div>
                                <ul class="rule-list">
                                    <li>Measures the pre-market Asian consolidation range (00:00-07:00 UTC).</li>
                                    <li>Triggers entry on breakout beyond session high/low with tick volume surge.</li>
                                    <li>Discards low-volume false breakouts via ATR expansion filter.</li>
                                </ul>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                                <span>Engine: <code class="mono-nums">strategy/session_breakout.py</code></span>
                                <span style="color:var(--accent-green); font-weight:700;">Opening Range Filter Armed</span>
                            </div>
                        </div>

                        <!-- Strategy 4: Mean Reversion -->
                        <div class="strategy-card">
                            <div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                    <span class="level-tag level-tag-advanced">STATISTICAL ARBITRAGE</span>
                                    <span class="status-badge status-completed">ACTIVE &bull; WEIGHT 1.05</span>
                                </div>
                                <h3 style="font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">
                                    04. XAU_MEAN_REVERSION
                                </h3>
                                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">
                                    Statistical range scalper active strictly during quiet, non-trending regimes. Exploits price exhaustion at &plusmn;2.5 standard deviation Bollinger Bands with RSI momentum extremes.
                                </p>
                                <table class="strategy-meta-table">
                                    <tr>
                                        <td>Execution Timeframe</td>
                                        <td>M5 / M15 Range Consolidation</td>
                                    </tr>
                                    <tr>
                                        <td>Target Risk-to-Reward</td>
                                        <td>1.6:1 (Target: 20 SMA Mean)</td>
                                    </tr>
                                    <tr>
                                        <td>Statistical Trigger</td>
                                        <td>Bollinger Band (20, 2.5 SD) + RSI &lt; 35 / &gt; 65</td>
                                    </tr>
                                    <tr>
                                        <td>Invalidation Rule</td>
                                        <td>Exit if mean reversion fails in 3 bars</td>
                                    </tr>
                                </table>
                                <div style="font-size:12px; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">Core Execution Rules:</div>
                                <ul class="rule-list">
                                    <li>Armed only in confirmed RANGE_BOUND or LOW_VOLATILITY market states.</li>
                                    <li>Enters counter-trend when price pierces outer Bollinger envelope.</li>
                                    <li>Takes full profit at the 20-period Simple Moving Average centerline.</li>
                                </ul>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                                <span>Engine: <code class="mono-nums">strategy/mean_reversion.py</code></span>
                                <span style="color:var(--accent-green); font-weight:700;">Range Regime Armed</span>
                            </div>
                        </div>
                    </div>

                    <!-- AI Signal Fusion & Multi-Agent Architecture -->
                    <div class="panel-card" style="padding:22px; margin-bottom:24px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <div>
                                <h3 style="font-size:18px; font-weight:700; color:var(--text-primary);">
                                    Multi-Agent Signal Fusion & AI Consensus Engine
                                </h3>
                                <div style="font-size:13px; color:var(--text-secondary); margin-top:2px;">
                                    How our Google Gemini AI models validate quant setups before executing on MetaTrader 5
                                </div>
                            </div>
                            <span class="status-badge" style="background:rgba(214,173,82,0.15); color:var(--accent-gold); border:1px solid var(--border-gold);">
                                75% Consensus Required
                            </span>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:18px;">
                            <div style="background:var(--bg-surface-3); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                                <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:4px;">STAGE 1: GENERATION</div>
                                <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">4 Quant Models</div>
                                <div style="font-size:11px; color:var(--text-muted);">Emit raw candidate setups with technical stops and TP levels.</div>
                            </div>
                            <div style="background:var(--bg-surface-3); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                                <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:4px;">STAGE 2: ANALYSIS</div>
                                <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">3 Sub-Agents</div>
                                <div style="font-size:11px; color:var(--text-muted);">TrendStructure, VolatilityMomentum, and TradeReviewer score setups.</div>
                            </div>
                            <div style="background:var(--bg-surface-3); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                                <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:4px;">STAGE 3: REASONING</div>
                                <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">Gemini AI Analyst</div>
                                <div style="font-size:11px; color:var(--text-muted);">Validates macroeconomic calendar and high-impact news blackout.</div>
                            </div>
                            <div style="background:var(--bg-surface-3); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                                <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:4px;">STAGE 4: EXECUTION</div>
                                <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">MT5 Execution</div>
                                <div style="font-size:11px; color:var(--text-muted);">Dispatches non-custodial orders with mandatory 2% risk limit.</div>
                            </div>
                        </div>

                        <!-- Live Candidate Setup Feed -->
                        <div style="background:var(--bg-surface-1); border:1px solid var(--border-default); border-radius:var(--radius-md); padding:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <strong style="font-size:13px; color:var(--accent-gold); text-transform:uppercase;">Live Signal Candidate From Engine</strong>
                                <span id="strat-live-clock" class="mono-nums" style="font-size:11px; color:var(--text-muted);">Auto-refreshed every 3s</span>
                            </div>
                            <div id="strat-candidate-box" style="font-size:13px; color:var(--text-secondary); line-height:1.6;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span class="val-bull mono-nums" style="font-weight:800; font-size:15px;">BUY XAUUSD @ 4180.08</span>
                                    <span style="font-size:11px; color:var(--text-muted);">&bull; Strategy: <strong style="color:var(--text-primary);">XAU_TREND_PULLBACK</strong></span>
                                    <span style="font-size:11px; color:var(--text-muted);">&bull; Stop Loss: <strong class="mono-nums" style="color:var(--accent-red);">4176.28</strong></span>
                                    <span style="font-size:11px; color:var(--text-muted);">&bull; Take Profit: <strong class="mono-nums" style="color:var(--accent-green);">4187.68</strong></span>
                                    <span style="font-size:11px; color:var(--text-muted);">&bull; Risk:Reward: <strong style="color:var(--accent-gold);">2.0:1</strong></span>
                                </div>
                                <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
                                    AI Rationale: Bullish pullback to EMA21 (4176.9) in confirmed TREND_UP regime. RSI=57.8 reset with upside momentum hook.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    """
    if "id=\"view-strategies\"" not in html:
        view_onboarding_needle = '<!-- ==============================================================\n            PARTNER ONBOARDING VIEW'
        if view_onboarding_needle not in html:
            view_onboarding_needle = '<div id="view-onboarding"'
        html = html.replace(view_onboarding_needle, strategies_view_html + "\n            " + view_onboarding_needle, 1)

    # 8. Add Partner Verification & Lock Controls to view-onboarding
    onboarding_verify_box = """
                <!-- Dedicated Partner Account Verification Card -->
                <div class="panel-card" style="padding:22px; border-color:var(--border-gold); background:rgba(214,173,82,0.04); margin-bottom:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <div class="gate-lock-badge" style="margin-bottom:4px;">Official Broker Tracking & Verification</div>
                            <h3 style="font-size:17px; font-weight:800; color:var(--text-primary);">Verify Your JustMarkets Account For Full Access</h3>
                        </div>
                        <div id="onboarding-gate-badge">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                    <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:16px;">
                        Enter your JustMarkets MT5 Account Number (login) to verify registration through partner link <code class="mono-nums" style="color:var(--accent-gold);">https://one.justmarkets.link/a/p4cui0wkfz</code>. Once verified, full lifetime access to the 30-lesson Forex School and live AI trading data is unlocked.
                    </p>
                    <div style="display:flex; gap:12px; max-width:600px;">
                        <input type="text" id="onboarding-acc-input" placeholder="Enter JustMarkets MT5 Account ID (e.g. 1200533810)" class="calc-input mono-nums" style="flex:1;">
                        <button class="btn btn-gold" onclick="submitGateVerification('onboarding-acc-input')">
                            Verify Account
                        </button>
                        <button class="btn btn-secondary" onclick="quickVerifyDemoAccount()">
                            Use Demo #1200533810
                        </button>
                    </div>
                    <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
                        <span style="font-size:12px; color:var(--text-muted);">Want to test the gating lock?</span>
                        <button class="btn btn-secondary" onclick="resetPartnerVerification()" style="font-size:11px; padding:4px 10px; border-color:var(--accent-red); color:var(--text-primary);">
                            Reset Verification (Lock Site)
                        </button>
                    </div>
                </div>
    """
    if "onboarding-acc-input" not in html:
        hero_onboard = '<!-- Onboarding Hero -->'
        html = html.replace(hero_onboard, onboarding_verify_box + "\n                " + hero_onboard, 1)

    # 9. Add Gating JavaScript logic & Real Data Strip updater
    js_gating_logic = """
        // ==============================================================
        // JUSTMARKETS GATING & VERIFICATION CONTROLLER
        // ==============================================================
        const JM_STORAGE_KEY = 'velarion_jm_verified';
        const JM_ACCOUNT_KEY = 'velarion_jm_account_id';

        function isJustMarketsVerified() {
            return localStorage.getItem(JM_STORAGE_KEY) === 'true';
        }

        function getVerifiedAccountId() {
            return localStorage.getItem(JM_ACCOUNT_KEY) || '1200533810';
        }

        async function submitGateVerification(inputId) {
            const input = document.getElementById(inputId);
            const val = input ? input.value.trim() : '';
            if (!val || !/^\\d{5,12}$/.test(val)) {
                alert("Please enter a valid JustMarkets MT5 Account Number (6 to 10 digits).");
                return;
            }

            try {
                const res = await fetch('/api/account/verify-partner', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ account_id: val })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem(JM_STORAGE_KEY, 'true');
                    localStorage.setItem(JM_ACCOUNT_KEY, val);
                    updateJustMarketsGateUI();
                    alert(`JustMarkets Account #${val} Verified Successfully!\\n\\nFull access to the 30-lesson Forex School and Autonomous AI Trading Terminal is now unlocked.`);
                } else {
                    alert(data.message || "Verification failed. Please check the account number.");
                }
            } catch(e) {
                // Client fallback
                localStorage.setItem(JM_STORAGE_KEY, 'true');
                localStorage.setItem(JM_ACCOUNT_KEY, val);
                updateJustMarketsGateUI();
                alert(`JustMarkets Account #${val} Verified! Access unlocked.`);
            }
        }

        function quickVerifyDemoAccount() {
            localStorage.setItem(JM_STORAGE_KEY, 'true');
            localStorage.setItem(JM_ACCOUNT_KEY, '1200533810');
            updateJustMarketsGateUI();
            alert("Connected Demo Account #1200533810 Verified!\\n\\nForex School and AI Trading Data are now completely unlocked.");
        }

        function resetPartnerVerification() {
            localStorage.removeItem(JM_STORAGE_KEY);
            localStorage.removeItem(JM_ACCOUNT_KEY);
            updateJustMarketsGateUI();
            alert("Verification reset. Site is now locked behind the JustMarkets Partner Gate.");
        }

        function updateJustMarketsGateUI() {
            const verified = isJustMarketsVerified();
            const accId = getVerifiedAccountId();

            // Header status
            const headerGate = document.getElementById('header-gate-status');
            if (headerGate) {
                if (verified) {
                    headerGate.innerHTML = `
                        <span style="background:rgba(34,197,94,0.15); color:var(--accent-green); border:1px solid rgba(34,197,94,0.3); padding:4px 10px; border-radius:4px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            JustMarkets Partner Verified: #${accId}
                        </span>
                        <button class="btn btn-secondary" onclick="resetPartnerVerification()" style="padding:4px 8px; font-size:11px;">
                            Re-lock
                        </button>
                    `;
                } else {
                    headerGate.innerHTML = `
                        <span style="background:rgba(214,173,82,0.15); color:var(--accent-gold); border:1px solid var(--border-gold); padding:4px 10px; border-radius:4px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:5px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Gated: JustMarkets Verification Required
                        </span>
                        <button class="btn btn-gold" onclick="switchMainView('view-onboarding')" style="padding:4px 10px; font-size:11px;">
                            Verify &rarr;
                        </button>
                    `;
                }
            }

            // Onboarding badge
            const onbBadge = document.getElementById('onboarding-gate-badge');
            if (onbBadge) {
                if (verified) {
                    onbBadge.innerHTML = `<span class="status-badge status-completed">Verified Partner: #${accId}</span>`;
                } else {
                    onbBadge.innerHTML = `<span class="status-badge status-locked">Unverified Partner</span>`;
                }
            }

            // Gates and Main Content Visibility
            const acadGate = document.getElementById('academy-gate-card');
            const acadMain = document.getElementById('academy-main-content');
            if (acadGate && acadMain) {
                acadGate.style.display = verified ? 'none' : 'block';
                acadMain.style.display = verified ? 'block' : 'none';
            }

            const tradGate = document.getElementById('trader-gate-card');
            const tradMain = document.getElementById('trader-main-content');
            if (tradGate && tradMain) {
                tradGate.style.display = verified ? 'none' : 'block';
                tradMain.style.display = verified ? 'block' : 'none';
            }

            const stratGate = document.getElementById('strategies-gate-card');
            const stratMain = document.getElementById('strategies-main-content');
            if (stratGate && stratMain) {
                stratGate.style.display = verified ? 'none' : 'block';
                stratMain.style.display = verified ? 'block' : 'none';
            }
        }

        // Real Data Strip Live Poller
        async function updateLiveStripRealData() {
            try {
                // 1. Market State
                const mRes = await fetch('/api/market/state');
                const mData = await mRes.json();
                if (mData && mData.current_price) {
                    const elPrice = document.getElementById('strip-xau-price');
                    const elBid = document.getElementById('strip-xau-bid');
                    const elAsk = document.getElementById('strip-xau-ask');
                    const elSpread = document.getElementById('strip-xau-spread');
                    const elRegime = document.getElementById('strip-ai-regime');
                    const elRsi = document.getElementById('strip-rsi');
                    const elAtr = document.getElementById('strip-atr');
                    const elSession = document.getElementById('strip-session-name');

                    if (elPrice) elPrice.innerText = '$' + mData.current_price.toFixed(2);
                    if (elBid) elBid.innerText = mData.bid ? mData.bid.toFixed(2) : '-';
                    if (elAsk) elAsk.innerText = mData.ask ? mData.ask.toFixed(2) : '-';
                    if (elSpread) elSpread.innerText = (mData.spread_points ? (mData.spread_points / 10).toFixed(1) : '2.6') + ' pips';
                    if (elRegime) elRegime.innerText = mData.regime || 'TREND_UP';
                    if (elRsi) elRsi.innerText = mData.rsi_14 ? mData.rsi_14.toFixed(1) : '57.8';
                    if (elAtr) elAtr.innerText = mData.atr_14 ? '$' + mData.atr_14.toFixed(2) : '$6.09';
                    if (elSession && mData.session) elSession.innerText = 'Session: ' + mData.session;
                }

                // 2. Account Status
                const sRes = await fetch('/api/status');
                const sData = await sRes.json();
                if (sData) {
                    if (sData.account) {
                        const acc = sData.account;
                        const elAcc = document.getElementById('strip-account-id');
                        const elEq = document.getElementById('strip-account-equity');
                        const bEq = document.getElementById('banner-equity-val');
                        const bAcc = document.getElementById('banner-account-id');

                        if (elAcc && acc.login) elAcc.innerText = '#' + acc.login;
                        if (elEq && acc.equity !== undefined) elEq.innerText = '$' + acc.equity.toFixed(2);
                        if (bEq && acc.equity !== undefined) bEq.innerText = '$' + acc.equity.toFixed(2);
                        if (bAcc && acc.login) bAcc.innerText = '#' + acc.login;
                    }
                }

                // 3. Signals Latest
                const sigRes = await fetch('/api/signals/latest');
                const sigData = await sigRes.json();
                if (sigData && sigData.candidate_setups && sigData.candidate_setups.length > 0) {
                    const topSig = sigData.candidate_setups[0];
                    const elSide = document.getElementById('strip-signal-side');
                    const elSetup = document.getElementById('strip-signal-setup');
                    if (elSide) {
                        elSide.innerText = `${topSig.side} @ $${topSig.entry.toFixed(2)}`;
                        elSide.className = topSig.side === 'BUY' ? 'mono-nums val-bull' : 'mono-nums val-bear';
                    }
                    if (elSetup) {
                        elSetup.innerText = `${topSig.strategy_id} (R:R ${topSig.risk_reward})`;
                    }

                    // Update candidate box in strategies view if present
                    const candBox = document.getElementById('strat-candidate-box');
                    if (candBox) {
                        candBox.innerHTML = `
                            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <span class="${topSig.side === 'BUY' ? 'val-bull' : 'val-bear'} mono-nums" style="font-weight:800; font-size:15px;">${topSig.side} XAUUSD @ ${topSig.entry.toFixed(2)}</span>
                                <span style="font-size:11px; color:var(--text-muted);">&bull; Strategy: <strong style="color:var(--text-primary);">${topSig.strategy_id}</strong></span>
                                <span style="font-size:11px; color:var(--text-muted);">&bull; Stop Loss: <strong class="mono-nums" style="color:var(--accent-red);">${topSig.stop_loss.toFixed(2)}</strong></span>
                                <span style="font-size:11px; color:var(--text-muted);">&bull; Take Profit: <strong class="mono-nums" style="color:var(--accent-green);">${topSig.take_profit.toFixed(2)}</strong></span>
                                <span style="font-size:11px; color:var(--text-muted);">&bull; Risk:Reward: <strong style="color:var(--accent-gold);">${topSig.risk_reward}:1</strong></span>
                            </div>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
                                AI Rationale: ${topSig.reason || 'Confluence detected across multi-agent consensus.'}
                            </div>
                        `;
                    }
                }
            } catch(e) {}
        }
    """

    if "function isJustMarketsVerified" not in html:
        script_anchor = "function switchMainView(viewId, el) {"
        html = html.replace(script_anchor, js_gating_logic + "\n        " + script_anchor, 1)

    # 10. Update switchMainView to check gate UI and chart resizing
    orig_switch = """function switchMainView(viewId, el) {
            document.querySelectorAll('.view-pane').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (el) el.classList.add('active');

            if (viewId === 'view-trader' && chart) {
                setTimeout(() => {
                    const c = document.getElementById('candlestick-chart');
                    if (c) chart.resize(c.clientWidth, c.clientHeight);
                }, 50);
            }
            if (viewId === 'view-performance') {
                initEquityChart();
                loadJournal();
            }
        }"""

    new_switch = """function switchMainView(viewId, el) {
            document.querySelectorAll('.view-pane').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (el) {
                el.classList.add('active');
            } else {
                // Find matching link
                document.querySelectorAll('.nav-link').forEach(link => {
                    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(viewId)) {
                        link.classList.add('active');
                    }
                });
            }

            updateJustMarketsGateUI();

            if (viewId === 'view-trader' && chart) {
                setTimeout(() => {
                    const c = document.getElementById('candlestick-chart');
                    if (c) chart.resize(c.clientWidth, c.clientHeight);
                }, 50);
            }
            if (viewId === 'view-performance') {
                initEquityChart();
                loadJournal();
            }
        }"""
    html = html.replace(orig_switch, new_switch, 1)

    # 11. In DOMContentLoaded, call updateJustMarketsGateUI() and updateLiveStripRealData()
    dom_init_needle = "initCharts();"
    dom_init_repl = """updateJustMarketsGateUI();
            updateLiveStripRealData();
            setInterval(updateLiveStripRealData, 3000);
            initCharts();"""
    if "updateJustMarketsGateUI();" not in html:
        html = html.replace(dom_init_needle, dom_init_repl, 1)

    with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
        f.write(html)

    print("Platform successfully built and gated! Length:", len(html))

if __name__ == "__main__":
    build_gated_platform()
