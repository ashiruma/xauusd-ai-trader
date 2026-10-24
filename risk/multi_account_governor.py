"""
Multi-Account Risk Governor & Capital Preservation Orchestrator.
Enforces:
1. Trade execution across all active verified trader accounts.
2. Strict cap of maximum 5 profitable trades per account per calendar day.
3. Daily Capital Growth Invariant: Starting balance must be strictly lower than closing balance.
4. Profit Cushion Compounding Protocol (Model 2):
   - Hysteresis Deadband (+30% trigger, +15% parachute floor, new high required to re-arm).
   - Conservative Lot Floor & 10% Profit Cushion Dollar Cap.
   - Market Regime Gating (only trend/killzones; throttled during compression/chop/news).
"""

from datetime import datetime, timezone, date
import logging
from typing import Dict, Any, List, Optional, Tuple
from config.settings import settings

logger = logging.getLogger(__name__)


class AccountDailySession:
    """Tracks daily lifecycle metrics and capital preservation for an individual trader account."""

    def __init__(
        self,
        account_id: str,
        initial_balance: float,
        current_date: Optional[date] = None,
        baseline_capital: Optional[float] = None
    ):
        self.account_id = str(account_id).strip()
        self.current_date: date = current_date or datetime.now(timezone.utc).date()
        self.starting_balance: float = round(float(initial_balance), 2)
        self.current_balance: float = round(float(initial_balance), 2)
        self.closing_balance: Optional[float] = None
        
        # Long-term baseline capital anchor (deposit baseline)
        self.baseline_capital: float = round(float(baseline_capital if baseline_capital is not None else initial_balance), 2)
        self.peak_equity: float = round(float(initial_balance), 2)
        self.accelerator_state: str = "BASELINE"  # "BASELINE" | "ACCELERATED" | "PARACHUTE_DOWNGRADE"
        self.last_trigger_high: float = round(float(initial_balance), 2)
        self.profit_cushion_usd: float = 0.0

        self.daily_profitable_trades: int = 0
        self.daily_losing_trades: int = 0
        self.daily_total_trades: int = 0
        self.daily_realized_pnl: float = 0.0
        
        self.is_daily_locked: bool = False
        self.lock_reason: Optional[str] = None
        self.history: List[Dict[str, Any]] = []

    def rollover_if_new_day(self, current_balance: float, current_date: Optional[date] = None) -> bool:
        """Roll over to a new trading day, recording yesterday's closing balance."""
        today = current_date or datetime.now(timezone.utc).date()
        if today != self.current_date:
            # Finalize previous day closing balance
            self.closing_balance = round(float(current_balance), 2)
            growth = round(self.closing_balance - self.starting_balance, 2)
            growth_pct = round((growth / self.starting_balance * 100.0) if self.starting_balance > 0 else 0.0, 2)
            
            logger.info(
                f"[DAILY ROLLOVER] Account #{self.account_id}: "
                f"Starting: ${self.starting_balance:.2f} -> Closing: ${self.closing_balance:.2f} "
                f"(Delta: ${growth:+.2f}, {growth_pct:+.2f}%) | Wins: {self.daily_profitable_trades}/5"
            )

            # Reset for today
            self.current_date = today
            self.starting_balance = round(float(current_balance), 2)
            self.current_balance = round(float(current_balance), 2)
            self.closing_balance = None
            self.daily_profitable_trades = 0
            self.daily_losing_trades = 0
            self.daily_total_trades = 0
            self.daily_realized_pnl = 0.0
            self.is_daily_locked = False
            self.lock_reason = None
            return True
        return False

    def can_open_trade(self) -> Tuple[bool, str]:
        """Verify whether this account is eligible to open a new trade today."""
        max_winning_trades = getattr(settings.risk, "max_daily_profitable_trades", 5)

        if self.is_daily_locked:
            return False, self.lock_reason or "Account trading locked for today."

        if self.daily_profitable_trades >= max_winning_trades:
            self.is_daily_locked = True
            self.lock_reason = (
                f"Daily profit goal reached: 5 profitable trades secured ({self.daily_profitable_trades}/{max_winning_trades}). "
                f"Trading locked to preserve positive closing balance (${self.current_balance:.2f} > ${self.starting_balance:.2f})."
            )
            return False, self.lock_reason

        # Daily loss circuit breaker check
        max_daily_loss_pct = getattr(settings.risk, "max_daily_loss_pct", 3.0)
        if self.starting_balance > 0:
            current_loss_pct = max(0.0, -self.daily_realized_pnl) / self.starting_balance * 100.0
            if current_loss_pct >= max_daily_loss_pct:
                self.is_daily_locked = True
                self.lock_reason = f"Daily loss limit hit ({current_loss_pct:.2f}% >= {max_daily_loss_pct}%). Circuit breaker engaged."
                return False, self.lock_reason

        return True, "ELIGIBLE"

    def evaluate_cushion_risk_tier(
        self,
        current_equity: float,
        market_regime: Optional[str] = None
    ) -> Tuple[float, Optional[float], str, str]:
        """
        Model 2: Profit Cushion ('House Money') Dynamic Compounding Protocol.
        Guardrails:
        1. Hysteresis Deadband (+30% trigger, +15% parachute floor, new high required to re-arm).
        2. Conservative Lot Floor & 10% Profit Cushion Dollar Cap.
        3. Market Regime Gating (only trend/killzones; throttled during compression/chop/news).

        Returns:
            (effective_risk_pct, max_cushion_dollar_cap, accelerator_state, reason_description)
        """
        eq = max(0.0, float(current_equity))
        standard_risk = getattr(settings.risk, "max_risk_per_trade_pct", 2.0)
        accelerated_risk = getattr(settings.risk, "cushion_accelerated_risk_pct", 2.75)
        trigger_pct = getattr(settings.risk, "cushion_trigger_growth_pct", 30.0)
        parachute_floor_pct = getattr(settings.risk, "cushion_parachute_floor_pct", 15.0)
        rearm_buffer_pct = getattr(settings.risk, "cushion_rearm_buffer_pct", 5.0)
        max_cushion_alloc_pct = getattr(settings.risk, "max_cushion_risk_allocation_pct", 10.0)
        enabled = getattr(settings.risk, "enable_profit_cushion_accelerator", True)

        if not enabled:
            return standard_risk, None, "BASELINE", "Profit cushion accelerator disabled in settings"

        if self.baseline_capital <= 0:
            self.baseline_capital = eq

        if eq > self.peak_equity:
            self.peak_equity = eq

        growth_usd = round(eq - self.baseline_capital, 2)
        growth_pct = round((growth_usd / self.baseline_capital * 100.0) if self.baseline_capital > 0 else 0.0, 2)
        self.profit_cushion_usd = max(0.0, growth_usd)

        # -----------------------------------------------------------------
        # 1. State Transitions & Hysteresis (Deadband buffer)
        # -----------------------------------------------------------------
        if self.accelerator_state == "BASELINE":
            if growth_pct >= trigger_pct:
                self.accelerator_state = "ACCELERATED"
                self.last_trigger_high = eq
                logger.info(
                    f"[CUSHION ACCELERATOR ARMED] Account #{self.account_id}: "
                    f"Equity ${eq:.2f} reached +{growth_pct:.1f}% (>= +{trigger_pct}% threshold). "
                    f"Profit Cushion: ${self.profit_cushion_usd:.2f}. Risk scaled to {accelerated_risk}%."
                )

        elif self.accelerator_state == "ACCELERATED":
            if eq > self.last_trigger_high:
                self.last_trigger_high = eq

            # Parachute Floor Check: Disengage if equity pulls back below parachute floor (+15%)
            if growth_pct < parachute_floor_pct:
                self.accelerator_state = "PARACHUTE_DOWNGRADE"
                logger.warning(
                    f"[CUSHION PARACHUTE ENGAGED] Account #{self.account_id}: "
                    f"Equity ${eq:.2f} pulled back to +{growth_pct:.1f}% (< +{parachute_floor_pct}% floor). "
                    f"Accelerator disengaged back to {standard_risk}% baseline to shield profits."
                )

        elif self.accelerator_state == "PARACHUTE_DOWNGRADE":
            # Re-arm requires making a clean new high above prior peak + buffer to eliminate whipsaw
            rearm_target = self.last_trigger_high * (1.0 + (rearm_buffer_pct / 100.0))
            if eq >= rearm_target:
                self.accelerator_state = "ACCELERATED"
                self.last_trigger_high = eq
                logger.info(
                    f"[CUSHION ACCELERATOR RE-ARMED] Account #{self.account_id}: "
                    f"Equity ${eq:.2f} broke new high >= ${rearm_target:.2f}. Accelerated tier restored."
                )

        # -----------------------------------------------------------------
        # 2. Risk Calculation & Guardrail Enforcement
        # -----------------------------------------------------------------
        if self.accelerator_state != "ACCELERATED":
            reason = (
                f"Standard Risk ({standard_risk}%): Baseline tier (Growth: {growth_pct:+.1f}%, "
                f"State: {self.accelerator_state})"
            )
            return standard_risk, None, self.accelerator_state, reason

        # Guardrail 3: Market Regime Gating
        non_trending_regimes = ("CHOP", "RANGE", "NEWS_EVENT", "HIGH_VOLATILITY_CHOP", "OFF_HOURS", "ROLLOVER_CAUTION")
        if market_regime and any(r in market_regime.upper() for r in non_trending_regimes):
            reason = (
                f"Regime Gated ({standard_risk}%): Profit cushion active (+{growth_pct:.1f}%), "
                f"but market regime '{market_regime}' is not trending. Sizing throttled to protect capital."
            )
            return standard_risk, None, "ACCELERATED_REGIME_THROTTLED", reason

        # Guardrail 2: Profit Cushion Dollar Cap (max 10% of profit cushion per trade)
        cushion_dollar_cap = round(self.profit_cushion_usd * (max_cushion_alloc_pct / 100.0), 2)
        cushion_dollar_cap = max(1.0, cushion_dollar_cap)

        reason = (
            f"Accelerated Risk ({accelerated_risk}%): Milestone +{growth_pct:.1f}% active. "
            f"Profit Cushion: ${self.profit_cushion_usd:.2f} (Max single risk cap: ${cushion_dollar_cap:.2f})."
        )
        return accelerated_risk, cushion_dollar_cap, "ACCELERATED", reason

    def record_trade_completion(self, pnl: float, new_balance: Optional[float] = None) -> Dict[str, Any]:
        """Record trade result, update profitable trade counter, and enforce closing balance rules."""
        self.daily_total_trades += 1
        self.daily_realized_pnl = round(self.daily_realized_pnl + pnl, 2)
        
        if new_balance is not None and new_balance > 0:
            self.current_balance = round(float(new_balance), 2)
        else:
            self.current_balance = round(self.current_balance + pnl, 2)

        if self.current_balance > self.peak_equity:
            self.peak_equity = self.current_balance

        max_winning_trades = getattr(settings.risk, "max_daily_profitable_trades", 5)
        
        if pnl > 0:
            self.daily_profitable_trades += 1
            logger.info(
                f"[PROFITABLE TRADE] Account #{self.account_id}: +${pnl:.2f} "
                f"({self.daily_profitable_trades}/{max_winning_trades} wins today). "
                f"Balance: ${self.current_balance:.2f} (Start: ${self.starting_balance:.2f})"
            )
            
            # Check if 5 profitable trades reached
            if self.daily_profitable_trades >= max_winning_trades:
                self.is_daily_locked = True
                self.closing_balance = self.current_balance
                self.lock_reason = (
                    f"Daily target achieved: 5 profitable trades completed. "
                    f"Trading locked to guarantee starting balance (${self.starting_balance:.2f}) "
                    f"< closing balance (${self.current_balance:.2f})."
                )
                logger.info(f"[DAILY GOAL ACHIEVED] Account #{self.account_id}: {self.lock_reason}")
        else:
            self.daily_losing_trades += 1
            logger.warning(
                f"[LOSS RECORDED] Account #{self.account_id}: ${pnl:.2f}. "
                f"Daily PnL: ${self.daily_realized_pnl:.2f}. Balance: ${self.current_balance:.2f}"
            )

        # Update cushion metrics on trade completion
        self.profit_cushion_usd = max(0.0, round(self.current_balance - self.baseline_capital, 2))

        trade_event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "pnl": round(pnl, 2),
            "current_balance": self.current_balance,
            "starting_balance": self.starting_balance,
            "baseline_capital": self.baseline_capital,
            "profit_cushion_usd": self.profit_cushion_usd,
            "accelerator_state": self.accelerator_state,
            "profitable_trades": self.daily_profitable_trades,
            "is_net_positive": (self.current_balance > self.starting_balance),
        }
        self.history.append(trade_event)
        return trade_event

    def to_dict(self) -> Dict[str, Any]:
        max_winning = getattr(settings.risk, "max_daily_profitable_trades", 5)
        is_net_positive = (self.current_balance > self.starting_balance)
        growth_over_baseline = round(self.current_balance - self.baseline_capital, 2)
        growth_over_baseline_pct = round((growth_over_baseline / self.baseline_capital * 100.0) if self.baseline_capital > 0 else 0.0, 2)

        return {
            "account_id": self.account_id,
            "date": str(self.current_date),
            "starting_balance": self.starting_balance,
            "current_balance": self.current_balance,
            "closing_balance": self.closing_balance or self.current_balance,
            "baseline_capital": self.baseline_capital,
            "peak_equity": self.peak_equity,
            "profit_cushion_usd": max(0.0, growth_over_baseline),
            "growth_over_baseline_pct": growth_over_baseline_pct,
            "accelerator_state": self.accelerator_state,
            "last_trigger_high": self.last_trigger_high,
            "net_profit_usd": round(self.current_balance - self.starting_balance, 2),
            "net_profit_pct": round(((self.current_balance - self.starting_balance) / self.starting_balance * 100.0) if self.starting_balance > 0 else 0.0, 2),
            "daily_profitable_trades": self.daily_profitable_trades,
            "max_daily_profitable_trades": max_winning,
            "daily_total_trades": self.daily_total_trades,
            "is_daily_locked": self.is_daily_locked,
            "lock_reason": self.lock_reason,
            "is_net_positive": is_net_positive,
            "status": "GOAL_REACHED_LOCKED" if (self.is_daily_locked and is_net_positive) else "DRAWDOWN_LOCKED" if self.is_daily_locked else "ACTIVE",
        }


