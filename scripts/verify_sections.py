with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

checks = {
    "Brand Velarion": "Velarion" in text,
    "Trader Dashboard": "Trader Dashboard" in text,
    "Factual Academy": "Factual Academy" in text,
    "Admin & Onboarding": "Admin & Onboarding" in text,
    "Audited Statements": "Audited Statements" in text,
    "Subsidized Banner": "subsidized-banner" in text,
    "JustMarkets Account #1200533810": "1200533810" in text,
    "6-KPI Strip": "executive-kpi-grid" in text,
    "Candlestick Chart": "candlestick-chart-container" in text or "tv-chart-container" in text or "chart-canvas" in text,
    "M1-H4 Timeframes": "M15" in text and "H4" in text and "M1" in text,
    "Blotter Table": "blotter-table" in text,
    "Prop Guardian": "Prop Guardian & Kill Switch" in text,
    "Active Subsidized Bots": "Active Subsidized Bots" in text,
    "DOM Ladder": "dom-ladder-wrap" in text,
    "Drawdown Formula": "Asymmetric Recovery Formula" in text or "R = \\frac{D}" in text or "R = D / (1 - D)" in text,
    "Recovery Matrix": "matrix-table" in text,
    "Microstructure Spreads": "Market Microstructure, Spreads & Session Mechanics" in text,
    "Interactive Calculator": "calc-account-equity" in text,
    "Economic Transparency FAQ": "How We Provide This Without Guru Up-sells" in text or "Economic Transparency" in text,
    "Connect Account Modal": "modal-connect" in text,
    "Emergency Stop Endpoint": "/api/emergency-stop" in text,
}

for k, v in checks.items():
    print(f"[{'PASS' if v else 'FAIL'}] {k}")
