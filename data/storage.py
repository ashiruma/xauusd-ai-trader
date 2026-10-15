"""
SQLite Database Storage and Audit Logging Layer for XAUUSD Trading System.
Provides full auditable lineage:
TRADE -> ORDER -> RISK DECISION -> SIGNAL -> STRATEGY -> AI ANALYSIS -> MARKET STATE
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from config.settings import settings
from data.models import (
    Candle, MarketState, CandidateSetup, AISignalDecision,
    FusedSignal, RiskDecision, Order, TradeRecord
)


class DatabaseStorage:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.db_path
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self.enabled: bool = True
        self.init_tables()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA busy_timeout = 10000;")
        except Exception:
            pass
        return conn

    def init_tables(self) -> None:
        try:
            with sqlite3.connect(self.db_path, timeout=30.0) as setup_conn:
                setup_conn.execute("PRAGMA journal_mode = WAL;")
                setup_conn.execute("PRAGMA synchronous = NORMAL;")
        except Exception:
            pass
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Candles
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS candles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    open REAL NOT NULL,
                    high REAL NOT NULL,
                    low REAL NOT NULL,
                    close REAL NOT NULL,
                    volume REAL NOT NULL,
                    UNIQUE(symbol, timeframe, timestamp)
                )
            """)

            # 2. Market State Snapshots
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS market_states (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    state_id TEXT UNIQUE NOT NULL,
                    timestamp TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    current_price REAL NOT NULL,
                    bid REAL NOT NULL,
                    ask REAL NOT NULL,
                    spread_points REAL NOT NULL,
                    atr_14 REAL NOT NULL,
                    rsi_14 REAL NOT NULL,
                    ema_9 REAL NOT NULL,
                    ema_21 REAL NOT NULL,
                    ema_50 REAL NOT NULL,
                    ema_200 REAL NOT NULL,
                    session TEXT NOT NULL,
                    regime TEXT NOT NULL,
                    details_json TEXT NOT NULL
                )
            """)

            # 3. Strategy Candidate Setups
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS candidate_setups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    setup_id TEXT UNIQUE NOT NULL,
                    strategy_id TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    entry REAL NOT NULL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    risk_reward REAL NOT NULL,
                    reason TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    expiry TEXT NOT NULL
                )
            """)

            # 4. AI Analyst Decisions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_decisions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ai_decision_id TEXT UNIQUE NOT NULL,
                    setup_id TEXT,
                    decision TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    setup_valid INTEGER NOT NULL,
                    entry REAL NOT NULL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    risk_reward REAL NOT NULL,
                    market_regime TEXT NOT NULL,
                    strategy_id TEXT NOT NULL,
                    reasons_json TEXT NOT NULL,
                    invalidation TEXT,
                    signal_expiry TEXT,
                    provider TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)

            # 5. Fused Signals
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS signals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    signal_id TEXT UNIQUE NOT NULL,
                    timestamp TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    entry REAL NOT NULL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    risk_reward REAL NOT NULL,
                    confidence REAL NOT NULL,
                    strategy_id TEXT NOT NULL,
                    market_regime TEXT NOT NULL,
                    reasons_json TEXT NOT NULL,
                    expiry TEXT NOT NULL,
                    is_valid INTEGER NOT NULL
                )
            """)

            # 6. Risk Decisions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_decisions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    decision_id TEXT UNIQUE NOT NULL,
                    signal_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    approved INTEGER NOT NULL,
                    rejection_code TEXT,
                    reason TEXT NOT NULL,
                    lot_size REAL NOT NULL,
                    risk_amount_usd REAL NOT NULL,
                    stop_distance_points REAL NOT NULL,
                    account_equity REAL NOT NULL
                )
            """)

            # 7. Orders
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT UNIQUE NOT NULL,
                    signal_id TEXT NOT NULL,
                    strategy_id TEXT NOT NULL,
                    magic_number INTEGER NOT NULL,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    lot_size REAL NOT NULL,
                    requested_price REAL NOT NULL,
                    filled_price REAL,
                    slippage_points REAL NOT NULL,
                    stop_loss REAL NOT NULL,
                    take_profit REAL NOT NULL,
                    status TEXT NOT NULL,
                    ticket INTEGER,
                    created_at TEXT NOT NULL,
                    executed_at TEXT,
                    error_message TEXT
                )
            """)

            # 8. Completed Trades (Auditable Journal)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trade_id TEXT UNIQUE NOT NULL,
                    ticket INTEGER NOT NULL,
                    order_id TEXT,
                    signal_id TEXT,
                    strategy_id TEXT,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    lots REAL NOT NULL,
                    entry_price REAL NOT NULL,
                    exit_price REAL NOT NULL,
                    pnl REAL NOT NULL,
                    return_pct REAL NOT NULL,
                    commission REAL NOT NULL,
                    swap REAL NOT NULL,
                    entry_time TEXT NOT NULL,
                    exit_time TEXT NOT NULL,
                    exit_reason TEXT NOT NULL,
                    holding_seconds REAL NOT NULL,
                    mfe REAL NOT NULL,
                    mae REAL NOT NULL,
                    market_regime TEXT,
                    session TEXT
                )
            """)

            # 9. System Audit Events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    component TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    correlation_id TEXT,
                    message TEXT NOT NULL,
                    metadata_json TEXT
                )
            """)

            # 10. Registered Users & Referral Verification
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE NOT NULL,
                    full_name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    justmarkets_account_id TEXT NOT NULL,
                    server TEXT DEFAULT 'JustMarkets-Demo3',
                    referral_code TEXT NOT NULL,
                    is_referral_verified INTEGER DEFAULT 1,
                    registered_at TEXT NOT NULL,
                    last_login_at TEXT NOT NULL,
                    equity REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'ACTIVE_VERIFIED',
                    notes TEXT
                )
            """)

            # 11. Partner Settings & Referral Configuration (Primary: tohstb0d83, Secondary: p4cui0wkfz with 10 partner drip)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS partner_config (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            now_iso = datetime.now(timezone.utc).isoformat()
            cursor.execute("""
                INSERT OR IGNORE INTO partner_config (key, value, updated_at)
                VALUES ('primary_code', 'tohstb0d83', ?)
            """, (now_iso,))
            cursor.execute("""
                INSERT OR IGNORE INTO partner_config (key, value, updated_at)
                VALUES ('primary_link', 'https://one.justmarkets.link/a/tohstb0d83', ?)
            """, (now_iso,))
            cursor.execute("""
                INSERT OR IGNORE INTO partner_config (key, value, updated_at)
                VALUES ('primary_limit', '10', ?)
            """, (now_iso,))
            cursor.execute("""
                INSERT OR IGNORE INTO partner_config (key, value, updated_at)
                VALUES ('secondary_code', 'p4cui0wkfz', ?)
            """, (now_iso,))
            cursor.execute("""
                INSERT OR IGNORE INTO partner_config (key, value, updated_at)
                VALUES ('secondary_link', 'https://one.justmarkets.link/a/p4cui0wkfz', ?)
            """, (now_iso,))

            conn.commit()


    def record_market_state(self, state_id: str, state: MarketState) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            details = {
                "recent_swing_high": state.recent_swing_high,
                "recent_swing_low": state.recent_swing_low,
                "previous_day_high": state.previous_day_high,
                "previous_day_low": state.previous_day_low,
                "previous_week_high": state.previous_week_high,
                "previous_week_low": state.previous_week_low,
                "asian_range_high": state.asian_range_high,
                "asian_range_low": state.asian_range_low,
                "trend_description": state.trend_description,
                "open_positions_count": state.open_positions_count
            }
            cursor.execute("""
                INSERT OR REPLACE INTO market_states (
                    state_id, timestamp, symbol, current_price, bid, ask,
                    spread_points, atr_14, rsi_14, ema_9, ema_21, ema_50, ema_200,
                    session, regime, details_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                state_id, state.timestamp.isoformat(), state.symbol, state.current_price,
                state.bid, state.ask, state.spread_points, state.atr_14, state.rsi_14,
                state.ema_9, state.ema_21, state.ema_50, state.ema_200,
                state.session.value, state.regime.value, json.dumps(details)
            ))
            conn.commit()

    def record_candidate_setup(self, setup_id: str, setup: CandidateSetup) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO candidate_setups (
                    setup_id, strategy_id, symbol, side, entry, stop_loss,
                    take_profit, risk_reward, reason, timestamp, expiry
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                setup_id, setup.strategy_id, setup.symbol, setup.side.value,
                setup.entry, setup.stop_loss, setup.take_profit, setup.risk_reward,
                setup.reason, setup.timestamp.isoformat(), setup.expiry.isoformat()
            ))
            conn.commit()

    def record_ai_decision(self, ai_decision_id: str, setup_id: Optional[str], decision: AISignalDecision, provider: str) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO ai_decisions (
                    ai_decision_id, setup_id, decision, confidence, setup_valid,
                    entry, stop_loss, take_profit, risk_reward, market_regime,
                    strategy_id, reasons_json, invalidation, signal_expiry, provider, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ai_decision_id, setup_id, decision.decision.value, decision.confidence,
                1 if decision.setup_valid else 0, decision.entry, decision.stop_loss,
                decision.take_profit, decision.risk_reward, decision.market_regime.value,
                decision.strategy_id, json.dumps(decision.reasons), decision.invalidation,
                decision.signal_expiry, provider, datetime.now(timezone.utc).isoformat()
            ))
            conn.commit()

    def record_signal(self, signal: FusedSignal) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO signals (
                    signal_id, timestamp, symbol, side, entry, stop_loss,
                    take_profit, risk_reward, confidence, strategy_id, market_regime,
                    reasons_json, expiry, is_valid
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                signal.signal_id, signal.timestamp.isoformat(), signal.symbol,
                signal.side.value, signal.entry, signal.stop_loss, signal.take_profit,
                signal.risk_reward, signal.confidence, signal.strategy_id,
                signal.market_regime.value, json.dumps(signal.reasons),
                signal.expiry.isoformat(), 1 if signal.is_valid else 0
            ))
            conn.commit()

    def record_risk_decision(self, decision_id: str, decision: RiskDecision) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO risk_decisions (
                    decision_id, signal_id, timestamp, approved, rejection_code,
                    reason, lot_size, risk_amount_usd, stop_distance_points, account_equity
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                decision_id, decision.signal_id, decision.timestamp.isoformat(),
                1 if decision.approved else 0, decision.rejection_code, decision.reason,
                decision.lot_size, decision.risk_amount_usd, decision.stop_distance_points,
                decision.account_equity
            ))
            conn.commit()

    def record_order(self, order: Order) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO orders (
                    order_id, signal_id, strategy_id, magic_number, symbol,
                    side, lot_size, requested_price, filled_price, slippage_points,
                    stop_loss, take_profit, status, ticket, created_at, executed_at, error_message
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order.order_id, order.signal_id, order.strategy_id, order.magic_number,
                order.symbol, order.side.value, order.lot_size, order.requested_price,
                order.filled_price, order.slippage_points, order.stop_loss, order.take_profit,
                order.status.value, order.ticket, order.created_at.isoformat(),
                order.executed_at.isoformat() if order.executed_at else None,
                order.error_message
            ))
            conn.commit()

    def record_trade(self, trade: TradeRecord, order_id: Optional[str] = None) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO trades (
                    trade_id, ticket, order_id, signal_id, strategy_id, symbol,
                    side, lots, entry_price, exit_price, pnl, return_pct,
                    commission, swap, entry_time, exit_time, exit_reason,
                    holding_seconds, mfe, mae, market_regime, session
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                trade.trade_id, trade.ticket, order_id, trade.signal_id, trade.strategy_id,
                trade.symbol, trade.side.value, trade.lots, trade.entry_price, trade.exit_price,
                trade.pnl, trade.return_pct, trade.commission, trade.swap,
                trade.entry_time.isoformat(), trade.exit_time.isoformat(), trade.exit_reason,
                trade.holding_seconds, trade.max_favorable_excursion, trade.max_adverse_excursion,
                trade.market_regime.value if trade.market_regime else None,
                trade.session.value if trade.session else None
            ))
            conn.commit()

    def record_system_event(self, severity: str, component: str, event_type: str,
                            message: str, correlation_id: Optional[str] = None,
                            metadata: Optional[Dict[str, Any]] = None) -> None:
        if not self.enabled:
            return
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO system_events (
                    timestamp, severity, component, event_type, correlation_id, message, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now(timezone.utc).isoformat(), severity, component, event_type,
                correlation_id, message, json.dumps(metadata or {})
            ))
            conn.commit()

    def get_trade_audit_lineage(self, trade_id: str) -> Dict[str, Any]:
        """
        Retrace complete end-to-end lineage for audit:
        TRADE -> ORDER -> RISK DECISION -> SIGNAL -> AI DECISION -> CANDIDATE SETUP
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM trades WHERE trade_id = ?", (trade_id,))
            trade_row = cursor.fetchone()
            if not trade_row:
                return {"error": f"Trade {trade_id} not found"}
            
            lineage: Dict[str, Any] = {"trade": dict(trade_row)}
            order_id = trade_row["order_id"]
            signal_id = trade_row["signal_id"]

            if order_id:
                cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
                order_row = cursor.fetchone()
                lineage["order"] = dict(order_row) if order_row else None

            if signal_id:
                cursor.execute("SELECT * FROM risk_decisions WHERE signal_id = ?", (signal_id,))
                risk_row = cursor.fetchone()
                lineage["risk_decision"] = dict(risk_row) if risk_row else None

                cursor.execute("SELECT * FROM signals WHERE signal_id = ?", (signal_id,))
                sig_row = cursor.fetchone()
                lineage["signal"] = dict(sig_row) if sig_row else None

                cursor.execute("SELECT * FROM ai_decisions WHERE ai_decision_id = ? OR setup_id = ?", (signal_id, signal_id))
                ai_row = cursor.fetchone()
                lineage["ai_decision"] = dict(ai_row) if ai_row else None

            return lineage

    def get_all_trades(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM trades ORDER BY exit_time DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_all_signals(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM signals ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_recent_system_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM system_events ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def register_user(
        self,
        full_name: str,
        email: str,
        justmarkets_account_id: str,
        referral_code: Optional[str] = None,
        server: str = "JustMarkets-Demo3",
        equity: float = 0.0,
        notes: str = ""
    ) -> Dict[str, Any]:
        user_id = f"USR_{uuid.uuid4().hex[:10].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()
        cfg = self.get_partner_config()
        if not referral_code:
            referral_code = cfg.get("active_code", "tohstb0d83")

        is_verified = 1 if self.is_valid_partner_code(referral_code) else 0
        status = "ACTIVE_VERIFIED" if is_verified else "UNVERIFIED_PENDING_REFERRAL"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO users (
                    user_id, full_name, email, justmarkets_account_id, server,
                    referral_code, is_referral_verified, registered_at, last_login_at, equity, status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, full_name, email, justmarkets_account_id, server,
                referral_code, is_verified, now_iso, now_iso, equity, status, notes
            ))
            conn.commit()

        return {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "justmarkets_account_id": justmarkets_account_id,
            "server": server,
            "referral_code": referral_code,
            "is_referral_verified": bool(is_verified),
            "status": status,
            "registered_at": now_iso
        }


    def get_user_by_account_id(self, account_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE justmarkets_account_id = ? ORDER BY id DESC LIMIT 1", (account_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM users WHERE LOWER(email) = LOWER(?) ORDER BY id DESC LIMIT 1",
                (email.strip(),)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_user_email(self, user_id: str, email: str) -> bool:
        """Sets the trader's email to the one on their JustMarkets account."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET email = ? WHERE user_id = ?", (email.strip().lower(), user_id))
            conn.commit()
            return cursor.rowcount > 0

    def get_all_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users ORDER BY id DESC")
            return [dict(row) for row in cursor.fetchall()]

    def update_user_status(
        self,
        user_id: str,
        status: str,
        is_verified: bool,
        equity: Optional[float] = None,
        notes: Optional[str] = None
    ) -> bool:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if equity is not None and notes is not None:
                cursor.execute(
                    "UPDATE users SET status = ?, is_referral_verified = ?, equity = ?, notes = ? WHERE user_id = ?",
                    (status, 1 if is_verified else 0, equity, notes, user_id)
                )
            elif equity is not None:
                cursor.execute(
                    "UPDATE users SET status = ?, is_referral_verified = ?, equity = ? WHERE user_id = ?",
                    (status, 1 if is_verified else 0, equity, user_id)
                )
            else:
                cursor.execute(
                    "UPDATE users SET status = ?, is_referral_verified = ? WHERE user_id = ?",
                    (status, 1 if is_verified else 0, user_id)
                )
            conn.commit()
            return cursor.rowcount > 0

    def get_partner_config(self) -> Dict[str, Any]:
        defaults = {
            "primary_code": "tohstb0d83",
            "primary_link": "https://one.justmarkets.link/a/tohstb0d83",
            "primary_limit": 10,
            "secondary_code": "p4cui0wkfz",
            "secondary_link": "https://one.justmarkets.link/a/p4cui0wkfz",
            "referral_code": "tohstb0d83",
            "referral_link": "https://one.justmarkets.link/a/tohstb0d83",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT key, value, updated_at FROM partner_config")
            rows = cursor.fetchall()
            res = dict(defaults)
            for r in rows:
                k = r["key"]
                v = r["value"]
                if k == "primary_limit":
                    try:
                        res[k] = int(v)
                    except (ValueError, TypeError):
                        res[k] = 10
                else:
                    res[k] = v
                res["updated_at"] = r["updated_at"]

            # Compute verified partner counts for both primary and secondary
            p_code = str(res.get("primary_code", "tohstb0d83")).strip().lower()
            s_code = str(res.get("secondary_code", "p4cui0wkfz")).strip().lower()

            cursor.execute(
                "SELECT COUNT(*) FROM users WHERE LOWER(referral_code) = ? AND is_referral_verified = 1",
                (p_code,)
            )
            p_count = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*) FROM users WHERE LOWER(referral_code) = ? AND is_referral_verified = 1",
                (s_code,)
            )
            s_count = cursor.fetchone()[0]

            p_limit = int(res.get("primary_limit", 10))
            is_drip_active = (p_count >= p_limit)

            active_code = res.get("secondary_code", "p4cui0wkfz") if is_drip_active else res.get("primary_code", "tohstb0d83")
            active_link = res.get("secondary_link", "https://one.justmarkets.link/a/p4cui0wkfz") if is_drip_active else res.get("primary_link", "https://one.justmarkets.link/a/tohstb0d83")

            res["primary_count"] = p_count
            res["primary_remaining"] = max(0, p_limit - p_count)
            res["secondary_count"] = s_count
            res["is_drip_active"] = is_drip_active
            res["active_tier"] = "secondary" if is_drip_active else "primary"
            res["active_code"] = active_code
            res["active_link"] = active_link
            # Backwards compatibility
            res["referral_code"] = active_code
            res["referral_link"] = active_link
            res["valid_codes"] = [res.get("primary_code", "tohstb0d83"), res.get("secondary_code", "p4cui0wkfz")]
            return res

    def is_valid_partner_code(self, code: Optional[str]) -> bool:
        if not code:
            return False
        clean = code.strip().lower()
        cfg = self.get_partner_config()
        valid = {
            str(cfg.get("primary_code", "tohstb0d83")).strip().lower(),
            str(cfg.get("secondary_code", "p4cui0wkfz")).strip().lower(),
            str(cfg.get("active_code", "tohstb0d83")).strip().lower(),
            str(cfg.get("referral_code", "tohstb0d83")).strip().lower()
        }
        return clean in valid

    def update_partner_config(
        self,
        referral_code: Optional[str] = None,
        referral_link: Optional[str] = None,
        primary_code: Optional[str] = None,
        primary_link: Optional[str] = None,
        primary_limit: Optional[int] = None,
        secondary_code: Optional[str] = None,
        secondary_link: Optional[str] = None
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if primary_code:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('primary_code', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (primary_code.strip(), now_iso))
            if primary_link:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('primary_link', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (primary_link.strip(), now_iso))
            if primary_limit is not None:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('primary_limit', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (str(primary_limit), now_iso))
            if secondary_code:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('secondary_code', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (secondary_code.strip(), now_iso))
            if secondary_link:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('secondary_link', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (secondary_link.strip(), now_iso))
            if referral_code and not primary_code:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('primary_code', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (referral_code.strip(), now_iso))
            if referral_link and not primary_link:
                cursor.execute("""
                    INSERT INTO partner_config (key, value, updated_at) VALUES ('primary_link', ?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """, (referral_link.strip(), now_iso))
            conn.commit()
        return self.get_partner_config()


    def kick_user(self, user_id: str, reason: str = "INACTIVE_DEACTIVATED") -> bool:
        """Deactivates and revokes platform access for an inactive user."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users 
                SET status = 'KICKED_INACTIVE', is_referral_verified = 0, notes = ? 
                WHERE user_id = ?
            """, (f"Kicked: {reason}", user_id))
            conn.commit()
            return cursor.rowcount > 0

    def reactivate_user(self, user_id: str) -> bool:
        """Restores platform access for a trader."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users 
                SET status = 'ACTIVE_VERIFIED', is_referral_verified = 1, notes = 'Reactivated' 
                WHERE user_id = ?
            """, (user_id,))
            conn.commit()
            return cursor.rowcount > 0

    def delete_user(self, user_id: str) -> bool:
        """Permanently removes a trader record."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
            conn.commit()
            return cursor.rowcount > 0

    def bulk_kick_inactive(self, days_inactive: int = 14) -> Dict[str, Any]:
        """Kicks out all users whose last_login_at is older than days_inactive or equity is 0."""
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days_inactive)).isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Select inactive candidates (excluding demo account #1200533810)
            cursor.execute("""
                SELECT user_id, full_name, justmarkets_account_id 
                FROM users 
                WHERE status != 'KICKED_INACTIVE'
                  AND justmarkets_account_id != '1200533810'
                  AND (last_login_at < ? OR equity <= 0)
            """, (cutoff,))
            candidates = [dict(row) for row in cursor.fetchall()]
            
            kicked_ids = [c["user_id"] for c in candidates]
            if kicked_ids:
                placeholders = ",".join(["?"] * len(kicked_ids))
                cursor.execute(f"""
                    UPDATE users 
                    SET status = 'KICKED_INACTIVE', is_referral_verified = 0, notes = 'Auto-pruned: Inactive > {days_inactive} days'
                    WHERE user_id IN ({placeholders})
                """, kicked_ids)
                conn.commit()

        return {
            "kicked_count": len(kicked_ids),
            "kicked_users": candidates
        }

    def get_loyalty_program_metrics(self, window_days: int = 90) -> Dict[str, Any]:
        """
        Calculates JustMarkets Partner Loyalty Program compliance and progress.
        Rule: Trading volume counts toward progress once you have attracted
        at least 10 new active clients in the past three months (90 days).
        All previously achieved milestones are retained. Grace period active.
        """
        now = datetime.now(timezone.utc)
        cutoff_date = (now - timedelta(days=window_days)).isoformat()
        cfg = self.get_partner_config()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users ORDER BY id DESC")
            all_users = [dict(row) for row in cursor.fetchall()]

        total_registered = len(all_users)
        referral_verified = [u for u in all_users if u.get("is_referral_verified") == 1]

        # Active clients within rolling 90-day window
        active_in_90d = []
        for u in referral_verified:
            reg_date = u.get("registered_at", "")
            if reg_date >= cutoff_date and u.get("status") in ("ACTIVE_VERIFIED", "ACTIVE_TRADER"):
                active_in_90d.append(u)

        active_count = len(active_in_90d)
        target = 10
        needed = max(0, target - active_count)
        progress_pct = min(100.0, round((active_count / target) * 100, 1))
        is_eligible = active_count >= target

        milestones = [
            {
                "tier": "Tier 1: Bronze Partner",
                "target_clients": 10,
                "reward": "$500 Cash Milestone + 10% Loyalty Commission Multiplier",
                "volume_status": "Active" if is_eligible else "Grace Period (Volume Paused)",
                "unlocked": is_eligible
            },
            {
                "tier": "Tier 2: Silver Partner",
                "target_clients": 25,
                "reward": "$2,000 Cash Milestone + 20% Rebate Multiplier",
                "volume_status": "Active" if active_count >= 25 else "Pending",
                "unlocked": active_count >= 25
            },
            {
                "tier": "Tier 3: Gold Partner",
                "target_clients": 50,
                "reward": "$5,000 Cash Milestone + Tech Kit / VIP Convention",
                "volume_status": "Active" if active_count >= 50 else "Pending",
                "unlocked": active_count >= 50
            },
            {
                "tier": "Tier 4: Platinum Partner",
                "target_clients": 100,
                "reward": "$10,000+ Luxury Milestone + Global Gala Invite",
                "volume_status": "Active" if active_count >= 100 else "Pending",
                "unlocked": active_count >= 100
            }
        ]

        return {
            "partner_code": cfg.get("referral_code", "p4cui0wkfz"),
            "partner_link": cfg.get("referral_link", "https://one.justmarkets.link/a/p4cui0wkfz"),
            "target_clients": target,
            "window_days": window_days,
            "grace_period_active": True,
            "grace_period_notice": "Volume counting paused until 10 new active clients are attracted in the past 3 months. All previously achieved milestones are retained.",
            "total_registered": total_registered,
            "referral_verified_count": len(referral_verified),
            "active_clients_90d": active_count,
            "clients_needed": needed,
            "progress_percent": progress_pct,
            "volume_counting_status": "ELIGIBLE" if is_eligible else "GRACE_PERIOD_PENDING",
            "milestones": milestones,
            "qualifying_clients": [
                {
                    "user_id": u.get("user_id"),
                    "full_name": u.get("full_name"),
                    "email": u.get("email"),
                    "justmarkets_account_id": u.get("justmarkets_account_id"),
                    "registered_at": u.get("registered_at"),
                    "equity": u.get("equity", 0.0),
                    "status": u.get("status")
                }
                for u in active_in_90d
            ]
        }


# Global database instance
db = DatabaseStorage()
