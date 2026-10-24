"""
Unit & Integration Tests for:
1. ICT / SMC (Smart Money Concepts) Trading Logic Alignment.
2. Multi-Account Execution for All Active Traders.
3. Maximum 5 Profitable Trades Per Account Per Day Circuit Breaker.
4. Capital Growth Invariant: Starting Balance Must Be Lower Than Closing Balance.
"""

from datetime import datetime, timezone, timedelta, date
import pytest

from config.settings import settings, SessionName, MarketRegimeType, OrderSide
from data.models import MarketState, FusedSignal
from strategy.ict_smc_confluence import IctSmcConfluenceStrategy
from risk.multi_account_governor import MultiAccountGovernor, AccountDailySession
from risk.risk_engine import RiskEngine


@pytest.fixture
def london_killzone_market_state():
    now = datetime(2026, 10, 24, 8, 30, tzinfo=timezone.utc)
    return MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=2650.0,
        bid=2649.90,
        ask=2650.10,
        spread_points=20.0,
        atr_14=2.40,
        rsi_14=42.0,
        ema_9=2651.0,
        ema_21=2653.0,
        ema_50=2655.0,
        ema_200=2640.0,
        recent_swing_high=2665.0,
        recent_swing_low=2645.0,
        previous_day_high=2670.0,
        previous_day_low=2642.0,
        asian_range_high=2662.0,
        asian_range_low=2649.50,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="London Killzone Bullish SMC Setup",
        open_positions_count=0
    )


# =============================================================================
# 1. SMC & ICT TRADING LOGIC VERIFICATION
# =============================================================================

class TestIctSmcTradingLogic:
    def test_bullish_ssl_sweep_in_london_killzone(self, london_killzone_market_state):
        """Bullish SMC setup: Sweeps Asian Low / SSL, MSS displacement into FVG targeting BSL."""
        strat = IctSmcConfluenceStrategy()
        london_killzone_market_state.current_price = 2650.20
        london_killzone_market_state.asian_range_low = 2649.80  # swept by current/recent low
        
        setup = strat.evaluate(london_killzone_market_state)
        assert setup is not None
        assert setup.side == OrderSide.BUY
        assert setup.risk_reward >= 2.0
        assert setup.stop_loss < setup.entry
        assert setup.take_profit > setup.entry
        assert "ICT/SMC Bullish Reversal" in setup.reason
        assert "Sell-Side Liquidity" in setup.reason

    def test_bearish_bsl_sweep_in_ny_killzone(self, london_killzone_market_state):
        """Bearish SMC setup: Sweeps Asian High / BSL, MSS displacement into FVG targeting SSL."""
        strat = IctSmcConfluenceStrategy()
        ny_state = london_killzone_market_state.model_copy()
        ny_state.session = SessionName.NEW_YORK
        ny_state.regime = MarketRegimeType.TREND_DOWN
        ny_state.current_price = 2661.80
        ny_state.asian_range_high = 2662.20
        ny_state.previous_day_high = 2662.00

        setup = strat.evaluate(ny_state)
        assert setup is not None
        assert setup.side == OrderSide.SELL
        assert setup.risk_reward >= 2.0
        assert setup.stop_loss > setup.entry
        assert setup.take_profit < setup.entry
        assert "ICT/SMC Bearish Reversal" in setup.reason
        assert "Buy-Side Liquidity" in setup.reason

    def test_ict_rejects_outside_killzones(self, london_killzone_market_state):
        """ICT requires active London/NY Killzones; rollover/off-hours must be rejected."""
        strat = IctSmcConfluenceStrategy()
        off_hours_state = london_killzone_market_state.model_copy()
        off_hours_state.session = SessionName.OFF_HOURS
        setup = strat.evaluate(off_hours_state)
        assert setup is None

    def test_ict_rejects_news_event_window(self, london_killzone_market_state):
        """SMC/ICT rules reject trading into high impact news manipulation spikes."""
        strat = IctSmcConfluenceStrategy()
        news_state = london_killzone_market_state.model_copy()
        news_state.regime = MarketRegimeType.NEWS_EVENT
        setup = strat.evaluate(news_state)
        assert setup is None


# =============================================================================
# 2. MULTI-ACCOUNT 5 PROFITABLE TRADES LIMIT & BALANCE PRESERVATION
# =============================================================================

