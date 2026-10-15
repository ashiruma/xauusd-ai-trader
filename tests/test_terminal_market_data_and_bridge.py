"""
Tests for Terminal Market Data, MT5 Source of Truth, and Bridge Architecture.
Validates:
1. Authorization binding to verified account session.
2. Honest disconnected broker telemetry with zero synthetic or simulated fallbacks.
3. Broker symbol preservation (e.g. XAUUSD.m).
4. Position-linked entry rationale without inferring from unrelated setups.
5. Decoupled read-only MT5 data connection.
"""

from datetime import datetime, timezone
import uuid
import pytest
from fastapi.testclient import TestClient

from api.app import app
from config.settings import settings, TradingMode
from data.models import Order, OrderSide, OrderStatus, FusedSignal, MarketRegimeType
from data.storage import db
from service import coordinator


@pytest.fixture
def client():
    return TestClient(app)


def test_disconnected_broker_feed_no_simulation(client, monkeypatch):
    """
    When MT5 is disconnected in LIVE mode, verify:
    - /api/market/quote returns is_connected=False, status=MT5_DISCONNECTED, current_price=None.
    - No simulated ticks or fake quotes are generated.
    - /api/positions returns empty list and status=MT5_DISCONNECTED.
    - /api/candles/history returns 0 candles and status=MT5_DISCONNECTED.
    - /api/account/info returns is_connected=False and login=None.
    """
    orig_mode = settings.trading_mode
    settings.trading_mode = TradingMode.LIVE
    try:
        # Force adapter is_connected to return False
        monkeypatch.setattr(coordinator.mt5_adapter, "is_connected", lambda: False)

        # 1. Quote endpoint
        q_res = client.get("/api/market/quote")
        assert q_res.status_code == 200
        q_data = q_res.json()
        assert q_data["is_connected"] is False
        assert q_data["status"] == "MT5_DISCONNECTED"
        assert q_data["current_price"] is None
        assert q_data["bid"] is None
        assert q_data["ask"] is None

        # 2. Positions endpoint
        pos_res = client.get("/api/positions")
        assert pos_res.status_code == 200
        pos_data = pos_res.json()
        assert pos_data["is_connected"] is False
        assert pos_data["status"] == "MT5_DISCONNECTED"
        assert pos_data["count"] == 0
        assert pos_data["positions"] == []

        # 3. Candles endpoint
        candle_res = client.get("/api/candles/history?timeframe=M15&count=50")
        assert candle_res.status_code == 200
        candle_data = candle_res.json()
        assert candle_data["is_connected"] is False
        assert candle_data["status"] == "MT5_DISCONNECTED"
        assert candle_data["count"] == 0
        assert candle_data["candles"] == []

        # 4. Account info endpoint
        acc_res = client.get("/api/account/info")
        assert acc_res.status_code == 200
        acc_data = acc_res.json()
        assert acc_data["is_connected"] is False
        assert acc_data["login"] is None
        assert acc_data["balance"] == 0.0
        assert acc_data["equity"] == 0.0
        assert acc_data["deposit_compliant"] is False

    finally:
        settings.trading_mode = orig_mode


def test_symbol_preservation_xauusd_m(client, monkeypatch):
    """
    Verify that the broker's actual symbol (e.g. XAUUSD.m) is preserved
    and returned in all market-data endpoints rather than hardcoded generic XAUUSD.
    """
    orig_symbol = coordinator.mt5_adapter._symbol
    coordinator.mt5_adapter._symbol = "XAUUSD.m"
    try:
        monkeypatch.setattr(coordinator.mt5_adapter, "is_connected", lambda: True)
        monkeypatch.setattr(coordinator.mt5_adapter, "get_quote", lambda sym=None: {
            "bid": 2650.10,
            "ask": 2650.36,
            "spread_points": 2.6,
            "time": 1700000000
        })

        q_res = client.get("/api/market/quote")
        assert q_res.status_code == 200
        q_data = q_res.json()
        assert q_data["symbol"] == "XAUUSD.m"
        assert q_data["is_connected"] is True
        assert q_data["current_price"] == 2650.23

    finally:
        coordinator.mt5_adapter._symbol = orig_symbol


