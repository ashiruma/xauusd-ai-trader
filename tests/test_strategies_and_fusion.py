"""
Tests for Strategies and Signal Fusion Engine.
"""

from datetime import datetime, timezone, timedelta
import pytest

from config.settings import MarketRegimeType, SessionName, OrderSide
from data.models import MarketState, CandidateSetup
from strategy.trend_pullback import TrendPullbackStrategy
from strategy.session_breakout import SessionBreakoutStrategy
from strategy.mean_reversion import MeanReversionStrategy
from fusion.signal_fusion import SignalFusionEngine


@pytest.fixture
def bullish_state():
    return MarketState(
        timestamp=datetime.now(timezone.utc),
        symbol="XAUUSD",
        current_price=2650.0,
        bid=2649.9,
        ask=2650.1,
        spread_points=20.0,
        atr_14=2.0,
        rsi_14=48.0,
        ema_9=2651.0,
        ema_21=2649.5,
        ema_50=2647.0,
        ema_200=2635.0,
        recent_swing_high=2660.0,
        recent_swing_low=2642.0,
        asian_range_high=2648.0,
        asian_range_low=2640.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish trend",
        open_positions_count=0
    )


def test_trend_pullback_evaluates_bullish_setup(bullish_state):
    strategy = TrendPullbackStrategy()
    setup = strategy.evaluate(bullish_state)
    assert setup is not None
    assert setup.side == OrderSide.BUY
    assert setup.entry == 2650.0
    assert setup.stop_loss < setup.entry
    assert setup.take_profit > setup.entry
    assert setup.risk_reward >= 1.5


def test_session_breakout_evaluates_breakout(bullish_state):
    # Asian range high is 2648, price is 2650.0
    strategy = SessionBreakoutStrategy()
    setup = strategy.evaluate(bullish_state)
    assert setup is not None
    assert setup.side == OrderSide.BUY
    assert setup.stop_loss < setup.entry


def test_mean_reversion_evaluates_range():
    range_state = MarketState(
        timestamp=datetime.now(timezone.utc),
        symbol="XAUUSD",
        current_price=2640.2,
        bid=2640.1,
        ask=2640.3,
        spread_points=20.0,
        atr_14=1.5,
        rsi_14=28.0,  # oversold
        ema_9=2642.0,
        ema_21=2642.1,
        ema_50=2642.0,
        ema_200=2642.0,
        recent_swing_high=2650.0,
        recent_swing_low=2640.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.RANGE,
        trend_description="Range market",
        open_positions_count=0
    )
    strategy = MeanReversionStrategy()
    setup = strategy.evaluate(range_state)
    assert setup is not None
    assert setup.side == OrderSide.BUY
    assert setup.entry == 2640.2


def test_signal_fusion_conflict_rejection(bullish_state):
    now = datetime.now(timezone.utc)
    setups = [
        CandidateSetup(
            strategy_id="STRAT_1",
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=2650.0,
            stop_loss=2645.0,
            take_profit=2660.0,
            risk_reward=2.0,
            reason="Long signal",
            timestamp=now,
            expiry=now + timedelta(hours=1)
        ),
        CandidateSetup(
            strategy_id="STRAT_2",
            symbol="XAUUSD",
            side=OrderSide.SELL,
            entry=2650.0,
            stop_loss=2655.0,
            take_profit=2640.0,
            risk_reward=2.0,
            reason="Short signal",
            timestamp=now,
            expiry=now + timedelta(hours=1)
        )
    ]
    fusion = SignalFusionEngine()
    fused = fusion.fuse(bullish_state, setups, ai_decision=None)
    assert fused.is_valid is False
    assert fused.side == OrderSide.NO_TRADE
    assert fused.strategy_id == "CONFLICT"


def test_liquidity_sweep_evaluates_bullish_sweep(bullish_state):
    from strategy.liquidity_sweep import LiquiditySweepStrategy
    # Set price sweeping slightly below PDL (2640.0) with RSI low
    sweep_state = MarketState(
        timestamp=datetime.now(timezone.utc),
        symbol="XAUUSD",
        current_price=2640.2,
        bid=2640.1,
        ask=2640.3,
        spread_points=20.0,
        atr_14=2.0,
        rsi_14=34.0,
        ema_9=2645.0,
        ema_21=2646.0,
        ema_50=2648.0,
        ema_200=2630.0,
        recent_swing_high=2660.0,
        recent_swing_low=2640.0,
        previous_day_low=2640.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish trend with pullback",
        open_positions_count=0
    )
    strategy = LiquiditySweepStrategy()
    setup = strategy.evaluate(sweep_state)
    assert setup is not None
    assert setup.side == OrderSide.BUY
    assert setup.entry == 2640.2
    assert setup.stop_loss < setup.entry
    assert setup.risk_reward >= 1.5


def test_regime_classification_allows_healthy_pullback():
    from state.regime import MarketRegimeEngine
    # Price pulls back towards EMA50, RSI at 42.0 (below 50, but structure is intact)
    regime, desc = MarketRegimeEngine.classify_regime(
        current_price=2648.0,
        ema_9=2649.0,
        ema_21=2652.0,
        ema_50=2645.0,
        ema_200=2630.0,
        atr_14=2.0,
        historical_atr_mean=2.0,
        rsi_14=42.0,
        is_news_active=False
    )
    assert regime == MarketRegimeType.TREND_UP
    assert "Bullish trend confirmed" in desc

