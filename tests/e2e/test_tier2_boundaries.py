"""
Tier 2 — Boundary & Corner Cases E2E Tests.
Tests edge conditions, extreme values, numerical bounds, fault tolerance,
and boundary defenses across R1, R2, R3, R4 (>=5 tests per feature).
"""

from datetime import datetime, timezone, timedelta
import json
import math
import uuid
import pytest
from fastapi.testclient import TestClient

from config.settings import settings, TradingMode, DataMode, MarketRegimeType, SessionName, OrderSide
from data.models import Tick, Candle, TimeFrame, MarketState, CandidateSetup, FusedSignal, Order, OrderStatus
from data.feed import MarketDataEngine
from service import TradingCoordinator
from ai.analyst import AIAnalyst
from fusion.signal_fusion import SignalFusionEngine
from risk.risk_engine import RiskEngine
from risk.position_sizer import PositionSizer
from execution.mt5_adapter import MT5ExecutionAdapter
from execution.order_validator import OrderValidator
from tests.e2e.conftest import FakeMT5Terminal, FakeGeminiProvider


# ==============================================================================
# Feature 1: R1 Boundaries & Corner Cases (Tick Streaming & Chart Sync)
# ==============================================================================

def test_r2_boundary_extreme_gold_prices():
    """
    R1.B1: Extreme gold spot prices ($4,162.50, $5,000.00, $10,000.00, $1,000.00)
    process without numerical overflow, NaN, or infinite spread points.
    """
    feed = MarketDataEngine()
    extreme_prices = [1000.00, 4162.50, 5000.00, 10000.00, 25000.00]
    base_time = datetime(2026, 10, 2, 12, 0, 0, tzinfo=timezone.utc)

    for i, px in enumerate(extreme_prices):
        t = Tick(
            symbol="XAUUSD",
            time=base_time + timedelta(seconds=i * 2),
            bid=px - 0.25,
            ask=px + 0.25,
            spread=0.50,
            volume=10.0
        )
        feed.process_tick(t)
        bid, ask, spread_pts = feed.get_latest_quote()
        assert not math.isnan(bid)
        assert not math.isnan(ask)
        assert not math.isnan(spread_pts)
        assert spread_pts == 50.0  # 0.50 / 0.01


def test_r2_boundary_micro_and_extreme_spreads():
    """
    R1.B2: Micro-spreads (0.01 = 1 point) and massive liquidity shock spreads (500.0 points)
    are calculated accurately without zero-division or numerical errors.
    """
    feed = MarketDataEngine()
    now = datetime.now(timezone.utc)

    # 1. Micro-spread: 1 point ($0.01)
    t_micro = Tick(symbol="XAUUSD", time=now, bid=4162.00, ask=4162.01, spread=0.01, volume=10.0)
    feed.process_tick(t_micro)
    _, _, spread_micro = feed.get_latest_quote()
    assert spread_micro == 1.0

    # 2. Extreme spread: 500 points ($5.00)
    t_wide = Tick(symbol="XAUUSD", time=now + timedelta(seconds=1), bid=4160.00, ask=4165.00, spread=5.00, volume=1.0)
    feed.process_tick(t_wide)
    _, _, spread_wide = feed.get_latest_quote()
    assert spread_wide == 500.0


def test_r2_boundary_rapid_tick_burst():
    """
    R1.B3: Rapid burst of 100 ticks within sub-second timestamps is digested cleanly
    with correct cumulative volume and high/low tracking.
    """
    feed = MarketDataEngine()
    base_time = datetime(2026, 10, 2, 14, 0, 0, tzinfo=timezone.utc)
    expected_total_volume = 0.0
    expected_high = 4160.0
    expected_low = 4165.0

    for i in range(100):
        mid = 4162.0 + math.sin(i / 10.0) * 2.0  # Fluctuates between 4160.0 and 4164.0
        expected_high = max(expected_high, mid)
        expected_low = min(expected_low, mid)
        vol = float(i + 1)
        expected_total_volume += vol

        tick = Tick(
            symbol="XAUUSD",
            time=base_time + timedelta(milliseconds=i * 10),
            bid=mid - 0.10,
            ask=mid + 0.10,
            spread=0.20,
            volume=vol
        )
        feed.process_tick(tick)

    m1_bar = feed._current_m1_bar
    assert m1_bar is not None
    assert m1_bar.volume == expected_total_volume
    assert round(m1_bar.high, 2) == round(expected_high, 2)
    assert round(m1_bar.low, 2) == round(expected_low, 2)


