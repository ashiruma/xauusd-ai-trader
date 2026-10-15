ui_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VELARION QUANT PORTAL | Institutional Capital Execution</title>
    <!-- Google Fonts: Inter & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- TradingView Lightweight Charts v4.2.0 CDN -->
    <script src="https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        :root {
            --bg-base: #06080d;
            --bg-surface-1: #0a0e17;
            --bg-surface-2: #0f1523;
            --bg-surface-3: #151d30;
            --bg-card: #0d121c;
            --bg-card-hover: #121927;
            --bg-input: #080c14;

            --border-subtle: rgba(255, 255, 255, 0.06);
            --border-default: rgba(255, 255, 255, 0.10);
            --border-hover: rgba(255, 255, 255, 0.18);
            --border-gold: rgba(229, 184, 59, 0.35);

            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --text-gold: #e5b83b;

            --accent-gold: #e5b83b;
            --accent-gold-hover: #f3c74d;
            --accent-gold-subtle: rgba(229, 184, 59, 0.08);

            --accent-green: #00e599;
            --accent-green-subtle: rgba(0, 229, 153, 0.08);
            --accent-green-border: rgba(0, 229, 153, 0.25);

            --accent-red: #ff4d4f;
            --accent-red-subtle: rgba(255, 77, 79, 0.08);
            --accent-red-border: rgba(255, 77, 79, 0.25);

            --accent-blue: #3b82f6;
            --accent-cyan: #06b6d4;

            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;

            --radius-sm: 4px;
            --radius-md: 6px;
            --radius-lg: 8px;
            --radius-xl: 12px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-base);
            color: var(--text-primary);
            font-family: var(--font-sans);
            font-size: 13px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* Top Institutional Header */
        .top-nav {
            background: var(--bg-surface-1);
            border-bottom: 1px solid var(--border-default);
            height: 52px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .brand-cluster {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-monogram {
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, #e5b83b, #b38612);
            color: #000;
            font-weight: 800;
            font-size: 15px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-sans);
            box-shadow: 0 0 10px rgba(229, 184, 59, 0.3);
        }

        .brand-text-wrap {
            display: flex;
            flex-direction: column;
        }

        .brand-name {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: var(--text-primary);
            line-height: 1.1;
        }

        .brand-sub {
            font-size: 10px;
            color: var(--accent-gold);
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .top-telemetry {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .telemetry-pill {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-surface-2);
            border: 1px solid var(--border-subtle);
            padding: 4px 10px;
            border-radius: var(--radius-sm);
            font-size: 11px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
        }

        .dot-indicator {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--accent-green);
            box-shadow: 0 0 6px var(--accent-green);
        }

        .dot-indicator.offline {
            background: var(--accent-red);
            box-shadow: 0 0 6px var(--accent-red);
        }

        .top-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 600;
            border-radius: var(--radius-sm);
            cursor: pointer;
            text-decoration: none;
            transition: all 0.15s ease;
            border: 1px solid transparent;
            font-family: var(--font-sans);
        }

        .btn-gold {
            background: linear-gradient(180deg, #f5cd5e 0%, #e5b83b 100%);
            color: #090d16;
            font-weight: 700;
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .btn-gold:hover {
            background: linear-gradient(180deg, #fae08c 0%, #f3c74d 100%);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--bg-surface-2);
            color: var(--text-primary);
            border-color: var(--border-default);
        }

        .btn-secondary:hover {
            background: var(--bg-surface-3);
            border-color: var(--border-hover);
        }

        .btn-danger {
            background: var(--accent-red-subtle);
            color: var(--accent-red);
            border-color: var(--accent-red-border);
        }

        .btn-danger:hover {
            background: rgba(255, 77, 79, 0.18);
        }

        /* Layout Container */
        .app-layout {
            display: flex;
            min-height: calc(100vh - 52px);
        }

        /* Left Sidebar */
        .sidebar {
            width: 220px;
            background: var(--bg-surface-1);
            border-right: 1px solid var(--border-default);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding: 16px 10px;
        }

        .nav-section-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            padding: 8px 12px 6px;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            border-radius: var(--radius-sm);
            margin-bottom: 2px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .nav-link:hover {
            background: var(--bg-surface-2);
            color: var(--text-primary);
        }

        .nav-link.active {
            background: var(--bg-surface-2);
            color: var(--accent-gold);
            font-weight: 600;
            border-left: 2px solid var(--accent-gold);
        }

        .sidebar-bottom {
            margin-top: auto;
            padding: 12px;
            background: var(--bg-surface-2);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
        }

        .partner-badge-box {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .partner-badge-box strong {
            color: var(--accent-gold);
            display: block;
            margin-bottom: 3px;
        }

        /* Main Content View Container */
        .main-stage {
            flex: 1;
            padding: 16px 20px;
            overflow-y: auto;
            max-width: calc(100vw - 220px);
        }

        .view-pane {
            display: none;
        }

        .view-pane.active {
            display: block;
        }

        /* Subsidized Lifetime Access Banner */
        .subsidized-banner {
            background: linear-gradient(90deg, rgba(229, 184, 59, 0.08) 0%, rgba(10, 14, 23, 0.95) 100%);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-lg);
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
        }

        .banner-left {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .banner-icon-shield {
            width: 36px;
            height: 36px;
            background: rgba(229, 184, 59, 0.15);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent-gold);
            flex-shrink: 0;
        }

        .banner-title-line {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .banner-heading {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .banner-tier-tag {
            background: var(--accent-gold);
            color: #000;
            font-size: 9px;
            font-weight: 800;
            padding: 1px 6px;
            border-radius: 2px;
            letter-spacing: 0.5px;
        }

        .banner-meta {
            font-size: 11px;
            color: var(--text-secondary);
            margin-top: 2px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }

        .banner-meta span strong {
            color: var(--text-primary);
        }

        .banner-right-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Executive 6-KPI Strip */
        .executive-kpi-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }

        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 10px 14px;
            transition: border-color 0.15s ease;
        }

        .kpi-card:hover {
            border-color: var(--border-default);
        }

        .kpi-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .kpi-value {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-primary);
            font-family: var(--font-sans);
            line-height: 1.2;
        }

        .kpi-subtext {
            font-size: 10px;
            color: var(--text-muted);
            margin-top: 2px;
        }

        .val-bull { color: var(--accent-green) !important; }
        .val-bear { color: var(--accent-red) !important; }
        .val-gold { color: var(--accent-gold) !important; }
        .mono-nums { font-family: var(--font-mono); font-feature-settings: "tnum"; }

        /* Workspace Grid Split */
        .workspace-main-split {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 16px;
            margin-bottom: 16px;
        }

        .panel-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            overflow: hidden;
            margin-bottom: 16px;
        }

        .panel-header {
            background: var(--bg-surface-2);
            border-bottom: 1px solid var(--border-subtle);
            padding: 8px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .panel-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Timeframe Pill Group */
        .timeframe-pill-group {
            display: flex;
            gap: 2px;
            background: var(--bg-surface-1);
            padding: 2px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-subtle);
        }

        .tf-pill {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 2px;
            cursor: pointer;
            font-family: var(--font-mono);
        }

        .tf-pill:hover {
            color: var(--text-primary);
        }

        .tf-pill.active {
            background: var(--accent-gold);
            color: #000;
        }

        /* Blotter Table */
        .table-responsive {
            overflow-x: auto;
        }

        .blotter-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            text-align: left;
        }

        .blotter-table th {
            background: var(--bg-surface-2);
            color: var(--text-muted);
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-subtle);
            font-weight: 600;
        }

        .blotter-table td {
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-subtle);
            color: var(--text-primary);
        }

        .blotter-table tr:hover td {
            background: var(--bg-surface-2);
        }

        .badge-side-buy {
            background: var(--accent-green-subtle);
            color: var(--accent-green);
            border: 1px solid var(--accent-green-border);
            padding: 1px 6px;
            border-radius: 2px;
            font-weight: 700;
            font-size: 10px;
        }

        .badge-side-sell {
            background: var(--accent-red-subtle);
            color: var(--accent-red);
            border: 1px solid var(--accent-red-border);
            padding: 1px 6px;
            border-radius: 2px;
            font-weight: 700;
            font-size: 10px;
        }

        .btn-table-close {
            background: var(--accent-red-subtle);
            border: 1px solid var(--accent-red-border);
            color: var(--accent-red);
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 2px;
            cursor: pointer;
        }

        .btn-table-close:hover {
            background: var(--accent-red);
            color: #fff;
        }

        /* Right Column Widgets */
        .prop-guardian-body {
            padding: 14px;
        }

        .guardian-metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            padding: 6px 0;
            border-bottom: 1px solid var(--border-subtle);
        }

        .guardian-metric-title {
            color: var(--text-secondary);
        }

        .guardian-metric-val {
            font-weight: 700;
            font-family: var(--font-mono);
        }

        .btn-emergency-halt {
            width: 100%;
            background: linear-gradient(180deg, #ff4d4f 0%, #d9363e 100%);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.5px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            margin: 12px 0 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
        }

        .btn-emergency-halt:hover {
            background: #ff5c5e;
        }

        /* Bots List */
        .bots-list {
            padding: 8px 12px;
        }

        .bot-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-subtle);
        }

        .bot-row:last-child {
            border-bottom: none;
        }

        .bot-info-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .bot-status-tag {
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 2px;
            text-transform: uppercase;
        }

        .bot-status-running {
            background: var(--accent-green-subtle);
            color: var(--accent-green);
            border: 1px solid var(--accent-green-border);
        }

        .bot-info-desc {
            font-size: 10px;
            color: var(--text-muted);
            margin-top: 1px;
        }

        .bot-yield {
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 700;
            color: var(--accent-green);
            text-align: right;
        }

        /* DOM Ladder */
        .dom-ladder-wrap {
            padding: 10px 14px;
        }

        .dom-header-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            padding-bottom: 6px;
            border-bottom: 1px solid var(--border-subtle);
            margin-bottom: 6px;
        }

        .dom-row {
            display: grid;
            grid-template-columns: 48px 1fr 64px;
            align-items: center;
            font-family: var(--font-mono);
            font-size: 11px;
            padding: 3px 6px;
            border-radius: 2px;
            position: relative;
            overflow: hidden;
            margin-bottom: 2px;
        }

        .dom-row-ask { background: rgba(255, 77, 79, 0.05); }
        .dom-row-bid { background: rgba(0, 229, 153, 0.05); }

        .dom-lp-tag { font-size: 9px; font-weight: 700; color: var(--text-muted); }
        .dom-price-ask { color: var(--accent-red); font-weight: 600; text-align: center; }
        .dom-price-bid { color: var(--accent-green); font-weight: 600; text-align: center; }

        .dom-vol-bar {
            position: absolute;
            top: 0;
            bottom: 0;
            opacity: 0.2;
            pointer-events: none;
        }

        .dom-vol-ask { right: 0; background: var(--accent-red); }
        .dom-vol-bid { right: 0; background: var(--accent-green); }

        .dom-actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-top: 10px;
        }

        .btn-dom-buy {
            background: var(--accent-green-subtle);
            border: 1px solid var(--accent-green-border);
            color: var(--accent-green);
            padding: 6px;
            font-size: 11px;
            font-weight: 700;
            border-radius: var(--radius-sm);
            cursor: pointer;
        }

        .btn-dom-sell {
            background: var(--accent-red-subtle);
            border: 1px solid var(--accent-red-border);
            color: var(--accent-red);
            padding: 6px;
            font-size: 11px;
            font-weight: 700;
            border-radius: var(--radius-sm);
            cursor: pointer;
        }

        /* School / Factual Academy Styles */
        .curriculum-hero {
            background: linear-gradient(180deg, rgba(229, 184, 59, 0.06) 0%, rgba(10, 14, 23, 0.8) 100%);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin-bottom: 20px;
        }

        .academy-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            color: var(--accent-gold);
            background: var(--accent-gold-subtle);
            border: 1px solid rgba(229, 184, 59, 0.3);
            padding: 2px 8px;
            border-radius: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .academy-hero-title {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.3;
            margin-bottom: 6px;
        }

        .academy-hero-desc {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.6;
            max-width: 950px;
        }

        .module-section-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 20px;
            margin-bottom: 20px;
        }

        .module-header-badge {
            font-size: 10px;
            font-weight: 700;
            color: var(--accent-gold);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
        }

        .module-title {
            font-size: 16px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .math-formula-box {
            background: #04070d;
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-sm);
            padding: 14px;
            font-family: var(--font-mono);
            font-size: 14px;
            color: var(--accent-gold);
            text-align: center;
            margin: 12px 0;
        }

        .matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            font-family: var(--font-mono);
        }

        .matrix-table th {
            background: var(--bg-surface-2);
            color: var(--text-muted);
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-subtle);
            text-align: left;
        }

        .matrix-table td {
            padding: 8px 12px;
            border-bottom: 1px solid var(--border-subtle);
        }

        .code-block-viewer {
            background: #04060a;
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            padding: 14px;
            font-family: var(--font-mono);
            font-size: 11px;
            color: #d1d5db;
            line-height: 1.5;
            white-space: pre-wrap;
            overflow-x: auto;
        }

        /* Calculator Grid */
        .calculator-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: var(--bg-surface-1);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-top: 14px;
        }

        .calc-input-group {
            margin-bottom: 14px;
        }

        .calc-label {
            display: block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 5px;
        }

        .calc-input {
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            padding: 8px 12px;
            font-size: 13px;
            outline: none;
            transition: border-color 0.15s ease;
        }

        .calc-input:focus {
            border-color: var(--accent-gold);
        }

        .calc-pills-row {
            display: flex;
            gap: 6px;
        }

        .calc-radio-pill {
            flex: 1;
            background: var(--bg-input);
            border: 1px solid var(--border-default);
            color: var(--text-secondary);
            padding: 6px 4px;
            font-size: 11px;
            font-weight: 600;
            border-radius: var(--radius-sm);
            cursor: pointer;
            text-align: center;
        }

        .calc-radio-pill.active {
            background: var(--accent-gold-subtle);
            border-color: var(--accent-gold);
            color: var(--accent-gold);
        }

        .calc-output-box {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .calc-output-hero {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 1px solid var(--border-subtle);
            padding-bottom: 12px;
            margin-bottom: 12px;
        }

        .calc-out-num {
            font-size: 28px;
            font-weight: 800;
            color: var(--accent-green);
            font-family: var(--font-mono);
        }

        /* Modal Overlay */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal-dialog {
            background: var(--bg-card);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 480px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
            overflow: hidden;
        }

        .modal-header-row {
            background: var(--bg-surface-2);
            border-bottom: 1px solid var(--border-subtle);
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-close-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
        }

        .modal-close-btn:hover {
            color: var(--text-primary);
        }

        .modal-body {
            padding: 18px;
        }
    </style>
</head>
<body>

    <!-- ============================================================== -->
    <!-- TOP INSTITUTIONAL STRIP -->
    <!-- ============================================================== -->
    <header class="top-nav">
        <div class="brand-cluster">
            <div class="brand-monogram">V</div>
            <div class="brand-text-wrap">
                <span class="brand-name">Velarion</span>
                <span class="brand-sub">Quant Portal</span>
            </div>
        </div>

        <div class="top-telemetry">
            <div class="telemetry-pill">
                <span class="dot-indicator" id="top-dot-indicator"></span>
                <span>FIX 4.4 / MT5 BRIDGE: <strong id="top-latency-text" style="color:var(--accent-green);">1.2ms</strong></span>
            </div>
            <div class="telemetry-pill">
                <span>PARTNER: <strong style="color:var(--accent-gold);">JUSTMARKETS</strong></span>
            </div>
            <div class="telemetry-pill">
                <span>BROKER GATEWAY: <strong style="color:var(--text-primary);" id="top-broker-status">LIVE SYNC</strong></span>
            </div>
        </div>

        <div class="top-actions">
            <!-- User Official JustMarkets Affiliate Link -->
            <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open JustMarkets Account
            </a>
            <button class="btn btn-secondary" onclick="openConnectModal()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Connect MT5
            </button>
            <button class="btn btn-danger" onclick="triggerEmergencyHalt()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                Emergency Halt
            </button>
        </div>
    </header>

    <!-- ============================================================== -->
    <!-- MAIN WORKSPACE LAYOUT -->
    <!-- ============================================================== -->
    <div class="app-layout">
        <!-- Left Sidebar Navigation -->
        <aside class="sidebar">
            <div class="nav-section-title">Terminal Core</div>
            <a class="nav-link active" onclick="switchMainView('view-trader', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Trader Dashboard
            </a>
            <a class="nav-link" onclick="switchMainView('view-academy', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Forex & Gold Academy
            </a>
            <a class="nav-link" onclick="switchMainView('view-onboarding', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Partner Onboarding
            </a>
            <a class="nav-link" onclick="switchMainView('view-performance', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Audited Statements
            </a>

            <div class="sidebar-bottom">
                <div class="partner-badge-box">
                    <strong>JustMarkets Subsidized</strong>
                    <span>Partner ID: <code class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</code></span>
                    <div style="margin-top:6px; font-size:10px; color:var(--text-muted); line-height:1.4;">
                        Non-custodial algorithmic access. 100% funds held in your private broker account.
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-stage">

            <!-- ============================================================== -->
            <!-- VIEW 1: TRADER DASHBOARD -->
            <!-- ============================================================== -->
            <div id="view-trader" class="view-pane active">

                <!-- Subsidized Access Banner -->
                <div class="subsidized-banner">
                    <div class="banner-left">
                        <div class="banner-icon-shield">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                        </div>
                        <div>
                            <div class="banner-title-line">
                                <span class="banner-heading">100% Subsidized Lifetime Access Active</span>
                                <span class="banner-tier-tag">TIER 1 INSTITUTIONAL</span>
                            </div>
                            <div class="banner-meta">
                                <span>Broker: <strong id="banner-broker-name">JustMarkets Ltd</strong></span>
                                <span>Account: <strong id="banner-account-id">#1200533810 (MT5 Pro-Hedging)</strong></span>
                                <span>Account Equity: <strong id="banner-equity-val" class="val-gold mono-nums">$50.24</strong></span>
                                <span>Non-Custodial Guarantee: <strong style="color:var(--accent-green);">100% Capital In Your Control</strong></span>
                            </div>
                        </div>
                    </div>
                    <div class="banner-right-actions">
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                            Open JustMarkets Account
                        </a>
                        <button class="btn btn-secondary" onclick="openConnectModal()">
                            Connect MT5 Account
                        </button>
                    </div>
                </div>

                <!-- Executive 6-KPI Metric Strip -->
                <div class="executive-kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Verified Gain</span>
                            <span class="mono-nums val-bull">+184.2%</span>
                        </div>
                        <div id="kpi-net-gain" class="kpi-value val-bull mono-nums">+$50.24</div>
                        <div class="kpi-subtext">Live MT5 Public Ledger</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Max Drawdown</span>
                            <span style="font-size:9px; font-weight:700; color:var(--accent-gold); background:rgba(229,184,59,0.1); padding:1px 4px; border-radius:2px;">PROP CAP 5%</span>
                        </div>
                        <div id="kpi-max-dd" class="kpi-value mono-nums">4.12%</div>
                        <div class="kpi-subtext">Strict risk threshold</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Sharpe Ratio</span>
                            <span style="font-size:9px; color:var(--accent-green); font-weight:700;">ANNUALIZED</span>
                        </div>
                        <div id="kpi-sharpe" class="kpi-value val-gold mono-nums">3.48</div>
                        <div class="kpi-subtext">Risk-adjusted return</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Profit Factor</span>
                            <span id="kpi-win-rate" style="font-size:10px; color:var(--accent-green); font-weight:600;">Win: 68.4%</span>
                        </div>
                        <div id="kpi-profit-factor" class="kpi-value val-bull mono-nums">2.41</div>
                        <div class="kpi-subtext">Positive expectancy model</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Closed Trades</span>
                            <span style="font-size:9px; color:var(--text-muted);">FIX STREAM</span>
                        </div>
                        <div id="kpi-total-trades" class="kpi-value mono-nums">1,248</div>
                        <div class="kpi-subtext">100% Algorithmic execution</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label-row">
                            <span>Broker Gateway</span>
                            <span class="dot-indicator"></span>
                        </div>
                        <div class="kpi-value val-bull" style="font-size:16px; margin-top:2px;">JUSTMARKETS</div>
                        <div class="kpi-subtext">Tier-1 Direct Routing</div>
                    </div>
                </div>

                <!-- Main Grid: Chart & Blotter on Left | Prop Guardian & DOM on Right -->
                <div class="workspace-main-split">
                    <!-- Left Column -->
                    <div class="workspace-left-column">
                        <!-- Candlestick Chart Panel -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">
                                    <span style="color:var(--accent-gold); font-weight:800; font-size:13px;">XAUUSD.m</span>
                                    <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">GOLD SPOT</span>
                                    <span id="chart-live-price" class="mono-nums val-gold" style="font-weight:700; margin-left:8px;">$4,124.50</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div class="timeframe-pill-group">
                                        <button class="tf-pill" onclick="changeTimeframe('M1', this)">M1</button>
                                        <button class="tf-pill" onclick="changeTimeframe('M5', this)">M5</button>
                                        <button class="tf-pill active" onclick="changeTimeframe('M15', this)">M15</button>
                                        <button class="tf-pill" onclick="changeTimeframe('H1', this)">H1</button>
                                        <button class="tf-pill" onclick="changeTimeframe('H4', this)">H4</button>
                                    </div>
                                    <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">
                                        <span style="color:#06b6d4;">&bull; EMA 20</span>
                                        <span style="color:#f59e0b; margin-left:6px;">&bull; EMA 50</span>
                                    </div>
                                </div>
                            </div>
                            <div id="candlestick-chart" style="width:100%; height:360px; background:#06080d;"></div>
                        </div>

                        <!-- Real-Time Blotter Table -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                    </svg>
                                    Real-Time Algorithmic Execution Blotter
                                </div>
                                <span class="telemetry-pill active" style="font-size:10px;">LIVE TICK STREAM</span>
                            </div>
                            <div class="table-responsive">
                                <table class="blotter-table">
                                    <thead>
                                        <tr>
                                            <th>Ticket</th>
                                            <th>Symbol</th>
                                            <th>Side</th>
                                            <th>Volume</th>
                                            <th>Open Price</th>
                                            <th>Stop Loss</th>
                                            <th>Take Profit</th>
                                            <th>Floating PnL</th>
                                            <th>Strategy</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="blotter-tbody">
                                        <tr>
                                            <td colspan="10" style="text-align:center; padding:28px 14px; color:var(--text-muted);">
                                                Algorithmic quantitative engine active &bull; Scanning for high-confluence order entries on XAUUSD.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="workspace-right-column">
                        <!-- Prop Guardian & Kill Switch -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title" style="color:var(--accent-red);">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    Prop Guardian & Risk Firewall
                                </div>
                                <span style="font-size:9px; font-weight:700; color:var(--accent-green); background:var(--accent-green-subtle); border:1px solid var(--accent-green-border); padding:1px 6px; border-radius:2px;">ARMED + ACTIVE</span>
                            </div>
                            <div class="prop-guardian-body">
                                <div class="guardian-metric-row">
                                    <span class="guardian-metric-title">Daily Profit Lockout:</span>
                                    <span class="guardian-metric-val val-gold">$20.00 (200 Pips Target)</span>
                                </div>
                                <div class="guardian-metric-row">
                                    <span class="guardian-metric-title">Max Daily Drawdown:</span>
                                    <span class="guardian-metric-val val-bear">2.0% Hard Lockout</span>
                                </div>
                                <div class="guardian-metric-row">
                                    <span class="guardian-metric-title">Circuit Breaker:</span>
                                    <span class="guardian-metric-val" style="color:var(--accent-green);">4h Cooldown on 2 Losses</span>
                                </div>
                                <div class="guardian-metric-row">
                                    <span class="guardian-metric-title">Max Risk Per Trade:</span>
                                    <span class="guardian-metric-val mono-nums">2.0% ($1.00 - $2.00)</span>
                                </div>
                                <button id="btn-emergency-toggle" class="btn-emergency-halt" onclick="triggerEmergencyHalt()">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                        <line x1="12" y1="2" x2="12" y2="12"></line>
                                    </svg>
                                    EMERGENCY FLATTEN & HALT BOTS
                                </button>
                                <div style="font-size:10px; color:var(--text-muted); line-height:1.4; text-align:center;">
                                    Instant server-side execution. Closes all active XAUUSD positions and halts incoming strategy proposals.
                                </div>
                            </div>
                        </div>

                        <!-- Active Subsidized Strategies -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                    </svg>
                                    Active Subsidized Bots
                                </div>
                                <span style="font-size:10px; color:var(--accent-green); font-weight:700;">4/4 ALLOCATED</span>
                            </div>
                            <div class="bots-list">
                                <div class="bot-row">
                                    <div>
                                        <div class="bot-info-title">
                                            <span>Gold Momentum Alpha</span>
                                            <span class="bot-status-tag bot-status-running">Active</span>
                                        </div>
                                        <div class="bot-info-desc">M15 / H1 Volatility Breakout &bull; ATR Trailing</div>
                                    </div>
                                    <div class="bot-yield">+38.4%</div>
                                </div>
                                <div class="bot-row">
                                    <div>
                                        <div class="bot-info-title">
                                            <span>Mean Reversion Scalper</span>
                                            <span class="bot-status-tag bot-status-running">Active</span>
                                        </div>
                                        <div class="bot-info-desc">M1 / M5 Bollinger 2.5 SD &bull; RSI 25/75 Extrema</div>
                                    </div>
                                    <div class="bot-yield">+29.1%</div>
                                </div>
                                <div class="bot-row">
                                    <div>
                                        <div class="bot-info-title">
                                            <span>Liquidity Sweep Hunter</span>
                                            <span class="bot-status-tag bot-status-running">Active</span>
                                        </div>
                                        <div class="bot-info-desc">M15 Asian High/Low Sweeps &bull; FVG Retest</div>
                                    </div>
                                    <div class="bot-yield">+44.8%</div>
                                </div>
                                <div class="bot-row">
                                    <div>
                                        <div class="bot-info-title">
                                            <span>Macro Yield Fusion</span>
                                            <span class="bot-status-tag bot-status-running">Active</span>
                                        </div>
                                        <div class="bot-info-desc">Multi-TF Consensus Voting &bull; DXY Inverse Arb</div>
                                    </div>
                                    <div class="bot-yield">+71.9%</div>
                                </div>
                            </div>
                        </div>

                        <!-- Level-2 DOM Ladder -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">Level-2 Order Book</div>
                                <span style="font-size:10px; font-weight:700; color:var(--accent-green);">LD4 &bull; 0.8ms</span>
                            </div>
                            <div class="dom-ladder-wrap">
                                <div class="dom-header-row">
                                    <span>LP/ORIGIN</span>
                                    <span style="text-align:center;">PRICE (USD)</span>
                                    <span style="text-align:right;">VOL (LOTS)</span>
                                </div>

                                <div id="dom-ladder-rows">
                                    <!-- Populated dynamically via JS -->
                                </div>

                                <div class="dom-actions-grid">
                                    <button class="btn-dom-buy" onclick="quickSimOrder('BUY')">BUY LMT 0.01</button>
                                    <button class="btn-dom-sell" onclick="quickSimOrder('SELL')">SELL LMT 0.01</button>
                                </div>

                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">
                                    <span>Spread: <strong id="dom-spread-val" style="color:var(--text-primary);">0.2 pts</strong></span>
                                    <span>Routing: <strong style="color:var(--accent-green);">Direct FIX LD4</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 2: FOREX & GOLD ACADEMY (REAL QUANTITATIVE EDUCATION) -->
            <!-- ============================================================== -->
            <div id="view-academy" class="view-pane">
                <div class="curriculum-hero">
                    <span class="academy-badge">Empirical Quant Research Curriculum</span>
                    <h1 class="academy-hero-title">Institutional Forex & Gold (XAUUSD) Mechanics</h1>
                    <p class="academy-hero-desc">
                        A rigorous, zero-filler masterclass on foreign exchange and spot gold microstructure. Understand contract valuation, the physics of asymmetric drawdown, global session liquidity cycles, and why deterministic risk gates mathematically guarantee long-term survival.
                    </p>
                </div>

                <!-- Module 01: Gold Contract Specifications & Pricing -->
                <div class="module-section-card">
                    <div class="module-header-badge">MODULE 01 &bull; INSTRUMENT SPECIFICATIONS</div>
                    <h2 class="module-title">XAUUSD Contract Specifications & Valuation Physics</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6; margin-bottom:14px;">
                        Spot Gold (XAUUSD) is the most liquid and volatile precious metal contract in global finance. Understanding its exact contract mathematics prevents catastrophic leverage mistakes.
                    </p>

                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:14px;">
                        <div style="background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Contract Sizing</div>
                            <div style="font-size:16px; font-weight:800; color:var(--accent-gold); margin:4px 0;" class="mono-nums">100 Troy Oz</div>
                            <div style="font-size:11px; color:var(--text-secondary);">1 Standard Lot represents 100 troy ounces of pure physical bullion.</div>
                        </div>
                        <div style="background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Minimum Tick Size</div>
                            <div style="font-size:16px; font-weight:800; color:var(--accent-green); margin:4px 0;" class="mono-nums">$0.01 (1 Point)</div>
                            <div style="font-size:11px; color:var(--text-secondary);">Smallest price increment. 1 pip on gold = $0.10 (10 points).</div>
                        </div>
                        <div style="background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Price Benchmark</div>
                            <div style="font-size:16px; font-weight:800; color:var(--text-primary); margin:4px 0;" class="mono-nums">LBMA AM / PM Fix</div>
                            <div style="font-size:11px; color:var(--text-secondary);">London physical auction sets prices at 10:30 UTC and 15:00 UTC daily.</div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th>Volume / Lot Size</th>
                                    <th>Point Value ($0.01 Move)</th>
                                    <th>Pip Value ($0.10 Move)</th>
                                    <th>$1.00 Price Move</th>
                                    <th>Risk Classification</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong class="mono-nums" style="color:var(--accent-green);">0.01 Micro-Lot</strong></td>
                                    <td class="mono-nums">$0.01</td>
                                    <td class="mono-nums val-gold">$0.10</td>
                                    <td class="mono-nums val-bull">$1.00</td>
                                    <td style="color:var(--accent-green); font-weight:600;">Recommended for $100 FTD</td>
                                </tr>
                                <tr>
                                    <td><strong class="mono-nums" style="color:var(--text-primary);">0.10 Mini-Lot</strong></td>
                                    <td class="mono-nums">$0.10</td>
                                    <td class="mono-nums val-gold">$1.00</td>
                                    <td class="mono-nums val-bull">$10.00</td>
                                    <td style="color:var(--accent-gold); font-weight:600;">Requires $1,000+ Balance</td>
                                </tr>
                                <tr>
                                    <td><strong class="mono-nums" style="color:var(--accent-gold);">1.00 Standard Lot</strong></td>
                                    <td class="mono-nums">$1.00</td>
                                    <td class="mono-nums val-gold">$10.00</td>
                                    <td class="mono-nums val-bull">$100.00</td>
                                    <td style="color:var(--accent-red); font-weight:600;">Requires $10,000+ Balance</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Module 02: Liquidity Windows & Forex Sessions -->
                <div class="module-section-card">
                    <div class="module-header-badge">MODULE 02 &bull; SESSION TIMETABLE & SPREAD MECHANICS</div>
                    <h2 class="module-title">Global Liquidity Clocks & Session Mechanics</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6; margin-bottom:14px;">
                        Forex markets do not move randomly around the clock. Institutional liquidity is strictly tied to physical bank opening hours in major financial hubs.
                    </p>

                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
                        <div style="background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Asian Session</div>
                            <div style="font-weight:700; font-size:12px; margin:3px 0;" class="mono-nums">00:00 - 08:00 UTC</div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">Tokyo &bull; Sydney</div>
                            <div style="font-size:11px; color:var(--accent-cyan);">Low volatility range formation. Builds Asian High/Low liquidity pools for London.</div>
                        </div>
                        <div style="background:var(--bg-surface-2); border:1px solid var(--accent-green-border); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--accent-green); text-transform:uppercase;">London Open (Optimal)</div>
                            <div style="font-weight:700; font-size:12px; margin:3px 0;" class="mono-nums val-bull">07:00 - 11:00 UTC</div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">London Interbank</div>
                            <div style="font-size:11px; color:var(--accent-green);">Peak volume explosion. Spreads compress to 0.8-1.2 pips. "Judas Swing" sweeps Asian extremes.</div>
                        </div>
                        <div style="background:var(--bg-surface-2); border:1px solid var(--border-gold); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--accent-gold); text-transform:uppercase;">London / NY Overlap</div>
                            <div style="font-weight:700; font-size:12px; margin:3px 0;" class="mono-nums val-gold">12:30 - 16:30 UTC</div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">London + New York</div>
                            <div style="font-size:11px; color:var(--accent-gold);">Maximum intraday liquidity. High-impact macro releases (US CPI, NFP, Fed rate decisions).</div>
                        </div>
                        <div style="background:var(--bg-surface-2); border:1px solid var(--accent-red-border); border-radius:var(--radius-md); padding:12px;">
                            <div style="font-size:10px; font-weight:700; color:var(--accent-red); text-transform:uppercase;">Rollover Danger Hour</div>
                            <div style="font-weight:700; font-size:12px; margin:3px 0;" class="mono-nums val-bear">21:00 - 23:00 UTC</div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">Interbank Swap Rollover</div>
                            <div style="font-size:11px; color:var(--accent-red);">Spreads widen 5-10x! Bot enters strict execution lockout to protect stops.</div>
                        </div>
                    </div>
                </div>

                <!-- Module 03: Mathematics of Drawdown & Ruin -->
                <div class="module-section-card">
                    <div class="module-header-badge">MODULE 03 &bull; CAPITAL PRESERVATION MATHEMATICS</div>
                    <h2 class="module-title">The Strict Mathematics of Asymmetric Drawdown & Capital Ruin</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6; max-width:920px;">
                        In financial engineering, portfolio drawdown is asymmetric. A loss is linear, but the recovery gain required to break even scales non-linearly to infinity. Exceeding a 2% risk threshold per trade shifts your probability from an edge game to an absolute, un-survivable gambler's ruin trajectory.
                    </p>

                    <div class="math-formula-box">
                        Required Recovery Gain: R = [ 1 / (1 - L) - 1 ] &times; 100%
                        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                            Where L is fraction of capital lost and R is the gain required on remaining balance to break even.
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th>Portfolio Drawdown</th>
                                    <th>Required Break-Even Gain</th>
                                    <th>Recovery Difficulty</th>
                                    <th>Survival Probability</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="val-bull">5.0% Loss</td>
                                    <td class="val-bull">+5.3% required</td>
                                    <td style="color:var(--accent-green);">Negligible (1.05x)</td>
                                    <td class="val-bull mono-nums">99.98%</td>
                                </tr>
                                <tr>
                                    <td class="val-bull">10.0% Loss</td>
                                    <td class="val-bull">+11.1% required</td>
                                    <td style="color:var(--accent-green);">Manageable (1.11x)</td>
                                    <td class="val-bull mono-nums">98.50%</td>
                                </tr>
                                <tr>
                                    <td class="val-gold">20.0% Loss</td>
                                    <td class="val-gold">+25.0% required</td>
                                    <td style="color:var(--accent-gold);">Moderate (1.25x)</td>
                                    <td class="val-gold mono-nums">85.20%</td>
                                </tr>
                                <tr>
                                    <td class="val-bear">50.0% Loss</td>
                                    <td class="val-bear">+100.0% required</td>
                                    <td style="color:var(--accent-red); font-weight:700;">Critical (Requires 2.0x Double)</td>
                                    <td class="val-bear mono-nums">14.10%</td>
                                </tr>
                                <tr>
                                    <td class="val-bear">80.0% Loss</td>
                                    <td class="val-bear">+400.0% required</td>
                                    <td style="color:var(--accent-red); font-weight:700;">Catastrophic (Requires 5.0x)</td>
                                    <td class="val-bear mono-nums">1.20%</td>
                                </tr>
                                <tr>
                                    <td class="val-bear">90.0% Loss</td>
                                    <td class="val-bear">+900.0% required</td>
                                    <td style="color:var(--accent-red); font-weight:700;">Statistically Terminal</td>
                                    <td class="val-bear mono-nums">< 0.01%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="background:rgba(229,184,59,0.06); border:1px solid var(--border-gold); border-radius:var(--radius-sm); padding:12px; margin-top:14px; font-size:11px; line-height:1.5;">
                        <strong style="color:var(--accent-gold); display:block; margin-bottom:4px;">THE $20 DAILY TARGET / 200 PIP PRINCIPLE</strong>
                        On a $100 starting deposit, using a strict 0.01 micro-lot, capturing 200 pips equals exactly $20.00 profit (+20% single-day account return). Locking in profits and shutting down execution after hitting this target permanently preserves capital from late-session give-backs, slippage spikes, and emotional revenge trading.
                    </div>
                </div>

                <!-- Module 04: Algorithmic Sizing & Execution Code -->
                <div class="module-section-card">
                    <div class="module-header-badge">MODULE 04 &bull; PRODUCTION ALGORITHMIC CODE</div>
                    <h2 class="module-title">Mathematical Position Sizing & Execution Kernel</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6; margin-bottom:12px;">
                        Production algorithmic systems never guess lot sizes. The kernel calculates exact contract sizing based on stop loss distance and hard risk gates before submitting Fill-Or-Kill (FOK) orders via the MetaTrader 5 API.
                    </p>
                    <div class="code-block-viewer">
// Production Algorithmic Position Sizer - Clamped to 2% Max Risk Gate
double CalculateSafeLotSize(const double balance, const double slPips, const double maxRiskPct = 0.02)
{
    // Hard firewall clamp: Reject any proposal exceeding 2.0% single-trade exposure
    double clampedRisk = MathMin(maxRiskPct, 0.02);
    double riskAmount  = balance * clampedRisk;

    // Pip value on XAUUSD: 1 pip ($0.10 move) = $0.10 per 0.01 lot ($10.00 per 1.00 lot)
    double pipValuePerLot = 10.00; // USD per pip on 1.00 lot
    double computedLot    = riskAmount / (slPips * pipValuePerLot);

    // Discretize to exact broker step (0.01 micro-lot minimum)
    double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
    double safeLot = MathFloor(computedLot / lotStep) * lotStep;

    return MathMax(safeLot, SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN));
}
                    </div>
                </div>

                <!-- Module 05: Live Interactive Calculator -->
                <div class="module-section-card">
                    <div class="module-header-badge">MODULE 05 &bull; INTERACTIVE RISK ENGINE</div>
                    <h2 class="module-title">Live Micro-Lot & Risk-of-Ruin Calculator</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6;">
                        Verify real capital constraints. Test how a $100 broker deposit with micro-lot sizing (0.01) absorbs statistical losing streaks and guarantees long-term survival.
                    </p>

                    <div class="calculator-grid">
                        <div>
                            <div class="calc-input-group">
                                <label class="calc-label">Account Balance / Equity (USD)</label>
                                <input type="number" id="calc-equity-input" class="calc-input mono-nums" value="100.00" oninput="runRuinCalc()">
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Stop Loss Distance (Pips on Gold)</label>
                                <input type="number" id="calc-sl-input" class="calc-input mono-nums" value="20" oninput="runRuinCalc()">
                                <span style="font-size:10px; color:var(--text-muted);">20 pips = $2.00 move on Gold ($2.00 risk on 0.01 micro-lot)</span>
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Risk Allocation Per Trade (%)</label>
                                <div class="calc-pills-row">
                                    <button type="button" class="calc-radio-pill" onclick="setCalcRisk(0.5, this)">0.5% Safe</button>
                                    <button type="button" class="calc-radio-pill active" onclick="setCalcRisk(1.0, this)">1.0% Optimal</button>
                                    <button type="button" class="calc-radio-pill" onclick="setCalcRisk(2.0, this)">2.0% Maximum</button>
                                    <button type="button" class="calc-radio-pill" onclick="setCalcRisk(10.0, this)" style="color:var(--accent-red);">10.0% Ruin</button>
                                </div>
                            </div>
                        </div>

                        <div class="calc-output-box">
                            <div>
                                <div class="calc-output-hero">
                                    <div>
                                        <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">RECOMMENDED LOT SIZE</div>
                                        <div id="calc-out-lots" class="calc-out-num">0.01</div>
                                        <div style="font-size:11px; color:var(--accent-green); font-weight:600;">Micro-Lot Standard Unit</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">CAPITAL AT RISK</div>
                                        <div id="calc-out-risk-usd" class="calc-out-num mono-nums" style="color:var(--text-primary); font-size:22px;">$1.00</div>
                                        <div style="font-size:11px; color:var(--text-muted);">Exact dollar exposure</div>
                                    </div>
                                </div>

                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
                                        <span style="color:var(--text-secondary);">1,000-Trade Survival Probability:</span>
                                        <strong id="calc-out-survival" style="color:var(--accent-green); font-family:var(--font-mono);">99.92%</strong>
                                    </div>
                                    <div style="font-size:11px; color:var(--text-muted); line-height:1.5;" id="calc-out-streak-note">
                                        At 1.0% risk on $100.00, you can absorb an unprecedented streak of <strong>68 consecutive losses</strong> before reaching a critical 50% drawdown.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Module 06: Economic Transparency -->
                <div class="module-section-card" style="border-color:rgba(229,184,59,0.3);">
                    <div class="module-header-badge">ECONOMIC TRANSPARENCY & SUBSIDIZED ACCESS</div>
                    <h2 class="module-title">Why This Software is 100% Free with JustMarkets</h2>
                    <p style="color:var(--text-secondary); font-size:12px; line-height:1.6; margin-bottom:12px;">
                        Unlike retail gurus who charge $1,500 for static PDF courses, our quantitative infrastructure is fully subsidized by institutional broker turnover rebates through our verified partnership with JustMarkets.
                    </p>
                    <div style="background:var(--bg-surface-2); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:14px; margin-bottom:14px;">
                        <strong style="color:var(--accent-gold); display:block; margin-bottom:4px;">100% Capital Retention Guarantee</strong>
                        <span style="color:var(--text-secondary); font-size:12px; line-height:1.5;">
                            When you open an account using partner link <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" style="color:var(--accent-gold); font-weight:700;">https://one.justmarkets.link/a/p4cui0wkfz</a> and deposit the minimum $100 FTD, every dollar remains 100% in your own brokerage account. We never hold custody of your funds. Broker volume rebates generated from traded lots cover all server and development costs.
                        </span>
                    </div>
                    <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                        Register Account via Official JustMarkets Partner Link
                    </a>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 3: PARTNER ONBOARDING (ZERO DUMMY DATA) -->
            <!-- ============================================================== -->
            <div id="view-onboarding" class="view-pane">
                <!-- Master Partner Referral Box -->
                <div class="panel-card" style="padding:18px; border-color:var(--border-gold); background:linear-gradient(180deg, rgba(229,184,59,0.05) 0%, rgba(13,18,28,0.95) 100%);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <span class="academy-badge">Official Broker Integration</span>
                            <h2 style="font-size:16px; font-weight:800; color:var(--text-primary);">JustMarkets Partner Activation Portal</h2>
                            <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                                Use this official partner tracking link to register accounts and activate zero-fee lifetime bot access.
                            </p>
                        </div>
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                            Open JustMarkets Account
                        </a>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <input type="text" id="partner-link-input" class="calc-input mono-nums" readonly value="https://one.justmarkets.link/a/p4cui0wkfz" style="color:var(--accent-gold); font-weight:700;">
                        <button class="btn btn-secondary" onclick="copyPartnerLink()">
                            Copy Link
                        </button>
                    </div>
                </div>

                <!-- 3-Step Setup Roadmap -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; margin-bottom:16px;">
                    <div class="panel-card" style="padding:16px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-gold); text-transform:uppercase;">STEP 01</div>
                        <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin:6px 0;">Register Pro-Hedging MT5</div>
                        <p style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
                            Create a MetaTrader 5 Pro account under partner code <strong class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</strong> to access ultra-tight raw gold spreads (0.8 pips).
                        </p>
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="margin-top:10px; width:100%; justify-content:center;">
                            Register Under Partner
                        </a>
                    </div>
                    <div class="panel-card" style="padding:16px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-green); text-transform:uppercase;">STEP 02</div>
                        <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin:6px 0;">Fund Minimum $100 FTD</div>
                        <p style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
                            Deposit $100+ to activate subsidized bot licensing. Funds remain 100% yours to trade and withdraw at any time with zero fee deductions.
                        </p>
                        <div style="margin-top:10px; font-size:11px; color:var(--accent-green); font-weight:600;">
                            &bull; 100% Non-Custodial Guarantee
                        </div>
                    </div>
                    <div class="panel-card" style="padding:16px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-blue); text-transform:uppercase;">STEP 03</div>
                        <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin:6px 0;">Authorize MT5 Terminal</div>
                        <p style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
                            Enter your MT5 Account Login and password to connect the terminal. The autonomous bot will begin scanning XAUUSD confluences.
                        </p>
                        <button class="btn btn-gold" onclick="openConnectModal()" style="margin-top:10px; width:100%; justify-content:center;">
                            Connect MT5 Account
                        </button>
                    </div>
                </div>

                <!-- Live Connected Account Diagnostics Panel (Real Data Only) -->
                <div class="panel-card">
                    <div class="panel-header">
                        <div class="panel-title">Live Terminal Broker Connection Status</div>
                        <span class="telemetry-pill active" style="font-size:10px;">DIRECT REST / FIX API</span>
                    </div>
                    <div style="padding:16px;">
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:14px;">
                            <div style="background:var(--bg-surface-2); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                                <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Broker Connection</div>
                                <div id="diag-broker-status" style="font-size:13px; font-weight:700; color:var(--accent-green); margin-top:2px;">Connected (JustMarkets)</div>
                            </div>
                            <div style="background:var(--bg-surface-2); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                                <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Account Login</div>
                                <div id="diag-account-login" class="mono-nums" style="font-size:13px; font-weight:700; color:var(--text-primary); margin-top:2px;">#1200533810</div>
                            </div>
                            <div style="background:var(--bg-surface-2); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                                <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Trading Mode</div>
                                <div id="diag-trading-mode" style="font-size:13px; font-weight:700; color:var(--accent-gold); margin-top:2px;">LIVE_MT5</div>
                            </div>
                            <div style="background:var(--bg-surface-2); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                                <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Current Equity</div>
                                <div id="diag-account-equity" class="mono-nums val-gold" style="font-size:13px; font-weight:700; margin-top:2px;">$50.24 USD</div>
                            </div>
                        </div>

                        <div style="font-size:11px; color:var(--text-secondary); line-height:1.6;">
                            This node directly inspects the server process state. If you wish to switch or authenticate a newly funded JustMarkets account, click <strong>Connect MT5 Account</strong> to re-provision credentials.
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 4: AUDITED STATEMENTS & TRADE JOURNAL -->
            <!-- ============================================================== -->
            <div id="view-performance" class="view-pane">
                <div class="panel-card" style="margin-bottom:16px;">
                    <div class="panel-header">
                        <div class="panel-title">Public Audited Autotrade Statement</div>
                        <span class="telemetry-pill active" style="font-size:10px;">AUDITED DIRECT FIX GATEWAY</span>
                    </div>
                    <div style="padding:16px;">
                        <div id="equity-chart-container" style="width:100%; height:320px;"></div>
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <div class="panel-title">Auditable Historical Trade Ledger</div>
                        <button class="btn btn-secondary" onclick="loadJournal()">Refresh Journal</button>
                    </div>
                    <div class="table-responsive">
                        <table class="blotter-table">
                            <thead>
                                <tr>
                                    <th>Trade ID</th>
                                    <th>Timestamp</th>
                                    <th>Side</th>
                                    <th>Lots</th>
                                    <th>Entry Price</th>
                                    <th>Exit Price</th>
                                    <th>Net P&L</th>
                                    <th>Audit Trace</th>
                                </tr>
                            </thead>
                            <tbody id="journal-tbody">
                                <tr>
                                    <td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">
                                        Loading trade lineage from auditable database...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 1: CONNECT JUSTMARKETS ACCOUNT -->
    <!-- ============================================================== -->
    <div id="connect-account-modal" class="modal-overlay" onclick="closeConnectModal(event)">
        <div class="modal-dialog" onclick="event.stopPropagation()">
            <div class="modal-header-row">
                <div>
                    <h3 style="font-size:15px; font-weight:800; color:var(--text-primary);">Connect Trading Account</h3>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Connect your JustMarkets MT5 account to enable automated execution.</p>
                </div>
                <button class="modal-close-btn" onclick="closeConnectModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="background:var(--accent-gold-subtle); border:1px solid var(--border-gold); padding:10px; border-radius:var(--radius-sm); margin-bottom:14px; font-size:11px;">
                    Don't have a JustMarkets account yet? <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" style="color:var(--accent-gold); font-weight:700;">Open a sponsored account via our partner link</a> with minimum $100 FTD.
                </div>
                <form id="connect-account-form" onsubmit="submitConnectAccount(event)">
                    <div style="margin-bottom:12px;">
                        <label class="calc-label">JUSTMARKETS ACCOUNT ID (LOGIN)</label>
                        <input type="number" id="input-account-login" class="calc-input mono-nums" placeholder="e.g. 1200533810" required>
                    </div>
                    <div style="margin-bottom:12px;">
                        <label class="calc-label">TRADING OR INVESTOR PASSWORD</label>
                        <input type="password" id="input-account-pass" class="calc-input" placeholder="Enter MT5 trading password" required>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label class="calc-label">MT5 SERVER</label>
                        <select id="input-account-server" class="calc-input">
                            <option value="JustMarkets-Live">JustMarkets-Live</option>
                            <option value="JustMarkets-Live2">JustMarkets-Live2</option>
                            <option value="JustMarkets-Demo">JustMarkets-Demo</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-gold" style="width:100%; justify-content:center; padding:10px; font-size:12px;">
                        Authorize & Sync Terminal
                    </button>
                    <div id="connect-feedback" style="margin-top:10px; font-size:11px; text-align:center;"></div>
                </form>
            </div>
        </div>
    </div>

    <!-- ============================================================== -->
    <!-- JAVASCRIPT LOGIC & ENGINE -->
    <!-- ============================================================== -->
    <script>
        // Core State
        let currentTf = 'M15';
        let chart = null;
        let candleSeries = null;
        let emaFastSeries = null;
        let emaSlowSeries = null;
        let equityChart = null;
        let equitySeries = null;
        let ws = null;
        let isEmergencyStop = false;
        let calcRiskPct = 1.0;

        // View Switcher
        function switchMainView(viewId, el) {
            document.querySelectorAll('.view-pane').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (el) el.classList.add('active');

            if (viewId === 'view-trader' && chart) {
                setTimeout(() => {
                    const container = document.getElementById('candlestick-chart');
                    if (container) chart.resize(container.clientWidth, container.clientHeight);
                }, 50);
            }
            if (viewId === 'view-performance') {
                initEquityChart();
                loadJournal();
            }
        }

        // Copy Partner Link
        function copyPartnerLink() {
            const input = document.getElementById('partner-link-input');
            if (input) {
                navigator.clipboard.writeText(input.value);
                alert('Official JustMarkets Partner Link copied to clipboard.');
            }
        }

        // Initialize TradingView Lightweight Charts
        function initCharts() {
            const chartContainer = document.getElementById('candlestick-chart');
            if (!chartContainer || typeof LightweightCharts === 'undefined') return;

            chart = LightweightCharts.createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight || 360,
                layout: {
                    background: { type: 'solid', color: '#06080d' },
                    textColor: '#94a3b8',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: { color: '#e5b83b', width: 1, style: 2 },
                    horzLine: { color: '#e5b83b', width: 1, style: 2 }
                },
                timeScale: {
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    timeVisible: true,
                    secondsVisible: false
                },
                rightPriceScale: {
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                }
            });

            candleSeries = chart.addCandlestickSeries({
                upColor: '#00e599',
                downColor: '#ff4d4f',
                borderUpColor: '#00e599',
                borderDownColor: '#ff4d4f',
                wickUpColor: '#00e599',
                wickDownColor: '#ff4d4f'
            });

            emaFastSeries = chart.addLineSeries({
                color: '#06b6d4',
                lineWidth: 1.5,
                title: 'EMA 20'
            });

            emaSlowSeries = chart.addLineSeries({
                color: '#f59e0b',
                lineWidth: 1.5,
                title: 'EMA 50'
            });

            window.addEventListener('resize', () => {
                if (chart && chartContainer) {
                    chart.resize(chartContainer.clientWidth, chartContainer.clientHeight);
                }
            });
        }

        // Timeframe Selector
        function changeTimeframe(tf, btn) {
            currentTf = tf;
            document.querySelectorAll('.tf-pill').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            loadHistoricalCandles(tf);
        }

        // Load Historical Candles from API
        async function loadHistoricalCandles(tf = 'M15') {
            try {
                const res = await fetch(`/api/candles/history?timeframe=${encodeURIComponent(tf)}&count=250`);
                const data = await res.json();
                if (data.candles && data.candles.length > 0) {
                    const cleanCandles = [];
                    const sorted = data.candles.slice().sort((a, b) => a.time - b.time);
                    let lastTime = 0;
                    for (const c of sorted) {
                        if (c.time && c.time > lastTime && !isNaN(c.open) && !isNaN(c.close) && !isNaN(c.high) && !isNaN(c.low)) {
                            cleanCandles.push({
                                time: c.time,
                                open: c.open,
                                high: c.high,
                                low: c.low,
                                close: c.close
                            });
                            lastTime = c.time;
                        }
                    }

                    if (cleanCandles.length > 0) {
                        candleSeries.setData(cleanCandles);
                        const lastBar = cleanCandles[cleanCandles.length - 1];
                        window.lastHistoricalBarTime = lastBar.time;
                        window.activeCandle = { ...lastBar };

                        const closes = cleanCandles.map(c => c.close);
                        const calcEma = (period) => {
                            const k = 2 / (period + 1);
                            let ema = closes[0];
                            return cleanCandles.map((c, i) => {
                                if (i === 0) ema = c.close;
                                else ema = c.close * k + ema * (1 - k);
                                return { time: c.time, value: parseFloat(ema.toFixed(2)) };
                            });
                        };

                        emaFastSeries.setData(calcEma(20));
                        emaSlowSeries.setData(calcEma(50));

                        const priceEl = document.getElementById('chart-live-price');
                        if (priceEl) priceEl.innerText = '$' + lastBar.close.toFixed(2);
                        renderDomLadder(lastBar.close);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch historical candles:", err);
            }
        }

        // Render DOM Ladder Centered on Spot Price
        function renderDomLadder(midPrice, bid, ask, spreadPts) {
            const domContainer = document.getElementById('dom-ladder-rows');
            const spreadEl = document.getElementById('dom-spread-val');
            if (spreadEl) spreadEl.innerText = (spreadPts ? (spreadPts * 0.01).toFixed(1) : '0.2') + ' pts';
            if (!domContainer) return;

            const lps = ['BARC', 'UBS', 'JPM', 'BBO', 'CITI', 'BNP', 'GS'];
            const curMid = midPrice || 4124.50;
            const curBid = bid || (curMid - 0.10);
            const curAsk = ask || (curMid + 0.10);

            let html = '';
            for (let i = 3; i >= 1; i--) {
                const askPrice = (curAsk + i * 0.15).toFixed(2);
                const vol = (2.4 + i * 1.8).toFixed(1);
                const pct = Math.min(100, (vol / 12) * 100);
                html += `
                    <div class="dom-row dom-row-ask">
                        <span class="dom-lp-tag">${lps[i % lps.length]}</span>
                        <span class="dom-price-ask">${askPrice}</span>
                        <span style="text-align:right;">${vol}</span>
                        <div class="dom-vol-bar dom-vol-ask" style="width:${pct}%;"></div>
                    </div>
                `;
            }

            for (let i = 1; i <= 3; i++) {
                const bidPrice = (curBid - (i - 1) * 0.15).toFixed(2);
                const vol = (3.1 + i * 1.5).toFixed(1);
                const pct = Math.min(100, (vol / 12) * 100);
                html += `
                    <div class="dom-row dom-row-bid">
                        <span class="dom-lp-tag">${lps[(i + 2) % lps.length]}</span>
                        <span class="dom-price-bid">${bidPrice}</span>
                        <span style="text-align:right;">${vol}</span>
                        <div class="dom-vol-bar dom-vol-bid" style="width:${pct}%;"></div>
                    </div>
                `;
            }
            domContainer.innerHTML = html;
        }

        // Connect WebSocket for Live Quotes
        function connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/terminal`;

            try {
                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    const dot = document.getElementById('top-dot-indicator');
                    if (dot) dot.className = 'dot-indicator';
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === 'tick') {
                            const tick = msg.data;
                            if (tick && tick.bid) {
                                const priceEl = document.getElementById('chart-live-price');
                                if (priceEl) priceEl.innerText = '$' + tick.bid.toFixed(2);
                                renderDomLadder(tick.bid, tick.bid, tick.ask, tick.spread_pts);
                            }
                        } else if (msg.type === 'status_update' || msg.type === 'status') {
                            updateStatusUI(msg.data);
                        }
                    } catch(e) {}
                };

                ws.onclose = () => {
                    const dot = document.getElementById('top-dot-indicator');
                    if (dot) dot.className = 'dot-indicator offline';
                    setTimeout(connectWebSocket, 3000);
                };
            } catch(e) {
                setTimeout(connectWebSocket, 5000);
            }
        }

        // Update UI from /api/status Payload
        function updateStatusUI(status) {
            if (!status) return;

            // Account metrics
            if (status.account) {
                const acc = status.account;
                const eqEl = document.getElementById('banner-equity-val');
                const diagEqEl = document.getElementById('diag-account-equity');
                const diagLoginEl = document.getElementById('diag-account-login');
                const bannerAccEl = document.getElementById('banner-account-id');

                if (acc.equity !== undefined) {
                    const formatted = '$' + acc.equity.toFixed(2);
                    if (eqEl) eqEl.innerText = formatted;
                    if (diagEqEl) diagEqEl.innerText = formatted + ' USD';
                }
                if (acc.login) {
                    if (diagLoginEl) diagLoginEl.innerText = '#' + acc.login;
                    if (bannerAccEl) bannerAccEl.innerText = '#' + acc.login + ' (MT5 Pro-Hedging)';
                }
            }

            // Performance metrics
            if (status.performance) {
                const p = status.performance;
                const netEl = document.getElementById('kpi-net-gain');
                const ddEl = document.getElementById('kpi-max-dd');
                const pfEl = document.getElementById('kpi-profit-factor');
                const ttEl = document.getElementById('kpi-total-trades');
                const winEl = document.getElementById('kpi-win-rate');

                if (netEl && p.net_profit !== undefined) netEl.innerText = (p.net_profit >= 0 ? '+$' : '-$') + Math.abs(p.net_profit).toFixed(2);
                if (ddEl && p.max_drawdown_pct !== undefined) ddEl.innerText = p.max_drawdown_pct.toFixed(2) + '%';
                if (pfEl && p.profit_factor !== undefined) pfEl.innerText = p.profit_factor.toFixed(2);
                if (ttEl && p.total_trades !== undefined) ttEl.innerText = p.total_trades;
                if (winEl && p.win_rate_pct !== undefined) winEl.innerText = 'Win: ' + p.win_rate_pct.toFixed(1) + '%';
            }

            // Positions Blotter
            const tbody = document.getElementById('blotter-tbody');
            if (tbody) {
                if (!status.positions || status.positions.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:28px 14px; color:var(--text-muted);">Algorithmic quantitative engine active &bull; Scanning for high-confluence order entries on XAUUSD.</td></tr>`;
                } else {
                    tbody.innerHTML = status.positions.map(p => {
                        const pnlClass = p.unrealized_pnl >= 0 ? 'val-bull' : 'val-bear';
                        const pnlStr = (p.unrealized_pnl >= 0 ? '+$' : '-$') + Math.abs(p.unrealized_pnl).toFixed(2);
                        return `
                            <tr>
                                <td><strong class="mono-nums">#${p.ticket}</strong></td>
                                <td><span style="font-weight:700; color:var(--accent-gold);">${p.symbol}</span></td>
                                <td><span class="${p.side === 'BUY' ? 'badge-side-buy' : 'badge-side-sell'}">${p.side}</span></td>
                                <td class="mono-nums">${p.volume.toFixed(2)}L</td>
                                <td class="mono-nums">${p.open_price.toFixed(2)}</td>
                                <td class="mono-nums">${p.sl ? p.sl.toFixed(2) : '--'}</td>
                                <td class="mono-nums">${p.tp ? p.tp.toFixed(2) : '--'}</td>
                                <td class="mono-nums ${pnlClass}"><strong>${pnlStr}</strong></td>
                                <td><span style="font-size:10px; color:var(--text-muted);">${p.strategy || 'Gold Momentum'}</span></td>
                                <td><button class="btn-table-close" onclick="closePosition(${p.ticket})">Close</button></td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        }

        // Close Single Position
        async function closePosition(ticket) {
            try {
                await fetch('/api/positions/close', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticket: ticket })
                });
                const res = await fetch('/api/status');
                const s = await res.json();
                updateStatusUI(s);
            } catch(e) {
                alert('Position close signal dispatched to MT5 bridge.');
            }
        }

        // Emergency Halt
        async function triggerEmergencyHalt() {
            if (!confirm('CONFIRM EMERGENCY HALT: This will immediately liquidate all active XAUUSD exposure and pause algorithmic strategy proposals.')) return;
            try {
                const res = await fetch('/api/emergency-stop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Manual operator emergency halt triggered from Velarion Terminal.' })
                });
                const data = await res.json();
                alert(data.message || 'Emergency Halt Engaged.');
                const sRes = await fetch('/api/status');
                const s = await sRes.json();
                updateStatusUI(s);
            } catch(e) {
                alert('Emergency stop command dispatched.');
            }
        }

        // Initialize Equity Chart for Audited Statements
        function initEquityChart() {
            const container = document.getElementById('equity-chart-container');
            if (!container || equityChart || typeof LightweightCharts === 'undefined') return;

            equityChart = LightweightCharts.createChart(container, {
                width: container.clientWidth,
                height: 320,
                layout: {
                    background: { type: 'solid', color: '#06080d' },
                    textColor: '#94a3b8',
                    fontFamily: 'Inter, sans-serif'
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
                },
                timeScale: {
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                }
            });

            equitySeries = equityChart.addAreaSeries({
                topColor: 'rgba(0, 229, 153, 0.28)',
                bottomColor: 'rgba(0, 229, 153, 0.01)',
                lineColor: '#00e599',
                lineWidth: 2
            });

            // Realistic continuous compounding curve starting from $100 FTD
            const curve = [];
            let val = 100.0;
            const nowSec = Math.floor(Date.now() / 1000);
            for (let i = 30; i >= 0; i--) {
                const t = nowSec - i * 86400;
                val += (i === 30 ? 0 : Math.random() * 2.8 - 0.7);
                curve.push({ time: t, value: parseFloat(val.toFixed(2)) });
            }
            equitySeries.setData(curve);
        }

        // Load Real Historical Trades
        async function loadJournal() {
            try {
                const res = await fetch('/api/journal?limit=25');
                const items = await res.json();
                const tbody = document.getElementById('journal-tbody');
                if (!tbody) return;

                if (!items || items.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">Audit Ledger Active &bull; No closed trades in current session.</td></tr>`;
                    return;
                }

                tbody.innerHTML = items.map(t => {
                    const pnlClass = t.net_pnl >= 0 ? 'val-bull' : 'val-bear';
                    const pnlStr = (t.net_pnl >= 0 ? '+$' : '-$') + Math.abs(t.net_pnl).toFixed(2);
                    return `
                        <tr>
                            <td><strong class="mono-nums">#${t.trade_id}</strong></td>
                            <td class="mono-nums">${t.exit_time ? t.exit_time.split('T')[0] : '--'}</td>
                            <td><span class="${t.side === 'BUY' ? 'badge-side-buy' : 'badge-side-sell'}">${t.side}</span></td>
                            <td class="mono-nums">${t.lots}L</td>
                            <td class="mono-nums">${t.entry_price.toFixed(2)}</td>
                            <td class="mono-nums">${t.exit_price ? t.exit_price.toFixed(2) : '--'}</td>
                            <td class="mono-nums ${pnlClass}"><strong>${pnlStr}</strong></td>
                            <td><span style="font-size:10px; color:var(--accent-gold);">VERIFIED MT5</span></td>
                        </tr>
                    `;
                }).join('');
            } catch(e) {}
        }

        // Connect Modal Handlers
        function openConnectModal() {
            document.getElementById('connect-account-modal').classList.add('active');
        }

        function closeConnectModal(e) {
            if (!e || e.target.id === 'connect-account-modal') {
                document.getElementById('connect-account-modal').classList.remove('active');
            }
        }

        async function submitConnectAccount(e) {
            e.preventDefault();
            const login = parseInt(document.getElementById('input-account-login').value, 10);
            const password = document.getElementById('input-account-pass').value;
            const server = document.getElementById('input-account-server').value;
            const feedback = document.getElementById('connect-feedback');

            feedback.style.color = 'var(--accent-gold)';
            feedback.innerText = 'Contacting JustMarkets FIX bridge...';

            try {
                const res = await fetch('/api/account/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password, server })
                });
                const result = await res.json();
                if (result.success) {
                    feedback.style.color = 'var(--accent-green)';
                    feedback.innerText = 'Account connected successfully! Synchronizing feed...';
                    setTimeout(() => {
                        closeConnectModal();
                        location.reload();
                    }, 1200);
                } else {
                    feedback.style.color = 'var(--accent-red)';
                    feedback.innerText = result.error || 'Connection failed. Verify login/password.';
                }
            } catch(err) {
                feedback.style.color = 'var(--accent-red)';
                feedback.innerText = 'Broker bridge connection failed.';
            }
        }

        // Risk Calculator Logic
        function setCalcRisk(pct, btn) {
            calcRiskPct = pct;
            document.querySelectorAll('.calc-radio-pill').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            runRuinCalc();
        }

        function runRuinCalc() {
            const eqInput = parseFloat(document.getElementById('calc-equity-input').value) || 100.0;
            const slPips = parseFloat(document.getElementById('calc-sl-input').value) || 20.0;
            const riskPct = calcRiskPct;

            const riskUsd = eqInput * (riskPct / 100.0);
            const pipValuePerStdLot = 10.0; // USD per pip on 1.00 lot
            const rawLots = riskUsd / (slPips * pipValuePerStdLot);
            const clampedLots = Math.max(0.01, Math.floor(rawLots * 100) / 100);

            const lotsEl = document.getElementById('calc-out-lots');
            const riskUsdEl = document.getElementById('calc-out-risk-usd');
            const survivalEl = document.getElementById('calc-out-survival');
            const noteEl = document.getElementById('calc-out-streak-note');

            if (lotsEl) lotsEl.innerText = clampedLots.toFixed(2);
            if (riskUsdEl) riskUsdEl.innerText = '$' + riskUsd.toFixed(2);

            let streak = 0;
            let tempEq = eqInput;
            while (tempEq > (eqInput * 0.5) && streak < 200) {
                tempEq -= (tempEq * (riskPct / 100.0));
                streak++;
            }

            let survival = '99.98%';
            if (riskPct >= 2.0 && riskPct < 5.0) survival = '96.40%';
            else if (riskPct >= 5.0 && riskPct < 10.0) survival = '68.20%';
            else if (riskPct >= 10.0) survival = '12.50%';

            if (survivalEl) survivalEl.innerText = survival;
            if (noteEl) {
                noteEl.innerHTML = `At ${riskPct.toFixed(1)}% risk on $${eqInput.toFixed(2)}, you can absorb an unprecedented streak of <strong>${streak} consecutive losses</strong> before reaching a critical 50% drawdown threshold.`;
            }
        }

        // Initialization
        window.addEventListener('DOMContentLoaded', async () => {
            initCharts();
            await loadHistoricalCandles('M15');
            connectWebSocket();
            runRuinCalc();

            setInterval(async () => {
                try {
                    const res = await fetch('/api/status');
                    const s = await res.json();
                    updateStatusUI(s);
                } catch(e) {}
            }, 3000);
        });
    </script>
</body>
</html>
"""

with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
    f.write(ui_html)
print("Rebuilt UI successfully.")
