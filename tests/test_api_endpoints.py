"""
Tests for FastAPI REST Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from api.app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_status_endpoint(client):
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "trading_mode" in data
    assert "broker_connected" in data
    assert "account" in data


def test_market_state_endpoint(client):
    response = client.get("/api/market/state")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert data["symbol"] == "XAUUSD"


def test_signals_endpoint(client):
    response = client.get("/api/signals/latest")
    assert response.status_code == 200
    data = response.json()
    assert "candidate_setups" in data
    assert "recent_signals" in data


def test_risk_status_and_emergency_stop_toggle(client):
    # Check risk status
    res = client.get("/api/risk/status")
    assert res.status_code == 200
    data = res.json()
    assert "max_risk_per_trade_pct" in data

    # Toggle Emergency Stop ON
    res_arm = client.post("/api/risk/emergency-stop", json={"enabled": True, "reason": "API test lockout"})
    assert res_arm.status_code == 200
    assert res_arm.json()["emergency_stop"] is True

    # Verify status reflects it
    res2 = client.get("/api/risk/status")
    assert res2.json()["emergency_stop"] is True

    # Disarm Emergency Stop
    res_disarm = client.post("/api/risk/emergency-stop", json={"enabled": False, "reason": "API test resume"})
    assert res_disarm.status_code == 200
    assert res_disarm.json()["emergency_stop"] is False


def test_performance_and_positions_endpoints(client):
    res_pos = client.get("/api/positions")
    assert res_pos.status_code == 200
    assert "positions" in res_pos.json()

    res_perf = client.get("/api/performance")
    assert res_perf.status_code == 200
    assert "total_trades" in res_perf.json()


def test_post_tick_endpoint(client):
    res = client.post("/api/trading/tick", json={"bid": 2650.10, "ask": 2650.35, "volume": 12.0})
    assert res.status_code == 200
    data = res.json()
    assert "market_state" in data
    assert data["market_state"]["bid"] == 2650.10


def test_candles_history_endpoint(client):
    response = client.get("/api/candles/history?count=50")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "XAUUSD"
    assert data["timeframe"] == "M15"
    assert data["count"] > 0
    assert len(data["candles"]) > 0
    first_candle = data["candles"][0]
    assert "time" in first_candle and isinstance(first_candle["time"], int)
    assert "open" in first_candle and "high" in first_candle and "low" in first_candle and "close" in first_candle


def test_position_close_endpoints(client):
    from datetime import datetime, timezone
    import uuid
    from data.models import Order, OrderSide, OrderStatus
    from config.settings import settings, TradingMode
    from service import coordinator

    original_mode = settings.trading_mode
    settings.trading_mode = TradingMode.PAPER
    try:
        # 1. Test 404 on non-existent ticket
        res_404 = client.post("/api/positions/close/99999999")
        assert res_404.status_code == 404

        # 2. Open an actual paper position
        order = Order(
            order_id=str(uuid.uuid4()),
            signal_id=str(uuid.uuid4()),
            strategy_id="TEST_STRAT",
            magic_number=100101,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            lot_size=0.10,
            requested_price=2650.0,
            stop_loss=2640.0,
            take_profit=2670.0,
            status=OrderStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        filled_order = coordinator.paper_adapter.submit_order(order)
        assert filled_order.status == OrderStatus.FILLED
        ticket = filled_order.ticket

        # Verify position is listed
        pos_res = client.get("/api/positions")
        assert any(p["ticket"] == ticket for p in pos_res.json()["positions"])

        # 3. Close the position via the new API endpoint
        close_res = client.post(f"/api/positions/close/{ticket}")
        assert close_res.status_code == 200
        close_data = close_res.json()
        assert close_data["success"] is True
        assert close_data["trade"]["ticket"] == ticket
        assert close_data["trade"]["exit_reason"] == "MANUAL_UI"

        # Verify position is cleared
        pos_res_after = client.get("/api/positions")
        assert not any(p["ticket"] == ticket for p in pos_res_after.json()["positions"])
    finally:
        settings.trading_mode = original_mode


def test_websocket_terminal_endpoint(client):
    with client.websocket_connect("/ws/terminal") as ws:
        init_data = ws.receive_json()
        assert init_data["type"] == "INITIAL_STATE"
        assert "status" in init_data
        assert "positions" in init_data

        ws.send_text("ping")
        pong = ws.receive_text()
        assert pong == "pong"


def test_journal_endpoints(client):
    # Journal list endpoint
    res = client.get("/api/journal?limit=10")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Missing trade ID returns 404
    res_missing = client.get("/api/journal/nonexistent_trade_id_999")
    assert res_missing.status_code == 404


def test_live_control_endpoints(client):
    # Live status endpoint
    res_status = client.get("/api/live/status")
    assert res_status.status_code == 200
    data = res_status.json()
    assert "running" in data
    assert "trading_mode" in data
    assert "symbol" in data

    # Live stop endpoint
    res_stop = client.post("/api/live/stop")
    assert res_stop.status_code == 200
    assert res_stop.json()["running"] is False


def test_strategies_endpoint(client):
    res = client.get("/api/strategies")
    assert res.status_code == 200
    data = res.json()
    assert "strategies" in data
    assert len(data["strategies"]) == 4
    strategy_ids = [s["id"] for s in data["strategies"]]
    assert "XAU_LIQUIDITY_SWEEP" in strategy_ids
    assert "XAU_TREND_PULLBACK" in strategy_ids
    assert "XAU_SESSION_BREAKOUT" in strategy_ids
    assert "XAU_MEAN_REVERSION" in strategy_ids
    assert "ai_fusion_engine" in data


def test_verify_partner_endpoint(client):
    # Valid JustMarkets account ID
    res = client.post("/api/account/verify-partner", json={"account_id": "1200533810"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["account_id"] == "1200533810"
    assert data["status"] == "VERIFIED"

    # Invalid short or non-numeric ID
    res_bad = client.post("/api/account/verify-partner", json={"account_id": "12"})
    assert res_bad.status_code == 200
    assert res_bad.json()["success"] is False


def test_user_registration_and_admin_endpoints(client):
    # Register with valid referral code
    reg_res = client.post("/api/users/register", json={
        "full_name": "Marcus Aurelius",
        "email": "marcus.aurelius@velarion.io",
        "justmarkets_account_id": "88112233",
        "referral_code": "p4cui0wkfz",
        "server": "JustMarkets-Demo3"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    assert reg_data["is_referral_verified"] is True
    assert reg_data["user"]["justmarkets_account_id"] == "88112233"

    # Profile me endpoint
    me_res = client.get("/api/users/me?account_id=88112233")
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["success"] is True
    assert me_data["user"]["full_name"] == "Marcus Aurelius"

    # Admin users list endpoint
    admin_res = client.get("/api/admin/users")
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["success"] is True
    assert admin_data["total_users"] >= 1
    assert admin_data["verified_users"] >= 1

    # Register with wrong referral code -> unverified
    bad_ref_res = client.post("/api/users/register", json={
        "full_name": "Unverified Trader",
        "email": "unverified@nowhere.com",
        "justmarkets_account_id": "999888777",
        "referral_code": "wrong_code_123",
        "server": "JustMarkets-Demo3"
    })
    assert bad_ref_res.status_code == 200
    bad_data = bad_ref_res.json()
    assert bad_data["is_referral_verified"] is False
    assert bad_data["user"]["status"] == "UNVERIFIED_PENDING_REFERRAL"


def test_justmarkets_login_and_gating(client):
    # 1. Login with demo account #1200533810 (recommended partner code) -> SUCCESS
    login_ok = client.post("/api/auth/login", json={
        "justmarkets_account_id": "1200533810",
        "email": "alex.vance@velarion.io",
        "server": "JustMarkets-Demo3"
    })
    assert login_ok.status_code == 200
    data_ok = login_ok.json()
    assert data_ok["success"] is True
    assert "token" in data_ok
    assert data_ok["user"]["is_referral_verified"] == 1

    # 2. Login with unverified account #999888777 (wrong referral code) -> STRICT DENIAL
    login_bad = client.post("/api/auth/login", json={
        "justmarkets_account_id": "999888777",
        "email": "unverified@nowhere.com",
        "server": "JustMarkets-Demo3"
    })
    assert login_bad.status_code == 200
    data_bad = login_bad.json()
    assert data_bad["success"] is False
    assert data_bad["error"] == "ACCESS_DENIED_NOT_RECOMMENDED_PARTNER"
    assert "ACCESS DENIED" in data_bad["message"]

    # 3. Login with non-existent account -> ACCOUNT_NOT_FOUND
    login_none = client.post("/api/auth/login", json={
        "justmarkets_account_id": "404404404",
        "email": "nonexistent@nowhere.com",
        "server": "JustMarkets-Demo3"
    })
    assert login_none.status_code == 200
    data_none = login_none.json()
    assert data_none["success"] is False
    assert data_none["error"] == "ACCOUNT_NOT_FOUND"

    # 4. Check session endpoint
    sess_ok = client.get("/api/auth/session?account_id=1200533810")
    assert sess_ok.status_code == 200
    assert sess_ok.json()["access_granted"] is True

    sess_bad = client.get("/api/auth/session?account_id=999888777")
    assert sess_bad.status_code == 200
    assert sess_bad.json()["access_granted"] is False


def test_partner_config_and_kick_user(client):
    try:
        # 1. Reset/Get initial partner config
        client.post("/api/partner/config", json={
            "referral_code": "p4cui0wkfz",
            "referral_link": "https://one.justmarkets.link/a/p4cui0wkfz"
        })
        cfg_res = client.get("/api/partner/config")
        assert cfg_res.status_code == 200
        initial_code = cfg_res.json()["referral_code"]
        assert initial_code == "p4cui0wkfz"

        # 2. Update partner config
        update_res = client.post("/api/partner/config", json={
            "referral_code": "partner_vip_2026",
            "referral_link": "https://one.justmarkets.link/a/partner_vip_2026"
        })
        assert update_res.status_code == 200
        assert update_res.json()["success"] is True
        assert update_res.json()["config"]["referral_code"] == "partner_vip_2026"

        # 3. Register user with new code -> Verified
        reg_res = client.post("/api/users/register", json={
            "full_name": "VIP Trader",
            "email": "vip.trader@goldfx.io",
            "justmarkets_account_id": "77889900",
            "referral_code": "partner_vip_2026"
        })
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert reg_data["is_referral_verified"] is True
        user_id = reg_data["user"]["user_id"]

        # 4. Kick the user out for inactivity
        kick_res = client.post(f"/api/admin/users/{user_id}/kick", json={
            "reason": "Inactive - zero trades executed"
        })
        assert kick_res.status_code == 200
        assert kick_res.json()["status"] == "KICKED_INACTIVE"

        # 5. Try login with kicked account -> STRICT ACCESS DENIAL
        login_kicked = client.post("/api/auth/login", json={
            "justmarkets_account_id": "77889900",
            "email": "vip.trader@goldfx.io"
        })
        assert login_kicked.status_code == 200
        assert login_kicked.json()["success"] is False
        assert "ACCESS DENIED" in login_kicked.json()["message"]

        # 6. Reactivate user
        react_res = client.post(f"/api/admin/users/{user_id}/reactivate")
        assert react_res.status_code == 200
        assert react_res.json()["status"] == "ACTIVE_VERIFIED"
    finally:
        # Restore default partner code and clean up test records
        client.post("/api/partner/config", json={
            "primary_code": "tohstb0d83",
            "primary_link": "https://one.justmarkets.link/a/tohstb0d83",
            "primary_limit": 10,
            "secondary_code": "p4cui0wkfz",
            "secondary_link": "https://one.justmarkets.link/a/p4cui0wkfz"
        })
        from api.app import db
        with db.get_connection() as conn:
            conn.execute("DELETE FROM users WHERE email IN ('marcus.aurelius@velarion.io', 'unverified@nowhere.com', 'vip.trader@goldfx.io', 'carlos.mendez@tradecorp.io') OR justmarkets_account_id IN ('88112233', '999888777', '77889900')")
            conn.commit()


def test_partner_drip_down_routing(client):
    from api.app import db
    try:
        # Reset to base primary and secondary config with 2 limit for test
        client.post("/api/partner/config", json={
            "primary_code": "tohstb0d83",
            "primary_link": "https://one.justmarkets.link/a/tohstb0d83",
            "primary_limit": 2,
            "secondary_code": "p4cui0wkfz",
            "secondary_link": "https://one.justmarkets.link/a/p4cui0wkfz"
        })

        cfg_res = client.get("/api/partner/config")
        assert cfg_res.status_code == 200
        cfg = cfg_res.json()
        assert cfg["primary_code"] == "tohstb0d83"
        assert cfg["primary_link"] == "https://one.justmarkets.link/a/tohstb0d83"
        assert cfg["secondary_code"] == "p4cui0wkfz"
        assert cfg["secondary_link"] == "https://one.justmarkets.link/a/p4cui0wkfz"
        assert cfg["is_drip_active"] is False
        assert cfg["active_code"] == "tohstb0d83"
        assert cfg["active_link"] == "https://one.justmarkets.link/a/tohstb0d83"

        # Register trader 1 under primary code
        r1 = client.post("/api/users/register", json={
            "full_name": "Primary Trader 1",
            "email": "primary1@goldfx.io",
            "justmarkets_account_id": "1110001",
            "referral_code": "tohstb0d83"
        })
        assert r1.json()["success"] is True
        assert r1.json()["is_referral_verified"] is True

        # Register trader 2 under primary code (reaches limit of 2)
        r2 = client.post("/api/users/register", json={
            "full_name": "Primary Trader 2",
            "email": "primary2@goldfx.io",
            "justmarkets_account_id": "1110002",
            "referral_code": "tohstb0d83"
        })
        assert r2.json()["success"] is True
        assert r2.json()["is_referral_verified"] is True

        # Check drip status now: should be active and routed to secondary link
        cfg_res2 = client.get("/api/partner/config")
        cfg2 = cfg_res2.json()
        assert cfg2["primary_count"] == 2
        assert cfg2["is_drip_active"] is True
        assert cfg2["active_tier"] == "secondary"
        assert cfg2["active_code"] == "p4cui0wkfz"
        assert cfg2["active_link"] == "https://one.justmarkets.link/a/p4cui0wkfz"

        # New user registering without explicit code drips down to secondary
        r3 = client.post("/api/users/register", json={
            "full_name": "Drip Overflow Trader",
            "email": "drip.trader@goldfx.io",
            "justmarkets_account_id": "1110003"
        })
        assert r3.json()["success"] is True
        assert r3.json()["is_referral_verified"] is True
        assert r3.json()["user"]["referral_code"] == "p4cui0wkfz"

        # Both primary and secondary traders can log in successfully
        login_p = client.post("/api/auth/login", json={
            "justmarkets_account_id": "1110001",
            "email": "primary1@goldfx.io"
        })
        assert login_p.json()["success"] is True

        login_s = client.post("/api/auth/login", json={
            "justmarkets_account_id": "1110003",
            "email": "drip.trader@goldfx.io"
        })
        assert login_s.json()["success"] is True

    finally:
        # Restore default partner config (10 limit) and clean up
        client.post("/api/partner/config", json={
            "primary_code": "tohstb0d83",
            "primary_link": "https://one.justmarkets.link/a/tohstb0d83",
            "primary_limit": 10,
            "secondary_code": "p4cui0wkfz",
            "secondary_link": "https://one.justmarkets.link/a/p4cui0wkfz"
        })
        with db.get_connection() as conn:
            conn.execute("DELETE FROM users WHERE justmarkets_account_id IN ('1110001', '1110002', '1110003')")
            conn.commit()


def test_market_quote_live_updating(client):
    res1 = client.get("/api/market/quote")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["symbol"] == "XAUUSD"
    assert d1["broker"] == "JustMarkets MT5"
    assert "current_price" in d1
    assert "bid" in d1
    assert "ask" in d1
    assert "timestamp" in d1
    assert d1["ask"] >= d1["bid"]
    assert d1["spread_points"] > 0

    res2 = client.get("/api/market/quote")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["symbol"] == "XAUUSD"
    assert "current_price" in d2


def test_market_ticks_endpoint(client):
    res = client.get("/api/market/ticks")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["symbol"] == "XAUUSD"
    assert len(data["ticks"]) > 0
    t = data["ticks"][0]
    assert "price" in t
    assert "bid" in t
    assert "ask" in t
    assert "timestamp" in t
    assert "time_ms" in t