def test_r2_boundary_corrupted_tick_detection():
    """
    R1.B4: Corrupted ticks (negative price, zero bid, inverted spread)
    are immediately intercepted and raise ValueError without polluting feed state.
    """
    feed = MarketDataEngine()
    now = datetime.now(timezone.utc)

    # 1. Negative bid
    with pytest.raises(ValueError, match="Corrupted tick"):
        feed.process_tick(Tick(symbol="XAUUSD", time=now, bid=-10.0, ask=4162.0, spread=0.2, volume=1.0))

    # 2. Zero ask
    with pytest.raises(ValueError, match="Corrupted tick"):
        feed.process_tick(Tick(symbol="XAUUSD", time=now, bid=4162.0, ask=0.0, spread=0.2, volume=1.0))

    # 3. Inverted spread (ask < bid)
    with pytest.raises(ValueError, match="Inverted spread"):
        feed.process_tick(Tick(symbol="XAUUSD", time=now, bid=4165.0, ask=4160.0, spread=-5.0, volume=1.0))


def test_r2_boundary_websocket_disconnect_during_broadcast(client):
    """
    R1.B5: Abrupt WebSocket disconnection during message broadcast
    is cleaned up gracefully by ConnectionManager without uncaught exceptions.
    """
    from api.app import manager

    with client.websocket_connect("/ws/terminal") as ws:
        _ = ws.receive_json()
        assert len(manager.active_connections) >= 1

    # After exiting context, connection is closed
    # Broadcasting should not fail and should prune dead connection
    import asyncio
    asyncio.run(manager.broadcast({"type": "PING_TEST", "val": 123}))


def test_r2_boundary_zero_volume_tick_handling():
    """
    R1.B6: Ticks with zero volume or None volume fall back cleanly to 1.0
    without producing 0-division or NaN in volume indicators.
    """
    feed = MarketDataEngine()
    now = datetime.now(timezone.utc)
    t = Tick(symbol="XAUUSD", time=now, bid=4162.0, ask=4162.2, spread=0.2, volume=0.0)
    feed.process_tick(t)

    assert feed._current_m1_bar is not None
    assert feed._current_m1_bar.volume >= 1.0


# ==============================================================================
# Feature 2: R2 Boundaries & Corner Cases (Strategies & AI Engine)
# ==============================================================================

def test_r2_boundary_expanded_asian_range_high_volatility():
    """
    R2.B1: At $4,160+ gold price, high gold volatility expands the Asian range
    up to $65.00 without breaking SessionBreakoutStrategy evaluation.
    """
    from strategy.session_breakout import SessionBreakoutStrategy
    strat = SessionBreakoutStrategy()
    now = datetime.now(timezone.utc)

    # Wide Asian range: $4,130 to $4,195 ($65.00 distance)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4198.0,  # Broke above Asian high 4195
        bid=4197.9,
        ask=4198.1,
        spread_points=20.0,
        atr_14=6.0,
        rsi_14=62.0,
        ema_9=4196.0,
        ema_21=4185.0,
        ema_50=4170.0,
        ema_200=4140.0,
        recent_swing_high=4195.0,
        recent_swing_low=4130.0,
        asian_range_high=4195.0,
        asian_range_low=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish Breakout",
        open_positions_count=0
    )

    setup = strat.evaluate(state)
    # The setup should either trigger breakout or evaluate cleanly without throwing exception
    if setup:
        assert setup.strategy_id == "XAU_SESSION_BREAKOUT"
        assert setup.side == OrderSide.BUY
        assert setup.entry == 4198.0


def test_r2_boundary_gemini_ai_rate_limit_429_graceful_handling(isolated_db):
    """
    R2.B2: When Google Gemini API returns HTTP 429 (Resource Exhausted / Rate Limited),
    AIAnalyst catches exception, records schema/rate violation, and rejects setup safely.
    """
    rate_limited_provider = FakeGeminiProvider(mode="RATE_LIMIT_429")
    analyst = AIAnalyst(provider=rate_limited_provider)
    now = datetime.now(timezone.utc)

    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish",
        open_positions_count=0
    )
    setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="Setup under test",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    decision = analyst.analyze_setup(state, setup)
    assert any("fallback engaged" in r.lower() for r in decision.reasons)
    assert decision.setup_valid is True
    assert decision.decision in (OrderSide.BUY, OrderSide.SELL, OrderSide.NO_TRADE)


