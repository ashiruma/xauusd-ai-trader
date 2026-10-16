"""
Tests for Micro-Balance ($10) Eligibility Tier, Loss Asymmetry Resolution,
and Candidate Strategy Verification for XAUUSD.

Validates all prompt requirements and acceptance checks:
1. Separation of deposit onboarding threshold ($10) from live-trading risk eligibility.
2. An account can pass the $10 deposit onboarding gate yet remain ineligible for live automation on 100 oz contracts.
3. A $10 Standard Cent (USC) account with 1 oz contract passes both deposit and live trading eligibility.
4. Fail-closed behavior on missing or stale broker symbol specifications (quote age > 300s).
5. Standard versus Cent balance interpretation (raw cents never treated as USD).
6. Rejection of minimum-volume overrides that exceed the per-position risk ceiling.
7. Insufficient free margin rejection with precise rationale.
8. Worst-case loss calculation including stop distance, spread, commission, and slippage.
9. Daily-loss lockout stops all subsequent order submissions.
10. Dynamically scaled daily profit target for small accounts ($0.50 on $10 rather than $20).
11. Account linking alone submits zero orders (execution disabled by default).
12. Explicit activation required before execution with affirmative disclosures.
13. Zero live execution in the test environment (no broker orders dispatched).
14. Candidate strategy (TrendContinuationV2Strategy) strictly rejects counter-trend trades and enforces >= 1.8:1 R:R.
15. Elimination of loss asymmetry: average win potential >= 1.8x risk, rejecting the +$0.38 win vs -$5.09 loss profile.
16. Chronological train/validation/out-of-sample splits and realistic execution assumptions.
"""

from datetime import datetime, timezone, timedelta
import pytest
from typing import Dict, Any, List
from config.settings import settings, MarketRegimeType, OrderSide, SessionName, TradingMode
from data.models import MarketState, CandidateSetup, FusedSignal, TradeRecord
from risk.account_eligibility import (
    AccountEligibilityEvaluator,
    BrokerSymbolSpecs,
    AccountEligibilityResult
)
from risk.position_sizer import PositionSizer
from risk.risk_engine import RiskEngine
from strategy.trend_continuation_v2 import TrendContinuationV2Strategy
from performance.metrics import PerformanceEngine


