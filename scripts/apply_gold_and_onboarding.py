import re

with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. REPLACE THE PIP VALUE CALCULATOR DROPDOWN WITH SPOT GOLD ONLY
old_pip_group = """                            <div class="calc-input-group">
                                <label class="calc-label">Instrument Type</label>
                                <select id="pip-asset" class="calc-input" onchange="runPipCalc()">
                                    <option value="fx-usd">Major FX Pair (EUR/USD, GBP/USD)</option>
                                    <option value="gold">Spot Gold (XAUUSD)</option>
                                    <option value="jpy">JPY Pair (USD/JPY at 154.00)</option>
                                </select>
                            </div>"""

new_pip_group = """                            <div class="calc-input-group">
                                <label class="calc-label">Trading Instrument (Gold Only)</label>
                                <div class="calc-input mono-nums val-gold" style="display:flex; align-items:center; justify-content:space-between; font-weight:700;">
                                    <span>Spot Gold (XAUUSD)</span>
                                    <span class="status-badge status-completed">100 OZ CONTRACT</span>
                                </div>
                                <input type="hidden" id="pip-asset" value="gold">
                            </div>"""

assert old_pip_group in html, "old_pip_group not found"
html = html.replace(old_pip_group, new_pip_group, 1)

# In JS: update runPipCalc to calculate Spot Gold strictly
old_run_pip = """function runPipCalc() {
            const lots = parseFloat(document.getElementById('pip-lots')?.value) || 0.10;
            const asset = document.getElementById('pip-asset')?.value || 'fx-usd';
            let pipVal = 1.0;
            if (asset === 'fx-usd') pipVal = lots * 10.0;
            else if (asset === 'gold') pipVal = lots * 10.0; // 0.10 per pip on 100oz contract
            else if (asset === 'jpy') pipVal = lots * (1000 / 154.0);

            const elVal = document.getElementById('pip-out-val');
            const elEx = document.getElementById('pip-out-example');
            if (elVal) elVal.innerText = '$' + pipVal.toFixed(2) + ' USD';
            if (elEx) elEx.innerText = '$' + (pipVal * 20).toFixed(2) + ' USD';
        }"""

new_run_pip = """function runPipCalc() {
            const lots = parseFloat(document.getElementById('pip-lots')?.value) || 0.01;
            // Strictly Spot Gold (XAUUSD): 1 standard lot (1.00) = 100 oz.
            // 1 pip on Gold = $0.10 price move = $10.00 USD per standard lot ($0.10 per 0.01 micro lot).
            // A $1.00 move on Gold = $100.00 per standard lot ($1.00 per 0.01 micro lot).
            const pipVal = lots * 10.0;
            const elVal = document.getElementById('pip-out-val');
            const elEx = document.getElementById('pip-out-example');
            if (elVal) elVal.innerText = '$' + pipVal.toFixed(2) + ' USD';
            if (elEx) elEx.innerText = '$' + (pipVal * 20).toFixed(2) + ' USD';
        }"""

if old_run_pip in html:
    html = html.replace(old_run_pip, new_run_pip, 1)

# 2. REBUILD VIEW-ONBOARDING:
# Two-column space-saving layout:
# Left = Header, 3 Onboarding Steps, Official Link box
# Right = Live Terminal Broker Connection Status & Partner Verification Gate (MOVED TO RIGHT OF PAGE!)

s_onb = html.find('<div id="view-onboarding"')
e_onb = html.find('<!-- ==============================================================\n            <!-- VIEW 4: AUDITED STATEMENTS')
if e_onb == -1:
    e_onb = html.find('<!-- VIEW 4: AUDITED STATEMENTS')
# Let's find end before view-performance
e_onb_tag = html.find('<div id="view-performance"')

old_onb_slice = html[s_onb:e_onb_tag]

