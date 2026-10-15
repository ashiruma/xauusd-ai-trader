"""
Shared fixtures and opaque-box test fakes for E2E testing suite.
Provides faithful mocks for MetaTrader 5 terminal and Google Gemini AI provider
to ensure 100% reliable, offline, and deterministic test execution.
"""

from datetime import datetime, timezone, timedelta
import json
from types import SimpleNamespace
from typing import Dict, Any, List, Optional
import numpy as np
import pytest
import httpx
from fastapi.testclient import TestClient

from config.settings import settings, TradingMode, DataMode, MarketRegimeType, SessionName, OrderSide
from data.models import Tick, Candle, TimeFrame, MarketState, CandidateSetup, FusedSignal
from data.feed import MarketDataEngine
from service import TradingCoordinator
from ai.provider import AIProvider
from risk.risk_engine import RiskEngine
from api.app import app
from data.storage import DatabaseStorage


class FakeMT5Terminal:
    """
    Opaque-box fake MetaTrader 5 terminal environment for deterministic E2E testing.
    Replicates build 6230 terminal behavior, tick streaming, order sending,
    filling modes, trade permissions, and position tracking.
    """
    TRADE_RETCODE_DONE = 10009
    ORDER_TYPE_BUY = 0
    ORDER_TYPE_SELL = 1
    ORDER_TIME_GTC = 0
    ORDER_FILLING_FOK = 0
    ORDER_FILLING_IOC = 1
    ORDER_FILLING_RETURN = 2
    TRADE_ACTION_DEAL = 1
    TRADE_ACTION_SLTP = 6
    TIMEFRAME_M15 = 15

    def __init__(
        self,
        connected: bool = True,
        trade_allowed: bool = True,
        balance: float = 50.0,
        equity: float = 50.0,
        margin_free: float = 50.0,
        bid: float = 4162.20,
        ask: float = 4162.45,
        filling_mode: int = 1,  # 1 = FOK, 2 = IOC
        symbol: str = "XAUUSD.m"
    ):
        self.connected = connected
        self.trade_allowed = trade_allowed
        self.balance = balance
        self.equity = equity
        self.margin_free = margin_free
        self.bid = bid
        self.ask = ask
        self.filling_mode = filling_mode
        self.symbol = symbol
        self.next_ticket = 200001
        self.orders: List[Dict[str, Any]] = []
        self.positions: Dict[int, SimpleNamespace] = {}
        self.order_retcode = self.TRADE_RETCODE_DONE
        self.last_error_tuple = (1, "Success")
        self.initialized = True

    def initialize(self, **kwargs) -> bool:
        return self.connected

    def shutdown(self) -> None:
        pass

    def last_error(self):
        return self.last_error_tuple

    def terminal_info(self):
        if not self.connected:
            return None
        return SimpleNamespace(
            connected=self.connected,
            trade_allowed=self.trade_allowed,
            build=6230,
            name="MetaTrader 5",
            company="JustMarkets",
            path="C:\\Program Files\\MetaTrader 5"
        )

    def symbol_info(self, symbol: str):
        if not self.connected:
            return None
        return SimpleNamespace(
            name=symbol,
            visible=True,
            filling_mode=self.filling_mode,
            point=0.01,
            trade_tick_size=0.01,
            spread=int(round((self.ask - self.bid) * 100))
        )

    def symbol_select(self, symbol: str, enable: bool) -> bool:
        return True

    def symbols_get(self):
        return [SimpleNamespace(name=self.symbol)]

    def symbol_info_tick(self, symbol: str):
        if not self.connected:
            return None
        return SimpleNamespace(
            time=int(datetime.now(timezone.utc).timestamp()),
            bid=self.bid,
            ask=self.ask,
            last=self.bid,
            volume=10,
            time_msc=int(datetime.now(timezone.utc).timestamp() * 1000),
            flags=96
        )

    def account_info(self):
        if not self.connected:
            return None
        return SimpleNamespace(
            balance=self.balance,
            equity=self.equity,
            margin_free=self.margin_free
        )

    def order_send(self, request: Dict[str, Any]):
        self.orders.append(request)
        if self.order_retcode != self.TRADE_RETCODE_DONE:
            return SimpleNamespace(
                retcode=self.order_retcode,
                order=0,
                price=0.0,
                profit=0.0
            )

        action = request.get("action", self.TRADE_ACTION_DEAL)
        if action == self.TRADE_ACTION_SLTP:
            ticket = request.get("position")
            if ticket in self.positions:
                pos = self.positions[ticket]
                pos.sl = request.get("sl", pos.sl)
                pos.tp = request.get("tp", pos.tp)
                return SimpleNamespace(retcode=self.TRADE_RETCODE_DONE, order=ticket, price=pos.price_current, profit=pos.profit)
            return SimpleNamespace(retcode=10013, order=0, price=0.0, profit=0.0)

        # DEAL action
        req_pos = request.get("position")
        if req_pos is not None:
            # Closing position
            ticket = req_pos
            if ticket in self.positions:
                pos = self.positions.pop(ticket)
                exit_price = request.get("price", self.bid)
                profit = (exit_price - pos.price_open) * 100.0 * pos.volume if pos.type == self.ORDER_TYPE_BUY else (pos.price_open - exit_price) * 100.0 * pos.volume
                self.balance += profit
                self.equity += profit
                return SimpleNamespace(retcode=self.TRADE_RETCODE_DONE, order=ticket, price=exit_price, profit=profit)
            return SimpleNamespace(retcode=10013, order=0, price=0.0, profit=0.0)

        # Opening new position
        ticket = self.next_ticket
        self.next_ticket += 1
        price = request.get("price", self.bid)
        side_type = request.get("type", self.ORDER_TYPE_BUY)
        pos = SimpleNamespace(
            ticket=ticket,
            symbol=request.get("symbol", self.symbol),
            type=side_type,
            volume=float(request.get("volume", 0.01)),
            price_open=float(price),
            price_current=float(price),
            sl=float(request.get("sl", 0.0)),
            tp=float(request.get("tp", 0.0)),
            profit=0.0,
            magic=request.get("magic", 108824),
            time=int(datetime.now(timezone.utc).timestamp()),
            comment=request.get("comment", "")
        )
        self.positions[ticket] = pos
        return SimpleNamespace(
            retcode=self.TRADE_RETCODE_DONE,
            order=ticket,
            price=price,
            profit=0.0
        )

    def positions_get(self, symbol: Optional[str] = None, ticket: Optional[int] = None):
        if not self.connected:
            return None
        res = list(self.positions.values())
        if ticket is not None:
            res = [p for p in res if p.ticket == ticket]
        if symbol is not None:
            res = [p for p in res if p.symbol == symbol]
        return res

    def copy_rates_from_pos(self, symbol: str, timeframe: int, start_pos: int, count: int):
        now = datetime.now(timezone.utc)
        dtype = [
            ('time', '<i8'),
            ('open', '<f8'),
            ('high', '<f8'),
            ('low', '<f8'),
            ('close', '<f8'),
            ('tick_volume', '<i8'),
            ('spread', '<i4'),
            ('real_volume', '<i8')
        ]
        rates = []
        base = 4160.0
        for i in range(count):
            t = int((now - timedelta(minutes=15 * (count - i))).timestamp())
            o = base + (i * 0.05)
            h = o + 1.2
            l = o - 0.8
            c = o + 0.3
            rates.append((t, o, h, l, c, 500 + i, 25, 0))
        return np.array(rates, dtype=dtype)


