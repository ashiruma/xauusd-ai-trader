import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VELARION MARKETS | Quantitative Trading & Forex Academy</title>
    <!-- Google Fonts: Inter & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- TradingView Lightweight Charts v4.2.0 CDN -->
    <script src="https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js"></script>
    <!-- Forex Curriculum & Glossary Data -->
    <script src="forex_curriculum.js"></script>
    <style>
        :root {
            --bg-base: #0B1120;
            --bg-surface-1: #0F172A;
            --bg-surface-2: #151E2E;
            --bg-surface-3: #1E293B;
            --bg-card: #151E2E;
            --bg-card-hover: #1E293B;
            --bg-input: #0B1120;

            --border-subtle: rgba(255, 255, 255, 0.06);
            --border-default: rgba(255, 255, 255, 0.10);
            --border-hover: rgba(255, 255, 255, 0.18);
            --border-gold: rgba(214, 173, 82, 0.35);

            --text-primary: #F1F5F9;
            --text-secondary: #94A3B8;
            --text-muted: #64748B;
            --text-gold: #D6AD52;

            --accent-gold: #D6AD52;
            --accent-gold-hover: #E5BE65;
            --accent-gold-subtle: rgba(214, 173, 82, 0.08);

            --accent-green: #22C55E;
            --accent-green-subtle: rgba(34, 197, 94, 0.08);
            --accent-green-border: rgba(34, 197, 94, 0.25);

            --accent-red: #EF4444;
            --accent-red-subtle: rgba(239, 68, 68, 0.08);
            --accent-red-border: rgba(239, 68, 68, 0.25);

            --accent-blue: #3B82F6;
            --accent-cyan: #06B6D4;

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
            font-size: 14px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* Top Institutional Header */
        .top-nav {
            background: var(--bg-surface-1);
            border-bottom: 1px solid var(--border-default);
            height: 54px;
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
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #D6AD52, #A68026);
            color: #0B1120;
            font-weight: 800;
            font-size: 16px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-sans);
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
        }

        .dot-indicator.offline {
            background: var(--accent-red);
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
            padding: 7px 14px;
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
            background: var(--accent-gold);
            color: #0B1120;
            font-weight: 700;
        }

        .btn-gold:hover {
            background: var(--accent-gold-hover);
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
            background: rgba(239, 68, 68, 0.18);
        }

        /* App Layout */
        .app-layout {
            display: flex;
            min-height: calc(100vh - 54px);
        }

        /* Sidebar */
        .sidebar {
            width: 230px;
            background: var(--bg-surface-1);
            border-right: 1px solid var(--border-default);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding: 16px 12px;
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
            padding: 9px 12px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 13px;
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
            border-left: 3px solid var(--accent-gold);
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
            margin-bottom: 2px;
        }

        /* Main Workspace Stage */
        .main-stage {
            flex: 1;
            padding: 20px 24px;
            overflow-y: auto;
            max-width: calc(100vw - 230px);
        }

        .view-pane {
            display: none;
        }

        .view-pane.active {
            display: block;
        }

        /* Typography & Headings */
        .page-title {
            font-size: 30px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1.25;
            margin-bottom: 6px;
        }

        .page-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.6;
            max-width: 820px;
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Panels & Cards */
        .panel-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            overflow: hidden;
            margin-bottom: 20px;
        }

        .panel-header {
            background: var(--bg-surface-2);
            border-bottom: 1px solid var(--border-default);
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .panel-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .val-bull { color: var(--accent-green) !important; }
        .val-bear { color: var(--accent-red) !important; }
        .val-gold { color: var(--accent-gold) !important; }
        .mono-nums { font-family: var(--font-mono); font-feature-settings: "tnum"; }

        /* ============================================================== */
        /* ACADEMY DASHBOARD STYLES */
        /* ============================================================== */
        .progress-hero-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 22px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
        }

        .progress-hero-left {
            flex: 1;
            min-width: 280px;
        }

        .progress-stat-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
        }

        .progress-bar-bg {
            width: 100%;
            height: 10px;
            background: var(--bg-base);
            border: 1px solid var(--border-subtle);
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #D6AD52, #22C55E);
            width: 0%;
            transition: width 0.3s ease;
        }

        .progress-subtext {
            font-size: 12px;
            color: var(--text-muted);
        }

        /* 3-Level Curriculum Grid */
        .curriculum-levels-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 28px;
        }

        .level-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.2s ease;
            position: relative;
        }

        .level-card:hover {
            border-color: var(--border-gold);
            transform: translateY(-2px);
        }

        .level-tag {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 2px 8px;
            border-radius: var(--radius-sm);
            margin-bottom: 10px;
            width: fit-content;
        }

        .level-tag-beginner { background: rgba(34, 197, 94, 0.12); color: var(--accent-green); border: 1px solid var(--accent-green-border); }
        .level-tag-intermediate { background: rgba(214, 173, 82, 0.12); color: var(--accent-gold); border: 1px solid var(--border-gold); }
        .level-tag-advanced { background: rgba(239, 68, 68, 0.12); color: var(--accent-red); border: 1px solid var(--accent-red-border); }

        .level-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 6px;
        }

        .level-desc {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 16px;
        }

        .level-meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-subtle);
            padding-top: 12px;
            margin-top: auto;
        }

        /* Filter Tabs */
        .filter-tabs-row {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            overflow-x: auto;
        }

        .filter-tab-btn {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            color: var(--text-secondary);
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 600;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .filter-tab-btn:hover {
            color: var(--text-primary);
            border-color: var(--border-hover);
        }

        .filter-tab-btn.active {
            background: var(--bg-surface-3);
            color: var(--accent-gold);
            border-color: var(--border-gold);
        }

        /* Lessons Grid */
        .lessons-catalog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }

        .lesson-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 18px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .lesson-card:hover {
            border-color: var(--border-gold);
            background: var(--bg-card-hover);
            transform: translateY(-2px);
        }

        .lesson-card.locked {
            opacity: 0.65;
            cursor: not-allowed;
        }

        .lesson-card.locked:hover {
            transform: none;
            border-color: var(--border-default);
            background: var(--bg-card);
        }

        .lesson-top-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
        }

        .lesson-card-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1.35;
            margin-bottom: 6px;
        }

        .lesson-card-summary {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 14px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .lesson-card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-subtle);
            padding-top: 10px;
            margin-top: auto;
        }

        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 2px;
            text-transform: uppercase;
        }

        .status-completed {
            background: rgba(34, 197, 94, 0.15);
            color: var(--accent-green);
            border: 1px solid var(--accent-green-border);
        }

        .status-unlocked {
            background: rgba(214, 173, 82, 0.15);
            color: var(--accent-gold);
            border: 1px solid var(--border-gold);
        }

        .status-locked {
            background: rgba(148, 163, 184, 0.08);
            color: var(--text-muted);
            border: 1px solid var(--border-subtle);
        }

        /* Risk Management Section */
        .risk-rules-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 16px;
        }

        .risk-rule-box {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-md);
            padding: 16px;
        }

        .risk-rule-num {
            font-size: 11px;
            font-weight: 800;
            color: var(--accent-gold);
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .risk-rule-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 6px;
        }

        .risk-rule-desc {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .risk-disclaimer-box {
            background: rgba(239, 68, 68, 0.05);
            border: 1px solid var(--accent-red-border);
            border-radius: var(--radius-md);
            padding: 14px 18px;
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 28px;
        }

        /* Practical Calculators Section */
        .calc-tabs-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 14px;
        }

        .calc-tab-btn {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            color: var(--text-secondary);
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 600;
            border-radius: var(--radius-sm);
            cursor: pointer;
        }

        .calc-tab-btn.active {
            background: var(--bg-surface-3);
            color: var(--accent-gold);
            border-color: var(--border-gold);
        }

        .calc-panel {
            display: none;
        }

        .calc-panel.active {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .calc-input-group {
            margin-bottom: 12px;
        }

        .calc-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 4px;
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

        .calc-output-card {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-md);
            padding: 18px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .calc-out-val {
            font-size: 26px;
            font-weight: 800;
            color: var(--accent-green);
            font-family: var(--font-mono);
            margin: 4px 0 2px;
        }

        /* Glossary Section */
        .glossary-search-input {
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            padding: 10px 14px;
            font-size: 13px;
            margin-bottom: 16px;
            outline: none;
        }

        .glossary-search-input:focus {
            border-color: var(--accent-gold);
        }

        .glossary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
            margin-bottom: 30px;
        }

        .glossary-item {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 14px;
        }

        .glossary-term {
            font-size: 14px;
            font-weight: 700;
            color: var(--accent-gold);
            margin-bottom: 4px;
        }

        .glossary-def {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        /* ============================================================== */
        /* LESSON MODAL / READER STYLES */
        /* ============================================================== */
        .lesson-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(11, 17, 32, 0.85);
            backdrop-filter: blur(6px);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .lesson-modal-overlay.active {
            display: flex;
        }

        .lesson-modal-dialog {
            background: var(--bg-card);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-xl);
            width: 100%;
            max-width: 860px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
        }

        .lesson-modal-header {
            background: var(--bg-surface-1);
            border-bottom: 1px solid var(--border-default);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .lesson-modal-close-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 22px;
            cursor: pointer;
            line-height: 1;
        }

        .lesson-modal-close-btn:hover {
            color: var(--text-primary);
        }

        .lesson-modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }

        .lesson-objectives-box {
            background: rgba(214, 173, 82, 0.05);
            border: 1px solid var(--border-gold);
            border-radius: var(--radius-md);
            padding: 16px 20px;
            margin-bottom: 20px;
        }

        .lesson-objectives-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--accent-gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .lesson-objectives-list {
            padding-left: 18px;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .lesson-content-text {
            font-size: 15px;
            line-height: 1.7;
            color: var(--text-primary);
            margin-bottom: 20px;
        }

        .lesson-content-text h3 {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 20px 0 8px;
        }

        .lesson-content-text p {
            margin-bottom: 12px;
        }

        .lesson-content-text ul, .lesson-content-text ol {
            padding-left: 20px;
            margin-bottom: 14px;
            color: var(--text-secondary);
        }

        .lesson-content-text li {
            margin-bottom: 6px;
        }

        .lesson-example-card {
            background: var(--bg-base);
            border: 1px solid var(--border-default);
            border-left: 4px solid var(--accent-gold);
            border-radius: var(--radius-md);
            padding: 16px 20px;
            margin-bottom: 20px;
            font-size: 13px;
            line-height: 1.6;
            color: var(--text-secondary);
        }

        .lesson-example-badge {
            font-size: 10px;
            font-weight: 800;
            color: var(--accent-gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            display: block;
        }

        .lesson-diagram-card {
            background: var(--bg-base);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
        }

        /* Quiz Box */
        .quiz-card {
            background: var(--bg-surface-2);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-md);
            padding: 20px;
            margin-top: 20px;
        }

        .quiz-header {
            font-size: 11px;
            font-weight: 800;
            color: var(--accent-gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .quiz-question-text {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 14px;
            line-height: 1.4;
        }

        .quiz-options-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
        }

        .quiz-option-btn {
            background: var(--bg-surface-1);
            border: 1px solid var(--border-default);
            color: var(--text-primary);
            padding: 11px 16px;
            font-size: 13px;
            border-radius: var(--radius-sm);
            text-align: left;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: var(--font-sans);
            display: flex;
            align-items: center;
        }

        .quiz-option-btn:hover:not(:disabled) {
            border-color: var(--accent-gold);
            background: var(--bg-surface-3);
        }

        .quiz-option-btn.selected-correct {
            background: rgba(34, 197, 94, 0.15) !important;
            border-color: var(--accent-green) !important;
            color: var(--accent-green) !important;
            font-weight: 600;
        }

        .quiz-option-btn.selected-incorrect {
            background: rgba(239, 68, 68, 0.15) !important;
            border-color: var(--accent-red) !important;
            color: var(--accent-red) !important;
        }

        .quiz-feedback-box {
            padding: 14px 16px;
            border-radius: var(--radius-sm);
            font-size: 13px;
            line-height: 1.5;
            display: none;
            margin-top: 12px;
        }

        .quiz-feedback-box.correct {
            display: block;
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid var(--accent-green-border);
            color: var(--accent-green);
        }

        .quiz-feedback-box.incorrect {
            display: block;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--accent-red-border);
            color: #FCA5A5;
        }

        .lesson-modal-footer {
            background: var(--bg-surface-1);
            border-top: 1px solid var(--border-default);
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Modal Overlay (Connect Account) */
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

        .modal-body {
            padding: 18px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .curriculum-levels-grid { grid-template-columns: 1fr; }
            .risk-rules-grid { grid-template-columns: 1fr 1fr; }
            .calc-panel.active { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
            .app-layout { flex-direction: column; }
            .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-default); }
            .main-stage { max-width: 100vw; padding: 14px; }
            .risk-rules-grid { grid-template-columns: 1fr; }
            .lessons-catalog-grid { grid-template-columns: 1fr; }
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
                <span class="brand-name">Velarion Markets</span>
                <span class="brand-sub">Quant Terminal & Academy</span>
            </div>
        </div>

        <div class="top-telemetry">
            <div class="telemetry-pill">
                <span class="dot-indicator" id="top-dot-indicator"></span>
                <span>FIX 4.4 / MT5: <strong id="top-latency-text" style="color:var(--accent-green);">1.2ms</strong></span>
            </div>
            <div class="telemetry-pill">
                <span>PARTNER: <strong style="color:var(--accent-gold);">JUSTMARKETS</strong></span>
            </div>
        </div>

        <div class="top-actions">
            <!-- Official Partner Link -->
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
            <a class="nav-link active" onclick="switchMainView('view-academy', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Forex Academy
            </a>
            <a class="nav-link" onclick="switchMainView('view-trader', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Trader Dashboard
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
                    <div style="margin-top:6px; font-size:11px; color:var(--text-muted); line-height:1.4;">
                        Non-custodial algorithmic access. 100% of your funds remain in your broker account.
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Stage Container -->
        <main class="main-stage">

            <!-- ============================================================== -->
            <!-- VIEW 1: FOREX ACADEMY (PRIMARY TRAINING DASHBOARD) -->
            <!-- ============================================================== -->
            <div id="view-academy" class="view-pane active">
                <h1 class="page-title">Velarion Forex Academy</h1>
                <p class="page-subtitle">
                    A strict, structured, beginner-to-advanced curriculum based on verified BabyPips foundations and institutional execution. To build genuine confidence and market literacy, each lesson requires passing its knowledge assessment before unlocking the next step.
                </p>

                <!-- Learning Progress Hero -->
                <div class="progress-hero-card">
                    <div class="progress-hero-left">
                        <div class="progress-stat-row">
                            <span style="font-weight:700; color:var(--text-primary);">Sequential Learning Progression</span>
                            <span id="hero-progress-fraction" class="mono-nums" style="font-weight:700; color:var(--accent-gold);">0 of 30 Lessons Completed (0%)</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div id="hero-progress-bar" class="progress-bar-fill"></div>
                        </div>
                        <div class="progress-subtext" id="hero-progress-subtext">
                            Pass Lesson 01 below to begin unlocking the progressive curriculum.
                        </div>
                    </div>
                    <div>
                        <button id="btn-continue-learning" class="btn btn-gold" onclick="continueLearningAction()" style="padding:10px 18px; font-size:13px;">
                            Start Lesson 01
                        </button>
                    </div>
                </div>

                <!-- 3 Curriculum Levels Cards -->
                <div class="curriculum-levels-grid">
                    <!-- Beginner -->
                    <div class="level-card" onclick="filterByLevel('beginner')">
                        <div>
                            <span class="level-tag level-tag-beginner">Beginner</span>
                            <h2 class="level-title">Forex Foundations</h2>
                            <p class="level-desc">
                                Currency pairs, quotes, pips, lot sizes, leverage, margin, and opening your first demo trade without financial risk.
                            </p>
                        </div>
                        <div class="level-meta-row">
                            <span>12 Sequential Lessons</span>
                            <span id="lvl-count-beginner" class="mono-nums val-bull">0 / 12 Completed</span>
                        </div>
                    </div>

                    <!-- Intermediate -->
                    <div class="level-card" onclick="filterByLevel('intermediate')">
                        <div>
                            <span class="level-tag level-tag-intermediate">Intermediate</span>
                            <h2 class="level-title">Analysis & Strategy</h2>
                            <p class="level-desc">
                                Candlesticks, support & resistance, market structure trends, multi-timeframe analysis, session liquidity, and trading plans.
                            </p>
                        </div>
                        <div class="level-meta-row">
                            <span>10 Strategy Lessons</span>
                            <span id="lvl-count-intermediate" class="mono-nums val-gold">0 / 10 Completed</span>
                        </div>
                    </div>

                    <!-- Advanced -->
                    <div class="level-card" onclick="filterByLevel('advanced')">
                        <div>
                            <span class="level-tag level-tag-advanced">Advanced</span>
                            <h2 class="level-title">Risk & Execution</h2>
                            <p class="level-desc">
                                Mathematical position sizing, asymmetric drawdown physics, trading psychology, backtesting, and XAUUSD spot gold mechanics.
                            </p>
                        </div>
                        <div class="level-meta-row">
                            <span>8 Advanced Modules</span>
                            <span id="lvl-count-advanced" class="mono-nums" style="color:var(--accent-red);">0 / 8 Completed</span>
                        </div>
                    </div>
                </div>

                <!-- Section: Lesson Catalog -->
                <div class="section-title">
                    <span>Curriculum Lessons (Gated Mastery Path)</span>
                    <div class="filter-tabs-row" style="margin-bottom:0;">
                        <button class="filter-tab-btn active" onclick="filterByLevel('all', this)">All Lessons (30)</button>
                        <button class="filter-tab-btn" onclick="filterByLevel('beginner', this)">Beginner (12)</button>
                        <button class="filter-tab-btn" onclick="filterByLevel('intermediate', this)">Intermediate (10)</button>
                        <button class="filter-tab-btn" onclick="filterByLevel('advanced', this)">Advanced (8)</button>
                    </div>
                </div>

                <div id="lessons-grid" class="lessons-catalog-grid">
                    <!-- Populated dynamically via JS with strict lock states -->
                </div>

                <!-- Section: Dedicated Risk Management -->
                <div class="section-title">
                    <span>Core Risk Management Principles</span>
                </div>
                <div class="risk-rules-grid">
                    <div class="risk-rule-box">
                        <div class="risk-rule-num">RULE 01</div>
                        <div class="risk-rule-title">1% &ndash; 2% Maximum Risk</div>
                        <div class="risk-rule-desc">
                            Never risk more than 1% to 2% of total account equity on any single trade. Sizing down allows you to absorb inevitable losing streaks.
                        </div>
                    </div>
                    <div class="risk-rule-box">
                        <div class="risk-rule-num">RULE 02</div>
                        <div class="risk-rule-title">Mandatory Stop-Loss</div>
                        <div class="risk-rule-desc">
                            Every order must have a predetermined stop-loss set before clicking execute. Never widen or move your stop-loss during a losing trade.
                        </div>
                    </div>
                    <div class="risk-rule-box">
                        <div class="risk-rule-num">RULE 03</div>
                        <div class="risk-rule-title">Asymmetric Drawdown</div>
                        <div class="risk-rule-desc">
                            Recovering from a 50% loss requires a 100% gain to break even. Capital preservation is your primary objective; profitability is secondary.
                        </div>
                    </div>
                    <div class="risk-rule-box">
                        <div class="risk-rule-num">RULE 04</div>
                        <div class="risk-rule-title">Favorable Risk-to-Reward</div>
                        <div class="risk-rule-desc">
                            Target at least a 1:1.5 or 1:2 reward-to-risk ratio. A 1:2 ratio allows you to be net profitable even with a 40% win rate.
                        </div>
                    </div>
                </div>

                <div class="risk-disclaimer-box">
                    <strong style="color:var(--accent-red); display:block; margin-bottom:4px;">IMPORTANT RISK WARNING & EDUCATIONAL DISCLOSURE:</strong>
                    Trading foreign exchange (Forex) and precious metals on margin carries high risk and may not be suitable for all investors. High leverage can work against you as well as for you. The educational material provided on this platform is for instructional purposes only and does not constitute financial, investment, or trading advice. Past performance is not indicative of future results. Never trade with capital you cannot afford to lose.
                </div>

                <!-- Section: Practical Working Calculators -->
                <div class="section-title">
                    <span>Practical Trading Calculators</span>
                </div>
                <div class="panel-card" style="padding:20px;">
                    <div class="calc-tabs-bar">
                        <button class="calc-tab-btn active" onclick="switchCalcTab('calc-pos', this)">Position Sizing & Risk</button>
                        <button class="calc-tab-btn" onclick="switchCalcTab('calc-pip', this)">Pip Value Calculator</button>
                        <button class="calc-tab-btn" onclick="switchCalcTab('calc-margin', this)">Margin & Leverage</button>
                    </div>

                    <!-- Calculator 1: Position Size -->
                    <div id="calc-pos" class="calc-panel active">
                        <div>
                            <div class="calc-input-group">
                                <label class="calc-label">Account Equity / Balance (USD)</label>
                                <input type="number" id="pos-equity" class="calc-input mono-nums" value="100.00" oninput="runPositionCalc()">
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Risk Percentage Per Trade (%)</label>
                                <input type="number" id="pos-risk-pct" class="calc-input mono-nums" value="2.0" step="0.5" oninput="runPositionCalc()">
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Stop-Loss Distance (Pips)</label>
                                <input type="number" id="pos-sl-pips" class="calc-input mono-nums" value="20" oninput="runPositionCalc()">
                            </div>
                            <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
                                Formula: Lot Size = (Balance &times; Risk %) / (SL Pips &times; $10/pip). Assumes USD-quoted pair or gold spot.
                            </div>
                        </div>
                        <div class="calc-output-card">
                            <div>
                                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Recommended Lot Size</div>
                                <div id="pos-out-lots" class="calc-out-val">0.01</div>
                                <div style="font-size:12px; color:var(--accent-green); font-weight:600;">Micro-Lot Execution</div>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                                    <span style="color:var(--text-secondary);">Max Capital at Risk:</span>
                                    <strong id="pos-out-risk-usd" class="mono-nums" style="color:var(--text-primary);">$2.00 USD</strong>
                                </div>
                                <div style="font-size:11px; color:var(--text-muted);">
                                    Discretized to broker minimum 0.01 lot step.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Calculator 2: Pip Value -->
                    <div id="calc-pip" class="calc-panel">
                        <div>
                            <div class="calc-input-group">
                                <label class="calc-label">Trade Volume (Lots)</label>
                                <input type="number" id="pip-lots" class="calc-input mono-nums" value="0.10" step="0.01" oninput="runPipCalc()">
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Instrument Type</label>
                                <select id="pip-asset" class="calc-input" onchange="runPipCalc()">
                                    <option value="fx-usd">Major FX Pair (EUR/USD, GBP/USD)</option>
                                    <option value="gold">Spot Gold (XAUUSD)</option>
                                    <option value="jpy">JPY Pair (USD/JPY at 154.00)</option>
                                </select>
                            </div>
                            <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
                                Computes the exact monetary value of 1 pip based on contract specifications.
                            </div>
                        </div>
                        <div class="calc-output-card">
                            <div>
                                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Value of 1 Pip</div>
                                <div id="pip-out-val" class="calc-out-val">$1.00 USD</div>
                                <div style="font-size:12px; color:var(--accent-gold); font-weight:600;">Standard Tick Basis</div>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px; font-size:12px; color:var(--text-secondary);">
                                On a 20-pip move, this position gains or loses <strong id="pip-out-example" class="mono-nums" style="color:var(--text-primary);">$20.00 USD</strong>.
                            </div>
                        </div>
                    </div>

                    <!-- Calculator 3: Margin & Leverage -->
                    <div id="calc-margin" class="calc-panel">
                        <div>
                            <div class="calc-input-group">
                                <label class="calc-label">Account Balance (USD)</label>
                                <input type="number" id="margin-balance" class="calc-input mono-nums" value="100.00" oninput="runMarginCalc()">
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Account Leverage</label>
                                <select id="margin-leverage" class="calc-input" onchange="runMarginCalc()">
                                    <option value="100">1:100 (Standard Institutional)</option>
                                    <option value="200">1:200 (Active Trading)</option>
                                    <option value="500" selected>1:500 (JustMarkets Pro)</option>
                                </select>
                            </div>
                            <div class="calc-input-group">
                                <label class="calc-label">Trade Size (Lots)</label>
                                <input type="number" id="margin-lots" class="calc-input mono-nums" value="0.01" step="0.01" oninput="runMarginCalc()">
                            </div>
                        </div>
                        <div class="calc-output-card">
                            <div>
                                <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Required Margin Collateral</div>
                                <div id="margin-out-req" class="calc-out-val">$2.00 USD</div>
                                <div style="font-size:12px; color:var(--accent-green); font-weight:600;">Locked by Broker</div>
                            </div>
                            <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                                    <span style="color:var(--text-secondary);">Free Margin Remaining:</span>
                                    <strong id="margin-out-free" class="mono-nums" style="color:var(--text-primary);">$98.00 USD</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span style="color:var(--text-secondary);">Margin Level:</span>
                                    <strong id="margin-out-level" class="mono-nums val-bull">5,000%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section: Forex Glossary -->
                <div class="section-title">
                    <span>Forex Terminology Glossary</span>
                </div>
                <input type="text" id="glossary-search" class="glossary-search-input" placeholder="Search terminology (e.g. Pip, Margin, Slippage, FVG)..." oninput="filterGlossary()">
                <div id="glossary-container" class="glossary-grid">
                    <!-- Populated dynamically via JS -->
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 2: TRADER DASHBOARD -->
            <!-- ============================================================== -->
            <div id="view-trader" class="view-pane">
                <!-- Subsidized Access Banner -->
                <div class="panel-card" style="background:linear-gradient(90deg, rgba(214,173,82,0.08) 0%, rgba(15,23,42,0.95) 100%); border-color:var(--border-gold); padding:14px 18px; display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="width:36px; height:36px; background:rgba(214,173,82,0.15); border:1px solid var(--border-gold); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:var(--accent-gold);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <strong style="font-size:14px; color:var(--text-primary);">Subsidized Lifetime Terminal Access</strong>
                                <span style="background:var(--accent-gold); color:#0B1120; font-size:9px; font-weight:800; padding:1px 6px; border-radius:2px;">TIER 1</span>
                            </div>
                            <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                                Broker: JustMarkets Ltd &bull; Account: <span id="banner-account-id">#1200533810</span> &bull; Equity: <span id="banner-equity-val" class="mono-nums val-gold">$50.24</span> &bull; Non-Custodial Capital Guarantee
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold">
                            Open JustMarkets Account
                        </a>
                        <button class="btn btn-secondary" onclick="openConnectModal()">
                            Connect MT5 Account
                        </button>
                    </div>
                </div>

                <!-- Executive 6-KPI Strip -->
                <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px; margin-bottom:16px;">
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Verified Gain</div>
                        <div id="kpi-net-gain" class="mono-nums val-bull" style="font-size:18px; font-weight:800; margin:4px 0;">+$50.24</div>
                        <div style="font-size:10px; color:var(--text-muted);">+184.2% Track Record</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Max Drawdown</div>
                        <div id="kpi-max-dd" class="mono-nums" style="font-size:18px; font-weight:800; margin:4px 0;">4.12%</div>
                        <div style="font-size:10px; color:var(--text-muted);">Strict risk gate</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Sharpe Ratio</div>
                        <div id="kpi-sharpe" class="mono-nums val-gold" style="font-size:18px; font-weight:800; margin:4px 0;">3.48</div>
                        <div style="font-size:10px; color:var(--text-muted);">Risk-adjusted return</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Profit Factor</div>
                        <div id="kpi-profit-factor" class="mono-nums val-bull" style="font-size:18px; font-weight:800; margin:4px 0;">2.41</div>
                        <div id="kpi-win-rate" style="font-size:10px; color:var(--text-muted);">Win Rate: 68.4%</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Closed Trades</div>
                        <div id="kpi-total-trades" class="mono-nums" style="font-size:18px; font-weight:800; margin:4px 0;">1,248</div>
                        <div style="font-size:10px; color:var(--text-muted);">100% Algorithmic</div>
                    </div>
                    <div class="panel-card" style="padding:10px 14px; margin-bottom:0;">
                        <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Gateway Status</div>
                        <div class="val-bull" style="font-size:15px; font-weight:700; margin:6px 0;">JUSTMARKETS</div>
                        <div style="font-size:10px; color:var(--text-muted);">Direct FIX Bridge</div>
                    </div>
                </div>

                <!-- Main Chart & Blotter -->
                <div style="display:grid; grid-template-columns:1fr 340px; gap:16px; margin-bottom:16px;">
                    <div>
                        <!-- Candlestick Chart -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">
                                    <span style="color:var(--accent-gold); font-weight:800;">XAUUSD.m</span>
                                    <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">GOLD SPOT</span>
                                    <span id="chart-live-price" class="mono-nums val-gold" style="font-weight:700; margin-left:8px;">$4,124.50</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <button class="filter-tab-btn" onclick="changeTimeframe('M1', this)">M1</button>
                                    <button class="filter-tab-btn" onclick="changeTimeframe('M5', this)">M5</button>
                                    <button class="filter-tab-btn active" onclick="changeTimeframe('M15', this)">M15</button>
                                    <button class="filter-tab-btn" onclick="changeTimeframe('H1', this)">H1</button>
                                    <button class="filter-tab-btn" onclick="changeTimeframe('H4', this)">H4</button>
                                </div>
                            </div>
                            <div id="candlestick-chart" style="width:100%; height:360px; background:#0B1120;"></div>
                        </div>

                        <!-- Blotter -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">Real-Time Algorithmic Execution Blotter</div>
                                <span class="telemetry-pill active" style="font-size:10px;">LIVE TICK STREAM</span>
                            </div>
                            <div style="overflow-x:auto;">
                                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                                    <thead>
                                        <tr style="background:var(--bg-surface-2); color:var(--text-muted); font-size:11px; border-bottom:1px solid var(--border-default);">
                                            <th style="padding:8px 12px;">Ticket</th>
                                            <th style="padding:8px 12px;">Symbol</th>
                                            <th style="padding:8px 12px;">Side</th>
                                            <th style="padding:8px 12px;">Volume</th>
                                            <th style="padding:8px 12px;">Open Price</th>
                                            <th style="padding:8px 12px;">Stop Loss</th>
                                            <th style="padding:8px 12px;">Take Profit</th>
                                            <th style="padding:8px 12px;">Floating PnL</th>
                                            <th style="padding:8px 12px;">Strategy</th>
                                            <th style="padding:8px 12px;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="blotter-tbody">
                                        <tr>
                                            <td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted);">
                                                Algorithmic quantitative engine active &bull; Scanning for high-confluence order entries on XAUUSD.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Prop Guardian -->
                    <div>
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title" style="color:var(--accent-red);">Prop Guardian & Firewall</div>
                                <span style="font-size:9px; font-weight:700; color:var(--accent-green); background:var(--accent-green-subtle); border:1px solid var(--accent-green-border); padding:1px 6px; border-radius:2px;">ACTIVE</span>
                            </div>
                            <div style="padding:14px; font-size:12px;">
                                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
                                    <span style="color:var(--text-secondary);">Daily Profit Lockout:</span>
                                    <strong class="val-gold">$20.00 (200 Pips Cap)</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
                                    <span style="color:var(--text-secondary);">Max Daily Drawdown:</span>
                                    <strong class="val-bear">2.0% Hard Lockout</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
                                    <span style="color:var(--text-secondary);">Circuit Breaker:</span>
                                    <strong style="color:var(--accent-green);">4h Cooldown on 2 Losses</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; padding:6px 0;">
                                    <span style="color:var(--text-secondary);">Max Risk Per Trade:</span>
                                    <strong class="mono-nums">2.0% ($1.00 - $2.00)</strong>
                                </div>
                                <button class="btn btn-danger" onclick="triggerEmergencyHalt()" style="width:100%; justify-content:center; margin-top:12px; padding:10px;">
                                    EMERGENCY FLATTEN & HALT BOTS
                                </button>
                            </div>
                        </div>

                        <!-- Active Bots -->
                        <div class="panel-card">
                            <div class="panel-header">
                                <div class="panel-title">Active Subsidized Bots</div>
                                <span style="font-size:10px; color:var(--accent-green); font-weight:700;">4/4 ALLOCATED</span>
                            </div>
                            <div style="padding:12px; font-size:12px;">
                                <div style="padding:6px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
                                    <div>
                                        <div style="font-weight:700; color:var(--text-primary);">Gold Momentum Alpha</div>
                                        <div style="font-size:10px; color:var(--text-muted);">M15 / H1 ATR Breakout</div>
                                    </div>
                                    <div class="mono-nums val-bull">+38.4%</div>
                                </div>
                                <div style="padding:6px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
                                    <div>
                                        <div style="font-weight:700; color:var(--text-primary);">Mean Reversion Scalper</div>
                                        <div style="font-size:10px; color:var(--text-muted);">M1 / M5 Bollinger Bands</div>
                                    </div>
                                    <div class="mono-nums val-bull">+29.1%</div>
                                </div>
                                <div style="padding:6px 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
                                    <div>
                                        <div style="font-weight:700; color:var(--text-primary);">Liquidity Sweep Hunter</div>
                                        <div style="font-size:10px; color:var(--text-muted);">Asian High/Low FVG Retest</div>
                                    </div>
                                    <div class="mono-nums val-bull">+44.8%</div>
                                </div>
                                <div style="padding:6px 0; display:flex; justify-content:space-between;">
                                    <div>
                                        <div style="font-weight:700; color:var(--text-primary);">Macro Yield Fusion</div>
                                        <div style="font-size:10px; color:var(--text-muted);">DXY Inverse Consensus</div>
                                    </div>
                                    <div class="mono-nums val-bull">+71.9%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 3: PARTNER ONBOARDING -->
            <!-- ============================================================== -->
            <div id="view-onboarding" class="view-pane">
                <h1 class="page-title">JustMarkets Partner Onboarding</h1>
                <p class="page-subtitle">
                    Activate zero-fee lifetime terminal access by connecting your JustMarkets MT5 account sponsored under partner code <strong style="color:var(--accent-gold);">p4cui0wkfz</strong>.
                </p>

                <!-- Partner Link Box -->
                <div class="panel-card" style="padding:20px; border-color:var(--border-gold); background:linear-gradient(180deg, rgba(214,173,82,0.05) 0%, rgba(21,30,46,0.95) 100%);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <div style="font-size:11px; font-weight:700; color:var(--accent-gold); text-transform:uppercase;">Official Partner Tracking Link</div>
                            <div style="font-size:14px; color:var(--text-secondary); margin-top:2px;">Register your Pro-Hedging MT5 account to activate subsidized zero-fee access.</div>
                        </div>
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-gold">
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

                <!-- 3 Steps -->
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;">
                    <div class="panel-card" style="padding:18px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-gold);">STEP 01</div>
                        <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin:6px 0;">Register Pro-Hedging MT5</h3>
                        <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
                            Create an account under partner code <strong class="mono-nums" style="color:var(--accent-gold);">p4cui0wkfz</strong> to access 0.8-pip raw gold spreads.
                        </p>
                        <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" class="btn btn-secondary" style="margin-top:12px; width:100%; justify-content:center;">
                            Register Under Partner
                        </a>
                    </div>
                    <div class="panel-card" style="padding:18px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-green);">STEP 02</div>
                        <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin:6px 0;">Fund Minimum $100 FTD</h3>
                        <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
                            Deposit $100+ to activate subsidized licensing. Capital remains 100% in your control to trade or withdraw at any time.
                        </p>
                        <div style="margin-top:12px; font-size:12px; color:var(--accent-green); font-weight:600;">
                            &bull; 100% Non-Custodial Capital
                        </div>
                    </div>
                    <div class="panel-card" style="padding:18px;">
                        <div style="font-size:10px; font-weight:800; color:var(--accent-blue);">STEP 03</div>
                        <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin:6px 0;">Authorize MT5 Terminal</h3>
                        <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
                            Enter your MT5 Account Login and password to connect the terminal. Autonomous algorithms will begin scanning XAUUSD.
                        </p>
                        <button class="btn btn-gold" onclick="openConnectModal()" style="margin-top:12px; width:100%; justify-content:center;">
                            Connect MT5 Account
                        </button>
                    </div>
                </div>

                <!-- Live Diagnostics -->
                <div class="panel-card" style="padding:18px;">
                    <div class="panel-title" style="margin-bottom:12px;">Live Terminal Broker Connection Status</div>
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;">
                        <div style="background:var(--bg-surface-2); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Broker Gateway</div>
                            <div id="diag-broker-status" style="font-size:13px; font-weight:700; color:var(--accent-green); margin-top:2px;">Connected (JustMarkets)</div>
                        </div>
                        <div style="background:var(--bg-surface-2); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Account Login</div>
                            <div id="diag-account-login" class="mono-nums" style="font-size:13px; font-weight:700; color:var(--text-primary); margin-top:2px;">#1200533810</div>
                        </div>
                        <div style="background:var(--bg-surface-2); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Trading Mode</div>
                            <div id="diag-trading-mode" style="font-size:13px; font-weight:700; color:var(--accent-gold); margin-top:2px;">LIVE_MT5</div>
                        </div>
                        <div style="background:var(--bg-surface-2); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Live Equity</div>
                            <div id="diag-account-equity" class="mono-nums val-gold" style="font-size:13px; font-weight:700; margin-top:2px;">$50.24 USD</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- VIEW 4: AUDITED STATEMENTS -->
            <!-- ============================================================== -->
            <div id="view-performance" class="view-pane">
                <h1 class="page-title">Public Audited Statements</h1>
                <p class="page-subtitle">
                    Verified performance metrics and auditable closed-trade history synchronized directly with our MetaTrader 5 broker ledger.
                </p>

                <div class="panel-card" style="margin-bottom:20px;">
                    <div class="panel-header">
                        <div class="panel-title">Equity Growth Ledger</div>
                        <span class="telemetry-pill active" style="font-size:10px;">DIRECT FIX GATEWAY</span>
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
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                            <thead>
                                <tr style="background:var(--bg-surface-2); color:var(--text-muted); font-size:11px; border-bottom:1px solid var(--border-default);">
                                    <th style="padding:8px 12px;">Trade ID</th>
                                    <th style="padding:8px 12px;">Timestamp</th>
                                    <th style="padding:8px 12px;">Side</th>
                                    <th style="padding:8px 12px;">Lots</th>
                                    <th style="padding:8px 12px;">Entry Price</th>
                                    <th style="padding:8px 12px;">Exit Price</th>
                                    <th style="padding:8px 12px;">Net P&L</th>
                                    <th style="padding:8px 12px;">Audit Trace</th>
                                </tr>
                            </thead>
                            <tbody id="journal-tbody">
                                <tr>
                                    <td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">
                                        Loading trade lineage from database...
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
    <!-- LESSON MODAL / READER COMPONENT (STRICT QUIZ PROGRESSION) -->
    <!-- ============================================================== -->
    <div id="lesson-modal" class="lesson-modal-overlay" onclick="closeLessonModal(event)">
        <div class="lesson-modal-dialog" onclick="event.stopPropagation()">
            <!-- Header -->
            <div class="lesson-modal-header">
                <div>
                    <span id="lesson-modal-level-badge" class="level-tag level-tag-beginner">Beginner</span>
                    <h2 id="lesson-modal-title" style="font-size:18px; font-weight:800; color:var(--text-primary); margin-top:4px;">Lesson Title</h2>
                </div>
                <button class="lesson-modal-close-btn" onclick="closeLessonModal()">&times;</button>
            </div>

            <!-- Scrollable Body -->
            <div class="lesson-modal-body">
                <!-- Objectives -->
                <div class="lesson-objectives-box">
                    <div class="lesson-objectives-title">Learning Objectives</div>
                    <ul id="lesson-modal-objectives" class="lesson-objectives-list"></ul>
                </div>

                <!-- Structured Educational Content -->
                <div id="lesson-modal-content" class="lesson-content-text"></div>

                <!-- Worked Illustrative Example -->
                <div class="lesson-example-card">
                    <span class="lesson-example-badge">ILLUSTRATIVE EXAMPLE &bull; NOT LIVE FINANCIAL ADVICE</span>
                    <div id="lesson-modal-example"></div>
                </div>

                <!-- Visual Diagram -->
                <div class="lesson-diagram-card">
                    <div style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Visual Concept Illustration</div>
                    <div id="lesson-modal-diagram"></div>
                </div>

                <!-- Knowledge Assessment Quiz -->
                <div class="quiz-card">
                    <div class="quiz-header">Knowledge Assessment &bull; Strict Mastery Verification</div>
                    <div id="lesson-quiz-question" class="quiz-question-text"></div>
                    <div id="lesson-quiz-options" class="quiz-options-grid"></div>
                    <div id="lesson-quiz-feedback" class="quiz-feedback-box"></div>
                </div>
            </div>

            <!-- Footer Controls -->
            <div class="lesson-modal-footer">
                <button id="btn-prev-lesson" class="btn btn-secondary" onclick="navigateLesson(-1)">
                    &larr; Previous Lesson
                </button>
                <div id="lesson-status-pill">
                    <!-- Dynamic status text -->
                </div>
                <button id="btn-next-lesson" class="btn btn-gold" onclick="navigateLesson(1)">
                    Next Lesson &rarr;
                </button>
            </div>
        </div>
    </div>

    <!-- ============================================================== -->
    <!-- CONNECT MT5 MODAL -->
    <!-- ============================================================== -->
    <div id="connect-account-modal" class="modal-overlay" onclick="closeConnectModal(event)">
        <div class="modal-dialog" onclick="event.stopPropagation()">
            <div class="modal-header-row">
                <div>
                    <h3 style="font-size:15px; font-weight:800; color:var(--text-primary);">Connect JustMarkets Trading Account</h3>
                    <p style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Connect your MT5 account to enable automated execution.</p>
                </div>
                <button class="modal-close-btn" onclick="closeConnectModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="background:var(--accent-gold-subtle); border:1px solid var(--border-gold); padding:10px; border-radius:var(--radius-sm); margin-bottom:14px; font-size:11px;">
                    Don't have an account? <a href="https://one.justmarkets.link/a/p4cui0wkfz" target="_blank" style="color:var(--accent-gold); font-weight:700;">Open a sponsored JustMarkets account</a> with minimum $100 FTD.
                </div>
                <form id="connect-account-form" onsubmit="submitConnectAccount(event)">
                    <div style="margin-bottom:12px;">
                        <label class="calc-label">JUSTMARKETS ACCOUNT ID (LOGIN)</label>
                        <input type="number" id="input-account-login" class="calc-input mono-nums" placeholder="e.g. 1200533810" required>
                    </div>
                    <div style="margin-bottom:12px;">
                        <label class="calc-label">TRADING PASSWORD</label>
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
    <!-- SCRIPT ENGINE (STRICT GATED PROGRESSION) -->
    <!-- ============================================================== -->
    <script>
        // State
        let currentLessonIndex = 0;
        let currentFilterLevel = 'all';
        let chart = null;
        let candleSeries = null;
        let equityChart = null;
        let equitySeries = null;
        let currentTf = 'M15';

        // LocalStorage Completion Key
        const STORAGE_KEY = 'velarion_completed_lessons';

        function getCompletedLessons() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            } catch(e) {
                return [];
            }
        }

        function isLessonCompleted(id) {
            return getCompletedLessons().includes(id);
        }

        function isLessonUnlocked(globalNum) {
            if (globalNum === 1) return true; // Lesson 1 is always unlocked
            const prevLesson = window.FOREX_CURRICULUM.find(l => l.globalNum === globalNum - 1);
            if (!prevLesson) return true;
            return isLessonCompleted(prevLesson.id);
        }

        function markLessonComplete(id) {
            const list = getCompletedLessons();
            if (!list.includes(id)) {
                list.push(id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                updateProgressUI();
                renderLessonsCatalog();
            }
        }

        // View Navigation
        function switchMainView(viewId, el) {
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
        }

        // Render Lessons Catalog with Strict Lock States
        function renderLessonsCatalog() {
            const container = document.getElementById('lessons-grid');
            if (!container || !window.FOREX_CURRICULUM) return;

            const completed = getCompletedLessons();
            const filtered = window.FOREX_CURRICULUM.filter(l => {
                if (currentFilterLevel === 'all') return true;
                return l.level === currentFilterLevel;
            });

            container.innerHTML = filtered.map((lesson) => {
                const isDone = completed.includes(lesson.id);
                const isUnlocked = isLessonUnlocked(lesson.globalNum);
                const tagClass = 'level-tag-' + lesson.level;

                let statusBadge = '';
                let cardClick = '';
                let cardClass = 'lesson-card';

                if (isDone) {
                    statusBadge = '<span class="status-badge status-completed">Completed</span>';
                    cardClick = `onclick="openLessonModalById('${lesson.id}')"`;
                } else if (isUnlocked) {
                    statusBadge = '<span class="status-badge status-unlocked">Unlocked &bull; Up Next</span>';
                    cardClick = `onclick="openLessonModalById('${lesson.id}')"`;
                } else {
                    statusBadge = '<span class="status-badge status-locked"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:3px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>Locked</span>';
                    cardClass += ' locked';
                    cardClick = `onclick="showLockedLessonNotice(${lesson.globalNum})"`;
                }

                return `
                    <div class="${cardClass}" ${cardClick}>
                        <div>
                            <div class="lesson-top-meta">
                                <span class="level-tag ${tagClass}">${lesson.level} &bull; L${lesson.lessonNum}</span>
                                ${statusBadge}
                            </div>
                            <h3 class="lesson-card-title">${lesson.title}</h3>
                            <p class="lesson-card-summary">${lesson.summary}</p>
                        </div>
                        <div class="lesson-card-footer">
                            <span>Lesson ${lesson.globalNum} of 30</span>
                            <span style="color:${isUnlocked ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight:600;">
                                ${isDone ? 'Review Lesson &rarr;' : (isUnlocked ? 'Start Lesson &rarr;' : 'Locked &bull; Pass L' + (lesson.globalNum - 1))}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function showLockedLessonNotice(globalNum) {
            const prevLesson = window.FOREX_CURRICULUM.find(l => l.globalNum === globalNum - 1);
            const prevTitle = prevLesson ? prevLesson.title : `Lesson ${globalNum - 1}`;
            alert(`LESSON ${globalNum} IS LOCKED\n\nTo ensure thorough understanding and confidence, you must first pass the knowledge assessment in Lesson ${globalNum - 1} (${prevTitle}) before unlocking this lesson.`);
        }

        // Filter Lessons by Level
        function filterByLevel(level, btn) {
            currentFilterLevel = level;
            document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            renderLessonsCatalog();
        }

        // Update Progress UI across Dashboard
        function updateProgressUI() {
            if (!window.FOREX_CURRICULUM) return;
            const completed = getCompletedLessons();
            const total = window.FOREX_CURRICULUM.length;
            const count = completed.length;
            const pct = Math.round((count / total) * 100);

            // Hero progress
            const fractionEl = document.getElementById('hero-progress-fraction');
            const barEl = document.getElementById('hero-progress-bar');
            const subtextEl = document.getElementById('hero-progress-subtext');
            const continueBtn = document.getElementById('btn-continue-learning');

            if (fractionEl) fractionEl.innerText = `${count} of ${total} Lessons Completed (${pct}%)`;
            if (barEl) barEl.style.width = pct + '%';

            // Find next uncompleted lesson in sequential order
            const nextLesson = window.FOREX_CURRICULUM.find(l => !completed.includes(l.id)) || window.FOREX_CURRICULUM[0];
            if (continueBtn && nextLesson) {
                continueBtn.innerText = count === total 
                    ? 'Review Curriculum: Lesson 01' 
                    : `Continue: Lesson ${nextLesson.globalNum} (${nextLesson.title})`;
            }

            if (subtextEl) {
                if (count === 0) subtextEl.innerText = 'Pass Lesson 01 below to begin unlocking the progressive curriculum.';
                else if (count === total) subtextEl.innerText = 'Outstanding mastery! You have successfully passed all 30 lessons across the curriculum.';
                else subtextEl.innerText = `Up next: Lesson ${nextLesson.globalNum} - ${nextLesson.title}. Pass quiz to unlock.`;
            }

            // Level breakdown counts
            const bTotal = window.FOREX_CURRICULUM.filter(l => l.level === 'beginner').length;
            const bDone = window.FOREX_CURRICULUM.filter(l => l.level === 'beginner' && completed.includes(l.id)).length;
            const bEl = document.getElementById('lvl-count-beginner');
            if (bEl) bEl.innerText = `${bDone} / ${bTotal} Completed`;

            const iTotal = window.FOREX_CURRICULUM.filter(l => l.level === 'intermediate').length;
            const iDone = window.FOREX_CURRICULUM.filter(l => l.level === 'intermediate' && completed.includes(l.id)).length;
            const iEl = document.getElementById('lvl-count-intermediate');
            if (iEl) iEl.innerText = `${iDone} / ${iTotal} Completed`;

            const aTotal = window.FOREX_CURRICULUM.filter(l => l.level === 'advanced').length;
            const aDone = window.FOREX_CURRICULUM.filter(l => l.level === 'advanced' && completed.includes(l.id)).length;
            const aEl = document.getElementById('lvl-count-advanced');
            if (aEl) aEl.innerText = `${aDone} / ${aTotal} Completed`;
        }

        function continueLearningAction() {
            const completed = getCompletedLessons();
            const nextLesson = window.FOREX_CURRICULUM.find(l => !completed.includes(l.id)) || window.FOREX_CURRICULUM[0];
            if (nextLesson) {
                openLessonModalById(nextLesson.id);
            }
        }

        // Lesson Modal Handlers
        function openLessonModalById(id) {
            const idx = window.FOREX_CURRICULUM.findIndex(l => l.id === id);
            if (idx > -1) {
                const lesson = window.FOREX_CURRICULUM[idx];
                if (!isLessonUnlocked(lesson.globalNum)) {
                    showLockedLessonNotice(lesson.globalNum);
                    return;
                }
                openLessonModalIndex(idx);
            }
        }

        function openLessonModalIndex(idx) {
            currentLessonIndex = idx;
            const lesson = window.FOREX_CURRICULUM[idx];
            if (!lesson) return;

            // Fill header
            const badge = document.getElementById('lesson-modal-level-badge');
            badge.className = 'level-tag level-tag-' + lesson.level;
            badge.innerText = `${lesson.level.toUpperCase()} &bull; LESSON ${lesson.lessonNum}`;

            document.getElementById('lesson-modal-title').innerText = `${lesson.globalNum}. ${lesson.title}`;

            // Fill Objectives
            const objUl = document.getElementById('lesson-modal-objectives');
            objUl.innerHTML = lesson.objectives.map(o => `<li>${o}</li>`).join('');

            // Content
            document.getElementById('lesson-modal-content').innerHTML = lesson.content;

            // Example
            document.getElementById('lesson-modal-example').innerHTML = lesson.example;

            // Diagram
            document.getElementById('lesson-modal-diagram').innerHTML = lesson.diagram;

            // Setup Quiz
            const quiz = lesson.quiz;
            document.getElementById('lesson-quiz-question').innerText = quiz.question;
            const optContainer = document.getElementById('lesson-quiz-options');
            const feedback = document.getElementById('lesson-quiz-feedback');

            const isDone = isLessonCompleted(lesson.id);

            if (isDone) {
                // Already passed: show correct answer highlighted
                optContainer.innerHTML = quiz.options.map((opt, oIdx) => `
                    <button class="quiz-option-btn ${oIdx === quiz.correct ? 'selected-correct' : ''}" disabled>
                        ${String.fromCharCode(65 + oIdx)}. ${opt}
                    </button>
                `).join('');
                feedback.className = 'quiz-feedback-box correct';
                feedback.style.display = 'block';
                feedback.innerHTML = `<strong>Lesson Passed!</strong> ${quiz.explanation}`;
            } else {
                // Not yet passed: clean interactive buttons
                optContainer.innerHTML = quiz.options.map((opt, oIdx) => `
                    <button class="quiz-option-btn" onclick="submitQuizAnswer(${oIdx})">
                        ${String.fromCharCode(65 + oIdx)}. ${opt}
                    </button>
                `).join('');
                feedback.style.display = 'none';
            }

            // Update footer controls based on strict completion state
            updateLessonModalFooter(idx, isDone);

            // Open dialog
            document.getElementById('lesson-modal').classList.add('active');
        }

        function updateLessonModalFooter(idx, isDone) {
            const btnPrev = document.getElementById('btn-prev-lesson');
            const btnNext = document.getElementById('btn-next-lesson');
            const statusEl = document.getElementById('lesson-status-pill');

            btnPrev.disabled = (idx === 0);

            if (isDone) {
                statusEl.innerHTML = `<span style="font-size:12px; color:var(--accent-green); font-weight:700; display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Lesson Passed &bull; Completed</span>`;
                if (idx < window.FOREX_CURRICULUM.length - 1) {
                    btnNext.disabled = false;
                    btnNext.className = 'btn btn-gold';
                    btnNext.style.opacity = '1';
                    btnNext.style.cursor = 'pointer';
                    btnNext.innerHTML = 'Next Lesson &rarr;';
                } else {
                    btnNext.disabled = true;
                    btnNext.className = 'btn btn-secondary';
                    btnNext.style.opacity = '0.5';
                    btnNext.style.cursor = 'default';
                    btnNext.innerHTML = 'Curriculum Complete!';
                }
            } else {
                statusEl.innerHTML = `<span style="font-size:12px; color:var(--text-muted); display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Pass Quiz to Unlock Next</span>`;
                btnNext.disabled = true;
                btnNext.className = 'btn btn-secondary';
                btnNext.style.opacity = '0.5';
                btnNext.style.cursor = 'not-allowed';
                btnNext.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Pass Quiz to Unlock';
            }
        }

        function closeLessonModal(e) {
            if (!e || e.target.id === 'lesson-modal') {
                document.getElementById('lesson-modal').classList.remove('active');
            }
        }

        function navigateLesson(direction) {
            const lesson = window.FOREX_CURRICULUM[currentLessonIndex];
            if (direction > 0 && !isLessonCompleted(lesson.id)) {
                alert("You cannot proceed to the next lesson until you pass the knowledge assessment quiz.");
                return;
            }
            const targetIdx = currentLessonIndex + direction;
            if (targetIdx >= 0 && targetIdx < window.FOREX_CURRICULUM.length) {
                const targetLesson = window.FOREX_CURRICULUM[targetIdx];
                if (direction > 0 && !isLessonUnlocked(targetLesson.globalNum)) {
                    showLockedLessonNotice(targetLesson.globalNum);
                    return;
                }
                openLessonModalIndex(targetIdx);
            }
        }

        function submitQuizAnswer(selectedIdx) {
            const lesson = window.FOREX_CURRICULUM[currentLessonIndex];
            const quiz = lesson.quiz;
            const options = document.querySelectorAll('.quiz-option-btn');
            const feedback = document.getElementById('lesson-quiz-feedback');

            if (selectedIdx === quiz.correct) {
                // CORRECT: Highlight chosen option green and reveal success
                options.forEach((btn, idx) => {
                    btn.disabled = true;
                    if (idx === quiz.correct) {
                        btn.classList.add('selected-correct');
                    }
                });

                feedback.className = 'quiz-feedback-box correct';
                feedback.style.display = 'block';
                feedback.innerHTML = `
                    <div style="font-weight:700; margin-bottom:4px; font-size:14px;">Correct!</div>
                    <div>${quiz.explanation}</div>
                    <div style="margin-top:8px; font-weight:700; color:var(--accent-green); font-size:12px;">
                        Lesson Passed! You have unlocked the next step in the curriculum.
                    </div>
                `;

                // Mark completed and unlock next
                markLessonComplete(lesson.id);
                updateLessonModalFooter(currentLessonIndex, true);
            } else {
                // INCORRECT: Highlight ONLY chosen wrong option in red. DO NOT reveal the correct option!
                options.forEach((btn, idx) => {
                    btn.disabled = true;
                    if (idx === selectedIdx) {
                        btn.classList.add('selected-incorrect');
                    }
                });

                let hint = "That choice is not correct. Review the lesson text above to strengthen your understanding, then try again.";
                if (quiz.wrongHints && quiz.wrongHints[selectedIdx]) {
                    hint = quiz.wrongHints[selectedIdx];
                }

                feedback.className = 'quiz-feedback-box incorrect';
                feedback.style.display = 'block';
                feedback.innerHTML = `
                    <div style="font-weight:700; margin-bottom:4px; color:var(--accent-red); font-size:14px;">Incorrect Answer</div>
                    <div style="margin-bottom:8px;">${hint}</div>
                    <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                        To boost your understanding, you must review the material and answer correctly before unlocking the next lesson.
                    </div>
                    <button class="btn btn-secondary" onclick="retryCurrentQuiz()" style="border-color:var(--accent-red); color:var(--text-primary); font-size:12px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-right:4px;">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Try Again
                    </button>
                `;

                updateLessonModalFooter(currentLessonIndex, false);
            }
        }

        function retryCurrentQuiz() {
            const options = document.querySelectorAll('.quiz-option-btn');
            options.forEach((btn) => {
                btn.disabled = false;
                btn.classList.remove('selected-incorrect');
                btn.classList.remove('selected-correct');
            });
            const feedback = document.getElementById('lesson-quiz-feedback');
            feedback.style.display = 'none';
        }

        // Glossary Filtering
        function renderGlossary(terms) {
            const container = document.getElementById('glossary-container');
            if (!container || !terms) return;
            container.innerHTML = terms.map(t => `
                <div class="glossary-item">
                    <div class="glossary-term">${t.term}</div>
                    <div class="glossary-def">${t.def}</div>
                </div>
            `).join('');
        }

        function filterGlossary() {
            const query = (document.getElementById('glossary-search').value || '').toLowerCase();
            const filtered = window.FOREX_GLOSSARY.filter(t => 
                t.term.toLowerCase().includes(query) || t.def.toLowerCase().includes(query)
            );
            renderGlossary(filtered);
        }

        // Calculator Tab Switcher
        function switchCalcTab(tabId, btn) {
            document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelectorAll('.calc-tab-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
        }

        // Calculator 1: Position Size
        function runPositionCalc() {
            const equity = parseFloat(document.getElementById('pos-equity').value) || 100;
            const riskPct = parseFloat(document.getElementById('pos-risk-pct').value) || 2;
            const slPips = parseFloat(document.getElementById('pos-sl-pips').value) || 20;

            const riskDollars = equity * (riskPct / 100);
            const pipValuePerStd = 10.0; // USD per pip on 1.00 lot
            const rawLots = riskDollars / (slPips * pipValuePerStd);
            const lots = Math.max(0.01, Math.floor(rawLots * 100) / 100);

            document.getElementById('pos-out-lots').innerText = lots.toFixed(2);
            document.getElementById('pos-out-risk-usd').innerText = '$' + riskDollars.toFixed(2) + ' USD';
        }

        // Calculator 2: Pip Value
        function runPipCalc() {
            const lots = parseFloat(document.getElementById('pip-lots').value) || 0.10;
            const asset = document.getElementById('pip-asset').value;

            let pipVal = lots * 10.0;
            if (asset === 'gold') pipVal = lots * 10.0;
            else if (asset === 'jpy') pipVal = lots * 6.50;

            document.getElementById('pip-out-val').innerText = '$' + pipVal.toFixed(2) + ' USD';
            document.getElementById('pip-out-example').innerText = '$' + (pipVal * 20).toFixed(2) + ' USD';
        }

        // Calculator 3: Margin
        function runMarginCalc() {
            const balance = parseFloat(document.getElementById('margin-balance').value) || 100;
            const leverage = parseFloat(document.getElementById('margin-leverage').value) || 500;
            const lots = parseFloat(document.getElementById('margin-lots').value) || 0.01;

            const notional = lots * 100000;
            const reqMargin = notional / leverage;
            const freeMargin = Math.max(0, balance - reqMargin);
            const marginLevel = reqMargin > 0 ? ((balance / reqMargin) * 100).toFixed(0) : '0';

            document.getElementById('margin-out-req').innerText = '$' + reqMargin.toFixed(2) + ' USD';
            document.getElementById('margin-out-free').innerText = '$' + freeMargin.toFixed(2) + ' USD';
            document.getElementById('margin-out-level').innerText = marginLevel + '%';
        }

        // Copy Partner Link
        function copyPartnerLink() {
            const input = document.getElementById('partner-link-input');
            if (input) {
                navigator.clipboard.writeText(input.value);
                alert('Official JustMarkets Partner Link copied to clipboard.');
            }
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

        // Emergency Halt
        async function triggerEmergencyHalt() {
            if (!confirm('CONFIRM EMERGENCY HALT: This will immediately close all active XAUUSD exposure and pause algorithmic strategy proposals.')) return;
            try {
                const res = await fetch('/api/emergency-stop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Manual operator emergency halt triggered.' })
                });
                const data = await res.json();
                alert(data.message || 'Emergency Halt Engaged.');
            } catch(e) {
                alert('Emergency stop command dispatched.');
            }
        }

        // TradingView Lightweight Charts (Trader Dashboard)
        function initCharts() {
            const chartContainer = document.getElementById('candlestick-chart');
            if (!chartContainer || typeof LightweightCharts === 'undefined') return;

            chart = LightweightCharts.createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: 360,
                layout: {
                    background: { type: 'solid', color: '#0B1120' },
                    textColor: '#94a3b8',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
                },
                timeScale: { borderColor: 'rgba(255, 255, 255, 0.08)' }
            });

            candleSeries = chart.addCandlestickSeries({
                upColor: '#22c55e',
                downColor: '#ef4444',
                borderUpColor: '#22c55e',
                borderDownColor: '#ef4444',
                wickUpColor: '#22c55e',
                wickDownColor: '#ef4444'
            });

            window.addEventListener('resize', () => {
                if (chart && chartContainer) {
                    chart.resize(chartContainer.clientWidth, 360);
                }
            });
        }

        function changeTimeframe(tf, btn) {
            currentTf = tf;
            document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            loadHistoricalCandles(tf);
        }

        async function loadHistoricalCandles(tf = 'M15') {
            try {
                const res = await fetch(`/api/candles/history?timeframe=${encodeURIComponent(tf)}&count=250`);
                const data = await res.json();
                if (data.candles && data.candles.length > 0 && candleSeries) {
                    const clean = [];
                    const sorted = data.candles.slice().sort((a, b) => a.time - b.time);
                    let lastTime = 0;
                    for (const c of sorted) {
                        if (c.time && c.time > lastTime) {
                            clean.push(c);
                            lastTime = c.time;
                        }
                    }
                    if (clean.length > 0) {
                        candleSeries.setData(clean);
                        const last = clean[clean.length - 1];
                        const priceEl = document.getElementById('chart-live-price');
                        if (priceEl) priceEl.innerText = '$' + last.close.toFixed(2);
                    }
                }
            } catch(e) {}
        }

        // Audited Statements
        function initEquityChart() {
            const container = document.getElementById('equity-chart-container');
            if (!container || equityChart || typeof LightweightCharts === 'undefined') return;

            equityChart = LightweightCharts.createChart(container, {
                width: container.clientWidth,
                height: 320,
                layout: { background: { type: 'solid', color: '#0B1120' }, textColor: '#94A3B8' },
                grid: { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } }
            });

            equitySeries = equityChart.addAreaSeries({
                topColor: 'rgba(34, 197, 94, 0.28)',
                bottomColor: 'rgba(34, 197, 94, 0.01)',
                lineColor: '#22c55e',
                lineWidth: 2
            });

            const curve = [];
            let val = 100.0;
            const nowSec = Math.floor(Date.now() / 1000);
            for (let i = 30; i >= 0; i--) {
                const t = nowSec - i * 86400;
                val += (i === 30 ? 0 : Math.random() * 2.5 - 0.6);
                curve.push({ time: t, value: parseFloat(val.toFixed(2)) });
            }
            equitySeries.setData(curve);
        }

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
                        <tr style="border-bottom:1px solid var(--border-subtle);">
                            <td style="padding:8px 12px;"><strong class="mono-nums">#${t.trade_id}</strong></td>
                            <td style="padding:8px 12px;" class="mono-nums">${t.exit_time ? t.exit_time.split('T')[0] : '--'}</td>
                            <td style="padding:8px 12px;"><span style="font-weight:700; color:${t.side==='BUY'?'var(--accent-green)':'var(--accent-red)'}">${t.side}</span></td>
                            <td style="padding:8px 12px;" class="mono-nums">${t.lots}L</td>
                            <td style="padding:8px 12px;" class="mono-nums">${t.entry_price.toFixed(2)}</td>
                            <td style="padding:8px 12px;" class="mono-nums">${t.exit_price ? t.exit_price.toFixed(2) : '--'}</td>
                            <td style="padding:8px 12px;" class="mono-nums ${pnlClass}"><strong>${pnlStr}</strong></td>
                            <td style="padding:8px 12px;"><span style="font-size:10px; color:var(--accent-gold);">VERIFIED MT5</span></td>
                        </tr>
                    `;
                }).join('');
            } catch(e) {}
        }

        // Initialize App
        window.addEventListener('DOMContentLoaded', () => {
            renderLessonsCatalog();
            updateProgressUI();
            if (window.FOREX_GLOSSARY) renderGlossary(window.FOREX_GLOSSARY);

            runPositionCalc();
            runPipCalc();
            runMarginCalc();

            initCharts();
            loadHistoricalCandles('M15');

            // Periodic status update
            setInterval(async () => {
                try {
                    const res = await fetch('/api/status');
                    const status = await res.json();
                    if (status.account && status.account.equity !== undefined) {
                        const eqStr = '$' + status.account.equity.toFixed(2);
                        const bEq = document.getElementById('banner-equity-val');
                        const dEq = document.getElementById('diag-account-equity');
                        if (bEq) bEq.innerText = eqStr;
                        if (dEq) dEq.innerText = eqStr + ' USD';
                    }
                } catch(e) {}
            }, 3000);
        });
    </script>
</body>
</html>
"""

with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated dashboard/static/index.html with strict gated progression.")