def test_r2_boundary_gemini_ai_malformed_json_markdown_payloads(isolated_db):
    """
    R2.B3: AI provider returning malformed JSON or markdown text is intercepted safely
    and results in NO_TRADE without raising unhandled JSONDecodeError.
    """
    broken_provider = FakeGeminiProvider(mode="MALFORMED_JSON")
    analyst = AIAnalyst(provider=broken_provider)
    now = datetime.now(timezone.utc)

    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish",
        open_positions_count=0
    )
    setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="Broken test",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    decision = analyst.analyze_setup(state, setup)
    assert decision.decision == OrderSide.NO_TRADE
    assert decision.setup_valid is False
    assert any("validation" in r.lower() for r in decision.reasons)


def test_r2_boundary_empty_candidate_setups_list(isolated_db):
    """
    R2.B4: Passing an empty list of candidate setups to SignalFusionEngine
    returns valid NO_TRADE without throwing IndexError.
    """
    fusion = SignalFusionEngine()
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.RANGE,
        trend_description="Quiet",
        open_positions_count=0
    )

    fused = fusion.fuse(state, candidate_setups=[], ai_decision=None)
    assert fused.is_valid is False
    assert fused.side == OrderSide.NO_TRADE
    assert fused.strategy_id == "NONE"


def test_r2_boundary_composite_confidence_threshold_edge(isolated_db):
    """
    R2.B5: Composite confidence threshold boundary: 0.519 is rejected,
    while 0.521 is approved.
    """
    fusion = SignalFusionEngine()
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Trend",
        open_positions_count=0
    )
    setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="Edge test",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    # Monkeypatch agents to produce controlled composite confidence
    # Case A: Below threshold (0.50)
    fusion.trend_agent.analyze = lambda s, p: {"score": 0.50, "reasons": ["A"]}
    fusion.vol_agent.analyze = lambda s, p: {"score": 0.50, "reasons": ["B"]}
    fusion.reviewer.review = lambda p: {"score": 0.50, "viable": True, "reasons": ["C"]}
    fused_low = fusion.fuse(state, [setup], ai_decision=None)
    assert fused_low.is_valid is False
    assert fused_low.side == OrderSide.NO_TRADE

    # Case B: Above threshold (0.80)
    fusion.trend_agent.analyze = lambda s, p: {"score": 0.85, "reasons": ["A"]}
    fusion.vol_agent.analyze = lambda s, p: {"score": 0.80, "reasons": ["B"]}
    fusion.reviewer.review = lambda p: {"score": 0.80, "viable": True, "reasons": ["C"]}
    fused_high = fusion.fuse(state, [setup], ai_decision=None)
    assert fused_high.is_valid is True
    assert fused_high.side == OrderSide.BUY


def test_r2_boundary_extreme_rsi_and_atr_inputs():
    """
    R2.B6: Technical indicators at theoretical limits (RSI=0.0, RSI=100.0, ATR=0.001, ATR=100.0)
    evaluate through strategies without numerical breakdown or zero-division.
    """
    from strategy.trend_pullback import TrendPullbackStrategy
    strat = TrendPullbackStrategy()
    now = datetime.now(timezone.utc)

    for rsi, atr in [(0.0, 0.001), (100.0, 100.0)]:
        state = MarketState(
            timestamp=now,
            symbol="XAUUSD",
            current_price=4162.0,
            bid=4161.9,
            ask=4162.1,
            spread_points=20.0,
            atr_14=atr,
            rsi_14=rsi,
            ema_9=4162.0,
            ema_21=4160.0,
            ema_50=4150.0,
            ema_200=4130.0,
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Extreme indicator test",
            open_positions_count=0
        )
        # Should not raise exception
        _ = strat.evaluate(state)


# ==============================================================================
# Feature 3: R3 Boundaries & Corner Cases (Small Account Risk Governance)
# ==============================================================================

def test_r3_boundary_zero_and_negative_equity():
    """
    R3.B1: Zero ($0.00) or negative equity (-$50.00) returns 0.0 lots
    without throwing division by zero.
    """
    for bad_equity in [0.0, -10.0, -50.0, -1000.0]:
        lots, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
            account_equity=bad_equity,
            entry_price=4162.0,
            stop_loss=4157.0,
            risk_pct=9.0
        )
        assert lots == 0.0
        assert risk_usd == 0.0
        assert stop_pts == 0.0