class FakeGeminiProvider(AIProvider):
    """
    Faithful fake for Google Gemini AI provider supporting all operational modes:
    - Normal BUY / SELL structured confirmation
    - Neutral / NO_TRADE decision
    - Rate limit (HTTP 429) simulation
    - Service timeout / network failure
    - Corrupt or malformed JSON payloads
    """
    def __init__(self, mode: str = "BUY_CONFIRM"):
        self.mode = mode
        self.calls: List[Dict[str, Any]] = []

    def set_mode(self, mode: str) -> None:
        self.mode = mode

    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        self.calls.append({"system_prompt": system_prompt, "user_payload": user_payload})

        if self.mode == "RATE_LIMIT_429":
            req = httpx.Request("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent")
            resp = httpx.Response(429, request=req, content=b'{"error": {"code": 429, "message": "Resource has been exhausted"}}')
            raise httpx.HTTPStatusError("429 Too Many Requests", request=req, response=resp)

        if self.mode == "TIMEOUT":
            raise httpx.TimeoutException("Gemini API connection timed out")

        if self.mode == "NETWORK_ERROR":
            raise httpx.ConnectError("Failed to resolve generativelanguage.googleapis.com")

        if self.mode == "MALFORMED_JSON":
            return "```json\n{ \"decision\": \"BUY\", broken_json: [invalid"

        setup = user_payload.get("candidate_setup") or {}
        side = setup.get("side", "BUY")
        entry = setup.get("entry", 4162.20)
        sl = setup.get("stop_loss", 4157.20)
        tp = setup.get("take_profit", 4172.20)
        rr = setup.get("risk_reward", 2.0)
        strat_id = setup.get("strategy_id", "XAU_TREND_PULLBACK")

        if self.mode == "SELL_CONFIRM":
            return json.dumps({
                "decision": "SELL",
                "confidence": 0.86,
                "setup_valid": True,
                "entry": entry,
                "stop_loss": sl if sl > entry else entry + 5.0,
                "take_profit": tp if tp < entry else entry - 10.0,
                "risk_reward": rr,
                "market_regime": user_payload.get("market_regime", "TREND_DOWN"),
                "strategy_id": strat_id,
                "reasons": ["Bearish order flow confirmed by Gemini AI macro analysis"],
                "invalidation": "Breach of swing high",
                "signal_expiry": setup.get("expiry", "")
            })

        if self.mode == "NO_TRADE":
            return json.dumps({
                "decision": "NO_TRADE",
                "confidence": 0.30,
                "setup_valid": False,
                "entry": entry,
                "stop_loss": sl,
                "take_profit": tp,
                "risk_reward": rr,
                "market_regime": user_payload.get("market_regime", "UNCERTAIN"),
                "strategy_id": strat_id,
                "reasons": ["Macro uncertainty and adverse consolidation"],
                "invalidation": "N/A",
                "signal_expiry": setup.get("expiry", "")
            })

        # Default: BUY_CONFIRM
        return json.dumps({
            "decision": "BUY",
            "confidence": 0.88,
            "setup_valid": True,
            "entry": entry,
            "stop_loss": sl,
            "take_profit": tp,
            "risk_reward": rr,
            "market_regime": user_payload.get("market_regime", "TREND_UP"),
            "strategy_id": strat_id,
            "reasons": [
                "Bullish macro liquidity structure confirmed by Gemini AI",
                "High probability continuation setup at spot gold $4,162+"
            ],
            "invalidation": f"Price breach below {sl}",
            "signal_expiry": setup.get("expiry", "")
        })


