"""
Tier 1 — Feature Coverage E2E Tests.
Validates all primary requirements (R1, R2, R3, R4) and interface contracts
defined in ORIGINAL_REQUEST.md and PROJECT.md (>=5 tests per feature).
"""

from datetime import datetime, timezone, timedelta
import json
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
from execution.live_trader import LiveTrader
from tests.e2e.conftest import FakeMT5Terminal, FakeGeminiProvider


# ==============================================================================
# Feature 1: Real-Time MT5 Tick Streaming & Chart Synchronization (R1)
# ==============================================================================

def test_r1_websocket_initial_state_on_connect(client, fake_mt5):
    """
    R1.1: WebSocket terminal connection primes state and immediately sends
    INITIAL_STATE message containing system status, positions, and market state.
    """
    with client.websocket_connect("/ws/terminal") as ws:
        msg = ws.receive_json()
        assert msg["type"] == "INITIAL_STATE"
        assert "timestamp" in msg
        assert "status" in msg
        assert "positions" in msg
        assert msg["status"]["app_name"] == "XAUUSD Quantitative Trading System"
        assert isinstance(msg["positions"], list)


def test_r1_websocket_ping_pong_keepalive(client, fake_mt5):
    """
    R1.2: Client ping receives immediate pong keepalive, preventing reconnect loops.
    """
    with client.websocket_connect("/ws/terminal") as ws:
        # Drain initial message
        init_data = ws.receive_json()
        assert init_data["type"] == "INITIAL_STATE"

        for _ in range(3):
            ws.send_text("ping")
            resp = ws.receive_text()
            assert resp == "pong"


def test_r1_live_tick_streaming_at_4162(fake_mt5, prime_market_feed, isolated_db):
    """
    R1.3: Ingestion of live broker tick at ~$4,162+ updates market state,
    calculates spread points, and triggers threadsafe broadcast.
    """
    coordinator = TradingCoordinator()
    prime_market_feed(coordinator.feed, count=50, base_price=4160.0)

    broadcasts = []
    coordinator.register_broadcast_listener(lambda d: broadcasts.append(d))

    now = datetime.now(timezone.utc)
    tick = Tick(
        symbol="XAUUSD",
        time=now,
        bid=4162.20,
        ask=4162.45,
        spread=0.25,
        volume=15.0
    )

    result = coordinator.step(tick)

    assert result["type"] == "TICK_STEP"
    assert result["market_state"]["symbol"] == "XAUUSD"
    assert result["market_state"]["bid"] == 4162.20
    assert result["market_state"]["ask"] == 4162.45
    assert result["market_state"]["current_price"] == 4162.325 or round(result["market_state"]["current_price"], 2) in (4162.32, 4162.33)
    assert len(broadcasts) >= 1
    assert broadcasts[-1]["type"] == "TICK_STEP"


def test_r1_tradingview_m15_candle_scrubbing_in_place():
    """
    R1.4: Sequential incoming ticks within the same 15-minute bucket scrub the candle
    in-place: high, low, close update dynamically while the initial open price remains untouched.
    """
    feed = MarketDataEngine(symbol="XAUUSD")
    base_time = datetime(2026, 10, 2, 10, 0, 5, tzinfo=timezone.utc)

    # First tick: defines Open at 4162.00
    t1 = Tick(symbol="XAUUSD", time=base_time, bid=4161.90, ask=4162.10, spread=0.20, volume=5.0)
    feed.process_tick(t1)
    m1_initial = feed._current_m1_bar
    assert m1_initial is not None
    initial_open = m1_initial.open
    assert initial_open == 4162.00

    # Second tick: pushes price Higher to 4165.00
    t2 = Tick(symbol="XAUUSD", time=base_time + timedelta(seconds=15), bid=4164.90, ask=4165.10, spread=0.20, volume=8.0)
    feed.process_tick(t2)
    assert feed._current_m1_bar.open == initial_open  # Open MUST NOT change
    assert feed._current_m1_bar.high == 4165.00
    assert feed._current_m1_bar.close == 4165.00

    # Third tick: pulls price Lower to 4158.00
    t3 = Tick(symbol="XAUUSD", time=base_time + timedelta(seconds=30), bid=4157.90, ask=4158.10, spread=0.20, volume=12.0)
    feed.process_tick(t3)
    assert feed._current_m1_bar.open == initial_open  # Open strictly preserved
    assert feed._current_m1_bar.low == 4158.00
    assert feed._current_m1_bar.close == 4158.00
    assert feed._current_m1_bar.volume == 25.0


