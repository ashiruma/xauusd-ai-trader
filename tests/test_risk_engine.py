"""
Tests for Deterministic Risk Engine.
Validates the 13 mandatory risk firewall checks.
"""

from datetime import datetime, timezone, timedelta
import pytest

from config.settings import settings, SessionName, MarketRegimeType, OrderSide
from data.models import FusedSignal, MarketState
from risk.risk_engine import RiskEngine


@pytest.fixture
def base_market_state():
    return MarketState(
        timestamp=datetime.now(timezone.utc),
        symbol="XAUUSD",
        current_price=2650.0,
        bid=2649.9,
        ask=2650.1,
        spread_points=20.0,
        atr_14=2.5,
        rsi_14=52.0,
        ema_9=2650.0,
        ema_21=2648.0,
        ema_50=2645.0,
        ema_200=2640.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish trend",
        open_positions_count=0
    )


@pytest.fixture
def valid_buy_signal():
    now = datetime.now(timezone.utc)
    return FusedSignal(
        signal_id="SIG_TEST_01",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=2650.0,
        stop_loss=2645.0,
        take_profit=2660.0,
        risk_reward=2.0,
        confidence=0.85,
        strategy_id="XAU_TREND_PULLBACK",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["Valid trend pullback"],
        expiry=now + timedelta(hours=2),
        is_valid=True
    )


def test_risk_approves_valid_trade(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    engine.peak_equity = 100000.0
    engine.daily_starting_equity = 100000.0
    
    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is True
    assert decision.rejection_code is None
    assert decision.lot_size > 0.0


def test_emergency_stop_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    engine.set_emergency_stop(True, "Manual emergency halt")

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_EMERGENCY_STOP"


def test_broker_disconnected_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=False
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_BROKER_OFFLINE"


def test_max_open_positions_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=settings.risk.max_open_positions,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_MAX_POSITIONS"


def test_daily_loss_limit_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    engine.daily_starting_equity = 100000.0
    engine.daily_pnl = -3500.0  # -3.5% loss > 3.0% limit

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=96500.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_MAX_DAILY_LOSS"


def test_max_drawdown_limit_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    engine.peak_equity = 100000.0
    current_equity = 91000.0  # 9% drawdown > 8.0% limit

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=current_equity,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_MAX_DRAWDOWN"


def test_consecutive_losses_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    engine.consecutive_losses = 3

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_CONSECUTIVE_LOSSES"


def test_spread_limit_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    base_market_state.spread_points = 50.0  # 50 points > 35 points limit

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_SPREAD_TOO_HIGH"


def test_minimum_risk_reward_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    valid_buy_signal.risk_reward = 1.2  # 1.2 < 1.5 min

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_MIN_RR_VIOLATED"


def test_stop_distance_bounds_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    # Stop too tight: $0.10 distance = 10 points < 15 points limit
    valid_buy_signal.entry = 2650.0
    valid_buy_signal.stop_loss = 2649.90

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_STOP_TOO_TIGHT"


def test_session_restriction_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    base_market_state.session = SessionName.ROLLOVER_CAUTION

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100000.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_SESSION_RESTRICTION"


def test_small_account_50_dollar_equity_approval(base_market_state, valid_buy_signal):
    engine = RiskEngine()  # dynamic equity initialization
    # Spot price $4162.00, entry 4162.00, stop 4158.00 ($4.00 stop distance = 400 pts)
    base_market_state.current_price = 4162.0
    base_market_state.bid = 4161.9
    base_market_state.ask = 4162.1
    valid_buy_signal.entry = 4162.0
    valid_buy_signal.stop_loss = 4158.0
    valid_buy_signal.take_profit = 4170.0
    valid_buy_signal.risk_reward = 2.0

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=50.0,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is True
    assert decision.rejection_code is None
    assert decision.lot_size == 0.01
    assert decision.account_equity == 50.0
    assert engine.peak_equity == 50.0
    assert engine.initial_equity == 50.0
    assert engine.daily_starting_equity == 50.0


def test_small_account_rejects_excessive_stop_distance(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    # Micro account with $23.64 equity; setup has $15.00 stop distance (1500 points)
    base_market_state.current_price = 4194.0
    valid_buy_signal.entry = 4194.0
    valid_buy_signal.stop_loss = 4179.0  # 1500 pts > 500 max allowed on micro accounts
    valid_buy_signal.take_profit = 4224.0

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=23.64,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_STOP_TOO_WIDE"


def test_reset_drawdown_baseline(base_market_state, valid_buy_signal):
    engine = RiskEngine(initial_equity=50.0)
    engine.peak_equity = 50.0
    engine.consecutive_losses = 3
    engine.cooldown_until = datetime.now(timezone.utc) + timedelta(hours=2)

    # Calling reset_drawdown_baseline with current equity $23.64
    engine.reset_drawdown_baseline(23.64)
    assert engine.initial_equity == 23.64
    assert engine.peak_equity == 23.64
    assert engine.daily_starting_equity == 23.64
    assert engine.consecutive_losses == 0
    assert engine.cooldown_until is None

    # Now an approved tight setup with $3.00 stop distance evaluates cleanly without drawdown lockout
    base_market_state.current_price = 4162.0
    valid_buy_signal.entry = 4162.0
    valid_buy_signal.stop_loss = 4159.0  # 300 pts
    valid_buy_signal.take_profit = 4168.0

    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=23.64,
        open_positions_count=0,
        is_broker_connected=True
    )
    assert decision.approved is True
    assert decision.lot_size == 0.01



def test_daily_profit_target_rejection(base_market_state, valid_buy_signal):
    engine = RiskEngine()
    # Simulate profit already reached
    engine.daily_starting_equity = 100000.0
    engine.daily_pnl = 25.0  # $25 profit > $20 target
    decision = engine.evaluate(
        signal=valid_buy_signal,
        market_state=base_market_state,
        account_equity=100025.0,
        open_positions_count=0,
        is_broker_connected=True,
    )
    assert decision.approved is False
    assert decision.rejection_code == "REJECT_DAILY_PROFIT_GOAL_REACHED"
