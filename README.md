# XAUUSD Quantitative Trading System

An institutional-grade, quantitative automated trading system engineered exclusively for **XAUUSD (Gold vs US Dollar)** with **MetaTrader 5 (MT5)** execution and **AI Analyst Decision Support**.

---

## Core Architectural Principle: The Deterministic Firewall

The AI is strictly an **analyst and decision-support component**. It is **never** allowed to execute trades directly.

```
REAL-TIME XAUUSD MARKET DATA (MT5 / Ticks / OHLCV)
                 │
                 ▼
       MARKET STATE ENGINE (ATR, RSI, EMAs, Swings, PDH/PDL, Sessions)
                 │
                 ▼
       DETERMINISTIC REGIME ENGINE (TREND_UP, TREND_DOWN, RANGE, VOLATILITY)
                 │
                 ▼
       STRATEGY ENGINE (XAU_TREND_PULLBACK, SESSION_BREAKOUT, MEAN_REVERSION)
                 │
                 ▼
       AI ANALYST & MULTI-AGENT VALIDATION (Structured JSON Schema Gating)
                 │
                 ▼
       SIGNAL FUSION ENGINE (Agreement, Conflict Resolution, Freshness)
                 │
                 ▼
╔════════════════════════════════════════════════════════════════════════╗
║                   DETERMINISTIC RISK ENGINE FIREWALL                   ║
║  1. Global Emergency Stop         8. Max Drawdown Ceiling              ║
║  2. Broker Gateway Heartbeat      9. Consecutive Loss Limit            ║
║  3. Signal Validity & Freshness  10. Max Spread Limit ($0.35)          ║
║  4. Signal Expiry Enforcement    11. Min Risk/Reward (1.5:1)           ║
║  5. Duplicate Signal Guard       12. Min/Max Stop Loss Distance        ║
║  6. Max Open Positions Limit     13. Session Restrictions              ║
║  7. Max Daily Loss Limit (3.0%)  14. High-Impact News Lockout          ║
╚════════════════════════════════════════════════════════════════════════╝
                 │
                 ▼
    EXECUTION GATEWAY (Order Validation & Sizing)
                 ├──> [PAPER MODE] -> High-Fidelity Paper Trading Engine
                 └──> [LIVE MODE]  -> MetaTrader 5 (order_send + Magic Number)
                 │
                 ▼
    AUDITABLE TRADE JOURNAL (SQLite Database)
    Lineage: TRADE -> ORDER -> RISK DECISION -> SIGNAL -> STRATEGY -> AI -> STATE
```

---

## Directory Structure