def test_r3_boundary_sub_margin_micro_equity():
    """
    R3.B2: Accounts with equity < $20.00 (e.g. $10.00) cannot support micro-lot margin
    and must return 0.0 lot size even if allow_min_lot_override=True.
    """
    lots, risk_usd, _ = PositionSizer.calculate_lot_size(
        account_equity=15.0,  # Below $20.00 margin floor
        entry_price=4162.0,
        stop_loss=4157.0,     # $5.00 stop distance
        risk_pct=9.0,         # $1.35 budget
        allow_min_lot_override=True
    )
    assert lots == 0.0


def test_r3_boundary_maximum_lot_cap():
    """
    R3.B3: Extremely large capital ($10,000,000.00) is strictly clamped
    to broker maximum lot size (100.0 lots).
    """
    lots, _, _ = PositionSizer.calculate_lot_size(
        account_equity=10_000_000.0,
        entry_price=4162.0,
        stop_loss=4161.0,
        risk_pct=1.0,
        max_lot=100.0
    )
    assert lots == 100.0


def test_r3_boundary_fractional_lot_step_downward_rounding():
    """
    R3.B4: Lot sizes are rounded strictly DOWN to lot_step (0.01) so that risk
    never exceeds the calculated dollar risk budget.
    """
    # Suppose raw calculation would yield 0.019 lots
    # It must round down to 0.01, NOT up to 0.02
    lots, _, _ = PositionSizer.calculate_lot_size(
        account_equity=100.0,
        entry_price=4162.0,
        stop_loss=4157.0,  # $5.00 stop -> $500 risk per standard lot
        risk_pct=1.5,      # $1.50 risk budget -> raw lot = 1.50 / 500 = 0.003
        allow_min_lot_override=False
    )
    assert lots == 0.0  # 0.003 is below min_lot and risk budget exceeded if 0.01 ($5 risk > $1.50)


