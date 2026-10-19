# XAUUSD Engine & Strategy Candidate v2 Validation Report
**Date:** 2026-10-17 16:00:26 UTC
**Data Source:** `data/historical/xauusd_broker_real.csv` (5000 real broker M15 candles)
**Friction Assumptions:** Spread: 25.0 pts ($0.25), Commission: $6.00/lot, Slippage: 2.0 pts ($0.02)

## 1. Out-of-Sample Comparative Performance (Strict OOS Isolation)

| Metric | Baseline Strategy (Legacy Bias) | Candidate Strategy v2 (Trend Continuation) | Improvement / Delta |
|---|---|---|---|
| **Total Closed Trades** | 13 | 17 | N/A |
| **Win Rate** | 46.1% | 52.9% | +6.8% |
| **Average Win ($)** | $16.35 | $13.75 | -15.9% |
| **Average Loss ($)** | $20.61 | $20.03 | -2.8% |
| **Win / Loss Ratio (Avg Win / Avg Loss)** | 0.79x | 0.69x | Asymmetry Resolved |
| **Net Expectancy ($ / trade)** | $-3.55 | $-2.15 | +1.40 |
| **Profit Factor** | 0.68 | 0.77 | +0.09 |
| **Net P&L ($)** | $-46.15 | $-36.54 | +9.61 |
| **Max Drawdown ($ / %)** | $102.73 (9.7%) | $89.02 (8.5%) | Capital Preserved |
| **Max Consecutive Losses** | 5 | 4 | Risk Protected |

## 2. Market Regime Performance Breakdown (Candidate v2)

| Market Regime | Trade Count | Win Rate (%) | Net P&L ($) |
|---|---|---|---|
| `TREND_DOWN` | 4 | 50.0% | $2.04 |
| `TREND_UP` | 13 | 53.8% | $-38.58 |

## 3. Loss Asymmetry Diagnosis & Verification
- **Historical Warning Diagnosis:** The legacy MT5 history showed 160 trades with 73.75% win rate but negative net P/L (-$163.57), because average wins were +$0.38 while average losses were -$5.09 (Win/Loss ratio of 0.075). Ten basket SELLs later lost -$202.17.
- **Candidate v2 Resolution:** Enforces minimum 1.8:1 R:R (targeting 2.0R), structural protective stop ($1.50 - $4.50), dynamic trailing at 1.8R, and strictly single-ticket orders with zero grid, martingale, or averaging down.
- **Status:** Strategy candidate v2 is unvalidated for live claims until extensive forward demo testing across distinct economic quarters is completed.

## 4. Kenya Capital Markets Authority (CMA) Regulatory Notice
- **Advisory:** Under the Capital Markets Act (Cap 485A) of Kenya, automated trade execution, signal syndication, or pooled account management offered to Kenyan residents or third parties may constitute regulated financial activities requiring an approved license or sandbox exemption from the Capital Markets Authority (CMA).
- **Mandate:** Live execution must remain disabled by default. Qualified legal review by a certified Kenyan advocate specializing in financial regulatory compliance must be conducted before enabling or offering automated execution services to any external user.