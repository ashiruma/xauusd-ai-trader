"""
Tests for Active Profit Collection Mechanism (Break-Even Lock & Trailing Stop)
and JustMarkets Multi-User Account Onboarding ($100+ Deposit Gate).
"""

from datetime import datetime, timezone
from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient

from config.settings import settings, TradingMode, DataMode, OrderSide
from data.models import Position, OrderSide
from service import TradingCoordinator
from execution.paper_adapter import PaperExecutionAdapter
from api.app import app


@pytest.fixture
def test_coordinator():
    coord = TradingCoordinator()
    coord.paper_adapter = PaperExecutionAdapter(initial_balance=1000.0)
    settings.trading_mode = TradingMode.PAPER
    return coord


def test_break_even_lock_buy(test_coordinator):
    """
    When BUY position exceeds break_even_trigger_points (80 pts = $0.80),
    SL is ratcheted to entry_price + 25 pts ($0.25).
    """
    adapter = test_coordinator.paper_adapter
    ticket = 7000101
    adapter._positions[ticket] = Position(
        ticket=ticket,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        lots=0.01,
        entry_price=2650.00,
        current_price=2650.00,
        stop_loss=2645.00,  # $5.00 initial SL
        take_profit=2665.00,
        floating_pnl=0.0,
        magic_number=108824,
        open_time=datetime.now(timezone.utc)
    )

    # Market moves up by 85 points ($0.85 profit)
    current_bid = 2650.85
    current_ask = 2651.10

    mods = test_coordinator.manage_open_positions(current_bid, current_ask)
    assert len(mods) == 1
    assert mods[0]["ticket"] == ticket
    assert mods[0]["side"] == "BUY"
    assert mods[0]["trigger"] == "BREAK_EVEN"
    assert mods[0]["new_sl"] == 2650.25  # 2650.00 + 0.25

    # Position in adapter updated
    assert adapter._positions[ticket].stop_loss == 2650.25


def test_trailing_stop_buy(test_coordinator):
    """
    When BUY position exceeds trailing_trigger_points (150 pts = $1.50),
    SL dynamically trails 80 points ($0.80) behind bid.
    """
    adapter = test_coordinator.paper_adapter
    ticket = 7000102
    adapter._positions[ticket] = Position(
        ticket=ticket,
        symbol="XAUUSD",
        side=OrderSide.BUY,
        lots=0.01,
        entry_price=2650.00,
        current_price=2650.85,
        stop_loss=2650.25,  # Already at BE
        take_profit=2665.00,
        floating_pnl=8.50,
        magic_number=108824,
        open_time=datetime.now(timezone.utc)
    )

    # Market surges to 2652.50 (+250 points profit)
    current_bid = 2652.50
    current_ask = 2652.75

    mods = test_coordinator.manage_open_positions(current_bid, current_ask)
    assert len(mods) == 1
    assert mods[0]["ticket"] == ticket
    assert mods[0]["trigger"] == "TRAILING_STOP"
    assert mods[0]["new_sl"] == 2651.70  # 2652.50 - 0.80

    assert adapter._positions[ticket].stop_loss == 2651.70


def test_break_even_lock_sell(test_coordinator):
    """
    When SELL position exceeds break_even_trigger_points (80 pts = $0.80),
    SL is ratcheted down to entry_price - 25 pts ($0.25).
    """
    adapter = test_coordinator.paper_adapter
    ticket = 7000103
    adapter._positions[ticket] = Position(
        ticket=ticket,
        symbol="XAUUSD",
        side=OrderSide.SELL,
        lots=0.01,
        entry_price=2650.00,
        current_price=2650.00,
        stop_loss=2655.00,  # $5.00 initial SL above entry
        take_profit=2635.00,
        floating_pnl=0.0,
        magic_number=108824,
        open_time=datetime.now(timezone.utc)
    )

    # Market drops to 2649.10 (90 points profit for SELL)
    current_bid = 2648.85
    current_ask = 2649.10

    mods = test_coordinator.manage_open_positions(current_bid, current_ask)
    assert len(mods) == 1
    assert mods[0]["ticket"] == ticket
    assert mods[0]["side"] == "SELL"
    assert mods[0]["trigger"] == "BREAK_EVEN"
    assert mods[0]["new_sl"] == 2649.75  # 2650.00 - 0.25

    assert adapter._positions[ticket].stop_loss == 2649.75


def test_trailing_stop_sell(test_coordinator):
    """
    When SELL position drops past trailing_trigger_points (150 pts = $1.50),
    SL dynamically trails 80 points ($0.80) above ask.
    """
    adapter = test_coordinator.paper_adapter
    ticket = 7000104
    adapter._positions[ticket] = Position(
        ticket=ticket,
        symbol="XAUUSD",
        side=OrderSide.SELL,
        lots=0.01,
        entry_price=2650.00,
        current_price=2649.10,
        stop_loss=2649.75,  # Already at BE
        take_profit=2635.00,
        floating_pnl=9.00,
        magic_number=108824,
        open_time=datetime.now(timezone.utc)
    )

    # Market plunges to 2647.50 (+250 points profit for SELL)
    current_bid = 2647.25
    current_ask = 2647.50

    mods = test_coordinator.manage_open_positions(current_bid, current_ask)
    assert len(mods) == 1
    assert mods[0]["ticket"] == ticket
    assert mods[0]["trigger"] == "TRAILING_STOP"
    assert mods[0]["new_sl"] == 2648.30  # 2647.50 + 0.80

    assert adapter._positions[ticket].stop_loss == 2648.30


