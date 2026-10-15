"""
Tests for Position Sizing on XAUUSD.
"""

import pytest
from risk.position_sizer import PositionSizer


def test_standard_position_sizing():
    # Equity $100,000, 1% risk ($1,000)
    # Entry $2650.00, SL $2645.00 -> $5.00 stop distance
    # On XAUUSD (100 oz per lot): $5.00 * 100 = $500 risk per 1.00 lot
    # Lots = $1000 / $500 = 2.00 lots
    lots, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
        account_equity=100000.0,
        entry_price=2650.0,
        stop_loss=2645.0,
        risk_pct=1.0,
        contract_size=100.0,
        min_lot=0.01,
        max_lot=100.0,
        lot_step=0.01
    )
    assert lots == 2.00
    assert risk_usd == 1000.0
    assert stop_pts == 500.0


def test_min_lot_clamping():
    # Small equity $500, 1% risk ($5.00)
    # Stop distance $10.00 -> $1,000 risk per lot
    # Min lot 0.01 would risk $10.00, which exceeds $5.00 * 1.25 -> Should return 0.0 for safety
    lots, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
        account_equity=500.0,
        entry_price=2650.0,
        stop_loss=2640.0,
        risk_pct=1.0,
        contract_size=100.0,
        min_lot=0.01,
        max_lot=100.0,
        lot_step=0.01,
        allow_min_lot_override=False
    )
    assert lots == 0.0


def test_zero_stop_distance_returns_zero():
    lots, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
        account_equity=100000.0,
        entry_price=2650.0,
        stop_loss=2650.0,
        risk_pct=1.0
    )
    assert lots == 0.0
    assert risk_usd == 0.0


def test_lot_step_downward_rounding():
    # Theoretical lots = 1.358 -> Must round down to 1.35 to never exceed risk budget
    lots, risk_usd, _ = PositionSizer.calculate_lot_size(
        account_equity=13580.0,
        entry_price=2650.0,
        stop_loss=2640.0,  # $10 stop -> $1000 per lot
        risk_pct=10.0,    # $1358 risk
        contract_size=100.0,
        min_lot=0.01,
        max_lot=100.0,
        lot_step=0.01
    )
    assert lots == 1.35
    assert risk_usd <= 1358.0


def test_micro_account_min_lot_override():
    # Micro account with $50.00 equity, 1% nominal risk ($0.50)
    # Without override -> 0.0 lots
    lots_no_override, _, _ = PositionSizer.calculate_lot_size(
        account_equity=50.0,
        entry_price=4160.0,
        stop_loss=4155.0,
        risk_pct=1.0,
        allow_min_lot_override=False
    )
    assert lots_no_override == 0.0

    # With override enabled -> allowed 0.01 min lot
    lots_override, risk_usd, _ = PositionSizer.calculate_lot_size(
        account_equity=50.0,
        entry_price=4160.0,
        stop_loss=4155.0,
        risk_pct=1.0,
        allow_min_lot_override=True
    )
    assert lots_override == 0.01
    assert risk_usd == 5.0


def test_micro_account_rejects_catastrophic_stops():
    # Micro account ($50.00 equity or $23.64 equity) with wide stop distances ($15.00, $30.00)
    # Must reject even if allow_min_lot_override=True to prevent account obliteration
    for bad_stop_dist in [10.0, 15.0, 30.0]:
        lots, risk_usd, pts = PositionSizer.calculate_lot_size(
            account_equity=23.64,
            entry_price=4194.0,
            stop_loss=4194.0 - bad_stop_dist,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lots == 0.0, f"Expected 0.0 lots for ${bad_stop_dist} stop distance on micro account, got {lots}"


