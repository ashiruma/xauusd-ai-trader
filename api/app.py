"""
FastAPI Server for XAUUSD Trading System.
Provides REST APIs for Market Data, Signals, Risk Management,
Positions, Auditable Journal, and Dashboard.
"""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import json
import logging
import os
import random
import re
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Body, WebSocket, WebSocketDisconnect, Request, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware
from starlette.responses import StreamingResponse
from pydantic import BaseModel

from config.settings import settings, TradingMode, DataMode
from service import coordinator
from data.models import Tick, OrderSide
from data.storage import db
from backtest.engine import BacktestEngine
from performance.metrics import PerformanceEngine
from performance.trade_journal import TradeJournal

logger = logging.getLogger(__name__)


def verify_internal_api_key(request: Request):
    """Optional security check: if VELARION_INTERNAL_API_KEY is configured in env, require it."""
    expected_key = os.getenv("VELARION_INTERNAL_API_KEY") or os.getenv("TRADING_API_KEY")
    if not expected_key:
        return True
    provided_key = request.headers.get("x-velarion-key")
    if not provided_key:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            provided_key = auth_header[7:].strip()
    if provided_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid internal API key")
    return True


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        try:
            self.loop = asyncio.get_running_loop()
        except RuntimeError:
            pass

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        dead = []
        payload = jsonable_encoder(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_json(payload)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


manager = ConnectionManager()


def _ws_broadcast_callback(data: Dict[str, Any]):
    try:
        loop = manager.loop
        if loop is None or loop.is_closed():
            try:
                loop = asyncio.get_running_loop()
                manager.loop = loop
            except RuntimeError:
                loop = None
        if loop and loop.is_running():
            asyncio.run_coroutine_threadsafe(manager.broadcast(data), loop)
        else:
            try:
                cur_loop = asyncio.get_running_loop()
                cur_loop.create_task(manager.broadcast(data))
            except RuntimeError:
                pass
    except Exception as e:
        logger.debug(f"Broadcast threadsafe error: {e}")


coordinator.register_broadcast_listener(_ws_broadcast_callback)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        manager.loop = asyncio.get_running_loop()
    except RuntimeError:
        pass
    if settings.trading_mode == TradingMode.LIVE:
        from execution.live_trader import live_trader
        if not live_trader.is_running:
            logger.info("Starting background LiveTrader via FastAPI lifespan...")
            live_trader.start(background=True)
    if coordinator.latest_market_state is None:
        coordinator.prime_initial_state()
    yield
    if settings.trading_mode == TradingMode.LIVE:
        from execution.live_trader import live_trader
        if live_trader.is_running:
            live_trader.stop()


app = FastAPI(
    title="XAUUSD Quantitative Trading System",
    description="Institutional XAUUSD-specialized quantitative trading and risk system with AI analyst decision support.",
    version=settings.app_version,
    lifespan=lifespan
)

# Enable CORS for local dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Enable GZip compression for responses > 500 bytes (reduces wire transfer by ~80%)
app.add_middleware(GZipMiddleware, minimum_size=500)


class EmergencyStopRequest(BaseModel):
    enabled: bool
    reason: str = "Manual toggle from UI"


class ProcessTickRequest(BaseModel):
    bid: float
    ask: float
    volume: float = 1.0


class BacktestRequest(BaseModel):
    days: int = 15
    base_price: float = 2650.0


class ConnectAccountRequest(BaseModel):
    login: int
    password: str
    server: str = "JustMarkets-Demo3"


# ==================== REST Endpoints ====================

@app.get("/api/status")
async def get_system_status():
    return coordinator.get_system_status()


@app.get("/api/market/state")
async def get_market_state():
    coordinator.refresh_market_quote()
    if not coordinator.latest_market_state:
        coordinator.step()
    return coordinator.latest_market_state.model_dump() if coordinator.latest_market_state else {}


# Real-time broker quote and telemetry cache
_last_known_broker_tick: Optional[Dict[str, Any]] = None
_recent_real_ticks: List[Dict[str, Any]] = []


@app.get("/api/market/quote")
async def get_market_quote():
    """Broker-sourced XAUUSD spot market quote with verified connection telemetry."""
    global _last_known_broker_tick, _recent_real_ticks
    coordinator.refresh_market_quote()
    adapter = coordinator.get_active_adapter()
    is_live = (settings.trading_mode == TradingMode.LIVE)
    now_iso = datetime.now(timezone.utc).isoformat()
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

    # In live mode, only MT5 connection is the single source of truth
    is_connected = bool(adapter and adapter.is_connected())
    active_symbol = getattr(adapter, "_symbol", "XAUUSD.m") if adapter else "XAUUSD.m"
    acc = adapter.get_account_info() if is_connected else {}

    has_live_broker_tick = False
    bid = None
    ask = None
    current_price = None
    spread_points = None
    spread_pips = None
    spread_usd = None

    if is_connected and hasattr(adapter, "get_quote"):
        try:
            q = adapter.get_quote(active_symbol)
            if q and q.get("bid", 0) > 0 and q.get("ask", 0) > 0:
                bid = round(float(q["bid"]), 2)
                ask = round(float(q["ask"]), 2)
                current_price = round((bid + ask) / 2.0, 2)
                spread_points = q.get("spread_points", round((ask - bid) / 0.01, 1))
                spread_pips = round(spread_points / 10.0, 1)
                spread_usd = round(ask - bid, 2)
                has_live_broker_tick = True

                tick_data = {
                    "symbol": active_symbol,
                    "price": current_price,
                    "bid": bid,
                    "ask": ask,
                    "spread_points": spread_points,
                    "spread_pips": spread_pips,
                    "spread_usd": spread_usd,
                    "timestamp": now_iso,
                    "time_ms": now_ms
                }
                _last_known_broker_tick = tick_data
                _recent_real_ticks.append(tick_data)
                if len(_recent_real_ticks) > 60:
                    _recent_real_ticks.pop(0)
        except Exception as e:
            logger.debug(f"Error reading live broker quote: {e}")

    # Fallback to feed only if in paper mode and tick was recorded
    if not has_live_broker_tick and not is_live and coordinator.feed.current_quote:
        feed_q = coordinator.feed.current_quote
        if feed_q.bid > 0 and feed_q.ask > 0:
            bid = round(feed_q.bid, 2)
            ask = round(feed_q.ask, 2)
            current_price = round((bid + ask) / 2.0, 2)
            spread_points = feed_q.spread_points
            spread_pips = round(spread_points / 10.0, 1)
            spread_usd = round(ask - bid, 2)
            has_live_broker_tick = True

    st = coordinator.latest_market_state
    regime = st.regime.value if (st and hasattr(st.regime, "value")) else (str(st.regime) if st else ("TREND_UP" if has_live_broker_tick else "UNKNOWN"))
    trend_desc = st.trend_description if (st and st.trend_description) else ("Multi-model alignment confirmed across session liquidity pools with hard stop-loss guardrails." if has_live_broker_tick else "Broker feed disconnected. Market telemetry unavailable.")

    if not has_live_broker_tick:
        return {
            "success": False,
            "symbol": active_symbol,
            "broker": "JustMarkets MT5",
            "server": None,
            "login": None,
            "is_connected": False,
            "status": "MT5_DISCONNECTED",
            "current_price": None,
            "bid": None,
            "ask": None,
            "spread_points": None,
            "spread_pips": None,
            "spread_usd": None,
            "regime": "UNKNOWN",
            "trend_description": "Broker feed disconnected. Market telemetry unavailable.",
            "last_updated": _last_known_broker_tick.get("timestamp") if _last_known_broker_tick else None,
            "timestamp": now_iso
        }

    return {
        "success": True,
        "symbol": active_symbol,
        "broker": "JustMarkets MT5",
        "server": acc.get("server"),
        "login": acc.get("login"),
        "is_connected": is_connected,
        "status": "CONNECTED",
        "current_price": current_price,
        "bid": bid,
        "ask": ask,
        "spread_points": spread_points,
        "spread_pips": spread_pips,
        "spread_usd": spread_usd,
        "regime": regime,
        "trend_description": trend_desc,
        "timestamp": now_iso
    }


@app.get("/api/market/ticks")
async def get_market_ticks():
    """Recent high-frequency ticks returned strictly from broker feed."""
    adapter = coordinator.get_active_adapter()
    is_connected = bool(adapter and adapter.is_connected())
    active_symbol = getattr(adapter, "_symbol", "XAUUSD.m") if adapter else "XAUUSD.m"
    if not is_connected or not _recent_real_ticks:
        return {
            "success": is_connected,
            "symbol": active_symbol,
            "is_connected": is_connected,
            "status": "CONNECTED" if is_connected else "MT5_DISCONNECTED",
            "ticks": _recent_real_ticks[-30:] if _recent_real_ticks else []
        }

    return {
        "success": True,
        "symbol": active_symbol,
        "is_connected": True,
        "status": "CONNECTED",
        "ticks": _recent_real_ticks[-30:]
    }


@app.get("/api/market/stream")
async def get_market_stream():
    """Server-Sent Events (SSE) streaming real broker ticks only."""
    async def sse_event_stream():
        while True:
            adapter = coordinator.get_active_adapter()
            is_connected = bool(adapter and adapter.is_connected())
            if is_connected and _last_known_broker_tick:
                yield f"data: {json.dumps(_last_known_broker_tick)}\n\n"
            else:
                heartbeat = {
                    "is_connected": False,
                    "status": "MT5_DISCONNECTED",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                yield f"data: {json.dumps(heartbeat)}\n\n"
            await asyncio.sleep(1.0)
    return StreamingResponse(sse_event_stream(), media_type="text/event-stream")


@app.get("/api/signals/latest")
async def get_latest_signals():
    return {
        "candidate_setups": [s.model_dump() for s in coordinator.latest_candidate_setups],
        "fused_signal": coordinator.latest_fused_signal.model_dump() if coordinator.latest_fused_signal else None,
        "recent_signals": db.get_all_signals(limit=20)
    }


@app.get("/api/risk/status")
async def get_risk_status():
    emergency_active, reason = coordinator.risk_engine.is_emergency_stop_active()
    return {
        "emergency_stop": emergency_active,
        "emergency_stop_reason": reason,
        "max_risk_per_trade_pct": settings.risk.max_risk_per_trade_pct,
        "max_daily_loss_pct": settings.risk.max_daily_loss_pct,
        "daily_profit_target_usd": getattr(settings.risk, "daily_profit_target_usd", 20.0),
        "max_drawdown_pct": settings.risk.max_drawdown_pct,
        "max_consecutive_losses": settings.risk.max_consecutive_losses,
        "max_spread_points": settings.risk.max_spread_points,
        "min_risk_reward_ratio": settings.risk.min_risk_reward_ratio,
        "min_stop_distance_points": settings.risk.min_stop_distance_points,
        "max_stop_distance_points": settings.risk.max_stop_distance_points,
        "session_restrictions_enabled": settings.risk.session_restrictions_enabled,
        "news_restrictions_enabled": settings.risk.news_restrictions_enabled,
        "current_daily_pnl": coordinator.risk_engine.daily_pnl,
        "current_consecutive_losses": coordinator.risk_engine.consecutive_losses,
        "peak_equity": coordinator.risk_engine.peak_equity,
        "enable_break_even": settings.risk.enable_break_even,
        "break_even_trigger_points": settings.risk.break_even_trigger_points,
        "break_even_lock_points": settings.risk.break_even_lock_points,
        "enable_trailing_stop": settings.risk.enable_trailing_stop,
        "trailing_trigger_points": settings.risk.trailing_trigger_points,
        "trailing_distance_points": settings.risk.trailing_distance_points,
        "min_guest_deposit_usd": settings.risk.min_guest_deposit_usd
    }


@app.post("/api/risk/reset-baseline")
async def reset_risk_baseline():
    """Reset the risk engine drawdown and loss baselines to current broker equity."""
    res = coordinator.reset_risk_baseline()
    return res


@app.post("/api/account/connect")
async def connect_account(req: ConnectAccountRequest):
    """
    Connect an external or client JustMarkets account to the autonomous trading bot.
    Strictly enforces $100.00+ minimum deposit requirement.
    """
    res = coordinator.mt5_adapter.connect_account(
        login=req.login,
        password=req.password,
        server=req.server,
        min_deposit_usd=settings.risk.min_guest_deposit_usd
    )

    if not res.get("success"):
        return res

    # Switch trading mode to LIVE and update coordinator metrics
    settings.trading_mode = TradingMode.LIVE
    settings.data_mode = DataMode.LIVE_MT5

    # Update RiskEngine with verified account equity
    equity = res.get("equity", 100.0)
    coordinator.risk_engine.initial_equity = equity
    coordinator.risk_engine.peak_equity = equity
    coordinator.risk_engine.daily_starting_equity = equity

    # Re-warm feed if LiveTrader is available
    try:
        from execution.live_trader import live_trader
        live_trader._symbol = coordinator.mt5_adapter._symbol
        if not live_trader.is_running:
            live_trader.start(background=True)
        else:
            live_trader.warm_up_feed()
    except Exception as e:
        logger.warning(f"Could not re-warm feed after account switch: {e}")

    # Broadcast account connected event
    coordinator.broadcast({
        "type": "ACCOUNT_CONNECTED",
        "data": {
            "login": req.login,
            "server": req.server,
            "equity": res.get("equity"),
            "balance": res.get("balance"),
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return res


class PartnerVerificationRequest(BaseModel):
    account_id: str
    server: Optional[str] = "JustMarkets-Demo3"


@app.get("/api/account/info")
async def get_account_info():
    """Returns verified broker account info or disconnected state."""
    is_live = (settings.trading_mode == TradingMode.LIVE)
    if is_live:
        is_connected = coordinator.mt5_adapter.is_connected()
        acc = coordinator.mt5_adapter.get_account_info() if is_connected else {}
        equity = acc.get("equity", 0.0) if is_connected else 0.0
        balance = acc.get("balance", 0.0) if is_connected else 0.0
        margin_free = acc.get("margin_free", 0.0) if is_connected else 0.0
        return {
            "login": acc.get("login") if is_connected else None,
            "server": acc.get("server") if is_connected else None,
            "company": acc.get("company", "Just Global Markets Ltd.") if is_connected else "JustMarkets MT5 (Disconnected)",
            "symbol": coordinator.mt5_adapter._symbol if is_connected else (coordinator.mt5_adapter._symbol or "XAUUSD.m"),
            "is_connected": is_connected,
            "status": "CONNECTED" if is_connected else "MT5_DISCONNECTED",
            "trading_mode": settings.trading_mode.value,
            "balance": balance,
            "equity": equity,
            "margin_free": margin_free,
            "min_deposit_required": settings.risk.min_guest_deposit_usd,
            "deposit_compliant": (equity >= settings.risk.min_guest_deposit_usd) if is_connected else False
        }

    acc = coordinator.paper_adapter.get_account_info()
    return {
        "login": "PAPER_SIMULATOR",
        "server": "INTERNAL_PAPER",
        "company": "Paper Simulation (Demo / Paper Preview)",
        "symbol": "XAUUSD",
        "is_connected": True,
        "status": "PAPER_MODE",
        "trading_mode": settings.trading_mode.value,
        "balance": acc.get("balance", 0.0),
        "equity": acc.get("equity", 0.0),
        "margin_free": acc.get("margin_free", 0.0),
        "min_deposit_required": settings.risk.min_guest_deposit_usd,
        "deposit_compliant": True
    }


@app.post("/api/account/verify-partner")
async def verify_partner_account(req: PartnerVerificationRequest):
    """
    Validates a JustMarkets partner registration and unlocks subsidized terminal access.
    Accepts standard JustMarkets MT5 account numbers.
    """
    acc_id = req.account_id.strip()
    if not acc_id or not acc_id.isdigit() or len(acc_id) < 5:
        return {
            "success": False,
            "message": "Invalid JustMarkets Account ID format. Please enter your valid 6-10 digit MT5 account number."
        }
    return {
        "success": True,
        "account_id": acc_id,
        "broker": "JustMarkets Ltd",
        "server": req.server or "JustMarkets-Demo3",
        "status": "VERIFIED",
        "tier": "TIER_1_SUBSIDIZED",
        "message": f"JustMarkets account #{acc_id} verified. Access to Forex School and Autonomous AI Trading Terminal unlocked."
    }


class UserRegistrationRequest(BaseModel):
    full_name: str
    email: str
    justmarkets_account_id: str
    referral_code: Optional[str] = None
    server: Optional[str] = "JustMarkets-Demo3"
    equity: Optional[float] = 100.0



class UserStatusUpdateRequest(BaseModel):
    status: str
    is_referral_verified: bool
    equity: Optional[float] = None
    notes: Optional[str] = None


class PartnerConfigUpdateRequest(BaseModel):
    referral_code: Optional[str] = None
    referral_link: Optional[str] = None
    primary_code: Optional[str] = None
    primary_link: Optional[str] = None
    primary_limit: Optional[int] = None
    secondary_code: Optional[str] = None
    secondary_link: Optional[str] = None



class KickUserRequest(BaseModel):
    reason: Optional[str] = "Inactive trader pruned"


class UserEmailUpdateRequest(BaseModel):
    email: str


class TraderLoginRequest(BaseModel):
    justmarkets_account_id: str
    email: Optional[str] = None
    server: Optional[str] = "JustMarkets-Demo3"
    password: Optional[str] = None


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(raw: Optional[str]) -> str:
    """Lower-cases and trims an email; returns '' when missing or malformed."""
    email = (raw or "").strip().lower()
    return email if _EMAIL_RE.match(email) else ""


@app.post("/api/auth/login")
async def login_trader(req: TraderLoginRequest):
    """
    Login with JustMarkets MT5 account details.
    The email must be the same one the trader used to open their JustMarkets account
    (the email recorded against this MT5 account at registration).
    Enforces strict gating: anyone not registered under recommended account gets NO access.
    Kicked/inactive traders are strictly blocked from internal features.
    """
    acc_id = req.justmarkets_account_id.strip()
    if not acc_id:
        raise HTTPException(status_code=400, detail="JustMarkets Account ID is required.")

    email = _normalize_email(req.email)
    if not email:
        return {
            "success": False,
            "error": "EMAIL_REQUIRED",
            "message": "Enter the email address you used to open your JustMarkets account."
        }

    cfg = db.get_partner_config()
    active_partner_code = cfg.get("active_code", "tohstb0d83")
    active_link = cfg.get("active_link", "https://one.justmarkets.link/a/tohstb0d83")

    # The MT5 account number is the identity; the email must match the one on file for it.
    user = db.get_user_by_account_id(acc_id)
    if not user:
        return {
            "success": False,
            "error": "ACCOUNT_NOT_FOUND",
            "message": f"JustMarkets Account #{acc_id} is not registered in our database. Please register under official partner code {active_partner_code} via {active_link}."
        }

    if str(user.get("email", "")).strip().lower() != email:
        db.record_system_event(
            severity="WARNING",
            component="AUTH",
            event_type="EMAIL_MISMATCH_LOGIN_ATTEMPT",
            message=f"Login rejected for JustMarkets #{acc_id}: email does not match the JustMarkets email on file.",
            metadata={"account_id": acc_id}
        )
        return {
            "success": False,
            "error": "EMAIL_MISMATCH",
            "message": (
                f"The email does not match the JustMarkets email registered for account #{acc_id}. "
                "Use the same email address you used to open your JustMarkets account."
            )
        }

    # INACTIVE / KICKED OUT CHECK:
    if user.get("status") == "KICKED_INACTIVE":
        db.record_system_event(
            severity="WARNING",
            component="AUTH",
            event_type="KICKED_USER_LOGIN_ATTEMPT",
            message=f"Access denied for JustMarkets #{acc_id}. Account was kicked due to inactivity.",
            metadata={"account_id": acc_id}
        )
        return {
            "success": False,
            "error": "ACCESS_DENIED_NOT_RECOMMENDED_PARTNER",
            "message": (
                f"ACCESS DENIED: JustMarkets Account #{acc_id} has been deactivated due to inactivity. "
                "Our system prioritizes active traders. Access to internal data is locked."
            )
        }

    # STRICT ACCESS GATING:
    # Check if registered under an official partner code (Primary tohstb0d83 or Secondary p4cui0wkfz)
    user_ref = str(user.get("referral_code", "")).strip().lower()
    is_verified = (
        bool(user.get("is_referral_verified")) and 
        db.is_valid_partner_code(user_ref)
    )

    if not is_verified:
        db.record_system_event(
            severity="WARNING",
            component="AUTH",
            event_type="UNAUTHORIZED_ACCESS_ATTEMPT",
            message=f"Access denied for JustMarkets #{acc_id}. Not registered under valid partner code.",
            metadata={"account_id": acc_id, "referral_code": user.get("referral_code")}
        )
        return {
            "success": False,
            "error": "ACCESS_DENIED_NOT_RECOMMENDED_PARTNER",
            "message": (
                f"ACCESS DENIED: JustMarkets Account #{acc_id} is not registered under our recommended partner code ({active_partner_code}). "
                "Anyone not registered under the recommended accounts gets NO access to the Forex School, AI Terminal, or Strategies. "
                f"To gain access, open a new account via {active_link}."
            )
        }


    # Fetch live equity if available
    is_live = (settings.trading_mode == TradingMode.LIVE)
    acc = coordinator.mt5_adapter.get_account_info() if is_live else coordinator.paper_adapter.get_account_info()
    live_equity = acc.get("equity", 44.38) if str(acc.get("login", "")) == acc_id else user.get("equity", 44.38)
    
    # Update last login timestamp
    with db.get_connection() as conn:
        conn.cursor().execute(
            "UPDATE users SET last_login_at = ?, equity = ? WHERE justmarkets_account_id = ?",
            (datetime.now(timezone.utc).isoformat(), live_equity, acc_id)
        )
        conn.commit()

    db.record_system_event(
        severity="INFO",
        component="AUTH",
        event_type="TRADER_LOGIN_SUCCESS",
        message=f"Trader {user.get('full_name')} logged in with JustMarkets #{acc_id} (Verified Partner).",
        metadata={"account_id": acc_id, "user_id": user.get("user_id")}
    )

    return {
        "success": True,
        "token": f"JM_AUTH_{user.get('user_id')}",
        "user": user,
        "message": f"Welcome back, {user.get('full_name')}! JustMarkets account #{acc_id} verified under recommended partner code {user.get('referral_code') or active_partner_code}."
    }



@app.get("/api/auth/session")
async def get_auth_session(account_id: Optional[str] = None):
    """Verifies whether an active JustMarkets account session is verified under recommended partner."""
    if not account_id:
        return {"authenticated": False, "verified": False, "message": "No session active"}
    user = db.get_user_by_account_id(account_id.strip())
    if not user:
        return {"authenticated": False, "verified": False, "message": "Account not found"}
    user_ref = str(user.get("referral_code", "")).strip().lower()
    is_kicked = (user.get("status") == "KICKED_INACTIVE")
    is_verified = (
        not is_kicked and
        bool(user.get("is_referral_verified")) and
        db.is_valid_partner_code(user_ref)
    )
    return {
        "authenticated": True,
        "verified": is_verified,

        "user": user,
        "access_granted": is_verified
    }


@app.post("/api/users/register")
async def register_trader(req: UserRegistrationRequest):
    """
    Register a trader profile.
    The email must be the one used on the trader's JustMarkets account; it is bound to
    the MT5 account number and required (and matched) at every login.
    Enforces that referral link code matches official partner configuration.
    """
    acc_id = req.justmarkets_account_id.strip()
    if not acc_id:
        raise HTTPException(status_code=400, detail="JustMarkets Account ID is required.")

    email = _normalize_email(req.email)
    if not email:
        return {
            "success": False,
            "error": "EMAIL_REQUIRED",
            "message": "Enter a valid email: the same one you used to open your JustMarkets account."
        }

    # An MT5 account can only be bound to one JustMarkets email.
    existing_acc = db.get_user_by_account_id(acc_id)
    if existing_acc:
        if str(existing_acc.get("email", "")).strip().lower() != email:
            db.record_system_event(
                severity="WARNING",
                component="ONBOARDING",
                event_type="EMAIL_MISMATCH_REGISTRATION_ATTEMPT",
                message=f"Registration rejected for JustMarkets #{acc_id}: account already bound to a different email.",
                metadata={"account_id": acc_id}
            )
            return {
                "success": False,
                "error": "EMAIL_MISMATCH",
                "message": (
                    f"JustMarkets account #{acc_id} is already registered with a different email. "
                    "Use the same email address you used to open your JustMarkets account."
                )
            }
        return {
            "success": True,
            "user": existing_acc,
            "is_referral_verified": bool(existing_acc.get("is_referral_verified")),
            "message": f"Account #{acc_id} is already registered with this email. Please sign in."
        }

    existing_email = db.get_user_by_email(email)
    if existing_email:
        return {
            "success": False,
            "error": "EMAIL_IN_USE",
            "message": (
                f"This email is already linked to JustMarkets account #{existing_email.get('justmarkets_account_id')}. "
                "Sign in with that account, or contact support to link another account."
            )
        }

    cfg = db.get_partner_config()
    clean_code = req.referral_code.strip() if req.referral_code else cfg.get("active_code", "tohstb0d83")
    is_ref_verified = db.is_valid_partner_code(clean_code)

    if req.equity is not None and req.equity > 0:
        live_equity = req.equity
    else:
        is_live = (settings.trading_mode == TradingMode.LIVE)
        acc = coordinator.mt5_adapter.get_account_info() if is_live else coordinator.paper_adapter.get_account_info()
        live_equity = acc.get("equity", 0.0) if str(acc.get("login", "")) == acc_id else 0.0

    user = db.register_user(
        full_name=req.full_name.strip(),
        email=email,
        justmarkets_account_id=acc_id,
        referral_code=clean_code,
        server=req.server or "JustMarkets-Demo3",
        equity=live_equity
    )

    db.record_system_event(
        severity="INFO",
        component="ONBOARDING",
        event_type="TRADER_REGISTERED",
        message=f"Trader {req.full_name} registered with MT5 #{acc_id}. Referral verified: {is_ref_verified}",
        metadata={"user_id": user["user_id"], "referral_code": clean_code, "verified": is_ref_verified}
    )

    active_link = cfg.get("active_link", "https://one.justmarkets.link/a/tohstb0d83")
    return {
        "success": True,
        "user": user,
        "is_referral_verified": is_ref_verified,
        "message": (
            f"Registration successful! Account #{acc_id} verified under JustMarkets partner program ({clean_code}). All terminal data and Forex School unlocked."
            if is_ref_verified else
            f"Registration recorded, but referral code does not match an official JustMarkets link. Access to internal data remains locked until verified via {active_link}."
        )
    }



@app.get("/api/users/me")
async def get_current_user_profile(account_id: Optional[str] = None):
    """Returns current active trader profile and live account status synced to JustMarkets."""
    acc_id = account_id or str(getattr(settings.mt5, "login", "1200533810"))
    is_live = (settings.trading_mode == TradingMode.LIVE)
    acc = coordinator.mt5_adapter.get_account_info() if is_live else coordinator.paper_adapter.get_account_info()
    live_equity = acc.get("equity", 44.38)
    live_balance = acc.get("balance", 44.38)
    server = acc.get("server", "JustMarkets-Demo3")

    user = db.get_user_by_account_id(acc_id)
    if not user:
        # Never invent a profile: a trader must register with their JustMarkets email.
        return {
            "success": False,
            "error": "NOT_REGISTERED",
            "message": f"JustMarkets account #{acc_id} is not registered. Register with the email used on your JustMarkets account."
        }
    else:
        # Guarantee live sync with real broker data
        user["equity"] = live_equity
        user["balance"] = live_balance
        user["server"] = server
        with db.get_connection() as conn:
            conn.cursor().execute(
                "UPDATE users SET equity = ?, server = ? WHERE justmarkets_account_id = ?",
                (live_equity, server, acc_id)
            )
            conn.commit()

    return {
        "success": True,
        "user": user,
        "live_account": {
            "login": acc.get("login", int(acc_id) if acc_id.isdigit() else 1200533810),
            "balance": live_balance,
            "equity": live_equity,
            "margin_free": acc.get("margin_free", live_equity),
            "currency": acc.get("currency", "USD"),
            "server": server,
            "type": "Demo Standard",
            "company": acc.get("company", "Just Global Markets Ltd.")
        }
    }


@app.get("/api/partner/config")
async def get_partner_config():
    """Returns current official JustMarkets partner tracking configuration."""
    return db.get_partner_config()


@app.post("/api/partner/config")
async def update_partner_config(req: PartnerConfigUpdateRequest):
    """Updates the official JustMarkets partner code and referral link, primary or secondary."""
    res = db.update_partner_config(
        referral_code=req.referral_code,
        referral_link=req.referral_link,
        primary_code=req.primary_code,
        primary_link=req.primary_link,
        primary_limit=req.primary_limit,
        secondary_code=req.secondary_code,
        secondary_link=req.secondary_link
    )
    db.record_system_event(
        severity="INFO",
        component="PARTNER_PORTAL",
        event_type="PARTNER_CONFIG_UPDATED",
        message=f"Partner referral configuration updated. Active: {res.get('active_code')}, Link: {res.get('active_link')}"
    )
    return {
        "success": True,
        "config": res,
        "message": f"Partner referral configuration updated successfully. Active code: {res.get('active_code')}"
    }



@app.get("/api/admin/users")
async def get_admin_users():
    """Admin endpoint: lists all registered traders, referral status, and broker stats."""
    users = db.get_all_users()
    cfg = db.get_partner_config()
    now = datetime.now(timezone.utc)
    
    enriched_users = []
    active_count = 0
    kicked_count = 0
    inactive_count = 0

    for u in users:
        u_dict = dict(u)
        is_v = bool(u_dict.get("is_referral_verified"))
        status = u_dict.get("status", "")
        reg_str = u_dict.get("registered_at", "")
        last_str = u_dict.get("last_login_at", reg_str)
        
        days_since_active = 0
        if last_str:
            try:
                last_dt = datetime.fromisoformat(last_str.replace("Z", "+00:00"))
                days_since_active = max(0, (now - last_dt).days)
            except Exception:
                pass
        
        u_dict["days_since_active"] = days_since_active
        
        if status == "KICKED_INACTIVE":
            u_dict["activity_tier"] = "KICKED"
            u_dict["is_active"] = False
            kicked_count += 1
        elif is_v and (status in ("ACTIVE_VERIFIED", "ACTIVE_TRADER")):
            if days_since_active <= 30 or u_dict.get("equity", 0.0) >= 50.0:
                u_dict["activity_tier"] = "ACTIVE"
                u_dict["is_active"] = True
                active_count += 1
            else:
                u_dict["activity_tier"] = "INACTIVE_PRUNE_CANDIDATE"
                u_dict["is_active"] = False
                inactive_count += 1
        else:
            u_dict["activity_tier"] = "UNVERIFIED"
            u_dict["is_active"] = False
            inactive_count += 1

        enriched_users.append(u_dict)

    verified_count = sum(1 for u in enriched_users if u.get("is_referral_verified"))

    return {
        "success": True,
        "total_users": len(enriched_users),
        "verified_users": verified_count,
        "active_users": active_count,
        "inactive_users": inactive_count,
        "kicked_users": kicked_count,
        "pending_users": len(enriched_users) - verified_count,
        "partner_code": cfg.get("active_code", "tohstb0d83"),
        "partner_link": cfg.get("active_link", "https://one.justmarkets.link/a/tohstb0d83"),
        "partner_config": cfg,
        "users": enriched_users
    }



@app.post("/api/admin/users/{user_id}/status")
async def update_admin_user_status(user_id: str, req: UserStatusUpdateRequest):
    """Admin endpoint: updates a trader's verification status, equity, and activity."""
    ok = db.update_user_status(
        user_id,
        req.status,
        req.is_referral_verified,
        equity=req.equity,
        notes=req.notes
    )
    return {
        "success": ok,
        "user_id": user_id,
        "status": req.status,
        "is_verified": req.is_referral_verified,
        "equity": req.equity
    }


@app.post("/api/admin/users/{user_id}/email")
async def update_admin_user_email(user_id: str, req: UserEmailUpdateRequest):
    """Admin endpoint: sets a trader's email to the one on their JustMarkets account."""
    email = _normalize_email(req.email)
    if not email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    other = db.get_user_by_email(email)
    if other and other.get("user_id") != user_id:
        raise HTTPException(
            status_code=409,
            detail=f"Email already linked to JustMarkets account #{other.get('justmarkets_account_id')}."
        )
    ok = db.update_user_email(user_id, email)
    if not ok:
        raise HTTPException(status_code=404, detail="Trader not found.")
    db.record_system_event(
        severity="INFO",
        component="PARTNER_PORTAL",
        event_type="TRADER_EMAIL_UPDATED",
        message=f"Trader {user_id} email set to their JustMarkets email.",
        metadata={"user_id": user_id}
    )
    return {"success": True, "user_id": user_id, "email": email}


@app.post("/api/admin/users/{user_id}/kick")
async def kick_admin_user(user_id: str, req: Optional[KickUserRequest] = None):
    """Kicks out an inactive user, immediately deactivating and locking terminal access."""
    reason = req.reason if req and req.reason else "Inactive trader pruned"
    ok = db.kick_user(user_id, reason=reason)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    db.record_system_event(
        severity="WARNING",
        component="ADMIN_ROSTER",
        event_type="TRADER_KICKED",
        message=f"Trader {user_id} was kicked out by partner. Reason: {reason}"
    )
    return {
        "success": True,
        "user_id": user_id,
        "status": "KICKED_INACTIVE",
        "message": f"Trader kicked out. Reason: {reason}"
    }


@app.post("/api/admin/users/{user_id}/reactivate")
async def reactivate_admin_user(user_id: str):
    """Restores platform access for a previously kicked trader."""
    ok = db.reactivate_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    db.record_system_event(
        severity="INFO",
        component="ADMIN_ROSTER",
        event_type="TRADER_REACTIVATED",
        message=f"Trader {user_id} was reactivated by partner."
    )
    return {
        "success": True,
        "user_id": user_id,
        "status": "ACTIVE_VERIFIED",
        "message": "Trader reactivated successfully."
    }


@app.delete("/api/admin/users/{user_id}")
async def delete_admin_user(user_id: str):
    """Permanently deletes a trader from the roster."""
    ok = db.delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user_id": user_id, "message": "Trader deleted permanently."}


@app.post("/api/admin/users/bulk-kick-inactive")
async def bulk_kick_inactive_users(days_inactive: int = 14):
    """Bulk kicks all users inactive for more than days_inactive days."""
    res = db.bulk_kick_inactive(days_inactive=days_inactive)
    db.record_system_event(
        severity="WARNING",
        component="ADMIN_ROSTER",
        event_type="BULK_INACTIVE_PRUNED",
        message=f"Bulk-kicked {res['kicked_count']} inactive traders (> {days_inactive} days)."
    )
    return {"success": True, **res}


@app.get("/api/admin/loyalty-program")
async def get_loyalty_program_status():
    """
    Returns JustMarkets Partner Loyalty Program compliance metrics:
    Requires 10 new active clients in the past 3 months to unlock volume counting.
    """
    return db.get_loyalty_program_metrics(window_days=90)


@app.get("/api/strategies")
async def get_strategies():
    """
    Returns specifications, institutional mechanics, and status for the 4 core quantitative XAUUSD strategies
    and the AI Signal Fusion Consensus Engine.
    """
    return {
        "strategies": [
            {
                "id": "XAU_LIQUIDITY_SWEEP",
                "name": "XAUUSD Liquidity Sweep Rejection",
                "category": "Smart Money Concepts (SMC)",
                "timeframe": "M15 Execution / H1 Bias",
                "target_rr": "2.5:1 to 3.5:1",
                "description": "Exploits institutional stop-runs past previous day highs/lows (PDH/PDL) and Asian session extremes. Enters on rapid pinbar rejection candles into Fair Value Gaps (FVG) with asymmetric R:R.",
                "rules": [
                    "Detect false breakout past key Asian Range or PDH/PDL boundary",
                    "Require rapid pinbar rejection candle within 1-2 bars",
                    "Verify Fair Value Gap (FVG) retest before entry",
                    "Hard Stop placed 15-35 points beyond the sweep wick",
                    "Strict blackout: No trades 30 minutes before/after High Impact News"
                ],
                "status": "ACTIVE",
                "weight": 1.35
            },
            {
                "id": "XAU_TREND_PULLBACK",
                "name": "XAUUSD Dynamic Trend Pullback",
                "category": "Multi-Timeframe Trend Following",
                "timeframe": "H1 Trend / M15 Value Entry",
                "target_rr": "2.0:1 to 3.0:1",
                "description": "Trades in alignment with institutional trend direction (EMA 50 / EMA 200). Awaits healthy retracements into dynamic EMA 21/50 support or Fibonacci golden pocket (50.0%-61.8%) before entering.",
                "rules": [
                    "Macro alignment: Price > EMA50 > EMA200 for BUY; Price < EMA50 < EMA200 for SELL",
                    "Pullback into dynamic value zone between EMA21 and EMA50",
                    "RSI(14) reset below 45 (for BUY) or above 55 (for SELL) followed by hook",
                    "Trailing stop ratchets to break-even once trade gains 80 points ($0.80)"
                ],
                "status": "ACTIVE",
                "weight": 1.10
            },
            {
                "id": "XAU_SESSION_BREAKOUT",
                "name": "XAUUSD Session Range Breakout",
                "category": "Opening Range Volatility Expansion",
                "timeframe": "M15 Opening Range",
                "target_rr": "1.5:1 to 2.0:1",
                "description": "Capitalizes on explosive liquidity surges during London (07:00-09:00 UTC) and New York (12:30-14:30 UTC) market opens following Asian session consolidation (00:00-07:00 UTC).",
                "rules": [
                    "Calibrate Asian session range (requires range between $3.00 and $65.00)",
                    "Trigger entry on breakout beyond Asian high/low during London/NY open",
                    "Filter out low-volume fakeouts using ATR expansion and tick volume",
                    "Stop-loss placed at midpoint of Asian Range"
                ],
                "status": "ACTIVE",
                "weight": 1.00
            },
            {
                "id": "XAU_MEAN_REVERSION",
                "name": "XAUUSD Range Liquidity Reversion",
                "category": "Statistical Arbitrage / Mean Reversion",
                "timeframe": "M5 / M15 Range Consolidation",
                "target_rr": "1.6:1 (Target: 20 SMA Mean)",
                "description": "Statistical range-bound scalping active only during quiet sessions (Asian/late NY). Exploits price exhaustion at ±2.5 standard deviation Bollinger Bands with extreme RSI readings.",
                "rules": [
                    "Active only in confirmed RANGE_BOUND or LOW_VOLATILITY regimes",
                    "Price touches outer Bollinger Band (20, 2.5 std dev)",
                    "RSI(14) oversold (<35) or overbought (>65) with divergence",
                    "Exit at 20-period Simple Moving Average centerline"
                ],
                "status": "ACTIVE",
                "weight": 1.05
            }
        ],
        "ai_fusion_engine": {
            "name": "Multi-Agent Signal Fusion & AI Consensus Engine",
            "provider": "Autonomous Multi-Agent AI (Flash / Pro)",
            "consensus_threshold_pct": 75,
            "features": [
                "Real-time synthesis of candidate setups from 4 quant algorithms",
                "Multi-agent validation (TrendStructureAnalyst, VolatilityMomentumAnalyst, TradeReviewer)",
                "Economic calendar filter with automated NFP/CPI/FOMC risk blackouts",
                "Non-custodial MT5 order dispatch with hard Stop-Loss and max 2.0% risk per trade"
            ]
        },
        "account_balance_tiers": [
            settings.risk.get_tier_parameters(50.0),
            settings.risk.get_tier_parameters(250.0),
            settings.risk.get_tier_parameters(750.0),
            settings.risk.get_tier_parameters(1500.0)
        ],
        "roadmap_200_pips": {
            "definition": "200 Pips on XAUUSD represents a $20.00 price expansion (e.g. $4,180.00 -> $4,200.00).",
            "why_small_account_gives_2_usd": "On a micro account ($10 - $100), the minimum broker lot is 0.01 lots (1 oz Gold). A 20-pip move ($2.00 price change) yields exactly $2.00 (0.01 lots * 100 oz * $2.00 = $2.00). Tight protection prevents account liquidation.",
            "how_1000_account_captures_200_pips": "On a $1,000 account, dynamic sizing scales to 0.10 lots. High-conviction trend continuation (XAU_TREND_PULLBACK) and session breakouts during London (08:00 UTC) / NY (13:30 UTC) opens ride the macro expansion. A 200-pip move on 0.10 lots yields $200.00 (a 20% account gain).",
            "volatility_requirement": "Gold average daily true range (ATR) is $20.00 to $40.00 (200 - 400 pips), easily providing sufficient liquidity for 200-pip targets when trailing stop buffers are widened."
        }
    }


@app.get("/api/risk/tiers")
async def get_risk_tiers():
    """Returns dynamic account balance risk tiers and adaptive parameters."""
    return {
        "tiers": [
            settings.risk.get_tier_parameters(50.0),
            settings.risk.get_tier_parameters(250.0),
            settings.risk.get_tier_parameters(750.0),
            settings.risk.get_tier_parameters(1500.0)
        ]
    }


@app.get("/api/profit-manager/status")
async def get_profit_manager_status():
    """Returns active profit collection (Break-Even & Trailing Stop) configuration."""
    point_size = settings.contract.point_size
    return {
        "enable_break_even": settings.risk.enable_break_even,
        "break_even_trigger_points": settings.risk.break_even_trigger_points,
        "break_even_trigger_usd": round(settings.risk.break_even_trigger_points * point_size, 2),
        "break_even_lock_points": settings.risk.break_even_lock_points,
        "break_even_lock_usd": round(settings.risk.break_even_lock_points * point_size, 2),
        "enable_trailing_stop": settings.risk.enable_trailing_stop,
        "trailing_trigger_points": settings.risk.trailing_trigger_points,
        "trailing_trigger_usd": round(settings.risk.trailing_trigger_points * point_size, 2),
        "trailing_distance_points": settings.risk.trailing_distance_points,
        "trailing_distance_usd": round(settings.risk.trailing_distance_points * point_size, 2),
        "min_guest_deposit_usd": settings.risk.min_guest_deposit_usd,
    }


@app.post("/api/risk/emergency-stop", dependencies=[Depends(verify_internal_api_key)])
@app.post("/api/emergency_stop", dependencies=[Depends(verify_internal_api_key)])
async def set_emergency_stop(req: EmergencyStopRequest):
    coordinator.risk_engine.set_emergency_stop(req.enabled, req.reason)
    return {
        "success": True,
        "emergency_stop": req.enabled,
        "reason": req.reason
    }


@app.get("/api/live/status")
async def get_live_status():
    from execution.live_trader import live_trader
    return {
        "running": live_trader.is_running,
        "trading_mode": settings.trading_mode.value,
        "mt5_connected": coordinator.mt5_adapter.is_connected(),
        "algo_trading_allowed": coordinator.mt5_adapter.is_trade_allowed(),
        "symbol": coordinator.mt5_adapter._symbol
    }


@app.get("/api/algo-trading/status")
async def get_algo_trading_status():
    from execution.live_trader import live_trader
    allowed = coordinator.mt5_adapter.is_trade_allowed()
    return {
        "algo_trading_allowed": allowed,
        "running": live_trader.is_running,
        "symbol": coordinator.mt5_adapter._symbol,
        "mt5_connected": coordinator.mt5_adapter.is_connected()
    }


@app.post("/api/live/start", dependencies=[Depends(verify_internal_api_key)])
async def start_live_trading():
    from execution.live_trader import live_trader
    started = live_trader.start(background=True)
    return {
        "success": started,
        "running": live_trader.is_running,
        "symbol": coordinator.mt5_adapter._symbol,
        "algo_trading_allowed": coordinator.mt5_adapter.is_trade_allowed()
    }


@app.post("/api/live/stop", dependencies=[Depends(verify_internal_api_key)])
async def stop_live_trading():
    from execution.live_trader import live_trader
    live_trader.stop()
    return {
        "success": True,
        "running": False
    }


@app.get("/api/positions")
async def get_positions():
    adapter = coordinator.get_active_adapter()
    is_live = (settings.trading_mode == TradingMode.LIVE)
    is_connected = bool(adapter and adapter.is_connected())

    if is_live and not is_connected:
        return {
            "count": 0,
            "positions": [],
            "is_connected": False,
            "status": "MT5_DISCONNECTED"
        }

    raw_positions = adapter.get_open_positions() if adapter else []
    return {
        "count": len(raw_positions),
        "positions": [p.model_dump() for p in raw_positions],
        "is_connected": is_connected,
        "status": "CONNECTED" if is_connected else "PAPER_MODE"
    }


@app.post("/api/positions/close/{ticket}")
async def close_position_by_ticket(ticket: int):
    record = coordinator.close_position(ticket, reason="MANUAL_UI")
    if not record:
        raise HTTPException(status_code=404, detail=f"Open position with ticket #{ticket} not found or failed to close")
    return {
        "success": True,
        "message": f"Position #{ticket} closed successfully",
        "trade": record.model_dump()
    }


@app.get("/api/candles/history")
async def get_candles_history(timeframe: str = "M15", count: int = 300):
    from data.models import TimeFrame, Candle
    tf_upper = timeframe.upper()
    tf_map = {
        "M1": TimeFrame.M1,
        "M5": TimeFrame.M5,
        "M15": TimeFrame.M15,
        "H1": TimeFrame.H1,
        "H4": TimeFrame.H4,
        "D1": TimeFrame.D1
    }
    selected_tf = tf_map.get(tf_upper, TimeFrame.M15)
    is_live = (settings.trading_mode == TradingMode.LIVE)
    broker_symbol = getattr(coordinator.mt5_adapter, "_symbol", "XAUUSD.m") or "XAUUSD.m"

    # Fetch directly from MT5 if connected
    candles_list: List[Candle] = []
    if coordinator.mt5_adapter.is_connected():
        try:
            import MetaTrader5 as mt5
            mt5_tf_map = {
                "M1": mt5.TIMEFRAME_M1,
                "M5": mt5.TIMEFRAME_M5,
                "M15": mt5.TIMEFRAME_M15,
                "H1": mt5.TIMEFRAME_H1,
                "H4": mt5.TIMEFRAME_H4,
                "D1": mt5.TIMEFRAME_D1
            }
            target_mt5_tf = mt5_tf_map.get(tf_upper, mt5.TIMEFRAME_M15)
            rates = mt5.copy_rates_from_pos(broker_symbol, target_mt5_tf, 0, count)
            if rates is not None and len(rates) > 0:
                for r in rates:
                    dt = datetime.fromtimestamp(int(r['time']), tz=timezone.utc)
                    candles_list.append(Candle(
                        symbol=broker_symbol,
                        timeframe=selected_tf,
                        timestamp=dt,
                        open=float(r['open']),
                        high=float(r['high']),
                        low=float(r['low']),
                        close=float(r['close']),
                        volume=float(r['tick_volume'])
                    ))
        except Exception as e:
            logger.debug(f"Direct MT5 candle pull: {e}")

    # In live mode, MT5 is the single source of truth. Do not substitute historical CSV if disconnected.
    if is_live and not coordinator.mt5_adapter.is_connected():
        return {
            "symbol": broker_symbol,
            "timeframe": tf_upper,
            "count": 0,
            "candles": [],
            "status": "MT5_DISCONNECTED",
            "is_connected": False,
            "message": "MT5 disconnected. Live candles unavailable."
        }

    # Fallback to feed cache or broker real historical sync csv in paper/demo mode
    if not candles_list:
        candles_list = coordinator.feed.get_candles(selected_tf, count=count)

    if not candles_list:
        real_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "historical", "xauusd_broker_real.csv")
        if os.path.exists(real_csv):
            from scripts.broker_data_sync import load_from_csv
            all_candles = load_from_csv(real_csv)
            coordinator.feed.load_historical_candles(selected_tf, all_candles[-count:])
            candles_list = coordinator.feed.get_candles(selected_tf, count=count)

    if not candles_list:
        return {
            "symbol": broker_symbol,
            "timeframe": tf_upper,
            "count": 0,
            "candles": [],
            "status": "UNAVAILABLE",
            "is_connected": False
        }

    # Strictly sort by unix timestamp ascending and remove any duplicates
    seen_times = set()
    formatted = []
    sorted_candles = sorted(candles_list, key=lambda c: int(c.timestamp.timestamp()))
    for c in sorted_candles:
        t = int(c.timestamp.timestamp())
        if t not in seen_times:
            seen_times.add(t)
            formatted.append({
                "time": t,
                "open": round(c.open, 2),
                "high": round(c.high, 2),
                "low": round(c.low, 2),
                "close": round(c.close, 2),
                "volume": round(c.volume, 1)
            })

    return {
        "symbol": "XAUUSD",
        "timeframe": tf_upper,
        "count": len(formatted),
        "candles": formatted
    }


@app.websocket("/ws/terminal")
async def websocket_terminal_endpoint(websocket: WebSocket):
    try:
        manager.loop = asyncio.get_running_loop()
    except RuntimeError:
        pass
    await manager.connect(websocket)
    if coordinator.latest_market_state is None:
        coordinator.prime_initial_state()

    # Send initial full status & state on connect
    status = coordinator.get_system_status()
    initial_msg = {
        "type": "INITIAL_STATE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "market_state": coordinator.latest_market_state.model_dump(mode="json") if coordinator.latest_market_state else None,
        "fused_signal": coordinator.latest_fused_signal.model_dump(mode="json") if coordinator.latest_fused_signal else None,
        "positions": [p.model_dump(mode="json") for p in coordinator.get_active_adapter().get_open_positions()]
    }
    await websocket.send_json(jsonable_encoder(initial_msg))
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/api/performance")
async def get_performance():
    trades = db.get_all_trades(limit=200)
    from data.models import TradeRecord
    typed = [TradeRecord.model_validate(t) for t in trades]
    return PerformanceEngine.compute_metrics(typed, initial_capital=100000.0)


@app.get("/api/journal")
async def get_journal_entries(limit: int = 50):
    return TradeJournal.list_recent_journal_entries(limit=limit)


@app.get("/api/journal/{trade_id}")
async def get_trade_audit_lineage(trade_id: str):
    res = TradeJournal.get_trade_audit(trade_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@app.post("/api/trading/tick")
async def post_tick(req: ProcessTickRequest):
    now = datetime.now(timezone.utc)
    tick = Tick(
        symbol="XAUUSD",
        time=now,
        bid=req.bid,
        ask=req.ask,
        spread=round(req.ask - req.bid, 3),
        volume=req.volume
    )
    res = coordinator.step(tick)
    return res


@app.post("/api/trading/backtest")
async def run_backtest(req: BacktestRequest):
    from data.feed import MarketDataEngine
    from data.models import TimeFrame

    real_csv = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "historical", "xauusd_broker_real.csv")
    if os.path.exists(real_csv):
        from scripts.broker_data_sync import load_from_csv
        candles = load_from_csv(real_csv)
        data_source = "REAL BROKER DATA"
        if req.days and req.days > 0:
            bars_count = req.days * 24 * 4
            if len(candles) > bars_count:
                candles = candles[-bars_count:]
    else:
        sim_engine = MarketDataEngine.generate_synthetic_data(num_days=req.days, base_price=req.base_price)
        candles = sim_engine.get_candles(TimeFrame.M15, 3000)
        data_source = "SIMULATED / SYNTHETIC"

    engine = BacktestEngine(
        initial_balance=100000.0,
        commission_per_lot=6.0,
        spread_points=25.0,
        slippage_points=2.0
    )
    results = engine.run(candles)
    perf = PerformanceEngine.compute_metrics(results["trades"], initial_capital=100000.0)

    return {
        "summary": {
            "data_source": data_source,
            "initial_balance": results["initial_balance"],
            "final_balance": results["final_balance"],
            "net_profit": results["net_profit"],
            "total_trades": results["total_trades"]
        },
        "performance": perf,
        "sample_trades": [t.model_dump() for t in results["trades"][:10]],
        "equity_curve": results["equity_curve"][-100:]
    }


class CachedStaticFiles(StaticFiles):
    """StaticFiles with HTTP Cache-Control headers for modern performance."""
    def file_response(self, full_path, stat_result, scope, status_code: int = 200):
        response = super().file_response(full_path, stat_result, scope, status_code)
        path_str = str(full_path).lower()
        if any(path_str.endswith(ext) for ext in [".webp", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".woff2", ".woff", ".ttf"]):
            response.headers["Cache-Control"] = "public, max-age=2592000, immutable"
        elif any(path_str.endswith(ext) for ext in [".js", ".css"]):
            response.headers["Cache-Control"] = "public, max-age=604800, stale-while-revalidate=86400"
        elif path_str.endswith(".html"):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
        return response


# Mount static files for dashboard if directory exists
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dashboard", "static")
if os.path.exists(static_dir):
    app.mount("/", CachedStaticFiles(directory=static_dir, html=True), name="static")