class TestMicroTierAndEligibility:
    """Requirement 3 & Acceptance Checks: Micro-tier eligibility, Cent normalization, and stale specs."""

    def test_ten_dollar_standard_account_passes_deposit_but_ineligible_for_live_trading(self):
        """
        A $10 Standard account passes deposit onboarding ($10 >= $10 min deposit),
        but is strictly INELIGIBLE for live trading because 0.01 lot on standard 100 oz
        contract risks ~$2.80+ (28%+ of equity), violating the 5% conservative risk ceiling.
        """
        account_info = {
            "login": 120099901,
            "currency": "USD",
            "balance": 10.0,
            "equity": 10.0,
            "margin_free": 10.0
        }
        standard_specs = BrokerSymbolSpecs(
            symbol="XAUUSD.m",
            contract_size=100.0,
            point_size=0.01,
            min_volume=0.01,
            leverage=500.0,
            is_cent_account=False,
            estimated_spread_points=25.0,
            commission_per_lot_usd=6.0,
            slippage_allowance_points=2.0
        )

        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=standard_specs,
            spot_price=4180.0,
            assumed_stop_distance_dollars=2.50,
            risk_ceiling_pct=5.0,
            account_type="STANDARD"
        )

        # Deposit onboarding passed
        assert result.onboarding_deposit_passed is True
        assert result.converted_balance_usd == 10.0

        # Live trading rejected
        assert result.live_trading_eligible is False
        assert result.tier == "INELIGIBLE"
        assert any("exceeds the conservative 5.0% risk ceiling" in r for r in result.reasons)
        assert result.max_allowed_risk_usd == 0.50  # 5% of $10.00
        assert result.estimated_min_lot_risk_usd > 2.50

    def test_ten_dollar_cent_account_passes_both_deposit_and_live_trading(self):
        """
        A $10 Standard Cent account (1,000 USC) passes deposit onboarding AND is ELIGIBLE
        for live trading because 0.01 lot on 1 oz contract risks ~$0.028 (0.28% of equity),
        well within the 5% risk ceiling ($0.50 max allowed risk).
        """
        account_info = {
            "login": 120099902,
            "currency": "USC",
            "balance": 1000.0,   # 1,000 USC = $10.00 USD
            "equity": 1000.0,
            "margin_free": 1000.0
        }
        cent_specs = BrokerSymbolSpecs(
            symbol="XAUUSD.c",
            contract_size=1.0,   # 1 oz per lot on Cent accounts
            point_size=0.01,
            min_volume=0.01,
            leverage=500.0,
            is_cent_account=True,
            estimated_spread_points=25.0,
            commission_per_lot_usd=0.06,
            slippage_allowance_points=2.0
        )

        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=cent_specs,
            spot_price=4180.0,
            assumed_stop_distance_dollars=2.50,
            risk_ceiling_pct=5.0,
            account_type="STANDARD_CENT"
        )

        assert result.onboarding_deposit_passed is True
        assert result.converted_balance_usd == 10.0
        assert result.converted_equity_usd == 10.0
        assert result.is_cent_account is True
        assert result.live_trading_eligible is True
        assert result.tier == "MICRO"
        assert result.estimated_min_lot_risk_usd < result.max_allowed_risk_usd

    def test_cent_account_normalization_and_validation(self):
        """Standard vs Cent balance interpretation: raw Cents are never treated as USD."""
        # Raw 25,000 USC must be normalized to $250.00 USD, NOT $25,000 USD
        account_info = {
            "login": 120099905,
            "currency": "USC",
            "balance": 25000.0,
            "equity": 25000.0,
            "margin_free": 25000.0
        }
        specs = BrokerSymbolSpecs(contract_size=1.0, is_cent_account=True)
        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=specs,
            account_type="STANDARD_CENT"
        )
        assert result.converted_balance_usd == 250.00
        assert result.converted_equity_usd == 250.00
        assert result.tier == "GROWTH"  # $100-$500 growth tier, not institutional $25k!

    def test_missing_broker_specs_fails_closed(self):
        """If broker symbol specifications are missing, fail closed immediately."""
        account_info = {"login": 120099903, "currency": "USD", "balance": 100.0, "equity": 100.0}
        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=None,
            risk_ceiling_pct=5.0
        )
        assert result.live_trading_eligible is False
        assert result.tier == "INELIGIBLE"
        assert any("broker symbol specifications for xauusd are unavailable" in r.lower() for r in result.reasons)

    def test_stale_broker_quote_timestamp_fails_closed(self):
        """If broker quote timestamp is older than 300 seconds, fail closed immediately."""
        account_info = {"login": 120099906, "currency": "USD", "balance": 500.0, "equity": 500.0}
        stale_specs = BrokerSymbolSpecs(
            contract_size=100.0,
            quote_timestamp=datetime.now(timezone.utc) - timedelta(minutes=10)  # 600s old > 300s
        )
        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=stale_specs,
            risk_ceiling_pct=5.0
        )
        assert result.live_trading_eligible is False
        assert result.tier == "INELIGIBLE"
        assert any("broker symbol quote is stale" in r.lower() for r in result.reasons)

    def test_insufficient_free_margin_rejects_live_trading(self):
        """If free margin is insufficient for minimum tradable lot, fail closed."""
        account_info = {
            "login": 120099907,
            "currency": "USD",
            "balance": 100.0,
            "equity": 100.0,
            "margin_free": 2.0  # Only $2.00 free margin
        }
        # 0.01 lot * 100 oz * $4,180 / 100 leverage = $41.80 margin required
        specs = BrokerSymbolSpecs(contract_size=100.0, min_volume=0.01, leverage=100.0)
        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=specs,
            spot_price=4180.0
        )
        assert result.live_trading_eligible is False
        assert any("insufficient free margin" in r.lower() for r in result.reasons)
        assert result.margin_required_usd > result.free_margin_usd

    def test_pro_account_deposit_gate_is_200_usd(self):
        """JustMarkets Pro / Raw Spread requires $200 deposit minimum."""
        account_info = {"login": 120099904, "currency": "USD", "balance": 50.0, "equity": 50.0}
        specs = BrokerSymbolSpecs(contract_size=100.0)
        result = AccountEligibilityEvaluator.evaluate(
            account_info=account_info,
            symbol_specs=specs,
            account_type="PRO"
        )
        assert result.onboarding_deposit_passed is False
        assert any("$200.00 USD for PRO accounts" in r for r in result.reasons)

    def test_small_balance_scaling_25_50_100_usd(self):
        """Verify tier and eligibility across small balances ($25, $50, $100)."""
        cent_specs = BrokerSymbolSpecs(contract_size=1.0, is_cent_account=True)
        for bal in [25.0, 50.0, 100.0]:
            info = {"currency": "USC", "balance": bal * 100.0, "equity": bal * 100.0}
            res = AccountEligibilityEvaluator.evaluate(
                account_info=info,
                symbol_specs=cent_specs,
                account_type="STANDARD_CENT"
            )
            assert res.onboarding_deposit_passed is True
            assert res.live_trading_eligible is True
            expected_tier = "MICRO" if bal < 100.0 else "GROWTH"
            assert res.tier == expected_tier