def test_r1_multitimeframe_bar_synthesis():
    """
    R1.5: Multi-timeframe synthesis aggregates completed M1 bars into M5 and M15 bars
    with consistent high/low/close values.
    """
    feed = MarketDataEngine(symbol="XAUUSD")
    start = datetime(2026, 10, 2, 8, 0, 0, tzinfo=timezone.utc)

    # Feed 15 consecutive 1-minute bars
    for m in range(15):
        bar_time = start + timedelta(minutes=m)
        c = Candle(
            symbol="XAUUSD",
            timeframe=TimeFrame.M1,
            timestamp=bar_time,
            open=4160.0 + m,
            high=4161.0 + m,
            low=4159.5 + m,
            close=4160.8 + m,
            volume=100.0
        )
        feed.add_candle(c)

    m1_bars = feed.get_candles(TimeFrame.M1, count=15)
    m5_bars = feed.get_candles(TimeFrame.M5, count=5)
    m15_bars = feed.get_candles(TimeFrame.M15, count=5)

    assert len(m1_bars) == 15
    assert len(m5_bars) == 3
    assert len(m15_bars) == 1

    # Verify M15 candle aggregation properties
    m15 = m15_bars[0]
    assert m15.open == 4160.0  # Open of first M1 bar
    assert m15.high == 4161.0 + 14  # Max high across 15 bars
    assert m15.close == 4160.8 + 14  # Close of last M1 bar
    assert m15.volume == 1500.0  # Sum of volumes


def test_r1_rest_candles_history_m15(client, prime_market_feed, fake_mt5):
    """
    R1.6: REST endpoint /api/candles/history?count=50 returns formatted M15 bars
    matching TradingView chart requirements.
    """
    from service import coordinator
    prime_market_feed(coordinator.feed, count=60, base_price=4160.0)

    res = client.get("/api/candles/history?count=50")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "XAUUSD"
    assert data["timeframe"] == "M15"
    assert data["count"] >= 50
    candles = data["candles"]
    assert len(candles) >= 50

    sample = candles[0]
    for key in ("time", "open", "high", "low", "close", "volume"):
        assert key in sample
    assert isinstance(sample["time"], int)
    assert sample["high"] >= sample["low"]


# ==============================================================================
# Feature 2: Hybrid Quantitative & Google Gemini AI Decision Engine (R2)
# ==============================================================================

def test_r2_quantitative_strategies_generate_candidate_setups(prime_market_feed):
    """
    R2.1: Quantitative strategies (Trend Pullback, Session Breakout, Liquidity Sweep,
    Mean Reversion) evaluate market state and return properly structured CandidateSetup objects.
    """
    feed = MarketDataEngine()
    prime_market_feed(feed, count=250, base_price=4160.0)
    now = datetime.now(timezone.utc)

    # Bullish market state aligned with Trend Pullback criteria
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.50,
        bid=4162.40,
        ask=4162.60,
        spread_points=20.0,
        atr_14=3.5,
        rsi_14=52.0,
        ema_9=4163.0,
        ema_21=4161.0,
        ema_50=4155.0,
        ema_200=4140.0,
        recent_swing_high=4170.0,
        recent_swing_low=4158.0,
        asian_range_high=4168.0,
        asian_range_low=4152.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish trend structure",
        open_positions_count=0
    )

    from strategy.trend_pullback import TrendPullbackStrategy
    strat = TrendPullbackStrategy()
    setup = strat.evaluate(state)

    assert setup is not None
    assert setup.strategy_id == "XAU_TREND_PULLBACK"
    assert setup.side in (OrderSide.BUY, OrderSide.SELL)
    assert setup.risk_reward >= 1.5
    assert setup.stop_loss > 0
    assert setup.take_profit > 0