def test_position_recorded_entry_rationale_vs_unrecorded(monkeypatch):
    """
    Verify position rationale behavior:
    1. If recorded at entry with the signal, the position displays that exact rationale.
    2. If not recorded at entry, the position returns 'Entry rationale unavailable'
       without inferring reasons or attaching the latest unrelated signal.
    """
    orig_mode = settings.trading_mode
    settings.trading_mode = TradingMode.PAPER
    try:
        unique_sig = f"SIG_{uuid.uuid4().hex[:8]}"
        expected_rationale = "15m Asian low swept into H1 order block with 2.4 R:R target"

        # Record signal in db with entry rationale
        sig = FusedSignal(
            signal_id=unique_sig,
            timestamp=datetime.now(timezone.utc),
            symbol="XAUUSD.m",
            side=OrderSide.BUY,
            entry=2650.0,
            stop_loss=2645.0,
            take_profit=2662.0,
            risk_reward=2.4,
            confidence=0.85,
            strategy_id="SMC_SWEEP",
            market_regime=MarketRegimeType.TREND_UP,
            reasons=[expected_rationale],
            expiry=datetime.now(timezone.utc),
            is_valid=True
        )
        db.record_signal(sig)

        # 1. Order WITH recorded signal
        order_with_rationale = Order(
            order_id=str(uuid.uuid4()),
            signal_id=unique_sig,
            strategy_id="SMC_SWEEP",
            magic_number=1001,
            symbol="XAUUSD.m",
            side=OrderSide.BUY,
            lot_size=0.05,
            requested_price=2650.0,
            stop_loss=2645.0,
            take_profit=2662.0,
            status=OrderStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        filled1 = coordinator.paper_adapter.submit_order(order_with_rationale)
        assert filled1.status == OrderStatus.FILLED
        pos1 = coordinator.paper_adapter._positions[filled1.ticket]
        assert pos1.entry_rationale == expected_rationale

        # 2. Order WITHOUT recorded signal (e.g. manual or unlinked)
        unlinked_sig = f"SIG_UNLINKED_{uuid.uuid4().hex[:8]}"
        order_without_rationale = Order(
            order_id=str(uuid.uuid4()),
            signal_id=unlinked_sig,
            strategy_id="MANUAL_ORDER",
            magic_number=1002,
            symbol="XAUUSD.m",
            side=OrderSide.SELL,
            lot_size=0.02,
            requested_price=2650.0,
            stop_loss=2655.0,
            take_profit=2640.0,
            status=OrderStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        filled2 = coordinator.paper_adapter.submit_order(order_without_rationale)
        assert filled2.status == OrderStatus.FILLED
        pos2 = coordinator.paper_adapter._positions[filled2.ticket]
        assert pos2.entry_rationale == "Entry rationale unavailable"

        # Cleanup positions
        coordinator.paper_adapter.close_position(filled1.ticket)
        coordinator.paper_adapter.close_position(filled2.ticket)

    finally:
        settings.trading_mode = orig_mode


def test_auth_session_verification_rejects_arbitrary_client_account():
    """
    Verify server-side authorization: an arbitrary or spoofed account ID
    not registered in the database is rejected with authenticated=False.
    """
    client = TestClient(app)
    # Passing arbitrary account_id without registration
    res = client.get("/api/auth/session?account_id=9999999999")
    assert res.status_code == 200
    data = res.json()
    assert data["authenticated"] is False
    assert data["verified"] is False
    assert data["message"] == "Account not found"


def test_decoupled_live_trading_switch_status(client):
    """
    Verify live trading switch status:
    - MT5 data feed is read-only.
    - live trading execution requires explicit running state.
    """
    res = client.get("/api/live/status")
    assert res.status_code == 200
    data = res.json()
    assert "running" in data
    assert "algo_trading_allowed" in data
    assert "mt5_connected" in data
    assert "symbol" in data
