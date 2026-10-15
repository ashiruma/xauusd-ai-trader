"""
Quantitative Performance Engine for XAUUSD.
Computes institutional statistical metrics: Profit Factor, Expectancy, Max Drawdown,
Win Rate, and multi-dimensional breakdowns by Strategy, Session, and Market Regime.
"""

from collections import defaultdict
from typing import Dict, List, Any
import numpy as np
from data.models import TradeRecord


class PerformanceEngine:
    @staticmethod
    def compute_metrics(trades: List[TradeRecord], initial_capital: float = 100000.0) -> Dict[str, Any]:
        if not trades:
            return {
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "win_rate_pct": 0.0,
                "gross_profit": 0.0,
                "gross_loss": 0.0,
                "net_profit": 0.0,
                "profit_factor": 0.0,
                "expectancy_usd": 0.0,
                "average_win_usd": 0.0,
                "average_loss_usd": 0.0,
                "max_drawdown_usd": 0.0,
                "max_drawdown_pct": 0.0,
                "max_consecutive_losses": 0,
                "avg_holding_time_minutes": 0.0,
                "by_strategy": {},
                "by_session": {},
                "by_regime": {}
            }

        pnls = [t.pnl for t in trades]
        wins = [p for p in pnls if p > 0]
        losses = [p for p in pnls if p < 0]

        total_trades = len(trades)
        win_count = len(wins)
        loss_count = len(losses)
        win_rate = (win_count / total_trades) * 100.0 if total_trades > 0 else 0.0

        gross_profit = float(sum(wins))
        gross_loss = float(abs(sum(losses)))
        net_profit = float(sum(pnls))
        
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (99.0 if gross_profit > 0 else 0.0)
        avg_win = float(np.mean(wins)) if wins else 0.0
        avg_loss = float(abs(np.mean(losses))) if losses else 0.0
        expectancy = (net_profit / total_trades) if total_trades > 0 else 0.0

        # Maximum Drawdown calculation
        cumulative = np.cumsum(pnls)
        equity_curve = initial_capital + cumulative
        running_max = np.maximum.accumulate(equity_curve)
        drawdowns = running_max - equity_curve
        max_dd_usd = float(np.max(drawdowns)) if len(drawdowns) > 0 else 0.0
        max_dd_pct = float(np.max(drawdowns / running_max * 100.0)) if len(drawdowns) > 0 else 0.0

        # Max consecutive losses
        max_consec_losses = 0
        current_consec = 0
        for p in pnls:
            if p < 0:
                current_consec += 1
                max_consec_losses = max(max_consec_losses, current_consec)
            else:
                current_consec = 0

        # Holding times
        holding_mins = [t.holding_seconds / 60.0 for t in trades]
        avg_holding_time = float(np.mean(holding_mins)) if holding_mins else 0.0

        # Breakdowns
        by_strategy = defaultdict(lambda: {"trades": 0, "wins": 0, "pnl": 0.0})
        by_session = defaultdict(lambda: {"trades": 0, "wins": 0, "pnl": 0.0})
        by_regime = defaultdict(lambda: {"trades": 0, "wins": 0, "pnl": 0.0})

        for t in trades:
            strat = t.strategy_id or "UNKNOWN"
            sess = t.session.value if t.session else "UNKNOWN"
            reg = t.market_regime.value if t.market_regime else "UNKNOWN"

            by_strategy[strat]["trades"] += 1
            by_strategy[strat]["pnl"] += t.pnl
            if t.pnl > 0:
                by_strategy[strat]["wins"] += 1

            by_session[sess]["trades"] += 1
            by_session[sess]["pnl"] += t.pnl
            if t.pnl > 0:
                by_session[sess]["wins"] += 1

            by_regime[reg]["trades"] += 1
            by_regime[reg]["pnl"] += t.pnl
            if t.pnl > 0:
                by_regime[reg]["wins"] += 1

        def format_breakdown(d):
            out = {}
            for k, v in d.items():
                wr = (v["wins"] / v["trades"] * 100.0) if v["trades"] > 0 else 0.0
                out[k] = {
                    "trades": v["trades"],
                    "win_rate_pct": round(wr, 1),
                    "net_pnl": round(v["pnl"], 2)
                }
            return out

        return {
            "total_trades": total_trades,
            "winning_trades": win_count,
            "losing_trades": loss_count,
            "win_rate_pct": round(win_rate, 2),
            "gross_profit": round(gross_profit, 2),
            "gross_loss": round(gross_loss, 2),
            "net_profit": round(net_profit, 2),
            "profit_factor": round(profit_factor, 2),
            "expectancy_usd": round(expectancy, 2),
            "average_win_usd": round(avg_win, 2),
            "average_loss_usd": round(avg_loss, 2),
            "max_drawdown_usd": round(max_dd_usd, 2),
            "max_drawdown_pct": round(max_dd_pct, 2),
            "max_consecutive_losses": max_consec_losses,
            "avg_holding_time_minutes": round(avg_holding_time, 1),
            "by_strategy": format_breakdown(by_strategy),
            "by_session": format_breakdown(by_session),
            "by_regime": format_breakdown(by_regime)
        }