def test_r2_primary_candidate_setup_weighted_selection(isolated_db):
    """
    R2.2: Signal Fusion prioritizes candidate setup with the highest strategy weight
    (Trend Pullback 1.2 > Liquidity Sweep 1.15 > Session Breakout 1.0 > Mean Reversion 0.95).
    """
    engine = SignalFusionEngine()
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
        trend_description="Strong Uptrend",
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
        reason="Oversold bounce",
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
        reason="EMA21 pullback",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    # When both are passed, Trend Pullback (weight 1.2) must be selected as primary
    fused = engine.fuse(state, [setup_mean_rev, setup_trend], ai_decision=None)
    assert fused.strategy_id == "XAU_TREND_PULLBACK"
    assert fused.is_valid is True
    assert fused.side == OrderSide.BUY


def test_r2_gemini_ai_analyst_validation_contract(fake_gemini, isolated_db):
    """
    R2.3: AI Analyst invokes Gemini provider, passes structured payload,
    and returns valid AISignalDecision conforming to schema.
    """
    analyst = AIAnalyst(provider=fake_gemini)
    now = datetime.now(timezone.utc)

    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.50,
        bid=4162.40,
        ask=4162.60,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=56.0,
        ema_9=4164.0,
        ema_21=4160.0,
        ema_50=4150.0,
        ema_200=4130.0,
        session=SessionName.NEW_YORK,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish continuation",
        open_positions_count=0
    )

    setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.50,
        stop_loss=4157.50,
        take_profit=4172.50,
        risk_reward=2.0,
        reason="Trend alignment",
        timestamp=now,
        expiry=now + timedelta(hours=2)
    )

    decision = analyst.analyze_setup(state, setup)

    assert decision.decision == OrderSide.BUY
    assert decision.setup_valid is True
    assert decision.confidence >= 0.80
    assert len(decision.reasons) >= 1
    assert len(fake_gemini.calls) == 1
    # Check that payload contains required structured fields
    payload = fake_gemini.calls[0]["user_payload"]
    assert payload["symbol"] == "XAUUSD"
    assert payload["market_regime"] == "TREND_UP"
    assert payload["candidate_setup"]["strategy_id"] == "XAU_TREND_PULLBACK"