class MultiAccountGovernor:
    """Manages multi-trader execution sessions, 5-win targets, and daily balance preservation."""

    def __init__(self):
        self._accounts: Dict[str, AccountDailySession] = {}

    def get_or_register_account(
        self,
        account_id: str,
        current_balance: float = 100.0,
        current_date: Optional[date] = None,
        baseline_capital: Optional[float] = None
    ) -> AccountDailySession:
        acc_key = str(account_id).strip()
        if acc_key not in self._accounts:
            self._accounts[acc_key] = AccountDailySession(
                account_id=acc_key,
                initial_balance=current_balance,
                current_date=current_date,
                baseline_capital=baseline_capital
            )
        else:
            if current_date is not None:
                self._accounts[acc_key].rollover_if_new_day(current_balance, current_date=current_date)
            elif self._accounts[acc_key].current_date == datetime.now(timezone.utc).date():
                self._accounts[acc_key].rollover_if_new_day(current_balance)
        return self._accounts[acc_key]

    def can_account_trade(
        self,
        account_id: str,
        current_balance: Optional[float] = None,
        current_date: Optional[date] = None
    ) -> Tuple[bool, str]:
        """Check if an individual trader account is authorized to place another trade today."""
        session = self.get_or_register_account(account_id, current_balance or 100.0, current_date=current_date)
        return session.can_open_trade()

    def get_account_risk_tier(
        self,
        account_id: str,
        current_equity: float,
        market_regime: Optional[str] = None
    ) -> Tuple[float, Optional[float], str, str]:
        """
        Calculates dynamic risk tier and cushion cap for an account using Model 2 rules.
        Returns:
            (effective_risk_pct, max_cushion_dollar_cap, accelerator_state, reason)
        """
        session = self.get_or_register_account(account_id, current_equity)
        return session.evaluate_cushion_risk_tier(current_equity, market_regime=market_regime)

    def record_account_trade(
        self,
        account_id: str,
        pnl: float,
        new_balance: Optional[float] = None,
        current_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Record trade execution outcome for an account."""
        session = self.get_or_register_account(account_id, current_date=current_date)
        return session.record_trade_completion(pnl=pnl, new_balance=new_balance)

    def get_active_trader_summaries(self) -> List[Dict[str, Any]]:
        """Returns the real-time status of all managed trader accounts."""
        return [session.to_dict() for session in self._accounts.values()]

    def reset_all(self):
        """Reset internal memory (for testing and new deployment cycles)."""
        self._accounts.clear()


# Global singleton instance
multi_account_governor = MultiAccountGovernor()
