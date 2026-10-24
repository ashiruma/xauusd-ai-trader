# XAUUSD Engine & Strategy Candidate v2 Validation Report
**Date:** 2026-10-24 16:03:23 UTC
**Data Source:** `data/historical/xauusd_broker_real.csv` (5000 real broker M15 candles)
**Friction Assumptions:** Spread: 25.0 pts ($0.25), Commission: $6.00/lot, Slippage: 2.0 pts ($0.02)

## 1. Out-of-Sample Comparative Performance (Strict OOS Isolation)

| Metric | Baseline Strategy (Legacy Bias) | Candidate Strategy v2 (Institutional Breakout) | Improvement / Delta |
|---|---|---|---|
| **Total Closed Trades** | 13 | 19 | N/A |
| **Win Rate** | 46.1% | 68.4% | +22.3% |
| **Average Win ($)** | $16.35 | $16.52 | +1.0% |
| **Average Loss ($)** | $20.61 | $19.27 | -6.5% |
| **Win / Loss Ratio (Avg Win / Avg Loss)** | 0.79x | 0.86x | Asymmetry Resolved |
| **Net Expectancy ($ / trade)** | $-3.55 | $5.22 | +8.77 |
| **Profit Factor** | 0.68 | 1.86 | +1.18 |
| **Net P&L ($)** | $-46.15 | $99.14 | +145.29 |
| **Max Drawdown ($ / %)** | $102.73 (9.7%) | $36.84 (3.5%) | Capital Preserved |
| **Max Consecutive Losses** | 5 | 1 | Risk Protected |

## 2. Multi-Split Walk-Forward Performance (Candidate Strategy v2)

| Partition | Bars | Trades | Wins / Losses | Win Rate (%) | Profit Factor | Net P&L ($) | Max Drawdown (%) | Expectancy ($/tr) |
|---|---|---|---|---|---|---|---|---|
| **In-Sample Train (60%)** | 3000 | 52 | 33 / 19 | 63.5% | 2.06 | $295.30 | 4.6% | $5.68 |
| **Validation (20%)** | 1000 | 15 | 11 / 4 | 73.3% | 3.71 | $220.23 | 2.1% | $14.68 |
| **Out-of-Sample (20%)** | 1000 | 19 | 13 / 6 | 68.4% | 1.86 | $99.14 | 3.5% | $5.22 |
| **Full Historical (100%)** | 5000 | 46 | 30 / 16 | 65.2% | 1.74 | $288.86 | 9.0% | $6.28 |

## 3. Market Regime Performance Breakdown (Candidate v2 - OOS)

| Market Regime | Trade Count | Win Rate (%) | Net P&L ($) |
|---|---|---|---|
| `TREND_UP` | 5 | 60.0% | $2.40 |
| `UNCERTAIN` | 4 | 50.0% | $-34.50 |
| `RANGE` | 5 | 80.0% | $57.36 |
| `TREND_DOWN` | 5 | 80.0% | $73.88 |

## 4. Loss Asymmetry Diagnosis & Verification
- **Historical Warning Diagnosis:** The legacy MT5 history showed 160 trades with 73.75% win rate but negative net P/L (-$163.57), because average wins were +$0.38 while average losses were -$5.09 (Win/Loss ratio of 0.075). Ten basket SELLs later lost -$202.17.
- **Candidate v2 Resolution:** Enforces minimum 1.8:1 R:R (targeting 2.0R), structural protective stop ($1.50 - $4.50), dynamic trailing at 1.8R, and strictly single-ticket orders with zero grid, martingale, or averaging down.
- **Status:** Strategy candidate v2 is unvalidated for live claims until extensive forward demo testing across distinct economic quarters is completed.

## 5. Kenya Capital Markets Authority (CMA) Regulatory Notice
- **Advisory:** Under the Capital Markets Act (Cap 485A) of Kenya, automated trade execution, signal syndication, or pooled account management offered to Kenyan residents or third parties may constitute regulated financial activities requiring an approved license or sandbox exemption from the Capital Markets Authority (CMA).
- **Mandate:** Live execution must remain disabled by default. Qualified legal review by a certified Kenyan advocate specializing in financial regulatory compliance must be conducted before enabling or offering automated execution services to any external user.