```
xauusd_ai_trader/
├── config/
│   ├── settings.py              # Pydantic Settings, environment configs, risk bounds
│   └── __init__.py
├── data/
│   ├── models.py                # Typed domain models (Candle, MarketState, Order, Trade)
│   ├── storage.py               # SQLite database engine, schemas, audit lineage
│   ├── feed.py                  # Real-time tick & multi-timeframe candle engine (M1-D1)
│   └── __init__.py
├── state/
│   ├── structure.py             # Swing Highs/Lows, Liquidity pools, Sessions (Asian, London, NY)
│   ├── regime.py                # Deterministic regime classifier (TREND_UP, RANGE, etc.)
│   ├── market_state.py          # Synthesizer of indicators (ATR, RSI, EMAs) and structure
│   └── __init__.py
├── strategy/
│   ├── base.py                  # Abstract BaseStrategy interface
│   ├── trend_pullback.py        # Expectancy strategy: Trend Pullback to EMA21/50
│   ├── session_breakout.py      # Session Breakout: London/NY Asian range expansion
│   ├── mean_reversion.py        # Liquidity Sweep & Range Reversion
│   └── __init__.py
├── ai/
│   ├── provider.py              # AI provider abstraction (Mock, OpenAI, Anthropic, OpenRouter)
│   ├── analyst.py               # Structured prompt, strict JSON schema validation, fallback
│   ├── agents/
│   │   ├── specialized_agents.py# TrendStructureAnalyst, VolatilityAnalyst, TradeReviewer
│   │   └── __init__.py
│   └── __init__.py
├── fusion/
│   ├── signal_fusion.py         # Deterministic fusion, conflict resolution, consensus score
│   └── __init__.py
├── risk/
│   ├── position_sizer.py        # Institutional lot sizing (100 oz contract, risk % of equity)
│   ├── risk_engine.py           # 14-point unbypassable deterministic risk firewall
│   └── __init__.py
├── execution/
│   ├── base.py                  # BaseExecutionAdapter interface
│   ├── order_validator.py       # Geometric SL/TP and traceability sanity validator
│   ├── paper_adapter.py         # Simulated fills, realistic slippage, SL/TP execution
│   ├── mt5_adapter.py           # Native MetaTrader 5 Python terminal adapter
│   └── __init__.py
├── backtest/
│   ├── engine.py                # Event-driven backtester (zero lookahead bias, spread, slippage)
│   └── __init__.py
├── performance/
│   ├── metrics.py               # Profit Factor, Expectancy, Max Drawdown, Session breakdown
│   ├── trade_journal.py         # Full end-to-end audit tracing
│   └── __init__.py
├── news/
│   ├── news_engine.py           # Economic events (CPI, FOMC, NFP) -> NORMAL, CAUTION, LOCKOUT
│   └── __init__.py
├── api/
│   ├── app.py                   # FastAPI REST API & static file serving
│   └── __init__.py
├── dashboard/
│   └── static/
│       └── index.html           # Professional dark-mode trading dashboard
├── tests/                       # 34 automated pytest tests
├── .env.example                 # Environment configuration template
├── pytest.ini                   # Pytest configuration
└── run.py                       # Unified CLI runner (serve, backtest, paper, status)
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.13 on Windows)
- Dependencies: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `httpx`, `pytest`, `MetaTrader5`

Install dependencies:
```bash
pip install fastapi uvicorn pydantic pydantic-settings httpx pytest MetaTrader5
```

### 2. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default mode is `TRADING_MODE=PAPER` with `AI__PROVIDER=mock`.

---

## How to Run

### Run the Dashboard & REST API Server
```bash
python run.py serve
```
Open your browser at:
`http://127.0.0.1:8000/`

The dashboard clearly identifies:
- **Operating Mode**: `PAPER MODE` vs `LIVE MODE`
- **Data Mode**: `PAPER FEED` vs `LIVE MT5`
- **AI Provider**: `DETERMINISTIC MOCK` vs `OPENAI / OPENROUTER`

### Run an Event-Driven Backtest
```bash
python run.py backtest --days 15
```
Simulates bar-by-bar execution without lookahead bias, applying realistic spreads, slippage, commissions, and session filters.

### Run the Real-Time Paper Trading Loop
```bash
python run.py paper
```

### Check System Status & Audit Summary via CLI
```bash
python run.py status
```

---

## MetaTrader 5 Live Connection

To connect to live or demo MetaTrader 5:
1. Open your MetaTrader 5 terminal.
2. In MT5: Tools -> Options -> Expert Advisors -> Ensure "Allow algorithmic trading" is checked.
3. Edit `.env`:
   ```ini
   TRADING_MODE=LIVE
   DATA_MODE=LIVE_MT5
   MT5__LOGIN=12345678
   MT5__PASSWORD=YourBrokerPassword
   MT5__SERVER=YourBroker-Demo
   MT5__SYMBOL=XAUUSD
   ```
4. Start the system:
   ```bash
   python run.py serve
   ```
   The `MT5ExecutionAdapter` automatically establishes session state, validates symbol specifications, injects magic numbers and traceability tags into order comments, and monitors open positions.

---

## Running the Automated Test Suite

Run all 34 automated unit, property, and integration tests:
```bash
python -m pytest -v
```
All tests pass with 100% test coverage over:
- Position Sizing calculations
- Risk Engine firewall rules (daily loss, drawdown, consecutive losses, spread, session lockout)
- Strategy generation and geometry
- Signal Fusion and conflict elimination
- AI schema validation and malformed response rejection
- MT5 offline stability & Paper fill simulation
- Backtest execution and quantitative metrics calculation
- End-to-end pipeline integration
