"""
End-to-End Integration Test for XAUUSD Trading System.
Exercises full pipeline:
Market Data Ingestion -> Market State -> Strategy Evaluation ->
AI Analyst Decision Support -> Signal Fusion -> Deterministic Risk Firewall ->
Execution -> Journaling.
"""

from datetime import datetime, timezone
import pytest

from config.settings import settings, TradingMode, DataMode, OrderSide
from data.models import Tick, TimeFrame
from data.feed import MarketDataEngine
from service import TradingCoordinator
from data.storage import db


def test_full_pipeline_step_execution():
    coordinator = TradingCoordinator()
    
    # Generate market history for data engine
    synthetic_engine = MarketDataEngine.generate_synthetic_data(num_days=10, base_price=2650.0)
    m15_candles = synthetic_engine.get_candles(TimeFrame.M15, 200)
    coordinator.feed.load_historical_candles(TimeFrame.M15, m15_candles)

    # Ingest a live tick
    now = datetime.now(timezone.utc)
    tick = Tick(
        symbol="XAUUSD",
        time=now,
        bid=2650.00,
        ask=2650.25,
        spread=0.25,
        volume=50.0
    )

    output = coordinator.step(tick)

    assert "market_state" in output
    assert output["market_state"]["symbol"] == "XAUUSD"
    assert "candidate_setups" in output
    assert "fused_signal" in output
    assert "open_positions" in output

    # Check system status
    status = coordinator.get_system_status()
    assert status["app_name"] == "XAUUSD Quantitative Trading System"
    assert status["trading_mode"] in ("PAPER", "LIVE", "BACKTEST")
    assert status["broker_connected"] is True