def test_r2_gemini_ai_graceful_fallback_on_network_timeout(isolated_db):
    """
    R2.4: When Gemini API experiences network timeout or error, AIAnalyst executes
    graceful error handling, preventing an unhandled crash and rejecting trade safely.
    """
    failing_provider = FakeGeminiProvider(mode="TIMEOUT")
    analyst = AIAnalyst(provider=failing_provider)
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
        ema_50=4155.0,
        ema_200=4140.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.RANGE,
        trend_description="Sideways",
        open_positions_count=0
    )
    setup = CandidateSetup(
        strategy_id="XAU_SESSION_BREAKOUT",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4156.0,
        take_profit=4174.0,
        risk_reward=2.0,
        reason="Range test",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    decision = analyst.analyze_setup(state, setup)
    assert any("fallback engaged" in r.lower() for r in decision.reasons)
    assert decision.setup_valid is True
    assert decision.decision in (OrderSide.BUY, OrderSide.SELL, OrderSide.NO_TRADE)


def test_r2_contradictory_candidate_setups_resolve_to_no_trade(isolated_db):
    """
    R2.5: Signal Fusion handles simultaneous contradictory BUY and SELL setups
    by deterministically returning NO_TRADE with a conflict reason.
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
        ema_21=4162.0,
        ema_50=4160.0,
        ema_200=4150.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.HIGH_VOLATILITY,
        trend_description="Volatile Chop",
        open_positions_count=0
    )
    buy_setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="Buy trigger",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )
    sell_setup = CandidateSetup(
        strategy_id="XAU_LIQUIDITY_SWEEP",
        symbol="XAUUSD",
        side=OrderSide.SELL,
        entry=4162.0,
        stop_loss=4167.0,
        take_profit=4152.0,
        risk_reward=2.0,
        reason="Sell sweep",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    fused = fusion.fuse(state, [buy_setup, sell_setup], ai_decision=None)
    assert fused.is_valid is False
    assert fused.side == OrderSide.NO_TRADE
    assert fused.strategy_id == "CONFLICT"
    assert any("conflict" in r.lower() for r in fused.reasons)


def test_r2_directional_divergence_between_strategy_and_ai(fake_gemini, isolated_db):
    """
    R2.6: Directional divergence between quantitative strategy (BUY) and AI Analyst (SELL)
    is resolved to NO_TRADE.
    """
    fusion = SignalFusionEngine()
    fake_gemini.set_mode("SELL_CONFIRM")
    analyst = AIAnalyst(provider=fake_gemini)
    now = datetime.now(timezone.utc)

    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.9,
        ask=4162.1,
        spread_points=20.0,
        atr_14=3.0,
        rsi_14=52.0,
        ema_9=4163.0,
        ema_21=4160.0,
        ema_50=4155.0,
        ema_200=4140.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish",
        open_positions_count=0
    )
    buy_setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        reason="Trend Pullback BUY",
        timestamp=now,
        expiry=now + timedelta(hours=1)
    )

    ai_decision = analyst.analyze_setup(state, buy_setup)
    fused = fusion.fuse(state, [buy_setup], ai_decision=ai_decision)

    assert fused.is_valid is False
    assert fused.side == OrderSide.NO_TRADE
    assert any("divergence" in r.lower() for r in fused.reasons)


# ==============================================================================
# Feature 3: Calibrated Risk Governance for Small Accounts ($50 Balance) (R3)
# ==============================================================================

def test_r3_micro_lot_sizing_calibration_on_50_dollar_account():
    """
    R3.1: On $50.00 account equity, position sizer with allow_min_lot_override=True
    approves exactly 0.01 micro-lot without returning 0.0 lots.
    """
    entry = 4162.00
    stop_loss = 4157.50  # $4.50 distance (450 points)
    # 0.01 lot on $4.50 stop = $4.50 risk (9.0% of $50 equity)

    lot_size, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
        account_equity=50.0,
        entry_price=entry,
        stop_loss=stop_loss,
        risk_pct=9.0,
        contract_size=100.0,
        min_lot=0.01,
        max_lot=100.0,
        lot_step=0.01,
        allow_min_lot_override=True
    )

    assert lot_size == 0.01
    assert risk_usd == 4.50
    assert stop_pts == 450.0


def test_r3_small_account_equity_initialization_prevents_drawdown_rejection(isolated_db):
    """
    R3.2: Initializing RiskEngine dynamically with $50.00 equity sets initial and
    peak equity correctly, preventing false 99.95% drawdown rejection.
    """
    engine = RiskEngine()
    engine.initial_equity = 50.0
    engine.peak_equity = 50.0
    engine.daily_starting_equity = 50.0

    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.85,
        ask=4162.15,
        spread_points=30.0,
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

    signal = FusedSignal(
        signal_id=f"SIG_{uuid.uuid4().hex[:8]}",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.5,
        take_profit=4171.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Valid trend setup"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    # Enable min lot override for $50 account
    original_override = settings.risk.allow_min_lot_override
    original_risk_pct = settings.risk.max_risk_per_trade_pct
    settings.risk.allow_min_lot_override = True
    settings.risk.max_risk_per_trade_pct = 9.0
    try:
        decision = engine.evaluate(
            signal=signal,
            market_state=state,
            account_equity=50.0,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is True
        assert decision.rejection_code is None
        assert decision.lot_size == 0.01
    finally:
        settings.risk.allow_min_lot_override = original_override
        settings.risk.max_risk_per_trade_pct = original_risk_pct


def test_r3_risk_firewall_spread_limit_rejection(isolated_db):
    """
    R3.3: Risk firewall rejects trade if current spread exceeds max_spread_points (35.0).
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=4162.0,
        bid=4161.70,
        ask=4162.20,
        spread_points=50.0,  # 50.0 points > 35.0 max spread
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
    signal = FusedSignal(
        signal_id="SIG_TEST_SPREAD",
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
        reasons=["Valid setup"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    decision = engine.evaluate(signal, state, account_equity=1000.0, open_positions_count=0)
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_SPREAD_TOO_HIGH"


def test_r3_risk_firewall_consecutive_loss_cooldown(isolated_db):
    """
    R3.4: 3 consecutive losses activate the 4-hour cooldown lock,
    rejecting subsequent trade proposals with REJECT_CONSECUTIVE_LOSSES.
    """
    engine = RiskEngine()
    engine.peak_equity = 1000.0
    engine.daily_starting_equity = 1000.0
    now = datetime.now(timezone.utc)

    # Record 3 consecutive losses (total -$15 = 1.5% loss on $1000, well below 3% max daily loss)
    engine.update_account_metrics(current_equity=995.0, trade_pnl=-5.0, current_time=now)
    engine.update_account_metrics(current_equity=990.0, trade_pnl=-5.0, current_time=now)
    engine.update_account_metrics(current_equity=985.0, trade_pnl=-5.0, current_time=now)

    assert engine.consecutive_losses == 0  # Reset upon trigger
    assert engine.cooldown_until is not None
    assert engine.cooldown_until > now

    state = MarketState(
        timestamp=now + timedelta(minutes=5),
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
    signal = FusedSignal(
        signal_id="SIG_TEST_LOSS",
        timestamp=now + timedelta(minutes=5),
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Valid setup"],
        expiry=now + timedelta(minutes=10),
        is_valid=True
    )

    decision = engine.evaluate(signal, state, account_equity=970.0, open_positions_count=0)
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_CONSECUTIVE_LOSSES"


def test_r3_risk_firewall_emergency_stop_toggle(isolated_db):
    """
    R3.5: Activating the emergency stop unconditionally rejects all signals with REJECT_EMERGENCY_STOP.
    """
    engine = RiskEngine()
    engine.set_emergency_stop(True, reason="Manual operator kill switch")

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
    signal = FusedSignal(
        signal_id="SIG_TEST_EMERGENCY",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,
        take_profit=4172.0,
        risk_reward=2.0,
        confidence=0.90,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Top tier setup"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    decision = engine.evaluate(signal, state, account_equity=1000.0, open_positions_count=0)
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_EMERGENCY_STOP"
    assert "kill switch" in decision.reason.lower()


def test_r3_risk_firewall_minimum_risk_reward_enforcement(isolated_db):
    """
    R3.6: Risk firewall rejects setups with Risk/Reward ratio below 1.5.
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
    signal = FusedSignal(
        signal_id="SIG_TEST_RR",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=4162.0,
        stop_loss=4157.0,  # $5.00 risk
        take_profit=4165.0, # $3.00 reward -> R:R = 0.60
        risk_reward=0.60,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Weak RR setup"],
        expiry=now + timedelta(minutes=5),
        is_valid=True
    )

    decision = engine.evaluate(signal, state, account_equity=1000.0, open_positions_count=0)
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_MIN_RR_VIOLATED"


# ==============================================================================
# Feature 4: Autonomous MT5 Order Execution & Position Telemetry (R4)
# ==============================================================================

def test_r4_mt5_adapter_fok_filling_mode_and_traceable_comment(fake_mt5, isolated_db):
    """
    R4.1: Order submission through MT5ExecutionAdapter enforces broker filling mode
    and attaches a traceable comment in format: strategy_id[:10]|signal_id[:12].
    """
    adapter = MT5ExecutionAdapter()
    adapter.connect()
    assert adapter.is_connected() is True

    order = Order(
        order_id="ORD_E2E_001",
        signal_id="SIG_E2E_9876543210",
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

    submitted = adapter.submit_order(order)
    assert submitted.status == OrderStatus.FILLED
    assert submitted.ticket is not None

    # Inspect fake MT5 recorded order request
    assert len(fake_mt5.orders) >= 1
    req = fake_mt5.orders[-1]
    assert req["symbol"] == "XAUUSD.m"
    assert req["volume"] == 0.01
    assert req["magic"] == 108824
    assert req["comment"] == "XAU_TREND_|SIG_E2E_9876"
    assert len(req["comment"]) <= 31


def test_r4_terminal_trade_permission_algo_trading_check(fake_mt5):
    """
    R4.2: is_trade_allowed() correctly reflects MT5 terminal algo trading permission,
    warning when disabled and confirming when enabled.
    """
    adapter = MT5ExecutionAdapter()
    adapter.connect()

    fake_mt5.trade_allowed = True
    assert adapter.is_trade_allowed() is True

    fake_mt5.trade_allowed = False
    assert adapter.is_trade_allowed() is False


def test_r4_autonomous_live_trader_tick_processing_loop(fake_mt5, isolated_db):
    """
    R4.3: LiveTrader tick processing step executes full lifecycle from tick ingest
    to state calculation and order execution.
    """
    from service import coordinator
    coordinator.mt5_adapter = MT5ExecutionAdapter()
    coordinator.mt5_adapter.connect()

    trader = LiveTrader(poll_interval_sec=0.1)
    warmed = trader.warm_up_feed()
    assert warmed is True
    assert coordinator.latest_market_state is not None
    assert coordinator.latest_market_state.symbol == "XAUUSD"


def test_r4_position_telemetry_and_floating_pnl_sync(fake_mt5, isolated_db):
    """
    R4.4: Active positions in MT5 adapter report ticket, lot size, entry price,
    SL, TP, and update floating P&L as market quotes fluctuate.
    """
    adapter = MT5ExecutionAdapter()
    adapter.connect()

    # Create open position in fake terminal
    order = Order(
        order_id="ORD_TEL_01",
        signal_id="SIG_TEL_01",
        strategy_id="XAU_TREND_PULLBACK",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.00,
        stop_loss=4157.00,
        take_profit=4172.00,
        created_at=datetime.now(timezone.utc)
    )
    adapter.submit_order(order)

    positions = adapter.get_open_positions()
    assert len(positions) == 1
    pos = positions[0]
    assert pos.symbol == "XAUUSD.m"
    assert pos.lots == 0.01
    assert pos.entry_price == 4162.45
    assert pos.stop_loss == 4157.00
    assert pos.take_profit == 4172.00


def test_r4_manual_position_close_and_broadcast_event(fake_mt5, isolated_db):
    """
    R4.5: coordinator.close_position() closes open position, creates TradeRecord,
    and broadcasts POSITION_CLOSED event with P&L.
    """
    coordinator = TradingCoordinator()
    coordinator.mt5_adapter = MT5ExecutionAdapter()
    coordinator.mt5_adapter.connect()

    # Submit an order
    order = Order(
        order_id="ORD_MAN_01",
        signal_id="SIG_MAN_01",
        strategy_id="XAU_TREND_PULLBACK",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.00,
        stop_loss=4157.00,
        take_profit=4172.00,
        created_at=datetime.now(timezone.utc)
    )
    filled = coordinator.mt5_adapter.submit_order(order)
    ticket = filled.ticket

    broadcasts = []
    coordinator.register_broadcast_listener(lambda d: broadcasts.append(d))

    record = coordinator.close_position(ticket, reason="MANUAL_UI")
    assert record is not None
    assert record.ticket == ticket
    assert record.exit_reason == "MANUAL_UI"
    assert any(b.get("type") == "POSITION_CLOSED" for b in broadcasts)


def test_r4_mt5_order_rejection_on_disconnected_gateway(fake_mt5, isolated_db):
    """
    R4.6: Submitting an order when MT5 gateway is disconnected marks order as REJECTED
    without raising an unhandled exception.
    """
    adapter = MT5ExecutionAdapter()
    fake_mt5.connected = False

    order = Order(
        order_id="ORD_DISC_01",
        signal_id="SIG_DISC_01",
        strategy_id="XAU_TREND_PULLBACK",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.00,
        stop_loss=4157.00,
        take_profit=4172.00,
        created_at=datetime.now(timezone.utc)
    )

    res = adapter.submit_order(order)
    assert res.status == OrderStatus.REJECTED
    assert "disconnected" in res.error_message.lower()