compact_onboarding_section = """<div id="view-onboarding" class="view-pane">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-default); padding-bottom:12px; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div class="level-tag level-tag-beginner" style="margin-bottom:4px;">BROKER INTEGRATION &bull; XAUUSD ONLY</div>
                        <h1 class="page-title" style="font-size:22px; margin:0;">JustMarkets Partner Setup &bull; Account Verification</h1>
                    </div>
                    <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold" style="font-size:12px; padding:8px 16px; text-decoration:none;">
                        Open JustMarkets MT5 &rarr;
                    </a>
                </div>

                <!-- 2-Column Compact Grid: Left = Steps & Link | Right = Live Broker Diagnostics & Verification (Moved to Right of Page!) -->
                <div style="display:grid; grid-template-columns:1fr 380px; gap:16px; align-items:start;">
                    <!-- Left Column: Steps & Link -->
                    <div>
                        <!-- 3 Steps Stacked Compactly -->
                        <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:14px;">
                            <div class="panel-card" style="padding:14px; margin-bottom:0; border-left:3px solid var(--accent-gold);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:10px; font-weight:800; color:var(--accent-gold);">STEP 01</span>
                                    <span class="status-badge" style="background:rgba(214,173,82,0.15); color:var(--accent-gold);">PARTNER CODE: p4cui0wkfz</span>
                                </div>
                                <h3 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:4px 0;">Register Pro-Hedging MT5 Account</h3>
                                <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0 0 10px 0;">
                                    Open an account with JustMarkets under official partner code <strong class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</strong>. Raw gold spreads from 0.8 pips and zero terminal license fees.
                                </p>
                                <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="font-size:11px; padding:6px 12px; width:100%; justify-content:center; text-decoration:none;">
                                    Register Under Partner &rarr;
                                </a>
                            </div>

                            <div class="panel-card" style="padding:14px; margin-bottom:0; border-left:3px solid var(--accent-green);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:10px; font-weight:800; color:var(--accent-green);">STEP 02</span>
                                    <span style="font-size:10px; color:var(--accent-green); font-weight:700;">NON-CUSTODIAL</span>
                                </div>
                                <h3 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:4px 0;">Fund Minimum $100 FTD</h3>
                                <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0;">
                                    Deposit $100+ to activate subsidized licensing. Capital remains 100% in your control to trade or withdraw at any time.
                                </p>
                            </div>

                            <div class="panel-card" style="padding:14px; margin-bottom:0; border-left:3px solid var(--accent-blue);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:10px; font-weight:800; color:var(--accent-blue);">STEP 03</span>
                                    <span style="font-size:10px; color:var(--accent-gold); font-weight:700;">AUTONOMOUS EXECUTION</span>
                                </div>
                                <h3 style="font-size:14px; font-weight:700; color:var(--text-primary); margin:4px 0;">Verify &amp; Activate Terminal</h3>
                                <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin:0;">
                                    Enter your JustMarkets MT5 Login in the panel on the right. Once verified, automated AI execution and the Forex School unlock automatically.
                                </p>
                            </div>
                        </div>

                        <!-- Official Referral Link Bar -->
                        <div class="panel-card" style="padding:14px; margin-bottom:0;">
                            <div style="font-size:11px; font-weight:700; color:var(--accent-gold); text-transform:uppercase; margin-bottom:4px;">Official Partner Tracking Link</div>
                            <div style="display:flex; gap:8px;">
                                <input type="text" id="partner-link-input" class="calc-input mono-nums" readonly value="https://one.justmarkets.link/a/p4cui0wkfz" style="color:var(--accent-gold); font-weight:700; font-size:12px;">
                                <button class="btn btn-secondary" onclick="copyPartnerLink()" style="font-size:11px; padding:6px 12px; white-space:nowrap;">
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: LIVE TERMINAL BROKER CONNECTION STATUS & VERIFICATION GATE (MOVED TO RIGHT OF PAGE!) -->
                    <div>
                        <!-- Live Terminal Broker Connection Status -->
                        <div class="panel-card" style="padding:16px; margin-bottom:12px; border-color:var(--border-gold);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <strong style="font-size:12px; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.5px;">Live Terminal Broker Status</strong>
                                <span id="diag-broker-status-pill" class="status-badge status-completed">CONNECTED</span>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="background:var(--bg-surface-2); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:var(--text-muted);">Broker Gateway</span>
                                    <span id="diag-broker-status" style="font-size:12px; font-weight:700; color:var(--accent-green);">JustMarkets Ltd</span>
                                </div>
                                <div style="background:var(--bg-surface-2); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:var(--text-muted);">Account Login</span>
                                    <span id="diag-account-login" class="mono-nums" style="font-size:12px; font-weight:700; color:var(--text-primary);">#1200533810</span>
                                </div>
                                <div style="background:var(--bg-surface-2); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:var(--text-muted);">Trading Mode</span>
                                    <span id="diag-trading-mode" class="mono-nums" style="font-size:12px; font-weight:700; color:var(--accent-gold);">LIVE_MT5 (XAUUSD)</span>
                                </div>
                                <div style="background:var(--bg-surface-2); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:var(--text-muted);">Account Equity</span>
                                    <span id="diag-account-equity" class="mono-nums val-gold" style="font-size:13px; font-weight:800;">$56.71 USD</span>
                                </div>
                            </div>
                        </div>

                        <!-- Verification & Account Gate Controller -->
                        <div class="panel-card" style="padding:16px; margin-bottom:0; background:rgba(214,173,82,0.03);">
                            <div style="font-size:11px; font-weight:800; color:var(--accent-gold); text-transform:uppercase; margin-bottom:4px;">Partner Verification Gate</div>
                            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:10px;">
                                Enter your JustMarkets MT5 Login to verify registration under partner code <code class="mono-nums val-gold">p4cui0wkfz</code>:
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <input type="text" id="onboarding-acc-input" placeholder="JustMarkets MT5 Login (e.g. 1200533810)" class="calc-input mono-nums" style="font-size:12px;">
                                <button class="btn btn-gold" onclick="submitGateVerification('onboarding-acc-input')" style="width:100%; justify-content:center; font-size:12px; padding:8px;">
                                    Verify &amp; Unlock Access
                                </button>
                                <button class="btn btn-secondary" onclick="quickVerifyDemoAccount()" style="width:100%; justify-content:center; font-size:11px; padding:6px;">
                                    Quick Demo Verify (#1200533810)
                                </button>
                            </div>
                            <div style="margin-top:10px; text-align:center;">
                                <button class="btn btn-secondary" onclick="resetPartnerVerification()" style="font-size:10px; padding:3px 8px; border-color:var(--accent-red); color:var(--text-primary);">
                                    Reset Verification (Test Lock)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 4: AUDITED STATEMENTS -->
            <!-- ============================================================== -->
            """

html = html[:s_onb] + compact_onboarding_section + html[e_onb_tag:]

with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Updated Pip Calculator (locked to Spot Gold) and Onboarding (2-column layout, diagnostics on right) successfully!")
