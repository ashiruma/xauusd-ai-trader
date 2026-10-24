"""
Unit & Integration Tests for:
Profit Cushion Compounding Protocol (Model 2).
Verifies:
1. Standard baseline risk (2.0%) below +30% growth.
2. Milestone trigger (+30% gain): scales to accelerated 2.75% risk with 10% cushion dollar cap.
3. Guardrail 1 (Hysteresis Deadband): Prevents boundary whipsaw between +15% and +30%.
4. Guardrail 1 (Parachute Floor): Disengages accelerator below +15% to protect accumulated gains.
5. Guardrail 1 (Clean Re-Arm): Requires breaking prior trigger high + buffer to re-arm.
6. Guardrail 2 (Conservative Lot Clamping): Never inflates lot size beyond mathematical cushion budget.
7. Guardrail 3 (Market Regime Gating): Throttles accelerated risk to baseline during chop, range, or news.
8. Rule 1: Zero emojis across all modules and tests.
"""

from datetime import datetime, timezone, timedelta, date
import pytest
import re

from config.settings import settings, SessionName, MarketRegimeType, OrderSide
from data.models import MarketState, FusedSignal
from risk.multi_account_governor import MultiAccountGovernor, AccountDailySession, multi_account_governor
from risk.risk_engine import RiskEngine
from risk.position_sizer import PositionSizer


@pytest.fixture
def clean_governor():
    multi_account_governor.reset_all()
    return multi_account_governor


@pytest.fixture
def trending_london_state():
    now = datetime(2026, 10, 24, 9, 0, tzinfo=timezone.utc)
    return MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=2650.0,
        bid=2649.85,
        ask=2650.15,
        spread_points=30.0,
        atr_14=2.50,
        rsi_14=55.0,
        ema_9=2648.0,
        ema_21=2645.0,
        ema_50=2640.0,
        ema_200=2630.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="London Killzone Clean Bullish Trend",
        open_positions_count=0
    )


def test_standard_baseline_risk_below_30_pct(clean_governor):
    """Accounts below +30% growth remain strictly at baseline risk (2.0%)."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # At starting capital ($100)
    risk_pct, dollar_cap, state, reason = session.evaluate_cushion_risk_tier(100.0, market_regime="TREND_UP")
    assert risk_pct == 2.0
    assert dollar_cap is None
    assert state == "BASELINE"
    assert "Baseline tier" in reason

    # At +20% gain ($120) - still below +30% threshold
    risk_pct_20, dollar_cap_20, state_20, _ = session.evaluate_cushion_risk_tier(120.0, market_regime="TREND_UP")
    assert risk_pct_20 == 2.0
    assert dollar_cap_20 is None
    assert state_20 == "BASELINE"


def test_milestone_trigger_at_30_pct_gain(clean_governor):
    """Breaching +30% gain arms the accelerator (2.75% risk, 10% cushion cap)."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # Equity reaches $130.00 (+30.0%)
    risk_pct, dollar_cap, state, reason = session.evaluate_cushion_risk_tier(130.0, market_regime="TREND_UP")
    assert risk_pct == 2.75
    assert state == "ACCELERATED"
    # Profit cushion is $30.00; 10% cap is $3.00
    assert dollar_cap == 3.00
    assert "Milestone +30.0% active" in reason


def test_hysteresis_deadband_prevents_whipsaw(clean_governor):
    """Pullback to $124 (+24%) remains in ACCELERATED mode without flip-flopping."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # 1. Arm at $132 (+32%)
    session.evaluate_cushion_risk_tier(132.0, market_regime="TREND_UP")
    assert session.accelerator_state == "ACCELERATED"

    # 2. Normal pullback to $124 (+24%, above the +15% floor)
    risk_pct, dollar_cap, state, _ = session.evaluate_cushion_risk_tier(124.0, market_regime="TREND_UP")
    assert state == "ACCELERATED"
    assert risk_pct == 2.75
    # Cushion is now $24.00; 10% cap is $2.40
    assert dollar_cap == 2.40


def test_parachute_disengages_below_15_pct(clean_governor):
    """Pullback below +15% floor disengages accelerator and locks baseline risk to protect principal."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # Arm at $135 (+35%)
    session.evaluate_cushion_risk_tier(135.0, market_regime="TREND_UP")
    assert session.accelerator_state == "ACCELERATED"

    # Pullback down to $112 (+12%, below +15% parachute floor)
    risk_pct, dollar_cap, state, reason = session.evaluate_cushion_risk_tier(112.0, market_regime="TREND_UP")
    assert state == "PARACHUTE_DOWNGRADE"
    assert risk_pct == 2.0  # Throttled back to safe baseline
    assert dollar_cap is None
    assert "PARACHUTE_DOWNGRADE" in reason


