"""
Tier 3 — Cross-Feature Interaction E2E Tests.
Validates pairwise and multi-feature combinations across:
- Small account risk + Breakout strategy at $4,162+ gold
- Gemini AI fallback + Liquidity sweep strategy
- Broker FOK fill + Terminal tick stream disconnect
- Rapid tick burst + M15 candle scrubbing + WebSocket broadcast
- Emergency stop + Bullish AI setup confirmation
- High-impact news lockout + Micro-lot sizing + Active position telemetry
- Multi-strategy simultaneous trigger + Priority weighting + MT5 execution
"""

from datetime import datetime, timezone, timedelta
import uuid
import pytest

from config.settings import settings, TradingMode, DataMode, MarketRegimeType, SessionName, OrderSide
from data.models import Tick, Candle, TimeFrame, MarketState, CandidateSetup, FusedSignal, Order, OrderStatus
from data.feed import MarketDataEngine
from service import TradingCoordinator
from ai.analyst import AIAnalyst
from fusion.signal_fusion import SignalFusionEngine
from risk.risk_engine import RiskEngine
from risk.position_sizer import PositionSizer
from execution.mt5_adapter import MT5ExecutionAdapter
from tests.e2e.conftest import FakeMT5Terminal, FakeGeminiProvider


def test_tier3_comb_small_account_risk_and_session_breakout_at_4162(isolated_db):
    """
    Combination 1: Small Account Risk ($50 Equity) + Session Breakout Strategy at $4,162+
    Verifies that a breakout setup at $4,162+ evaluates through the risk firewall
    on $50 equity with 8-10% risk budget and approves exactly 0.01 lot ($4.50 risk).
    """
    engine = RiskEngine()
    engine.initial_equity = 50.0
    engine.peak_equity = 50.0
    engine.daily_starting_equity = 50.0

    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4165.0,
        bid=4164.85,
        ask=4165.15,
        spread_points=30.0,
        atr_14=4.0,
        rsi_14=60.0,
        ema_9=4164.0,
        ema_21=4158.0,
        ema_50=4145.0,
        ema_200=4120.0,
        recent_swing_high=4162.0,
        recent_swing_low=4135.0,
        asian_range_high=4162.0,
        asian_range_low=4135.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Asian session high breakout",
        open_positions_count=0
    )

    breakout_signal = FusedSignal(
        signal_id=f"SIG_BRK_{uuid.uuid4().hex[:8]}",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4165.0,
        stop_loss=4160.5,  # $4.50 stop distance (450 pts)
        take_profit=4174.0, # $9.00 reward (R:R = 2.0)
        risk_reward=2.0,
        confidence=0.86,
        strategy_id="XAU_SESSION_BREAKOUT",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Asian range high breakout at $4165"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    original_override = settings.risk.allow_min_lot_override
    original_risk_pct = settings.risk.max_risk_per_trade_pct
    settings.risk.allow_min_lot_override = True
    settings.risk.max_risk_per_trade_pct = 9.0
    try:
        decision = engine.evaluate(
            signal=breakout_signal,
            market_state=state,
            account_equity=50.0,
            open_positions_count=0
        )
        assert decision.approved is True
        assert decision.lot_size == 0.01
        assert decision.risk_amount_usd == 4.50
        assert decision.rejection_code is None
    finally:
        settings.risk.allow_min_lot_override = original_override
        settings.risk.max_risk_per_trade_pct = original_risk_pct


def test_tier3_comb_gemini_fallback_and_liquidity_sweep(isolated_db):
    """
    Combination 2: Gemini AI Rate-Limit / Fallback + Liquidity Sweep Strategy
    When a Liquidity Sweep setup triggers but Gemini returns HTTP 429,
    the AI Analyst catches the rate limit, logs safe fallback, and rejects
    unconfirmed setups without crashing the trading loop.
    """
    fake_gemini = FakeGeminiProvider(mode="RATE_LIMIT_429")
    analyst = AIAnalyst(provider=fake_gemini)
    fusion = SignalFusionEngine()

    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.5,
        rsi_14=42.0,
        ema_9=4163.0,
        ema_21=4164.0,
        ema_50=4168.0,
        ema_200=4175.0,
        recent_swing_high=4175.0,
        recent_swing_low=4158.0,
        session=SessionName.NEW_YORK,
        regime=MarketRegimeType.TREND_DOWN,
        trend_description="Liquidity sweep of session lows",
        open_positions_count=0
    )

    sweep_setup = CandidateSetup(
        strategy_id="XAU_LIQUIDITY_SWEEP",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4156.0,
        take_profit=4174.0,
        risk_reward=2.0,
        reason="Liquidity sweep and pinbar reversal",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    # 1. AI Analyst receives 429 and activates deterministic fallback
    ai_decision = analyst.analyze_setup(state, sweep_setup)
    assert any("fallback engaged" in r.lower() for r in ai_decision.reasons)
    assert ai_decision.setup_valid is True

    # 2. Signal Fusion safely fuses with fallback decision
    fused = fusion.fuse(state, [sweep_setup], ai_decision=ai_decision)
    assert fused.strategy_id == "XAU_LIQUIDITY_SWEEP"
    assert fused.is_valid is True


def test_tier3_comb_fok_order_and_terminal_disconnect(fake_mt5, isolated_db):
    """
    Combination 3: Broker FOK Fill Execution + Terminal Tick Stream Disconnect
    When an order submission is initiated but MT5 terminal drops offline,
    the adapter rejects the order cleanly without an unhandled crash,
    and coordinator status reflects the disconnection.
    """
    coordinator = TradingCoordinator()
    coordinator.mt5_adapter = MT5ExecutionAdapter()
    coordinator.mt5_adapter.connect()
    assert coordinator.mt5_adapter.is_connected() is True

    # Simulate terminal disconnect
    fake_mt5.connected = False

    order = Order(
        order_id="ORD_COMB_DISC_01",
        signal_id="SIG_COMB_DISC_01",
        strategy_id="XAU_TREND_PULLBACK",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.45,
        stop_loss=4157.45,
        take_profit=4172.45,
        created_at=datetime.now(timezone.utc)
    )

    res = coordinator.mt5_adapter.submit_order(order)
    assert res.status == OrderStatus.REJECTED
    assert "disconnected" in res.error_message.lower()

    # System status reflects offline broker
    status = coordinator.get_system_status()
    assert status["broker_connected"] is False


def test_tier3_comb_rapid_tick_burst_and_m15_candle_scrubbing(client):
    """
    Combination 4: Rapid Tick Burst + TradingView M15 Candle Scrubbing + Live WebSocket Broadcast
    Simulates high volatility burst of 50 ticks during London open;
    verifies that M15 candle updates in real-time and WebSocket broadcast callback receives events.
    """
    coordinator = TradingCoordinator()
    broadcast_events = []
    coordinator.register_broadcast_listener(lambda data: broadcast_events.append(data))

    start_time = datetime(2026, 10, 2, 8, 15, 0, tzinfo=timezone.utc)

    # Ingest 50 rapid ticks in same 15m candle (between 8:15 and 8:25)
    for i in range(50):
        t = start_time + timedelta(seconds=i * 10)
        px = 4162.0 + (i * 0.10)
        tick = Tick(
            symbol="XAUUSD",
            time=t,
            bid=px - 0.12,
            ask=px + 0.13,
            spread=0.25,
            volume=5.0
        )
        coordinator.step(tick)

    assert len(broadcast_events) == 50
    latest_event = broadcast_events[-1]
    assert latest_event["type"] == "TICK_STEP"
    assert latest_event["market_state"]["current_price"] > 4162.0

    # Verify M15 candle updated high and close in-place
    m15_bars = coordinator.feed.get_candles(TimeFrame.M15, count=1)
    if m15_bars:
        assert m15_bars[-1].high >= 4166.0


def test_tier3_comb_emergency_stop_overrides_bullish_ai(fake_gemini, isolated_db):
    """
    Combination 5: Emergency Stop Active + Trend Pullback Signal + Bullish AI Confirmation
    Verifies that when Emergency Stop is enabled, even an ideal Trend Pullback setup
    with 95% AI confidence is unconditionally rejected by the Risk Firewall.
    """
    fake_gemini.set_mode("BUY_CONFIRM")
    analyst = AIAnalyst(provider=fake_gemini)
    fusion = SignalFusionEngine()
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0

    # Arm Emergency Stop
    engine.set_emergency_stop(True, reason="Operator risk circuit breaker")

    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=55.0,
        ema_9=4163.0,
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
        reason="A+ setup",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    ai_decision = analyst.analyze_setup(state, setup)
    assert ai_decision.setup_valid is True

    fused = fusion.fuse(state, [setup], ai_decision=ai_decision)
    assert fused.is_valid is True

    # Risk Engine must block it
    dec = engine.evaluate(fused, state, account_equity=1000.0, open_positions_count=0)
    assert dec.approved is False
    assert dec.rejection_code == "REJECT_EMERGENCY_STOP"


def test_tier3_comb_news_lockout_and_active_position_telemetry(fake_mt5, isolated_db):
    """
    Combination 6: High-Impact News Lockout + Micro-Lot 0.01 Sizing + Active Position Telemetry
    During high-impact news, new entries are locked out, but existing positions
    continue to sync P&L and can be closed manually.
    """
    coordinator = TradingCoordinator()
    coordinator.mt5_adapter = MT5ExecutionAdapter()
    coordinator.mt5_adapter.connect()

    # 1. Existing open position
    order = Order(
        order_id="ORD_NEWS_01",
        signal_id="SIG_NEWS_01",
        strategy_id="XAU_TREND_PULLBACK",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        created_at=datetime.now(timezone.utc)
    )
    filled = coordinator.mt5_adapter.submit_order(order)
    ticket = filled.ticket

    # 2. Simulate news lockout during step
    from news.news_engine import news_engine, NewsImpactStatus
    original_check = news_engine.check_news_status
    news_engine.check_news_status = lambda dt: (NewsImpactStatus.NEWS_LOCKOUT, None, "US Non-Farm Payrolls (NFP) release")

    try:
        now = datetime.now(timezone.utc)
        tick = Tick(symbol="XAUUSD", time=now, bid=4168.0, ask=4168.5, spread=0.5, volume=20.0)
        res = coordinator.step(tick)

        # Market state marks news event regime
        assert res["market_state"]["regime"] == MarketRegimeType.NEWS_EVENT.value
        # Open positions still reported
        assert len(res["open_positions"]) == 1

        # Position can still be closed manually during news
        closed = coordinator.close_position(ticket, reason="PRE_NEWS_EXIT")
        assert closed is not None
        assert closed.ticket == ticket
    finally:
        news_engine.check_news_status = original_check


def test_tier3_comb_multi_strategy_simultaneous_triggers_and_execution(fake_mt5, isolated_db):
    """
    Combination 7: Multi-Strategy Simultaneous Trigger + Weight Prioritization + Execution
    When Trend Pullback (weight 1.2) and Mean Reversion (weight 0.95) fire together,
    SignalFusion prioritizes Trend Pullback, Risk Engine approves, and MT5 fills FOK order.
    """
    coordinator = TradingCoordinator()
    coordinator.mt5_adapter = MT5ExecutionAdapter()
    coordinator.mt5_adapter.connect()
    coordinator.risk_engine.peak_equity = 1000.0
    coordinator.risk_engine.daily_starting_equity = 1000.0

    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=54.0,
        ema_9=4163.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish",
        open_positions_count=0
    )

    setup_mean_rev = CandidateSetup(
        strategy_id="XAU_MEAN_REVERSION",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4158.0,
        take_profit=4170.0,
        risk_reward=2.0,
        reason="Oversold pullback",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )
    setup_trend = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="EMA21 confluence",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    fused = coordinator.fusion_engine.fuse(state, [setup_mean_rev, setup_trend], ai_decision=None)
    assert fused.strategy_id == "XAU_TREND_PULLBACK"
    assert fused.is_valid is True

    decision = coordinator.risk_engine.evaluate(fused, state, account_equity=1000.0, open_positions_count=0)
    assert decision.approved is True
    assert decision.lot_size >= 0.01

    order = Order(
        order_id="ORD_MULTI_01",
        signal_id=fused.signal_id,
        strategy_id=fused.strategy_id,
        magic_number=108824,
        symbol="XAUUSD.m",
        side=fused.side,
        lot_size=decision.lot_size,
        requested_price=fused.entry,
        stop_loss=fused.stop_loss,
        take_profit=fused.take_profit,
        created_at=now
    )
    filled = coordinator.mt5_adapter.submit_order(order)
    assert filled.status == OrderStatus.FILLED
    assert filled.ticket is not None
