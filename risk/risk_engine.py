"""
Deterministic Risk Engine for XAUUSD.
The unbypassable institutional gatekeeper between Strategy/AI proposals and Broker Execution.
If ANY mandatory rule fails: REJECT TRADE.
"""

from datetime import datetime, timezone, timedelta
import uuid
from typing import Optional, Dict, Any, List
from config.settings import settings, SessionName
from data.models import FusedSignal, RiskDecision, MarketState, OrderSide
from risk.position_sizer import PositionSizer
from news.news_engine import news_engine, NewsImpactStatus
from data.storage import db


class RiskEngine:
    def __init__(self, initial_equity: Optional[float] = None):
        self._emergency_stop = settings.emergency_stop
        self._emergency_reason = settings.emergency_stop_reason
        self._recent_signals: Dict[str, datetime] = {}
        
        # State tracking for account drawdown & daily loss - dynamically initialized
        self.initial_equity: Optional[float] = initial_equity
        self.peak_equity: Optional[float] = initial_equity
        self.daily_starting_equity: Optional[float] = initial_equity
        self.daily_pnl: float = 0.0
        self.daily_profitable_trades: int = 0
        self.is_daily_profit_locked: bool = False
        self.consecutive_losses: int = 0
        self.cooldown_until: Optional[datetime] = None
        self.current_day = datetime.now(timezone.utc).date()

    def set_emergency_stop(self, enabled: bool, reason: str = "Manual emergency stop triggered") -> None:
        self._emergency_stop = enabled
        self._emergency_reason = reason if enabled else None
        db.record_system_event(
            severity="CRITICAL" if enabled else "INFO",
            component="RiskEngine",
            event_type="EMERGENCY_STOP_TOGGLED",
            message=f"Emergency stop set to {enabled}. Reason: {reason}"
        )

    def is_emergency_stop_active(self) -> tuple[bool, Optional[str]]:
        return self._emergency_stop, self._emergency_reason

    def update_account_metrics(self, current_equity: float, trade_pnl: Optional[float] = None, current_time: Optional[datetime] = None) -> None:
        """Update peak equity, daily P&L, and consecutive loss tracking."""
        today = (current_time or datetime.now(timezone.utc)).date()
        if today != self.current_day:
            self.current_day = today
            self.daily_starting_equity = current_equity
            self.daily_pnl = 0.0
            self.daily_profitable_trades = 0
            self.is_daily_profit_locked = False
            self.consecutive_losses = 0
            self.cooldown_until = None

        if current_equity > 0:
            if self.initial_equity is None or self.initial_equity <= 0:
                self.initial_equity = current_equity
            if self.peak_equity is None or self.peak_equity <= 0 or current_equity > self.peak_equity:
                self.peak_equity = current_equity
            if self.daily_starting_equity is None or self.daily_starting_equity <= 0:
                self.daily_starting_equity = current_equity

        if trade_pnl is not None:
            self.daily_pnl += trade_pnl
            if trade_pnl > 0:
                self.daily_profitable_trades += 1
                max_winning = getattr(settings.risk, "max_daily_profitable_trades", 5)
                if self.daily_profitable_trades >= max_winning:
                    self.is_daily_profit_locked = True
                self.consecutive_losses = 0
                self.cooldown_until = None
            elif trade_pnl < 0:
                # If already in cooldown, ignore further loss counting
                now_time = current_time or datetime.now(timezone.utc)
                if self.cooldown_until and now_time < self.cooldown_until:
                    # do not increment consecutive losses during active cooldown
                    pass
                else:
                    self.consecutive_losses += 1
                    # Trigger cooldown only when losses exceed the allowed maximum
                    if self.consecutive_losses > settings.risk.max_consecutive_losses:
                        cooldown_dt = now_time
                        self.cooldown_until = cooldown_dt + timedelta(hours=4)
                        self.consecutive_losses = 0
            else:
                self.consecutive_losses = 0
                self.cooldown_until = None

    def reset_drawdown_baseline(self, current_equity: Optional[float] = None) -> None:
        """Reset peak and starting equity baselines, e.g. after re-depositing or calibrating."""
        if current_equity is not None and current_equity > 0:
            self.initial_equity = current_equity
            self.peak_equity = current_equity
            self.daily_starting_equity = current_equity
        elif self.initial_equity is not None and self.initial_equity > 0:
            self.peak_equity = self.initial_equity
            self.daily_starting_equity = self.initial_equity
        self.daily_pnl = 0.0
        self.consecutive_losses = 0
        self.cooldown_until = None
        db.record_system_event(
            severity="INFO",
            component="RiskEngine",
            event_type="DRAWDOWN_BASELINE_RESET",
            message=f"Drawdown baseline reset. Peak equity set to {self.peak_equity}"
        )

    def evaluate(
        self,
        signal: FusedSignal,
        market_state: MarketState,
        account_equity: float,
        open_positions_count: int,
        is_broker_connected: bool = True,
        symbol_specs: Optional[Any] = None
    ) -> RiskDecision:
        """
        Deterministic pre-trade risk evaluation.
        Every proposed order must pass all 13 checks.
        """
        decision_id = f"RISK_{uuid.uuid4().hex[:12]}"
        now = market_state.timestamp if (market_state and market_state.timestamp) else datetime.now(timezone.utc)
        self.update_account_metrics(account_equity, current_time=now)

        # Helper to construct rejection
        def reject(code: str, reason: str) -> RiskDecision:
            decision = RiskDecision(
                signal_id=signal.signal_id,
                timestamp=now,
                approved=False,
                rejection_code=code,
                reason=reason,
                lot_size=0.0,
                risk_amount_usd=0.0,
                stop_distance_points=0.0,
                account_equity=account_equity
            )
            db.record_risk_decision(decision_id, decision)
            db.record_system_event(
                severity="WARNING",
                component="RiskEngine",
                event_type="TRADE_REJECTED",
                message=f"Signal {signal.signal_id} rejected: [{code}] {reason}",
                correlation_id=signal.signal_id
            )
            return decision

        # 1. Global Emergency Stop
        if self._emergency_stop:
            return reject("REJECT_EMERGENCY_STOP", f"Emergency stop active: {self._emergency_reason}")

        # 2. Broker Connection Status
        if not is_broker_connected:
            return reject("REJECT_BROKER_OFFLINE", "Execution gateway disconnected or unhealthy")

        # 3. Signal Validity
        if not signal.is_valid or signal.side == OrderSide.NO_TRADE:
            return reject("REJECT_SIGNAL_INVALID", "Incoming signal is marked invalid or NO_TRADE")

        # 4. Signal Expiry
        if now > signal.expiry:
            return reject("REJECT_SIGNAL_EXPIRED", f"Signal expired at {signal.expiry.isoformat()}")

        # 5. Duplicate Signal Protection
        last_sig_time = self._recent_signals.get(signal.strategy_id)
        if last_sig_time:
            time_since = (now - last_sig_time).total_seconds()
            if time_since < settings.risk.duplicate_signal_window_seconds:
                return reject("REJECT_DUPLICATE_SIGNAL", f"Duplicate signal within lockout window ({time_since:.0f}s < {settings.risk.duplicate_signal_window_seconds}s)")

        # 6. Max Open Positions
        if open_positions_count >= settings.risk.max_open_positions:
            return reject("REJECT_MAX_POSITIONS", f"Open positions ({open_positions_count}) reached maximum allowed ({settings.risk.max_open_positions})")

        # 7. Max Daily Loss Limit
        daily_loss_pct = 0.0
        if self.daily_starting_equity and self.daily_starting_equity > 0:
            daily_loss_pct = max(0.0, -self.daily_pnl) / self.daily_starting_equity * 100.0
        if daily_loss_pct >= settings.risk.max_daily_loss_pct:
            return reject("REJECT_MAX_DAILY_LOSS", f"Daily loss limit reached ({daily_loss_pct:.2f}% >= {settings.risk.max_daily_loss_pct}%)")
        # Daily profit target lockout: scale dynamically by percentage for accounts < $400
        # (avoiding an inappropriate $20 implied target on a $10 micro account)
        daily_target_pct = getattr(settings.risk, "daily_profit_target_pct", 5.0)
        if self.daily_starting_equity and self.daily_starting_equity < 400.0:
            target_usd = round(self.daily_starting_equity * (daily_target_pct / 100.0), 2)
        else:
            target_usd = getattr(settings.risk, "daily_profit_target_usd", 20.0)

        if target_usd is not None and self.daily_pnl >= target_usd:
            return reject("REJECT_DAILY_PROFIT_GOAL_REACHED", f"Daily profit target reached (${self.daily_pnl:.2f} >= ${target_usd:.2f})")

        # 7b. Maximum Profitable Trades per Account per Day (5 Wins Limit)
        max_winning_trades = getattr(settings.risk, "max_daily_profitable_trades", 5)
        if self.is_daily_profit_locked or self.daily_profitable_trades >= max_winning_trades:
            return reject(
                "REJECT_DAILY_MAX_WINNING_TRADES_REACHED",
                f"Maximum 5 profitable trades reached for today ({self.daily_profitable_trades} >= {max_winning_trades}). Daily profit locked to ensure closing balance exceeds starting balance."
            )

        # 8. Max Total Drawdown Limit
        drawdown_pct = 0.0
        if self.peak_equity and self.peak_equity > 0:
            drawdown_pct = (self.peak_equity - account_equity) / self.peak_equity * 100.0
        if drawdown_pct >= settings.risk.max_drawdown_pct:
            return reject("REJECT_MAX_DRAWDOWN", f"Account drawdown limit exceeded ({drawdown_pct:.2f}% >= {settings.risk.max_drawdown_pct}%)")

        # 9. Consecutive Losses Cooldown
        if self.cooldown_until and now < self.cooldown_until:
            mins_left = (self.cooldown_until - now).total_seconds() / 60.0
            return reject("REJECT_CONSECUTIVE_LOSSES", f"Consecutive loss cooldown active ({mins_left:.0f}m remaining)")
        elif self.cooldown_until and now >= self.cooldown_until:
            self.cooldown_until = None

        if self.consecutive_losses >= settings.risk.max_consecutive_losses:
            return reject("REJECT_CONSECUTIVE_LOSSES", f"Consecutive loss cooldown active ({self.consecutive_losses} >= {settings.risk.max_consecutive_losses})")

        # 10. Spread Limit
        if market_state.spread_points > settings.risk.max_spread_points:
            return reject("REJECT_SPREAD_TOO_HIGH", f"Current spread ({market_state.spread_points:.1f} pts) exceeds maximum ({settings.risk.max_spread_points} pts)")

        # 11. Minimum Risk / Reward Ratio (Adaptive by Account Equity Tier)
        tier_params = settings.risk.get_tier_parameters(account_equity)
        min_required_rr = settings.risk.min_risk_reward_ratio
        if signal.risk_reward < min_required_rr:
            return reject("REJECT_MIN_RR_VIOLATED", f"Setup risk/reward {signal.risk_reward:.2f} is below required minimum {min_required_rr:.2f}")

        # 12. Stop Distance Limits
        stop_dist_pts = round(abs(signal.entry - signal.stop_loss) / settings.contract.point_size, 1)
        min_stop_allowed = settings.risk.min_stop_distance_points
        if symbol_specs and hasattr(symbol_specs, "stops_level_points") and symbol_specs.stops_level_points > 0:
            min_stop_allowed = max(min_stop_allowed, symbol_specs.stops_level_points)
        if stop_dist_pts < min_stop_allowed:
            return reject("REJECT_STOP_TOO_TIGHT", f"Stop distance {stop_dist_pts:.1f} pts is below minimum {min_stop_allowed:.1f} pts")
        
        effective_max_stop = settings.risk.max_stop_distance_points
        if account_equity <= 250.0:
            effective_max_stop = min(effective_max_stop, 500.0)

        if stop_dist_pts > effective_max_stop:
            return reject("REJECT_STOP_TOO_WIDE", f"Stop distance {stop_dist_pts:.1f} pts exceeds maximum allowed {effective_max_stop:.1f} pts")

        # 13. Session Restrictions
        if settings.risk.session_restrictions_enabled:
            if market_state.session in (SessionName.ROLLOVER_CAUTION, SessionName.OFF_HOURS):
                return reject("REJECT_SESSION_RESTRICTION", f"Trading barred during illiquid session: {market_state.session.value}")

        # 14. High-Impact News Lockout
        news_status, event, news_reason = news_engine.check_news_status(now)
        if news_status == NewsImpactStatus.NEWS_LOCKOUT:
            return reject("REJECT_NEWS_LOCKOUT", news_reason)

        # 15. Deterministic Position Sizing Calculation
        effective_risk_pct = getattr(self, "max_risk_per_trade_pct", settings.risk.max_risk_per_trade_pct)
        if account_equity >= 1000.0 and effective_risk_pct > 2.0:
            effective_risk_pct = 1.0

        contract_sz = getattr(symbol_specs, "contract_size", settings.contract.contract_size) if symbol_specs else settings.contract.contract_size
        pt_sz = getattr(symbol_specs, "point_size", settings.contract.point_size) if symbol_specs else settings.contract.point_size
        min_v = getattr(symbol_specs, "min_volume", settings.contract.min_lot) if symbol_specs else settings.contract.min_lot
        max_v = getattr(symbol_specs, "max_volume", settings.contract.max_lot) if symbol_specs else settings.contract.max_lot
        v_step = getattr(symbol_specs, "volume_step", settings.contract.lot_step) if symbol_specs else settings.contract.lot_step
        spread_pts = getattr(symbol_specs, "estimated_spread_points", 0.0) if symbol_specs else 0.0
        comm_lot = getattr(symbol_specs, "commission_per_lot_usd", 0.0) if symbol_specs else 0.0
        slip_pts = getattr(symbol_specs, "slippage_allowance_points", 0.0) if symbol_specs else 0.0
        hard_cap = tier_params.get("hard_risk_cap_pct", settings.risk.max_micro_risk_pct)

        lot_size, risk_usd, stop_pts = PositionSizer.calculate_lot_size(
            account_equity=account_equity,
            entry_price=signal.entry,
            stop_loss=signal.stop_loss,
            risk_pct=effective_risk_pct,
            risk_ceiling_pct=hard_cap,
            contract_size=contract_sz,
            point_size=pt_sz,
            min_lot=min_v,
            max_lot=max_v,
            lot_step=v_step,
            spread_points=spread_pts,
            commission_per_lot=comm_lot,
            slippage_points=slip_pts,
            allow_min_lot_override=settings.risk.allow_min_lot_override
        )

        if lot_size < min_v:
            return reject("REJECT_LOT_SIZE_ZERO", f"Calculated position size ({lot_size} lots) below broker minimum ({min_v}) or exceeds risk ceiling")

        # 16. Free Margin Check
        if symbol_specs:
            lev = getattr(symbol_specs, "leverage", 500.0)
            req_margin = round((lot_size * contract_sz * signal.entry) / max(lev, 1.0), 2)
            if req_margin > account_equity:
                return reject("REJECT_INSUFFICIENT_MARGIN", f"Required margin (${req_margin:.2f}) exceeds account equity (${account_equity:.2f})")

        # Trade Approved
        self._recent_signals[signal.strategy_id] = now
        approval = RiskDecision(
            signal_id=signal.signal_id,
            timestamp=now,
            approved=True,
            rejection_code=None,
            reason=f"Approved {signal.side.value} {lot_size:.2f} lots at ${signal.entry:.2f} (Risk: ${risk_usd:.2f}, R:R: {signal.risk_reward:.2f})",
            lot_size=lot_size,
            risk_amount_usd=risk_usd,
            stop_distance_points=stop_pts,
            account_equity=account_equity
        )
        db.record_risk_decision(decision_id, approval)
        db.record_system_event(
            severity="INFO",
            component="RiskEngine",
            event_type="TRADE_APPROVED",
            message=f"Signal {signal.signal_id} approved for {lot_size:.2f} lots",
            correlation_id=signal.signal_id
        )
        return approval


# Global default risk engine
risk_engine = RiskEngine()