def test_account_connect_rejects_under_100_deposit(monkeypatch):
    """
    Verifies the strict $100.00 USD deposit policy:
    An external user connecting an account with < $100 equity is REJECTED.
    """
    client = TestClient(app)

    # Mock mt5.login and account_info returning $45.00 equity
    fake_mt5 = SimpleNamespace(
        login=lambda **kwargs: True,
        initialize=lambda **kwargs: True,
        account_info=lambda: SimpleNamespace(balance=45.0, equity=45.0, margin_free=45.0, leverage=500, currency="USD"),
        symbols_get=lambda: [SimpleNamespace(name="XAUUSD.m")],
        symbol_select=lambda sym, en: True
    )
    import execution.mt5_adapter as mt5_mod
    monkeypatch.setattr(mt5_mod, "mt5", fake_mt5)
    monkeypatch.setattr(mt5_mod, "MT5_AVAILABLE", True)

    resp = client.post("/api/account/connect", json={
        "login": 9991234,
        "password": "guestPassword123",
        "server": "JustMarkets-Demo3"
    })
    data = resp.json()

    assert data["success"] is False
    assert "Minimum deposit requirement not met" in data["message"]
    assert data["deposit_required"] == 100.0
    assert data["current_equity"] == 45.0


def test_account_connect_accepts_100_plus_deposit(monkeypatch):
    """
    Verifies that an external account with >= $100.00 deposit is approved and activated.
    """
    client = TestClient(app)

    fake_mt5 = SimpleNamespace(
        login=lambda **kwargs: True,
        initialize=lambda **kwargs: True,
        account_info=lambda: SimpleNamespace(balance=250.0, equity=250.0, margin_free=250.0, leverage=500, currency="USD"),
        symbols_get=lambda: [SimpleNamespace(name="XAUUSD.m")],
        symbol_info=lambda s: SimpleNamespace(name=s, visible=True),
        symbol_select=lambda sym, en: True,
        terminal_info=lambda: SimpleNamespace(connected=True, trade_allowed=True)
    )
    import execution.mt5_adapter as mt5_mod
    monkeypatch.setattr(mt5_mod, "mt5", fake_mt5)
    monkeypatch.setattr(mt5_mod, "MT5_AVAILABLE", True)

    resp = client.post("/api/account/connect", json={
        "login": 9995678,
        "password": "guestPassword123",
        "server": "JustMarkets-Live"
    })
    data = resp.json()

    assert data["success"] is True
    assert data["equity"] == 250.0
    assert data["login"] == 9995678
    assert "successfully connected" in data["message"]


def test_profit_manager_and_account_info_endpoints():
    """Verify REST status endpoints for profit manager and account info."""
    client = TestClient(app)

    resp = client.get("/api/profit-manager/status")
    assert resp.status_code == 200
    pm = resp.json()
    assert pm["enable_break_even"] is True
    assert pm["break_even_trigger_points"] == 80.0
    assert pm["break_even_trigger_usd"] == 0.80
    assert pm["break_even_lock_points"] == 25.0
    assert pm["break_even_lock_usd"] == 0.25
    assert pm["enable_trailing_stop"] is True
    assert pm["trailing_trigger_points"] == 150.0
    assert pm["trailing_trigger_usd"] == 1.50
    assert pm["trailing_distance_points"] == 80.0
    assert pm["trailing_distance_usd"] == 0.80
    assert pm["min_guest_deposit_usd"] == 100.0

    acc_resp = client.get("/api/account/info")
    assert acc_resp.status_code == 200
    acc = acc_resp.json()
    assert "login" in acc
    assert "min_deposit_required" in acc
    assert acc["min_deposit_required"] == 100.0


def test_account_balance_tiers_and_200_pip_scaling():
    """Verify dynamic account balance risk tiers, R:R scaling, and 200-pip roadmap."""
    client = TestClient(app)

    # 1. Micro Tier (< $100)
    micro = settings.risk.get_tier_parameters(50.0)
    assert micro["tier"] == "MICRO"
    assert micro["min_rr"] == 1.5
    assert "20 - 50 pips" in micro["target_pips"]
    assert "1.8:1 to 2.5:1" in micro["expected_pnl_range"]

    # 2. Institutional Tier ($1,000+)
    inst = settings.risk.get_tier_parameters(1200.0)
    assert inst["tier"] == "INSTITUTIONAL"
    assert inst["min_rr"] == 2.5
    assert inst["runner_enabled"] is True
    assert "200" in inst["target_pips"]

    # 3. API endpoint validation
    tier_resp = client.get("/api/risk/tiers")
    assert tier_resp.status_code == 200
    tiers_data = tier_resp.json()
    assert len(tiers_data["tiers"]) == 4

    strat_resp = client.get("/api/strategies")
    assert strat_resp.status_code == 200
    strat_data = strat_resp.json()
    assert "account_balance_tiers" in strat_data
    assert "roadmap_200_pips" in strat_data
    assert "why_small_account_gives_2_usd" in strat_data["roadmap_200_pips"]
    assert "how_1000_account_captures_200_pips" in strat_data["roadmap_200_pips"]