@pytest.fixture
def fake_mt5(monkeypatch):
    """Patch execution/mt5_adapter and execution/live_trader with FakeMT5Terminal."""
    terminal = FakeMT5Terminal(
        connected=True,
        trade_allowed=True,
        balance=50.0,
        equity=50.0,
        margin_free=50.0,
        bid=4162.20,
        ask=4162.45
    )
    import execution.mt5_adapter as mt5_mod
    import execution.live_trader as live_mod

    monkeypatch.setattr(mt5_mod, "mt5", terminal)
    monkeypatch.setattr(mt5_mod, "MT5_AVAILABLE", True)
    monkeypatch.setattr(live_mod, "mt5", terminal)
    monkeypatch.setattr(live_mod, "MT5_AVAILABLE", True)
    return terminal


@pytest.fixture
def fake_gemini():
    return FakeGeminiProvider(mode="BUY_CONFIRM")


@pytest.fixture
def isolated_db(tmp_path, monkeypatch):
    """Creates a clean isolated SQLite database per test."""
    test_db_path = str(tmp_path / "xauusd_test_e2e.db")
    test_storage = DatabaseStorage(db_path=test_db_path)
    import data.storage as storage_mod
    import service as service_mod
    import api.app as app_mod
    import fusion.signal_fusion as fusion_mod
    import risk.risk_engine as risk_mod
    import ai.analyst as analyst_mod
    import execution.mt5_adapter as mt5_adapter_mod

    monkeypatch.setattr(storage_mod, "db", test_storage)
    monkeypatch.setattr(service_mod, "db", test_storage)
    monkeypatch.setattr(app_mod, "db", test_storage)
    monkeypatch.setattr(fusion_mod, "db", test_storage)
    monkeypatch.setattr(risk_mod, "db", test_storage)
    monkeypatch.setattr(analyst_mod, "db", test_storage)
    monkeypatch.setattr(mt5_adapter_mod, "db", test_storage)
    return test_storage


@pytest.fixture
def client(isolated_db):
    """FastAPI TestClient with isolated test database."""
    return TestClient(app)


@pytest.fixture
def prime_market_feed():
    """Helper to populate a MarketDataEngine with realistic $4,162+ M15 candles."""
    def _prime(feed_engine: MarketDataEngine, count: int = 200, base_price: float = 4160.0):
        now = datetime.now(timezone.utc)
        candles = []
        for i in range(count):
            t = now - timedelta(minutes=15 * (count - i))
            o = round(base_price + (i * 0.03), 2)
            h = round(o + 1.20, 2)
            l = round(o - 0.70, 2)
            c = round(o + 0.25, 2)
            candles.append(Candle(
                symbol="XAUUSD",
                timeframe=TimeFrame.M15,
                timestamp=t,
                open=o,
                high=h,
                low=l,
                close=c,
                volume=100.0 + i
            ))
        feed_engine.load_historical_candles(TimeFrame.M15, candles)
        return candles
    return _prime