class TestMultiAccountDailyProfitableTradesAndBalance:
    def test_single_account_reaches_5_wins_and_locks(self):
        """Account can take at most 5 profitable trades. On the 5th win, daily trading locks."""
        governor = MultiAccountGovernor()
        account_id = "1200533810"
        session = governor.get_or_register_account(account_id, current_balance=100.0)

        assert session.starting_balance == 100.0
        assert session.current_balance == 100.0
        assert session.daily_profitable_trades == 0

        # Win 1
        can_trade, _ = governor.can_account_trade(account_id)
        assert can_trade is True
        governor.record_account_trade(account_id, pnl=2.50)
        assert session.daily_profitable_trades == 1
        assert session.current_balance == 102.50

        # Win 2, 3, 4
        governor.record_account_trade(account_id, pnl=3.00)
        governor.record_account_trade(account_id, pnl=2.00)
        governor.record_account_trade(account_id, pnl=2.80)
        assert session.daily_profitable_trades == 4
        can_trade, _ = governor.can_account_trade(account_id)
        assert can_trade is True

        # Win 5 (CAP REACHED)
        governor.record_account_trade(account_id, pnl=2.20)
        assert session.daily_profitable_trades == 5
        assert session.is_daily_locked is True

        # Next trade attempt must be rejected
        can_trade_6, reason = governor.can_account_trade(account_id)
        assert can_trade_6 is False
        assert "5 profitable trades" in reason

        # Verification of Capital Growth: Starting balance MUST be lower than closing balance
        assert session.starting_balance < session.closing_balance
        assert session.starting_balance == 100.0
        assert session.closing_balance == 112.50
        assert session.current_balance == 112.50
        assert session.to_dict()["is_net_positive"] is True

    def test_multi_account_independence(self):
        """Multiple active trader accounts are tracked independently."""
        governor = MultiAccountGovernor()
        acc_a = "1200533810"
        acc_b = "8229392"

        sess_a = governor.get_or_register_account(acc_a, current_balance=50.0)
        sess_b = governor.get_or_register_account(acc_b, current_balance=500.0)

        # Account A wins 5 trades -> locks
        for _ in range(5):
            governor.record_account_trade(acc_a, pnl=1.50)
        assert sess_a.is_daily_locked is True
        can_trade_a, _ = governor.can_account_trade(acc_a)
        assert can_trade_a is False

        # Account B has only 2 wins -> remains eligible
        governor.record_account_trade(acc_b, pnl=12.00)
        governor.record_account_trade(acc_b, pnl=15.00)
        assert sess_b.daily_profitable_trades == 2
        can_trade_b, _ = governor.can_account_trade(acc_b)
        assert can_trade_b is True
        assert sess_b.is_daily_locked is False

    def test_risk_engine_enforces_5_wins_circuit_breaker(self, london_killzone_market_state):
        """RiskEngine rejects setups once 5 profitable trades are completed."""
        engine = RiskEngine()
        engine.daily_starting_equity = 100.0
        engine.daily_profitable_trades = 5
        engine.is_daily_profit_locked = True

        now = datetime.now(timezone.utc)
        signal = FusedSignal(
            signal_id="SIG_SMC_TEST",
            timestamp=now,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=2650.0,
            stop_loss=2647.5,
            take_profit=2655.0,
            risk_reward=2.0,
            confidence=0.88,
            strategy_id="XAU_ICT_SMC_CONFLUENCE",
            market_regime=MarketRegimeType.TREND_UP,
            reasons=["SMC SSL sweep"],
            expiry=now + timedelta(hours=2),
            is_valid=True
        )

        decision = engine.evaluate(
            signal=signal,
            market_state=london_killzone_market_state,
            account_equity=115.0,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is False
        assert decision.rejection_code == "REJECT_DAILY_MAX_WINNING_TRADES_REACHED"
        assert "Maximum 5 profitable trades reached" in decision.reason

    def test_day_rollover_finalizes_positive_closing_balance(self):
        """Rollover resets daily metrics and ensures previous day's starting < closing balance."""
        governor = MultiAccountGovernor()
        account_id = "1200533810"
        day_1 = date(2026, 10, 23)
        day_2 = date(2026, 10, 24)

        session = governor.get_or_register_account(account_id, current_balance=100.0, current_date=day_1)
        for _ in range(5):
            governor.record_account_trade(account_id, pnl=2.00, current_date=day_1)
        assert session.current_balance == 110.0
        assert session.is_daily_locked is True

        # Rollover to next day
        session.rollover_if_new_day(current_balance=110.0, current_date=day_2)
        assert session.current_date == day_2
        assert session.starting_balance == 110.0  # new baseline
        assert session.daily_profitable_trades == 0  # reset for new day
        assert session.is_daily_locked is False  # unlocked for new day
        can_trade_day2, _ = governor.can_account_trade(account_id, current_date=day_2)
        assert can_trade_day2 is True