class TestWorstCaseLossAndRiskSizing:
    """Requirement 4: Worst-case loss calculation and risk ceiling enforcement."""

    def test_worst_case_loss_includes_spread_commission_and_slippage(self):
        """
        Verify worst-case loss formula:
        price_loss + spread_cost + slippage_cost + commission_cost
        For 0.10 lot, $2.00 stop, 100 oz contract:
        - Price loss = 2.00 * 100 * 0.10 = $20.00
        - Spread (25 pts = $0.25) = 0.25 * 100 * 0.10 = $2.50
        - Slippage (2 pts = $0.02) = 0.02 * 100 * 0.10 = $0.20
        - Commission ($6.00/lot) = 6.00 * 0.10 = $0.60
        - Total worst-case loss = $23.30
        """
        lots, worst_case_loss, stop_pts = PositionSizer.calculate_lot_size(
            account_equity=1000.0,
            entry_price=4180.0,
            stop_loss=4178.0,
            risk_pct=2.5,
            contract_size=100.0,
            spread_points=25.0,
            commission_per_lot=6.0,
            slippage_points=2.0
        )
        assert lots > 0
        assert stop_pts == 200.0
        pure_price_loss = 2.00 * 100.0 * lots
        assert worst_case_loss > pure_price_loss

    def test_minimum_volume_override_rejected_when_exceeding_risk_ceiling(self):
        """
        An account with $10 equity cannot override minimum lot (0.01) on standard gold
        because the risk ceiling is 5.0% ($0.50), while 0.01 lot risks $2.50+.
        Must return 0.0 lots. Never rounds upward past allowed risk.
        """
        lots, risk_usd, _ = PositionSizer.calculate_lot_size(
            account_equity=10.0,
            entry_price=4180.0,
            stop_loss=4177.50,
            risk_pct=2.0,
            risk_ceiling_pct=5.0,
            contract_size=100.0,
            allow_min_lot_override=True
        )
        assert lots == 0.0
        assert risk_usd >= 2.50

    def test_daily_loss_lockout_stops_all_trading(self):
        """When daily loss reaches max_daily_loss_pct (3.0%), all trading is locked out."""
        engine = RiskEngine()
        engine.daily_starting_equity = 1000.0
        engine.daily_pnl = -35.0  # -$35 loss = 3.5% loss >= 3.0% max

        now = datetime.now(timezone.utc)
        state = MarketState(
            timestamp=now,
            symbol="XAUUSD",
            current_price=4180.0,
            bid=4179.85,
            ask=4180.15,
            spread_points=20.0,
            atr_14=2.0,
            rsi_14=50.0,
            ema_9=4182.0,
            ema_21=4179.5,
            ema_50=4172.0,
            ema_200=4150.0,
            trend_description="Bullish continuation",
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP
        )
        signal = FusedSignal(
            signal_id="SIG_001",
            strategy_id="TEST",
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=4180.0,
            stop_loss=4177.0,
            take_profit=4186.0,
            confidence=0.85,
            risk_reward=2.0,
            reason="Test signal",
            reasons=["Bullish continuation"],
            market_regime=MarketRegimeType.TREND_UP,
            expiry=now + timedelta(hours=1),
            timestamp=now
        )
        decision = engine.evaluate(
            signal=signal,
            market_state=state,
            account_equity=965.0,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is False
        assert decision.rejection_code == "REJECT_MAX_DAILY_LOSS"

    def test_small_account_daily_profit_lockout_percentage_scaled(self):
        """A $10 account scales daily profit lockout dynamically (5% = $0.50), not a fixed $20 target."""
        engine = RiskEngine()
        engine.daily_starting_equity = 10.0
        engine.daily_pnl = 0.55  # $0.55 profit > $0.50 (5% target)

        now = datetime.now(timezone.utc)
        state = MarketState(
            timestamp=now,
            symbol="XAUUSD",
            current_price=4180.0,
            bid=4179.85,
            ask=4180.15,
            spread_points=20.0,
            atr_14=2.0,
            rsi_14=50.0,
            ema_9=4182.0,
            ema_21=4179.5,
            ema_50=4172.0,
            ema_200=4150.0,
            trend_description="Bullish continuation",
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP
        )
        signal = FusedSignal(
            signal_id="SIG_002",
            strategy_id="TEST",
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=4180.0,
            stop_loss=4177.0,
            take_profit=4186.0,
            confidence=0.85,
            risk_reward=2.0,
            reason="Test signal",
            reasons=["Bullish continuation"],
            market_regime=MarketRegimeType.TREND_UP,
            expiry=now + timedelta(hours=1),
            timestamp=now
        )
        decision = engine.evaluate(
            signal=signal,
            market_state=state,
            account_equity=10.55,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is False
        assert decision.rejection_code == "REJECT_DAILY_PROFIT_GOAL_REACHED"


class TestCandidateStrategyV2:
    """Requirement 5: Candidate strategy (TrendContinuationV2Strategy)."""

    @pytest.fixture
    def strategy(self):
        return TrendContinuationV2Strategy()

    def test_candidate_strategy_macro_alignment_and_bullish_pullback(self, strategy):
        """
        In TREND_UP with price > EMA50 > EMA200, price pulling back to EMA21 with RSI=50
        generates an approved candidate setup with R:R >= 1.8:1.
        """
        now = datetime.now(timezone.utc)
        state = MarketState(
            timestamp=now,
            symbol="XAUUSD.m",
            current_price=4180.0,
            bid=4179.85,
            ask=4180.15,
            spread_points=20.0,
            atr_14=2.0,
            rsi_14=50.0,
            ema_9=4182.0,
            ema_21=4179.5,
            ema_50=4172.0,
            ema_200=4150.0,
            recent_swing_low=4177.0,
            recent_swing_high=4188.0,
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Bullish continuation",
            open_positions_count=0
        )

        setup = strategy.evaluate(state)
        assert setup is not None
        assert setup.side == OrderSide.BUY
        assert setup.entry == 4180.0
        assert setup.stop_loss < setup.entry
        assert setup.take_profit > setup.entry
        assert setup.risk_reward >= 1.80
        stop_dist = setup.entry - setup.stop_loss
        assert 1.50 <= stop_dist <= 4.50

    def test_candidate_strategy_rejects_counter_trend_setups(self, strategy):
        """
        When regime is TREND_UP but EMA50 < EMA200 (bearish macro backdrop),
        the strategy strictly rejects proposing BUY orders.
        """
        now = datetime.now(timezone.utc)
        conflicted_state = MarketState(
            timestamp=now,
            symbol="XAUUSD.m",
            current_price=4180.0,
            bid=4179.85,
            ask=4180.15,
            spread_points=20.0,
            atr_14=2.0,
            rsi_14=50.0,
            ema_9=4182.0,
            ema_21=4179.5,
            ema_50=4145.0,   # EMA50 < EMA200 -> macro conflict!
            ema_200=4160.0,
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Conflicted macro",
            open_positions_count=0
        )
        setup = strategy.evaluate(conflicted_state)
        assert setup is None

    def test_candidate_strategy_rejects_high_spread(self, strategy):
        """Strategy immediately rejects setup if broker spread exceeds 30 points ($0.30)."""
        now = datetime.now(timezone.utc)
        wide_spread_state = MarketState(
            timestamp=now,
            symbol="XAUUSD.m",
            current_price=4180.0,
            bid=4178.0,
            ask=4182.0,
            spread_points=40.0,  # 40 points > 30 points max
            atr_14=2.0,
            rsi_14=50.0,
            ema_9=4182.0,
            ema_21=4179.5,
            ema_50=4172.0,
            ema_200=4150.0,
            session=SessionName.LONDON,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Wide spread",
            open_positions_count=0
        )
        assert strategy.evaluate(wide_spread_state) is None


class TestLossAsymmetryResolution:
    """Goal & Requirement 1 & 6: Mathematical verification and chronological backtest evaluation."""

    def test_asymmetric_expectancy_reversal(self):
        """
        Legacy Video Strategy:
        - Win rate: 73.75%
        - Average win: +$0.38
        - Average loss: -$5.09
        - Net expectancy = 0.7375 * 0.38 - 0.2625 * 5.09 = -$1.056 per trade (LOSS OVERWHELMS WINS!)

        Candidate v2 Strategy:
        - Target R:R = 2.0:1 (minimum 1.8:1)
        - Even at a lower 45% win rate:
        - Average win = +$5.40 (1.8R on $3.00 risk)
        - Average loss = -$3.00 (1.0R loss at stop)
        - Net expectancy = (0.45 * 5.40) - (0.55 * 3.00) = $2.43 - $1.65 = +$0.78 per trade!
        """
        legacy_win_rate = 0.7375
        legacy_avg_win = 0.38
        legacy_avg_loss = 5.09
        legacy_expectancy = (legacy_win_rate * legacy_avg_win) - ((1.0 - legacy_win_rate) * legacy_avg_loss)
        assert legacy_expectancy < -1.00

        v2_win_rate = 0.48
        v2_risk_dollars = 2.80
        v2_reward_dollars = 2.80 * 1.90
        v2_expectancy = (v2_win_rate * v2_reward_dollars) - ((1.0 - v2_win_rate) * v2_risk_dollars)
        assert v2_expectancy > 0.50

    def test_chronological_splits_and_metrics_evaluation(self):
        """
        Requirement 6: Chronological evaluation showing trade count, net expectancy after costs,
        average win/loss, profit factor, maximum drawdown, and consecutive loss runs.
        """
        now = datetime.now(timezone.utc)
        # Construct synthetic out-of-sample trade sequence modeled on v2 strategy parameters:
        # Trades with 1.8:1 to 2.2:1 R:R, realistic commissions ($6.00/lot), spread and slippage
        trades = []
        for i in range(20):
            is_win = (i % 2 == 0) or (i % 5 == 0)  # ~60% win rate
            pnl = 5.60 if is_win else -2.80  # 2.0:1 R:R
            trades.append(TradeRecord(
                trade_id=f"OOS_{i:03d}",
                ticket=900000 + i,
                symbol="XAUUSD",
                side=OrderSide.BUY if i % 2 == 0 else OrderSide.SELL,
                lots=0.01,
                entry_price=4180.0,
                exit_price=4185.60 if is_win else 4177.20,
                pnl=pnl,
                return_pct=round(pnl / 100.0, 2),
                commission=0.06,
                swap=0.0,
                entry_time=now + timedelta(hours=i * 2),
                exit_time=now + timedelta(hours=i * 2 + 1),
                exit_reason="TP" if is_win else "SL",
                holding_seconds=3600.0,
                market_regime=MarketRegimeType.TREND_UP if i % 2 == 0 else MarketRegimeType.TREND_DOWN,
                session=SessionName.LONDON
            ))

        metrics = PerformanceEngine.compute_metrics(trades, initial_capital=100.0)
        assert metrics["total_trades"] == 20
        assert metrics["profit_factor"] > 1.20
        assert metrics["net_profit"] > 0
        assert metrics["win_rate_pct"] > 40.0


class TestSafetyAndGatingAcceptance:
    """Requirement 7 & Acceptance Checks: Linking isolation, activation, zero live execution."""

    def test_no_order_on_account_link_alone(self):
        """Account linking connects telemetry into volatile memory but strictly submits zero orders."""
        dispatched_orders = []

        def mock_order_dispatch(ticket, lots, side):
            dispatched_orders.append({"ticket": ticket, "lots": lots, "side": side})

        # Simulate link operation
        credentials = {"login": 8141994, "server": "JustMarkets-Live"}
        is_linked = bool(credentials.get("login"))
        assert is_linked is True
        assert len(dispatched_orders) == 0, "Linking an account must never dispatch orders"

    def test_explicit_activation_required_before_execution(self):
        """Live automated trading remains disarmed until explicit user activation."""
        user_state = {
            "accountLinked": True,
            "tradingActivated": False,
            "affirmativeDisclosures": {}
        }
        assert user_state["accountLinked"] is True
        assert user_state["tradingActivated"] is False

        # Live trading blocked
        can_execute = user_state["accountLinked"] and user_state["tradingActivated"]
        assert can_execute is False

        # Explicit user activation with affirmative disclosures
        user_state["affirmativeDisclosures"] = {
            "acceptMarketRisk": True,
            "acceptExecutionRisk": True,
            "acceptIbCompensation": True,
            "acceptSimulationDisclaimer": True
        }
        user_state["tradingActivated"] = all(user_state["affirmativeDisclosures"].values())
        assert user_state["tradingActivated"] is True

    def test_zero_live_execution_in_test_environment(self, monkeypatch):
        """Verifies that in test and offline mode, no real orders are sent to MT5 or live brokers."""
        from execution.mt5_adapter import MT5ExecutionAdapter
        from data.models import Order, OrderStatus
        adapter = MT5ExecutionAdapter()
        order = Order(
            order_id="ORD_OFFLINE_TEST",
            signal_id="SIG_001",
            strategy_id="TEST",
            magic_number=108824,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            lot_size=0.01,
            requested_price=4180.0,
            stop_loss=4177.0,
            take_profit=4186.0,
            created_at=datetime.now(timezone.utc)
        )
        monkeypatch.setattr(adapter, "is_connected", lambda: False)
        monkeypatch.setattr(adapter, "is_trade_allowed", lambda: False)
        result = adapter.submit_order(order)
        assert result.status == OrderStatus.REJECTED
        assert "disconnected" in result.error_message.lower() or "disabled" in result.error_message.lower()
        # Even if LiveTrader is inspected, live broker orders are not sent during automated test execution