def test_rearm_requires_new_high(clean_governor):
    """After parachute disengagement, re-arming requires breaking the prior peak + 5% buffer."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # 1. Arm at $130 (peak = $130)
    session.evaluate_cushion_risk_tier(130.0, market_regime="TREND_UP")
    assert session.last_trigger_high == 130.0

    # 2. Parachute down to $110
    session.evaluate_cushion_risk_tier(110.0, market_regime="TREND_UP")
    assert session.accelerator_state == "PARACHUTE_DOWNGRADE"

    # 3. Bounce to $128 (+28%) - must NOT re-arm prematurely
    _, _, state_128, _ = session.evaluate_cushion_risk_tier(128.0, market_regime="TREND_UP")
    assert state_128 == "PARACHUTE_DOWNGRADE"

    # 4. Target is 130 * 1.05 = $136.50. Test at $137.00
    risk_pct_rearm, _, state_137, _ = session.evaluate_cushion_risk_tier(137.0, market_regime="TREND_UP")
    assert state_137 == "ACCELERATED"
    assert risk_pct_rearm == 2.75


def test_regime_gating_throttles_risk_in_chop(clean_governor):
    """When market regime shifts to CHOP or NEWS_EVENT, accelerated sizing is throttled to baseline."""
    acc_id = "1200533810"
    session = clean_governor.get_or_register_account(acc_id, current_balance=100.0, baseline_capital=100.0)

    # Arm at $135 in trend
    session.evaluate_cushion_risk_tier(135.0, market_regime="TREND_UP")
    assert session.accelerator_state == "ACCELERATED"

    # Market enters CHOP regime
    risk_pct, dollar_cap, state, reason = session.evaluate_cushion_risk_tier(135.0, market_regime="CHOP")
    assert risk_pct == 2.0  # Throttled to 2.0%
    assert dollar_cap is None
    assert state == "ACCELERATED_REGIME_THROTTLED"
    assert "not trending" in reason

    # Market enters NEWS_EVENT
    risk_pct_news, _, state_news, reason_news = session.evaluate_cushion_risk_tier(135.0, market_regime="NEWS_EVENT")
    assert risk_pct_news == 2.0
    assert state_news == "ACCELERATED_REGIME_THROTTLED"


def test_position_sizer_respects_cushion_dollar_cap():
    """Position sizer clamps lot size to never exceed the cushion dollar cap."""
    # Account has $130 equity, stop loss is $2.00 (200 pts), contract_size is 100.0
    # 1.00 lot loses $200.00; 0.01 lot loses $2.00
    # Cushion dollar cap is $3.00
    lot, risk_usd, pts = PositionSizer.calculate_lot_size(
        account_equity=130.0,
        entry_price=2650.0,
        stop_loss=2648.0,
        risk_pct=2.75,
        max_risk_usd=3.00,
        contract_size=100.0,
        point_size=0.01,
        min_lot=0.01,
        max_lot=10.0,
        lot_step=0.01
    )
    assert lot == 0.01
    assert risk_usd <= 3.00
    assert risk_usd == 2.00


def test_risk_engine_integration_with_profit_cushion(clean_governor, trending_london_state):
    """End-to-end integration: RiskEngine dynamically queries cushion tier per account."""
    # Pre-register account with $100 baseline deposit
    clean_governor.get_or_register_account("TEST_TRADER_101", current_balance=100.0, baseline_capital=100.0)

    engine = RiskEngine()
    now = datetime.now(timezone.utc)
    signal = FusedSignal(
        signal_id="SIG_CUSHION_TEST",
        timestamp=now,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=2650.0,
        stop_loss=2648.0,
        take_profit=2655.0,
        risk_reward=2.5,
        confidence=0.88,
        strategy_id="XAU_ICT_SMC_CONFLUENCE",
        market_regime=MarketRegimeType.TREND_UP,
        reasons=["ICT Bullish FVG"],
        expiry=now + timedelta(hours=2),
        is_valid=True
    )

    # Account grows to $140 (+40% above $100 baseline) in trending London session
    decision = engine.evaluate(
        signal=signal,
        market_state=trending_london_state,
        account_equity=140.0,
        open_positions_count=0,
        is_broker_connected=True,
        account_id="TEST_TRADER_101"
    )

    assert decision.approved is True
    assert decision.lot_size > 0
    assert "[ACCELERATED]" in decision.reason


def test_zero_emojis_in_profit_cushion_source():
    """Verify strictly 0 emojis exist in all affected files."""
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf]')
    files = [
        'config/settings.py',
        'risk/position_sizer.py',
        'risk/multi_account_governor.py',
        'risk/risk_engine.py',
        'service.py',
        'api/app.py',
        'tests/test_profit_cushion_compounding.py'
    ]

    for path in files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        matches = emoji_pattern.findall(content)
        assert len(matches) == 0, f"Found emojis in {path}: {matches}"
