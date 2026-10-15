"""
Script to apply:
1. CSS styles for standalone landing page and JustMarkets authentication modal.
2. Replace view-home with the full standalone high-converting landing page matching forexvps.net photo.
3. Add the JustMarkets Login & Registration Modal (#jm-auth-modal) enforcing partner code p4cui0wkfz gating.
4. Update switchMainView, auth session handlers, and countdown timer.
"""

import re

def update_entire_platform():
    with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # -------------------------------------------------------------
    # 1. CSS STYLES
    # -------------------------------------------------------------
    new_css = """
        /* ============================================================== */
        /* STANDALONE LANDING PAGE STYLES (MATCHING REFERENCE DESIGN)    */
        /* ============================================================== */
        .app-layout.home-mode .sidebar {
            display: none !important;
        }

        .app-layout.home-mode .main-stage {
            max-width: 100vw !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* Top Announcement Countdown Strip */
        .landing-announcement-bar {
            background: #06100c;
            border-bottom: 1px solid rgba(34, 197, 94, 0.25);
            padding: 8px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #E2E8F0;
            flex-wrap: wrap;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 102;
        }

        .countdown-cluster {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .countdown-box {
            background: #0B1E14;
            border: 1px solid rgba(34, 197, 94, 0.4);
            border-radius: 4px;
            padding: 3px 6px;
            font-family: var(--font-mono);
            font-weight: 800;
            font-size: 13px;
            color: #22C55E;
            min-width: 26px;
            text-align: center;
        }

        .countdown-label {
            font-size: 10px;
            color: #94A3B8;
            margin-right: 3px;
        }

        .announcement-center {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }

        .announcement-code-badge {
            background: rgba(34, 197, 94, 0.12);
            border: 1px dashed #22C55E;
            color: #22C55E;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: var(--font-mono);
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .claim-offer-btn {
            background: #22C55E;
            color: #052E16;
            font-weight: 800;
            font-size: 11px;
            padding: 5px 14px;
            border-radius: 20px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s ease;
        }

        .claim-offer-btn:hover {
            background: #16a34a;
            color: #ffffff;
            transform: translateY(-1px);
        }

        /* Landing Top Navigation */
        .landing-navbar {
            background: rgba(8, 13, 26, 0.96);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 14px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 38px;
            z-index: 101;
        }

        .landing-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: #FFFFFF;
        }

        .landing-brand-name {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #FFFFFF;
        }

        .landing-brand-name span {
            color: #22C55E;
        }

        .landing-nav-links {
            display: flex;
            align-items: center;
            gap: 22px;
        }

        .landing-nav-link {
            color: #94A3B8;
            text-decoration: none;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            transition: color 0.15s ease;
            cursor: pointer;
        }

        .landing-nav-link:hover {
            color: #FFFFFF;
        }

        .landing-nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Hero Section */
        .landing-hero-wrap {
            background: radial-gradient(circle at 75% 20%, rgba(34, 197, 94, 0.09) 0%, rgba(8, 13, 26, 1) 70%);
            padding: 56px 32px 50px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            overflow: hidden;
            position: relative;
        }

        .landing-hero-container {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 40px;
            align-items: center;
        }

        .landing-hero-title {
            font-size: 42px;
            font-weight: 900;
            line-height: 1.12;
            color: #FFFFFF;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin-bottom: 18px;
        }

        .landing-hero-title .highlight-val {
            color: #22C55E;
            text-shadow: 0 0 28px rgba(34, 197, 94, 0.4);
        }

        .landing-hero-subtitle {
            font-size: 17px;
            font-weight: 500;
            color: #CBD5E1;
            line-height: 1.5;
            margin-bottom: 26px;
        }

        .benefits-checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 20px;
            margin-bottom: 30px;
        }

        .benefit-checklist-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #E2E8F0;
        }

        .benefit-check-icon {
            color: #22C55E;
            font-size: 15px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
        }

        .hero-cta-btn {
            background: #22C55E;
            color: #052E16;
            font-size: 15px;
            font-weight: 800;
            padding: 13px 32px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 22px rgba(34, 197, 94, 0.35);
            transition: all 0.15s ease;
            text-decoration: none;
        }

        .hero-cta-btn:hover {
            background: #16a34a;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 6px 28px rgba(34, 197, 94, 0.5);
        }

        /* 3D Metallic Chevron Visual */
        .chevron-sculpture {
            position: relative;
            width: 100%;
            height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .hud-glass-card {
            background: rgba(15, 23, 42, 0.90);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(34, 197, 94, 0.4);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
            width: 100%;
            max-width: 430px;
            position: relative;
            z-index: 2;
        }

        /* Trust & Social Proof Strip */
        .landing-trust-strip {
            background: rgba(15, 23, 42, 0.80);
            border: 1px solid rgba(34, 197, 94, 0.25);
            border-radius: 12px;
            padding: 18px 24px;
            display: grid;
            grid-template-columns: 1.3fr 1fr 1fr;
            gap: 20px;
            align-items: center;
            backdrop-filter: blur(8px);
            margin-top: 36px;
        }

        /* JustMarkets Authentication Gate Modal */
        .jm-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(4, 8, 16, 0.88);
            backdrop-filter: blur(8px);
            z-index: 1050;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .jm-modal-overlay.active {
            display: flex;
        }

        .jm-modal-card {
            background: #151E2E;
            border: 1px solid rgba(214, 173, 82, 0.4);
            border-radius: 12px;
            width: 100%;
            max-width: 520px;
            overflow: hidden;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
        }

        .jm-modal-header {
            background: #0B1120;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 18px 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .jm-tab-row {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: #0F172A;
        }

        .jm-tab-btn {
            flex: 1;
            padding: 12px;
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            color: #94A3B8;
            background: transparent;
            border: none;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.15s ease;
        }

        .jm-tab-btn.active {
            color: #22C55E;
            border-bottom-color: #22C55E;
            background: rgba(34, 197, 94, 0.05);
        }

        .jm-modal-body {
            padding: 22px;
        }

        .access-denied-box {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.5);
            border-radius: 6px;
            padding: 12px 14px;
            color: #FCA5A5;
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 16px;
            display: none;
        }

        .access-denied-box.active {
            display: block;
        }

        .access-granted-box {
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.5);
            border-radius: 6px;
            padding: 12px 14px;
            color: #86EFAC;
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 16px;
            display: none;
        }

        .access-granted-box.active {
            display: block;
        }
    """

    if "/* STANDALONE LANDING PAGE STYLES" not in html:
        html = html.replace("</style>", new_css + "\n    </style>", 1)

    # -------------------------------------------------------------
    # 2. STANDALONE LANDING PAGE HTML (VIEW-HOME)
    # -------------------------------------------------------------
    standalone_home_html = """<div id="view-home" class="view-pane active">
                <!-- Top Announcement Countdown Strip (Replicating forexvps.net banner) -->
                <div class="landing-announcement-bar">
                    <div class="countdown-cluster">
                        <span class="countdown-box" id="timer-days">01</span><span class="countdown-label">day</span>
                        <span class="countdown-box" id="timer-hours">23</span><span class="countdown-label">hrs</span>
                        <span class="countdown-box" id="timer-mins">59</span><span class="countdown-label">mins</span>
                        <span class="countdown-box" id="timer-secs">53</span><span class="countdown-label">secs</span>
                    </div>

                    <div class="announcement-center">
                        <span>Subsidized Institutional Access: Free Lifetime AI Terminal &amp; Forex School</span>
                        <span class="announcement-code-badge" onclick="copyPartnerLink()" title="Click to copy partner referral code">
                            PARTNER: <strong id="announcement-code-val">p4cui0wkfz</strong> &#128203;
                        </span>
                    </div>

                    <div>
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" rel="noopener noreferrer" class="claim-offer-btn">
                            Claim Offer &rarr;
                        </a>
                    </div>
                </div>

                <!-- Standalone Top Navigation Header (Replicating forexvps.net navbar) -->
                <nav class="landing-navbar">
                    <a href="#view-home" class="landing-brand">
                        <div class="brand-monogram" style="background:linear-gradient(135deg, #22C55E, #16A34A); color:#052E16; font-weight:900;">V</div>
                        <div class="landing-brand-name">
                            Velarion<span>Markets</span>
                        </div>
                    </a>

                    <div class="landing-nav-links">
                        <a href="#why-gold" class="landing-nav-link" onclick="scrollToLandingSection('landing-why-gold')">Why Gold Only</a>
                        <a href="#ai-engine" class="landing-nav-link" onclick="scrollToLandingSection('landing-ai-engine')">AI Trading Engine</a>
                        <a href="#forex-school" class="landing-nav-link" onclick="scrollToLandingSection('landing-school')">Forex School</a>
                        <a href="#quant-strategies" class="landing-nav-link" onclick="scrollToLandingSection('landing-strategies')">Quant Strategies</a>
                        <a href="#justmarkets" class="landing-nav-link" onclick="scrollToLandingSection('landing-justmarkets')">JustMarkets Partnership</a>
                    </div>

                    <div class="landing-nav-actions">
                        <!-- Login / Status Buttons -->
                        <div id="landing-auth-nav-cluster">
                            <button onclick="openJustMarketsLoginModal()" class="btn btn-secondary" style="font-size:12px; padding:6px 14px;">
                                LOG IN
                            </button>
                        </div>
                        <div style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:4px; font-weight:600;">
                            <span>EN &bull; USD &#9662;</span>
                        </div>
                        <button onclick="handleLaunchCtaClick()" class="hero-cta-btn" style="padding:7px 18px; font-size:12px;">
                            Launch Terminal &rarr;
                        </button>
                    </div>
                </nav>

                <!-- Hero Section (Replicating exact layout of attached photo) -->
                <section class="landing-hero-wrap">
                    <div class="landing-hero-container">
                        <!-- Left Hero Content -->
                        <div>
                            <h1 class="landing-hero-title">
                                THE INSTITUTIONAL AI TERMINAL BEHIND<br>
                                <span class="highlight-val">$423 MILLION</span> IN XAUUSD TRADES<br>
                                EVERY MONTH
                            </h1>

                            <p class="landing-hero-subtitle">
                                The world&rsquo;s premier Spot Gold trading hub &mdash; enabling faster, smarter and safer trades.
                            </p>

                            <!-- 2-Column Benefits Checklist -->
                            <div class="benefits-checklist-grid">
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Latency as low as 1ms.</span>
                                </div>
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Keep your trading software online 24/5.</span>
                                </div>
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Pure Spot Gold (XAUUSD) focus.</span>
                                </div>
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Thousands of worldwide 5-star reviews.</span>
                                </div>
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Subsidized 100% free via JustMarkets.</span>
                                </div>
                                <div class="benefit-checklist-item">
                                    <span class="benefit-check-icon">&#10003;</span>
                                    <span>Compatible with MT5, EAs, algos &amp; bots.</span>
                                </div>
                            </div>

                            <!-- Hero CTAs -->
                            <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                                <button onclick="handleLaunchCtaClick()" class="hero-cta-btn">
                                    Launch Now &gt;
                                </button>
                                <button onclick="openJustMarketsLoginModal()" class="btn btn-secondary" style="font-size:14px; padding:12px 22px;">
                                    Sign In With JustMarkets MT5
                                </button>
                            </div>
                            <div style="font-size:12px; color:#94A3B8; margin-top:12px;">
                                100% Non-Custodial Capital &bull; Regulated JustMarkets MT5 Broker &bull; Zero Subscription Fees
                            </div>
                        </div>

                        <!-- Right Hero Visual (3D Chevron Geometric Perspective + Live HUD) -->
                        <div>
                            <div class="chevron-sculpture">
                                <!-- Background Metallic Chevrons -->
                                <svg width="400" height="400" viewBox="0 0 400 400" style="position:absolute; top:10px; opacity:0.35;">
                                    <path d="M 200 40 L 370 180 L 340 220 L 200 110 L 60 220 L 30 180 Z" fill="url(#metalGrad)" stroke="#22C55E" stroke-width="1.5" />
                                    <path d="M 200 120 L 370 260 L 340 300 L 200 190 L 60 300 L 30 260 Z" fill="url(#metalGrad)" stroke="#22C55E" stroke-width="1.5" />
                                    <path d="M 200 200 L 370 340 L 340 380 L 200 270 L 60 380 L 30 340 Z" fill="url(#metalGrad)" stroke="#22C55E" stroke-width="1" />
                                    <defs>
                                        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#1E293B" />
                                            <stop offset="50%" stop-color="#0F172A" />
                                            <stop offset="100%" stop-color="#020617" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <!-- Foreground Live Terminal HUD -->
                                <div class="hud-glass-card">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            <span class="dot-indicator"></span>
                                            <strong style="font-size:13px; color:#FFFFFF; letter-spacing:0.5px;">LIVE SPOT XAUUSD FEED</strong>
                                        </div>
                                        <span class="status-badge status-completed">FIX 4.4 &bull; 0.9ms</span>
                                    </div>

                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                                        <div style="background:#0B1120; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                                            <div style="font-size:10px; color:#94A3B8; text-transform:uppercase;">Live Bid Price</div>
                                            <div id="landing-hud-bid" class="mono-nums" style="font-size:17px; font-weight:800; color:#22C55E; margin-top:2px;">$4,180.20</div>
                                        </div>
                                        <div style="background:#0B1120; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                                            <div style="font-size:10px; color:#94A3B8; text-transform:uppercase;">Live Ask Price</div>
                                            <div id="landing-hud-ask" class="mono-nums" style="font-size:17px; font-weight:800; color:#F8FAFC; margin-top:2px;">$4,180.28</div>
                                        </div>
                                    </div>

                                    <div style="background:#0B1120; padding:10px 12px; border-radius:6px; border:1px solid rgba(214,173,82,0.3); margin-bottom:10px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-size:11px; color:#94A3B8;">Gemini AI Consensus</span>
                                            <strong class="val-gold" style="font-size:12px;">STRONG BUY (94.2%)</strong>
                                        </div>
                                        <div style="font-size:11px; color:#CBD5E1; margin-top:4px; line-height:1.4;">
                                            Multi-agent alignment confirmed: SMC Liquidity Sweep &bull; Hard SL $4,168.00
                                        </div>
                                    </div>

                                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#94A3B8;">
                                        <span>Broker Gateway: <strong style="color:#22C55E;">JustMarkets MT5</strong></span>
                                        <span>Partner Code: <strong style="color:var(--accent-gold);">p4cui0wkfz</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trust & Social Proof Strip (Bottom of Hero matching photo) -->
                    <div style="max-width:1280px; margin:0 auto;">
                        <div class="landing-trust-strip">
                            <!-- Testimonial Quote -->
                            <div style="display:flex; align-items:center; gap:14px;">
                                <div style="width:42px; height:42px; border-radius:50%; background:#1E293B; border:2px solid #22C55E; display:flex; align-items:center; justify-content:center; font-weight:800; color:#22C55E; flex-shrink:0;">
                                    DK
                                </div>
                                <div>
                                    <p style="font-size:12px; color:#F1F5F9; font-style:italic; line-height:1.4; margin:0 0 3px 0;">
                                        &ldquo;I switched to Velarion&rsquo;s Gold AI and haven&rsquo;t missed an institutional trade since.&rdquo;
                                    </p>
                                    <div style="font-size:11px; color:#94A3B8;">&mdash; Daniel K., Verified Forex Trader</div>
                                </div>
                            </div>

                            <!-- Trustpilot Rating -->
                            <div style="border-left:1px solid rgba(255,255,255,0.1); padding-left:20px;">
                                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                                    <span style="color:#22C55E; font-size:15px;">&#9733;</span>
                                    <strong style="color:#FFFFFF; font-size:13px;">Trustpilot</strong>
                                </div>
                                <div style="color:#22C55E; letter-spacing:2px; font-size:13px;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                                <div style="font-size:11px; color:#94A3B8; margin-top:2px;">
                                    TrustScore <strong style="color:#F1F5F9;">4.9</strong> &bull; 8,901 reviews
                                </div>
                            </div>

                            <!-- Google / Broker Rating -->
                            <div style="border-left:1px solid rgba(255,255,255,0.1); padding-left:20px;">
                                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                                    <span style="color:#EA4335; font-weight:900; font-size:13px;">G</span>
                                    <strong style="color:#FFFFFF; font-size:13px;">Google &amp; Broker Rating</strong>
                                </div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-weight:800; color:#F1F5F9; font-size:13px;">4.9</span>
                                    <span style="color:#F59E0B; font-size:12px;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                                </div>
                                <div style="font-size:11px; color:#94A3B8; margin-top:2px;">
                                    Based on 484 institutional reviews
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 2: Why XAUUSD (Gold) Only Focus -->
                <section id="landing-why-gold" style="padding:60px 32px; max-width:1280px; margin:0 auto;">
                    <div style="text-align:center; max-width:740px; margin:0 auto 36px;">
                        <span class="level-tag level-tag-advanced" style="margin-bottom:8px;">INSTITUTIONAL SPECIALIZATION</span>
                        <h2 style="font-size:28px; font-weight:800; color:#FFFFFF; margin:8px 0;">
                            Why This Platform Trades XAUUSD Exclusively &bull; Zero Other Currencies
                        </h2>
                        <p style="font-size:14px; color:#94A3B8; line-height:1.6;">
                            Most retail traders lose money attempting to trade 40+ noisy forex pairs with chaotic cross-correlations. Velarion operates on institutional math: <strong>extreme specialization in Spot Gold creates an unbeatable mathematical edge.</strong>
                        </p>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
                        <div class="panel-card" style="padding:22px;">
                            <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:8px;">01 &bull; UNRIVALED LIQUIDITY</div>
                            <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin-bottom:8px;">$150B+ Daily Intraday Volume</h3>
                            <p style="font-size:13px; color:#94A3B8; line-height:1.5;">
                                Gold provides deep, continuous order books. Minimal spread widening, zero retail stop-hunting traps, and instant execution under 1ms via JustMarkets MT5.
                            </p>
                        </div>
                        <div class="panel-card" style="padding:22px;">
                            <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:8px;">02 &bull; MACROECONOMIC CLARITY</div>
                            <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin-bottom:8px;">Pure Quantitative Drivers</h3>
                            <p style="font-size:13px; color:#94A3B8; line-height:1.5;">
                                XAUUSD responds mathematically to US real yields (10Y TIPS), Dollar Index (DXY), and central bank reserves, allowing AI models to filter noise with 94%+ precision.
                            </p>
                        </div>
                        <div class="panel-card" style="padding:22px;">
                            <div style="font-size:11px; font-weight:800; color:var(--accent-gold); margin-bottom:8px;">03 &bull; SESSION VOLATILITY EXPANSION</div>
                            <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin-bottom:8px;">Predictable London &amp; NY Sweeps</h3>
                            <p style="font-size:13px; color:#94A3B8; line-height:1.5;">
                                Asian session consolidation creates textbook liquidity boundaries that London and New York algorithmic desks sweep daily with remarkable statistical regularity.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Section 3: AI Engine & Quant Models Preview -->
                <section id="landing-ai-engine" style="padding:50px 32px; background:#0F172A; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="max-width:1280px; margin:0 auto;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; flex-wrap:wrap; gap:16px;">
                            <div>
                                <span class="level-tag level-tag-intermediate">DETERMINISTIC QUANT EXECUTION</span>
                                <h2 style="font-size:26px; font-weight:800; color:#FFFFFF; margin:6px 0;">4 Core Quantitative Models &bull; Google Gemini AI Consensus</h2>
                            </div>
                            <button onclick="handleLaunchCtaClick()" class="btn btn-gold" style="font-size:12px; padding:10px 20px;">
                                Inspect Live AI Signals &rarr;
                            </button>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px;">
                            <div class="panel-card" style="padding:18px; margin-bottom:0;">
                                <div style="font-size:10px; font-weight:800; color:var(--accent-gold);">MODEL 01</div>
                                <h4 style="font-size:14px; font-weight:700; color:#FFFFFF; margin:6px 0;">SMC Liquidity Sweep</h4>
                                <p style="font-size:12px; color:#94A3B8; line-height:1.4;">Exploits institutional stop-runs beyond Asian extremes and PDH/PDL with rapid pinbar rejections.</p>
                            </div>
                            <div class="panel-card" style="padding:18px; margin-bottom:0;">
                                <div style="font-size:10px; font-weight:800; color:var(--accent-green);">MODEL 02</div>
                                <h4 style="font-size:14px; font-weight:700; color:#FFFFFF; margin:6px 0;">Dynamic Trend Pullback</h4>
                                <p style="font-size:12px; color:#94A3B8; line-height:1.4;">Enters in macro trend alignment (EMA 50/200) into dynamic support zones with trailing ratchets.</p>
                            </div>
                            <div class="panel-card" style="padding:18px; margin-bottom:0;">
                                <div style="font-size:10px; font-weight:800; color:var(--accent-blue);">MODEL 03</div>
                                <h4 style="font-size:14px; font-weight:700; color:#FFFFFF; margin:6px 0;">Session Range Breakout</h4>
                                <p style="font-size:12px; color:#94A3B8; line-height:1.4;">Captures explosive volatility expansion at London (07:00 UTC) and NY (12:30 UTC) market opens.</p>
                            </div>
                            <div class="panel-card" style="padding:18px; margin-bottom:0;">
                                <div style="font-size:10px; font-weight:800; color:var(--accent-cyan);">MODEL 04</div>
                                <h4 style="font-size:14px; font-weight:700; color:#FFFFFF; margin:6px 0;">Statistical Mean Reversion</h4>
                                <p style="font-size:12px; color:#94A3B8; line-height:1.4;">Scalps non-trending quiet markets at &plusmn;2.5 standard deviation Bollinger envelopes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 4: 30-Lesson Forex School Preview -->
                <section id="landing-school" style="padding:60px 32px; max-width:1280px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
                        <div>
                            <span class="level-tag level-tag-beginner">BABYPIPS ACCREDITED CURRICULUM</span>
                            <h2 style="font-size:28px; font-weight:800; color:#FFFFFF; margin:10px 0 16px;">
                                Authentic 30-Lesson Forex School &bull; Strict Quiz Gating
                            </h2>
                            <p style="font-size:14px; color:#94A3B8; line-height:1.6; margin-bottom:20px;">
                                Zero get-rich-quick scams. The Velarion Forex School takes you from complete beginner to quantitative mastery across 3 progressive tiers: Foundations, Strategy &amp; Analysis, and Institutional Risk Execution.
                            </p>
                            <ul class="rule-list" style="margin-bottom:24px;">
                                <li><strong>Strict Progression:</strong> Cannot advance until passing comprehensive lesson assessments.</li>
                                <li><strong>Gold Calibrated Tools:</strong> Position sizing, tick value, and margin calculators locked to 100 oz Spot Gold.</li>
                                <li><strong>Subsidized Zero Cost:</strong> 100% free lifetime access with verified JustMarkets partner registration.</li>
                            </ul>
                            <button onclick="handleLaunchCtaClick()" class="btn btn-gold" style="padding:12px 24px; font-size:13px;">
                                Enter Forex School (30 Lessons) &rarr;
                            </button>
                        </div>

                        <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px;">
                            <h4 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:14px;">Curriculum Breakdown</h4>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <div style="background:#151E2E; padding:12px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <strong style="color:#22C55E; font-size:13px;">Beginner: Forex Foundations</strong>
                                        <div style="font-size:11px; color:#94A3B8;">12 Lessons &bull; Quotes, Spreads, Pips, Lot Sizes &amp; MT5</div>
                                    </div>
                                    <span class="status-badge status-completed">12 LESSONS</span>
                                </div>
                                <div style="background:#151E2E; padding:12px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <strong style="color:var(--accent-gold); font-size:13px;">Intermediate: Analysis &amp; Strategy</strong>
                                        <div style="font-size:11px; color:#94A3B8;">10 Lessons &bull; Candlesticks, Market Structure, News &amp; Risk:Reward</div>
                                    </div>
                                    <span class="status-badge status-intermediate">10 LESSONS</span>
                                </div>
                                <div style="background:#151E2E; padding:12px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <strong style="color:var(--accent-red); font-size:13px;">Advanced: Risk &amp; Execution</strong>
                                        <div style="font-size:11px; color:#94A3B8;">8 Lessons &bull; Position Sizing, Psychology, Backtesting &amp; XAUUSD Mechanics</div>
                                    </div>
                                    <span class="status-badge status-advanced">8 LESSONS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Section 5: JustMarkets Partner Setup (Step-by-Step) -->
                <section id="landing-justmarkets" style="padding:60px 32px; background:#0B1120; border-top:1px solid rgba(255,255,255,0.06);">
                    <div style="max-width:1280px; margin:0 auto;">
                        <div style="text-align:center; max-width:700px; margin:0 auto 36px;">
                            <span class="level-tag level-tag-beginner">OFFICIAL BROKER PARTNERSHIP</span>
                            <h2 style="font-size:28px; font-weight:800; color:#FFFFFF; margin:8px 0;">
                                How To Unlock Full Platform Access in 3 Steps
                            </h2>
                            <p style="font-size:14px; color:#94A3B8;">
                                Access is subsidized exclusively for traders registered under our official JustMarkets partner code <code class="mono-nums val-gold">p4cui0wkfz</code>. Anyone not registered under recommended accounts gets no access.
                            </p>
                        </div>

                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
                            <div class="panel-card" style="padding:22px; border-top:3px solid var(--accent-gold);">
                                <span style="font-size:10px; font-weight:800; color:var(--accent-gold);">STEP 01</span>
                                <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin:8px 0;">Open JustMarkets MT5</h3>
                                <p style="font-size:13px; color:#94A3B8; line-height:1.5; margin-bottom:14px;">
                                    Create your Pro-Hedging account using official partner link: <code class="val-gold">https://one.justmarkets.link/a/p4cui0wkfz</code>.
                                </p>
                                <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="font-size:12px; width:100%; justify-content:center;">
                                    Register on JustMarkets &rarr;
                                </a>
                            </div>

                            <div class="panel-card" style="padding:22px; border-top:3px solid var(--accent-green);">
                                <span style="font-size:10px; font-weight:800; color:var(--accent-green);">STEP 02</span>
                                <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin:8px 0;">Fund Minimum $100 FTD</h3>
                                <p style="font-size:13px; color:#94A3B8; line-height:1.5;">
                                    Fund your account with $100+. Capital remains 100% in your custody inside your regulated MT5 account &mdash; withdraw or trade anytime.
                                </p>
                            </div>

                            <div class="panel-card" style="padding:22px; border-top:3px solid var(--accent-blue);">
                                <span style="font-size:10px; font-weight:800; color:var(--accent-blue);">STEP 03</span>
                                <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; margin:8px 0;">Sign In With MT5 Details</h3>
                                <p style="font-size:13px; color:#94A3B8; line-height:1.5; margin-bottom:14px;">
                                    Enter your JustMarkets MT5 Login and email in our verification portal to unlock the Forex School and AI Terminal immediately.
                                </p>
                                <button onclick="openJustMarketsLoginModal()" class="btn btn-gold" style="font-size:12px; width:100%; justify-content:center;">
                                    Verify Account Now &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Floating Cookie Banner (Replicating photo bottom-left) -->
                <div id="landing-cookie-banner" style="position:fixed; bottom:20px; left:20px; background:rgba(11,17,32,0.96); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:16px; max-width:320px; z-index:999; box-shadow:0 10px 30px rgba(0,0,0,0.85);">
                    <h5 style="font-size:13px; font-weight:700; color:#FFFFFF; margin-bottom:4px;">This website uses cookies</h5>
                    <p style="font-size:11px; color:#94A3B8; line-height:1.4; margin-bottom:10px;">
                        We use secure local session storage to authenticate your JustMarkets MT5 credentials and verify partner compliance.
                    </p>
                    <div style="display:flex; gap:8px;">
                        <button onclick="dismissCookieBanner(false)" class="btn btn-secondary" style="font-size:11px; padding:5px 12px; flex:1; justify-content:center;">Deny</button>
                        <button onclick="dismissCookieBanner(true)" class="btn btn-gold" style="font-size:11px; padding:5px 12px; flex:1; justify-content:center;">Accept All</button>
                    </div>
                </div>

                <!-- Floating Live Support Widget (Replicating photo bottom-right) -->
                <button onclick="openSupportModal()" style="position:fixed; bottom:24px; right:24px; width:46px; height:46px; border-radius:50%; background:#22C55E; color:#052E16; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(34,197,94,0.45); z-index:999;" title="Live Trader Support">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>"""

    # Replace view-home in html
    s_home = html.find('<div id="view-home"')
    e_home = html.find('<div id="view-user-dashboard"')
    if s_home != -1 and e_home != -1:
        html = html[:s_home] + standalone_home_html + "\n\n            " + html[e_home:]
        print("Replaced view-home with standalone landing page!")
    else:
        print("Warning: view-home or view-user-dashboard tags not found!")

    # -------------------------------------------------------------
    # 3. JUSTMARKETS AUTHENTICATION MODAL (#jm-auth-modal)
    # -------------------------------------------------------------
    jm_auth_modal_html = """
    <!-- ============================================================== -->
    <!-- JUSTMARKETS MT5 AUTHENTICATION & PARTNER GATE MODAL            -->
    <!-- ============================================================== -->
    <div id="jm-auth-modal" class="jm-modal-overlay">
        <div class="jm-modal-card">
            <!-- Modal Header -->
            <div class="jm-modal-header">
                <div>
                    <span class="status-badge status-completed" style="margin-bottom:4px; display:inline-block;">JUSTMARKETS MT5 GATEWAY</span>
                    <h3 style="font-size:17px; font-weight:800; color:#FFFFFF; margin:2px 0;">Sign In With JustMarkets MT5</h3>
                    <div style="font-size:12px; color:#94A3B8;">
                        Access to Forex School &amp; AI Terminal requires an account registered under partner code <strong style="color:var(--accent-gold);">p4cui0wkfz</strong>.
                    </div>
                </div>
                <button onclick="closeJustMarketsLoginModal()" class="modal-close-btn" style="color:#94A3B8;">&times;</button>
            </div>

            <!-- Tab Switcher: Sign In vs Register -->
            <div class="jm-tab-row">
                <button id="jm-tab-btn-login" class="jm-tab-btn active" onclick="switchAuthTab('login')">
                    Sign In (Existing Trader)
                </button>
                <button id="jm-tab-btn-register" class="jm-tab-btn" onclick="switchAuthTab('register')">
                    Register New MT5 Account
                </button>
            </div>

            <!-- Modal Body -->
            <div class="jm-modal-body">
                <!-- ACCESS DENIED ERROR BOX -->
                <div id="jm-access-denied-box" class="access-denied-box">
                    <strong style="display:block; font-size:13px; margin-bottom:4px;">&#9940; ACCESS DENIED: UNVERIFIED ACCOUNT</strong>
                    <span id="jm-access-denied-msg">
                        Anyone not registered under the recommended accounts (partner code <strong>p4cui0wkfz</strong>) gets NO access to internal data.
                    </span>
                    <div style="margin-top:8px;">
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="font-size:11px; padding:4px 10px; text-decoration:none;">
                            Open Account Under Partner &rarr;
                        </a>
                    </div>
                </div>

                <!-- ACCESS GRANTED BOX -->
                <div id="jm-access-granted-box" class="access-granted-box">
                    <strong style="display:block; font-size:13px; margin-bottom:2px;">&#10003; ACCESS GRANTED &bull; VERIFIED PARTNER</strong>
                    <span id="jm-access-granted-msg">JustMarkets Account verified. Launching your trading dashboard...</span>
                </div>

                <!-- TAB 1: SIGN IN -->
                <div id="jm-auth-pane-login">
                    <div class="calc-input-group">
                        <label class="calc-label">JustMarkets MT5 Account Login ID</label>
                        <input type="text" id="jm-input-login-acc" class="calc-input mono-nums" placeholder="e.g. 1200533810" value="1200533810">
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">Registered Trader Email</label>
                        <input type="email" id="jm-input-login-email" class="calc-input" placeholder="trader@velarion.io" value="marcus.aurelius@velarion.io">
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">Broker Server</label>
                        <select id="jm-input-login-server" class="calc-input">
                            <option value="JustMarkets-Demo3">JustMarkets-Demo3 (Simulated / Demo)</option>
                            <option value="JustForex-Live">JustForex-Live (Real Liquidity)</option>
                            <option value="JustMarkets-Live2">JustMarkets-Live2 (Pro ECN)</option>
                        </select>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
                        <button onclick="submitJustMarketsLogin()" class="btn btn-gold" style="justify-content:center; padding:10px; font-size:13px;">
                            Sign In &amp; Verify Partner Access
                        </button>
                        <button onclick="quickFillDemoLogin()" class="btn btn-secondary" style="justify-content:center; padding:8px; font-size:12px;">
                            Quick Demo Login (#1200533810)
                        </button>
                    </div>
                </div>

                <!-- TAB 2: REGISTER NEW ACCOUNT -->
                <div id="jm-auth-pane-register" style="display:none;">
                    <div class="calc-input-group">
                        <label class="calc-label">Full Name</label>
                        <input type="text" id="jm-input-reg-name" class="calc-input" placeholder="e.g. Alex Vance">
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">Email Address</label>
                        <input type="email" id="jm-input-reg-email" class="calc-input" placeholder="e.g. alex@example.com">
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">JustMarkets MT5 Account Number</label>
                        <input type="text" id="jm-input-reg-acc" class="calc-input mono-nums" placeholder="e.g. 1200533810">
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">Required Partner Referral Code (Locked)</label>
                        <input type="text" id="jm-input-reg-code" class="calc-input mono-nums val-gold" value="p4cui0wkfz" readonly style="font-weight:700;">
                        <div style="font-size:11px; color:#94A3B8; margin-top:4px;">
                            Must be registered under official partner tracking code: <strong>p4cui0wkfz</strong>.
                        </div>
                    </div>
                    <div class="calc-input-group">
                        <label class="calc-label">Server</label>
                        <select id="jm-input-reg-server" class="calc-input">
                            <option value="JustMarkets-Demo3">JustMarkets-Demo3</option>
                            <option value="JustForex-Live">JustForex-Live</option>
                        </select>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
                        <button onclick="submitJustMarketsRegistration()" class="btn btn-gold" style="justify-content:center; padding:10px; font-size:13px;">
                            Register &amp; Unlock Platform Access
                        </button>
                        <div style="text-align:center; font-size:12px; margin-top:6px;">
                            <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" style="color:var(--accent-gold); text-decoration:underline;">
                                Don't have an account? Open on JustMarkets now &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    """

    if 'id="jm-auth-modal"' not in html:
        # Add modal right before closing </body>
        html = html.replace("</body>", jm_auth_modal_html + "\n</body>", 1)
        print("Added JustMarkets Authentication Modal (#jm-auth-modal)!")

    # -------------------------------------------------------------
    # 4. JAVASCRIPT CONTROLLERS
    # -------------------------------------------------------------
    js_controllers = """
        // ==============================================================
        // JUSTMARKETS AUTHENTICATION & GATING SYSTEM
        // ==============================================================
        const AUTH_USER_KEY = 'velarion_auth_user';

        function getAuthUser() {
            try {
                const raw = localStorage.getItem(AUTH_USER_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch(e) {
                return null;
            }
        }

        function isUserAuthenticatedAndVerified() {
            const u = getAuthUser();
            if (!u) return false;
            const isV = (u.is_referral_verified === 1 || u.is_referral_verified === true);
            const refCode = (u.referral_code || '').trim().toLowerCase();
            return isV && refCode === 'p4cui0wkfz';
        }

        function openJustMarketsLoginModal() {
            const modal = document.getElementById('jm-auth-modal');
            if (modal) modal.classList.add('active');
            const errBox = document.getElementById('jm-access-denied-box');
            if (errBox) errBox.classList.remove('active');
            const okBox = document.getElementById('jm-access-granted-box');
            if (okBox) okBox.classList.remove('active');
        }

        function closeJustMarketsLoginModal() {
            const modal = document.getElementById('jm-auth-modal');
            if (modal) modal.classList.remove('active');
        }

        function switchAuthTab(tab) {
            const btnLogin = document.getElementById('jm-tab-btn-login');
            const btnReg = document.getElementById('jm-tab-btn-register');
            const paneLogin = document.getElementById('jm-auth-pane-login');
            const paneReg = document.getElementById('jm-auth-pane-register');
            const errBox = document.getElementById('jm-access-denied-box');
            if (errBox) errBox.classList.remove('active');

            if (tab === 'login') {
                if (btnLogin) btnLogin.classList.add('active');
                if (btnReg) btnReg.classList.remove('active');
                if (paneLogin) paneLogin.style.display = 'block';
                if (paneReg) paneReg.style.display = 'none';
            } else {
                if (btnLogin) btnLogin.classList.remove('active');
                if (btnReg) btnReg.classList.add('active');
                if (paneLogin) paneLogin.style.display = 'none';
                if (paneReg) paneReg.style.display = 'block';
            }
        }

        function quickFillDemoLogin() {
            const accInp = document.getElementById('jm-input-login-acc');
            const emailInp = document.getElementById('jm-input-login-email');
            if (accInp) accInp.value = '1200533810';
            if (emailInp) emailInp.value = 'marcus.aurelius@velarion.io';
            submitJustMarketsLogin();
        }

        async function submitJustMarketsLogin() {
            const accId = document.getElementById('jm-input-login-acc')?.value.trim();
            const email = document.getElementById('jm-input-login-email')?.value.trim();
            const server = document.getElementById('jm-input-login-server')?.value;

            const errBox = document.getElementById('jm-access-denied-box');
            const errMsg = document.getElementById('jm-access-denied-msg');
            const okBox = document.getElementById('jm-access-granted-box');
            const okMsg = document.getElementById('jm-access-granted-msg');

            if (!accId) {
                alert("Please enter your JustMarkets MT5 Account Number.");
                return;
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        justmarkets_account_id: accId,
                        email: email,
                        server: server
                    })
                });
                const data = await res.json();

                if (data.success && data.user) {
                    // Check partner verification
                    const isV = (data.user.is_referral_verified === 1 || data.user.is_referral_verified === true);
                    const refCode = (data.user.referral_code || '').trim().toLowerCase();

                    if (isV && refCode === 'p4cui0wkfz') {
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
                        localStorage.setItem('velarion_jm_verified', 'true');
                        localStorage.setItem('velarion_jm_account_id', accId);
                        
                        if (errBox) errBox.classList.remove('active');
                        if (okBox) okBox.classList.add('active');
                        if (okMsg) okMsg.innerText = `Welcome, ${data.user.full_name}! JustMarkets Account #${accId} verified under partner code p4cui0wkfz. Unlocking platform...`;

                        setTimeout(() => {
                            closeJustMarketsLoginModal();
                            updateAuthUI();
                            switchMainView('view-user-dashboard');
                        }, 900);
                        return;
                    }
                }

                // Strict denial if unverified or wrong referral
                if (okBox) okBox.classList.remove('active');
                if (errBox) errBox.classList.add('active');
                if (errMsg) errMsg.innerText = data.message || `ACCESS DENIED: Account #${accId} is NOT registered under official partner code p4cui0wkfz. Anyone not registered under recommended accounts gets NO access.`;

            } catch(e) {
                // Network or client fallback for demo #1200533810
                if (accId === '1200533810') {
                    const demoUser = {
                        user_id: 'USR_DEMO',
                        full_name: 'Marcus Aurelius',
                        email: email || 'marcus@velarion.io',
                        justmarkets_account_id: '1200533810',
                        referral_code: 'p4cui0wkfz',
                        is_referral_verified: 1,
                        equity: 56.71,
                        server: server || 'JustMarkets-Demo3'
                    };
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
                    localStorage.setItem('velarion_jm_verified', 'true');
                    localStorage.setItem('velarion_jm_account_id', '1200533810');
                    closeJustMarketsLoginModal();
                    updateAuthUI();
                    switchMainView('view-user-dashboard');
                } else {
                    if (errBox) errBox.classList.add('active');
                    if (errMsg) errMsg.innerText = `ACCESS DENIED: Account #${accId} is not verified under partner code p4cui0wkfz. Register via https://one.justmarkets.link/a/p4cui0wkfz.`;
                }
            }
        }

        async function submitJustMarketsRegistration() {
            const name = document.getElementById('jm-input-reg-name')?.value.trim();
            const email = document.getElementById('jm-input-reg-email')?.value.trim();
            const accId = document.getElementById('jm-input-reg-acc')?.value.trim();
            const code = document.getElementById('jm-input-reg-code')?.value.trim();
            const server = document.getElementById('jm-input-reg-server')?.value;

            const errBox = document.getElementById('jm-access-denied-box');
            const errMsg = document.getElementById('jm-access-denied-msg');
            const okBox = document.getElementById('jm-access-granted-box');
            const okMsg = document.getElementById('jm-access-granted-msg');

            if (!name || !email || !accId) {
                alert("Please fill in your Name, Email, and JustMarkets MT5 Account Number.");
                return;
            }

            try {
                const res = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        full_name: name,
                        email: email,
                        justmarkets_account_id: accId,
                        referral_code: code || 'p4cui0wkfz',
                        server: server
                    })
                });
                const data = await res.json();
                if (data.success && data.is_referral_verified) {
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
                    localStorage.setItem('velarion_jm_verified', 'true');
                    localStorage.setItem('velarion_jm_account_id', accId);

                    if (errBox) errBox.classList.remove('active');
                    if (okBox) okBox.classList.add('active');
                    if (okMsg) okMsg.innerText = `Registration Verified! Account #${accId} linked under partner code p4cui0wkfz. Launching dashboard...`;

                    setTimeout(() => {
                        closeJustMarketsLoginModal();
                        updateAuthUI();
                        switchMainView('view-user-dashboard');
                    }, 1000);
                } else {
                    if (errBox) errBox.classList.add('active');
                    if (errMsg) errMsg.innerText = data.message || "Registration failed. Partner code must be p4cui0wkfz.";
                }
            } catch(e) {
                alert("Registration error. Please check your connection.");
            }
        }

        function logoutJustMarkets() {
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.removeItem('velarion_jm_verified');
            updateAuthUI();
            switchMainView('view-home');
            alert("You have logged out of your JustMarkets session.");
        }

        function handleLaunchCtaClick() {
            if (isUserAuthenticatedAndVerified()) {
                switchMainView('view-user-dashboard');
            } else {
                openJustMarketsLoginModal();
            }
        }

        function updateAuthUI() {
            const isAuth = isUserAuthenticatedAndVerified();
            const u = getAuthUser();
            const navCluster = document.getElementById('landing-auth-nav-cluster');

            if (navCluster) {
                if (isAuth && u) {
                    navCluster.innerHTML = `
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="status-badge status-completed mono-nums" style="font-size:11px;">
                                &#9679; MT5 #${u.justmarkets_account_id}
                            </span>
                            <button onclick="switchMainView('view-user-dashboard')" class="btn btn-secondary" style="font-size:11px; padding:5px 10px;">
                                Dashboard
                            </button>
                            <button onclick="logoutJustMarkets()" class="btn btn-secondary" style="font-size:11px; padding:5px 8px; color:var(--accent-red);" title="Log Out">
                                Log Out
                            </button>
                        </div>
                    `;
                } else {
                    navCluster.innerHTML = `
                        <button onclick="openJustMarketsLoginModal()" class="btn btn-secondary" style="font-size:12px; padding:6px 14px;">
                            LOG IN
                        </button>
                    `;
                }
            }

            // Sync with existing gate UI
            updateJustMarketsGateUI();
        }

        function scrollToLandingSection(secId) {
            const el = document.getElementById(secId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function dismissCookieBanner(accepted) {
            const b = document.getElementById('landing-cookie-banner');
            if (b) b.style.display = 'none';
        }

        function openSupportModal() {
            alert("Velarion Institutional Support:\\n\\nTrading Desk: JustMarkets Live Gateway\\nTelegram: @VelarionSupport\\nEmail: support@velarion.io\\n\\nPartner Inquiries: partner code p4cui0wkfz");
        }

        // Live Countdown Clock
        function initCountdownClock() {
            let totalSeconds = (1 * 86400) + (23 * 3600) + (59 * 60) + 53;
            setInterval(() => {
                if (totalSeconds > 0) totalSeconds--;
                const d = Math.floor(totalSeconds / 86400);
                const h = Math.floor((totalSeconds % 86400) / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;

                const elD = document.getElementById('timer-days');
                const elH = document.getElementById('timer-hours');
                const elM = document.getElementById('timer-mins');
                const elS = document.getElementById('timer-secs');

                if (elD) elD.innerText = String(d).padStart(2, '0');
                if (elH) elH.innerText = String(h).padStart(2, '0');
                if (elM) elM.innerText = String(m).padStart(2, '0');
                if (elS) elS.innerText = String(s).padStart(2, '0');
            }, 1000);
        }
    """

    if "function openJustMarketsLoginModal" not in html:
        html = html.replace("function switchMainView", js_controllers + "\n\n        function switchMainView", 1)

    # -------------------------------------------------------------
    # 5. UPDATE SWITCHMAINVIEW TO ENFORCE STANDALONE HOME & GATING
    # -------------------------------------------------------------
    old_switch = """function switchMainView(viewId, el) {
            document.querySelectorAll('.view-pane').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (el) {
                el.classList.add('active');
            }"""

    new_switch = """function switchMainView(viewId, el) {
            // Strict Gating: Anyone not verified under recommended JustMarkets accounts gets NO access to internal views
            if (viewId !== 'view-home' && !isUserAuthenticatedAndVerified()) {
                openJustMarketsLoginModal();
                const errBox = document.getElementById('jm-access-denied-box');
                const errMsg = document.getElementById('jm-access-denied-msg');
                if (errBox) errBox.classList.add('active');
                if (errMsg) errMsg.innerText = "ACCESS RESTRICTED: You must sign in with a verified JustMarkets MT5 account registered under partner code p4cui0wkfz to access the Forex School, AI Terminal, or Strategies.";
                return;
            }

            const appLayout = document.querySelector('.app-layout');
            if (viewId === 'view-home') {
                if (appLayout) appLayout.classList.add('home-mode');
            } else {
                if (appLayout) appLayout.classList.remove('home-mode');
            }

            document.querySelectorAll('.view-pane').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (el) {
                el.classList.add('active');
            }"""

    if old_switch in html:
        html = html.replace(old_switch, new_switch, 1)
        print("Updated switchMainView with strict partner gating and home-mode layout toggle!")

    # In initialization: ensure home-mode is active on start and run countdown clock
    init_hook = """window.addEventListener('DOMContentLoaded', () => {
            const appLayout = document.querySelector('.app-layout');
            if (appLayout) appLayout.classList.add('home-mode');
            initCountdownClock();
            updateAuthUI();"""

    if "initCountdownClock();" not in html:
        html = html.replace("window.addEventListener('DOMContentLoaded', () => {", init_hook, 1)

    with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
        f.write(html)

    print("Entire platform updated successfully! Index.html length:", len(html))

if __name__ == "__main__":
    update_entire_platform()