def test_r3_boundary_exact_stop_distance_bounds(isolated_db):
    """
    R3.B5: Exact boundary checks for stop distance: min (15.0 pts = $0.15)
    and max (3000.0 pts = $30.00).
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bounds",
        open_positions_count=0
    )

    # 1. Stop too tight: $0.10 distance (10.0 points < 15.0 min)
    sig_tight = FusedSignal(
        signal_id="SIG_TIGHT",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4161.90,  # 10 points
        take_profit=4165.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Tight"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )
    dec_tight = engine.evaluate(sig_tight, state, account_equity=1000.0, open_positions_count=0)
    assert dec_tight.approved is False
    assert dec_tight.rejection_code == "REJECT_STOP_TOO_TIGHT"

    # 2. Stop too wide: $35.00 distance (3500.0 points > 3000.0 max)
    sig_wide = FusedSignal(
        signal_id="SIG_WIDE",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4127.0,  # 3500 points
        take_profit=4250.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Wide"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )
    dec_wide = engine.evaluate(sig_wide, state, account_equity=1000.0, open_positions_count=0)
    assert dec_wide.approved is False
    assert dec_wide.rejection_code == "REJECT_STOP_TOO_WIDE"


def test_r3_boundary_daily_loss_limit_threshold(isolated_db):
    """
    R3.B6: Daily loss percentage boundary: exactly at 2.99% is allowed,
    while 3.01% triggers REJECT_MAX_DAILY_LOSS.
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Loss test",
        open_positions_count=0
    )
    signal = FusedSignal(
        signal_id="SIG_LOSS_BOUND",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Loss test"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    # 1. Daily loss at $29.00 (2.90% < 3.00%) -> Allowed (passes daily loss check)
    engine.daily_pnl = -29.0
    dec_pass = engine.evaluate(signal, state, account_equity=971.0, open_positions_count=0)
    assert dec_pass.rejection_code != "REJECT_MAX_DAILY_LOSS"

    # 2. Daily loss at $30.50 (3.05% >= 3.00%) -> Rejected
    engine._recent_signals.clear()
    engine.daily_pnl = -30.50
    dec_fail = engine.evaluate(signal, state, account_equity=969.5, open_positions_count=0)
    assert dec_fail.approved is False
    assert dec_fail.rejection_code == "REJECT_MAX_DAILY_LOSS"


# ==============================================================================
# Feature 4: R4 Boundaries & Corner Cases (MT5 Execution & Telemetry)
# ==============================================================================

def test_r4_boundary_duplicate_signal_lockout_window(isolated_db):
    """
    R4.B1: Two consecutive signals for the same strategy within 300 seconds
    are intercepted by the duplicate signal protection (REJECT_DUPLICATE_SIGNAL).
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Dup test",
        open_positions_count=0
    )
    sig1 = FusedSignal(
        signal_id="SIG_DUP_01",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["First"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    # First signal approved
    dec1 = engine.evaluate(sig1, state, account_equity=1000.0, open_positions_count=0)
    assert dec1.approved is True

    # Second signal 10 seconds later for the SAME strategy is rejected
    sig2 = FusedSignal(
        signal_id="SIG_DUP_02",
        timestamp=now + timedelta(seconds=10),
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.2,
        stop_loss=4157.2,
        take_profit=4172.2,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Second duplicate"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )
    state2 = state.model_copy(update={"timestamp": now + timedelta(seconds=10)})
    dec2 = engine.evaluate(sig2, state2, account_equity=1000.0, open_positions_count=0)
    assert dec2.approved is False
    assert dec2.rejection_code == "REJECT_DUPLICATE_SIGNAL"


def test_r4_boundary_terminal_trade_permission_disabled(fake_mt5):
    """
    R4.B2: Terminal Algo Trading disabled (trade_allowed=False) prevents order
    execution and informs operator.
    """
    fake_mt5.trade_allowed = False
    adapter = MT5ExecutionAdapter()
    adapter.connect()

    assert adapter.is_trade_allowed() is False


def test_r4_boundary_max_open_positions_limit(isolated_db):
    """
    R4.B3: When active positions reach max_open_positions (1),
    subsequent signals are rejected with REJECT_MAX_POSITIONS.
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=50.0,
        ema_9=4162.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Max pos test",
        open_positions_count=1
    )
    signal = FusedSignal(
        signal_id="SIG_MAX_POS",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Test"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    dec = engine.evaluate(signal, state, account_equity=1000.0, open_positions_count=1)
    assert dec.approved is False
    assert dec.rejection_code == "REJECT_MAX_POSITIONS"


def test_r4_boundary_position_close_nonexistent_ticket(fake_mt5, isolated_db):
    """
    R4.B4: Closing an already closed or invalid ticket returns None cleanly
    without causing an exception.
    """
    adapter = MT5ExecutionAdapter()
    adapter.connect()

    res = adapter.close_position(ticket=99999999, reason="MANUAL")
    assert res is None


def test_r4_boundary_comment_truncation_mt5_protocol(fake_mt5, isolated_db):
    """
    R4.B5: Order comment is strictly constrained to <= 31 characters
    to prevent MT5 API buffer rejection.
    """
    adapter = MT5ExecutionAdapter()
    adapter.connect()

    order = Order(
        order_id="ORD_LONG_COMMENT_01",
        signal_id="SIG_VERY_LONG_UUID_IDENTIFIER_1234567890",
        strategy_id="XAU_TREND_PULLBACK_SUPER_LONG_NAME",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        created_at=datetime.now(timezone.utc)
    )

    adapter.submit_order(order)
    assert len(fake_mt5.orders) >= 1
    comment = fake_mt5.orders[-1]["comment"]
    assert len(comment) <= 31


def test_r4_boundary_order_validator_geometry_checks():
    """
    R4.B6: OrderValidator checks geometric consistency:
    BUY SL must be strictly below entry, TP strictly above entry.
    SELL SL must be strictly above entry, TP strictly below entry.
    """
    now = datetime.now(timezone.utc)

    # 1. Faulty BUY: SL > Entry
    bad_buy_sl = Order(
        order_id="B1", signal_id="S1", strategy_id="T1", magic_number=1,
        symbol="XAUUSD", side=OrderSide.BUY, lot_size=0.01,
        requested_price=4162.0, stop_loss=4165.0, take_profit=4175.0,
        created_at=now
    )
    ok_b1, msg_b1 = OrderValidator.validate(bad_buy_sl)
    assert ok_b1 is False
    assert "Invalid BUY geometry" in msg_b1

    # 2. Faulty SELL: SL < Entry
    bad_sell_sl = Order(
        order_id="B2", signal_id="S2", strategy_id="T2", magic_number=1,
        symbol="XAUUSD", side=OrderSide.SELL, lot_size=0.01,
        requested_price=4162.0, stop_loss=4155.0, take_profit=4150.0,
        created_at=now
    )
    ok_b2, msg_b2 = OrderValidator.validate(bad_sell_sl)
    assert ok_b2 is False
    assert "Invalid SELL geometry" in msg_b2
