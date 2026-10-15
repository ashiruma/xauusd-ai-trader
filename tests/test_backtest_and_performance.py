"""
Tests for Backtesting Engine, Performance Calculations, and Trade Journal.
"""

from datetime import datetime, timezone, timedelta
import pytest

from data.models import TradeRecord, OrderSide, MarketRegimeType, SessionName, TimeFrame
from data.feed import MarketDataEngine
from backtest.engine import BacktestEngine
from performance.metrics import PerformanceEngine
from performance.trade_journal import TradeJournal


def test_performance_engine_metrics_calculation():
    now = datetime.now(timezone.utc)
    trades = [
        TradeRecord(
            trade_id="TRD_1",
            ticket=101,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            lots=1.0,
            entry_price=2650.0,
            exit_price=2660.0,
            pnl=1000.0,
            return_pct=1.0,
            commission=6.0,
            swap=0.0,
            entry_time=now,
            exit_time=now + timedelta(minutes=45),
            exit_reason="TP",
            holding_seconds=2700.0,
            market_regime=MarketRegimeType.TREND_UP,
            session=SessionName.LONDON
        ),
        TradeRecord(
            trade_id="TRD_2",
            ticket=102,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            lots=1.0,
            entry_price=2660.0,
            exit_price=2655.0,
            pnl=-500.0,
            return_pct=-0.5,
            commission=6.0,
            swap=0.0,
            entry_time=now + timedelta(hours=1),
            exit_time=now + timedelta(hours=1, minutes=30),
            exit_reason="SL",
            holding_seconds=1800.0,
            market_regime=MarketRegimeType.TREND_UP,
            session=SessionName.NEW_YORK
        )
    ]
    metrics = PerformanceEngine.compute_metrics(trades, initial_capital=100000.0)

    assert metrics["total_trades"] == 2
    assert metrics["winning_trades"] == 1
    assert metrics["losing_trades"] == 1
    assert metrics["win_rate_pct"] == 50.0
    assert metrics["net_profit"] == 500.0
    assert metrics["gross_profit"] == 1000.0
    assert metrics["gross_loss"] == 500.0
    assert metrics["profit_factor"] == 2.0
    assert metrics["expectancy_usd"] == 250.0
    assert metrics["avg_holding_time_minutes"] == 37.5


def test_backtest_engine_simulation_runs():
    sim_data = MarketDataEngine.generate_synthetic_data(num_days=10, base_price=2650.0)
    candles = sim_data.get_candles(TimeFrame.M15, 1000)

    engine = BacktestEngine(initial_balance=100000.0)
    results = engine.run(candles)

    assert "initial_balance" in results
    assert "final_balance" in results
    assert "total_trades" in results
    assert len(results["equity_curve"]) > 0


def test_trade_journal_lineage_retrieval():
    # Test lineage query on a recorded trade
    entries = TradeJournal.list_recent_journal_entries(limit=5)
    assert isinstance(entries, list)
