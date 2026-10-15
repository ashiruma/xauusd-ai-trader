"""
Tests for MT5 and Paper Execution Adapters.
"""

from datetime import datetime, timezone
import pytest

from data.models import Order, OrderSide, OrderStatus
from execution.order_validator import OrderValidator
from execution.paper_adapter import PaperExecutionAdapter
from execution.mt5_adapter import MT5ExecutionAdapter


def test_order_validator_rejection_rules():
    # Invalid SL above BUY entry
    bad_buy = Order(
        order_id="ORD_001",
        signal_id="SIG_001",
        strategy_id="STRAT_001",
        magic_number=1001,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        lot_size=1.0,
        requested_price=2650.0,
        stop_loss=2655.0,  # Invalid: SL > entry for BUY
        take_profit=2670.0,
        created_at=datetime.now(timezone.utc)
    )
    valid, msg = OrderValidator.validate(bad_buy)
    assert valid is False
    assert "Invalid BUY geometry" in msg


def test_paper_execution_adapter_fill_and_sl_tp():
    adapter = PaperExecutionAdapter(initial_balance=100000.0)
    adapter.update_market_quote(bid=2650.0, ask=2650.25)

    order = Order(
        order_id="ORD_002",
        signal_id="SIG_002",
        strategy_id="STRAT_002",
        magic_number=1001,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        lot_size=1.0,
        requested_price=2650.25,
        stop_loss=2645.0,
        take_profit=2660.0,
        created_at=datetime.now(timezone.utc)
    )
    filled_order = adapter.submit_order(order)
    assert filled_order.status == OrderStatus.FILLED
    assert filled_order.ticket is not None

    positions = adapter.get_open_positions()
    assert len(positions) == 1
    ticket = positions[0].ticket

    # Simulate price movement hitting TP
    adapter.update_market_quote(bid=2661.0, ask=2661.25)
    # Position should auto-close on TP hit
    assert len(adapter.get_open_positions()) == 0
    assert adapter.balance > 100000.0


def test_mt5_adapter_safe_offline_status():
    adapter = MT5ExecutionAdapter()
    # When terminal is not running or invalid credentials, is_connected must be False
    connected = adapter.is_connected()
    # It must not raise an unhandled crash
    assert isinstance(connected, bool)
    acc = adapter.get_account_info()
    assert "equity" in acc


def test_mt5_adapter_filling_mode_and_trade_allowed():
    adapter = MT5ExecutionAdapter()
    filling_type = adapter._get_filling_type()
    assert isinstance(filling_type, int)

    trade_allowed = adapter.is_trade_allowed()
    assert isinstance(trade_allowed, bool)


def test_mt5_adapter_prioritizes_fok_filling_mode(monkeypatch):
    import MetaTrader5 as mt5
    adapter = MT5ExecutionAdapter()

    class MockSymbolInfo:
        filling_mode = 3  # Both FOK (1) and IOC (2) supported

    monkeypatch.setattr(mt5, "symbol_info", lambda sym: MockSymbolInfo())
    filling_type = adapter._get_filling_type()
    assert filling_type == mt5.ORDER_FILLING_FOK


def test_mt5_adapter_submitting_order_rejects_when_trade_not_allowed(monkeypatch):
    adapter = MT5ExecutionAdapter()
    monkeypatch.setattr(adapter, "is_connected", lambda: True)
    monkeypatch.setattr(adapter, "is_trade_allowed", lambda: False)

    order = Order(
        order_id="ORD_ALGO_OFF",
        signal_id="SIG_001",
        strategy_id="XAU_TREND",
        magic_number=108824,
        symbol="XAUUSD.m",
        side=OrderSide.BUY,
        lot_size=0.01,
        requested_price=4162.0,
        stop_loss=4158.0,
        take_profit=4170.0,
        created_at=datetime.now(timezone.utc)
    )
    result = adapter.submit_order(order)
    assert result.status == OrderStatus.REJECTED
    assert "Automated trading is disabled" in result.error_message

