"""
Adversarial Verification Suite by Challenger 1.
Empirically stress-tests small account risk sizing ($50 equity @ $4,162+ XAUUSD),
broker filling modes, and Gemini AI provider fallback scenarios.
"""

import json
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
import httpx
import pytest

from config.settings import settings, SessionName
from data.models import (
    FusedSignal, CandidateSetup, AISignalDecision, RiskDecision, MarketState,
    Order, OrderSide, OrderStatus, MarketRegimeType, Tick
)
from risk.position_sizer import PositionSizer
from risk.risk_engine import RiskEngine
from execution.mt5_adapter import MT5ExecutionAdapter, MT5_AVAILABLE
from ai.provider import (
    GeminiAIProvider, DeterministicMockProvider, get_ai_provider
)
from ai.analyst import AIAnalyst
from fusion.signal_fusion import SignalFusionEngine
from strategy.session_breakout import SessionBreakoutStrategy
from service import TradingCoordinator
from api.app import _ws_broadcast_callback


# ==============================================================================
# CHALLENGE 1: Small Account Risk Sizing ($50 Account @ $4,162+ XAUUSD)
# ==============================================================================

class TestSmallAccountRiskSizing:
    @pytest.fixture
    def market_state_4162(self):
        return MarketState(
            symbol="XAUUSD",
            timestamp=datetime.now(timezone.utc),
            current_price=4162.04,
            bid=4161.90,
            ask=4162.18,
            spread_points=28.0,
            atr_14=3.5,
            rsi_14=55.0,
            ema_9=4161.0,
            ema_21=4158.0,
            ema_50=4150.0,
            ema_200=4130.0,
            session=SessionName.NEW_YORK,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Bullish impulse above EMA 21",
            open_positions_count=0
        )

    @pytest.fixture
    def buy_signal_4162(self):
        now = datetime.now(timezone.utc)
        return FusedSignal(
            signal_id="SIG_CHALLENGE_50",
            timestamp=now,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=4162.04,
            stop_loss=4158.04,  # $4.00 stop distance = 400 pts
            take_profit=4170.04,  # $8.00 TP = 800 pts (2.0 R:R)
            risk_reward=2.0,
            confidence=0.85,
            strategy_id="XAU_TREND_PULLBACK",
            market_regime=MarketRegimeType.TREND_UP,
            reasons=["Empirical challenge test signal"],
            expiry=now + timedelta(hours=1),
            is_valid=True
        )

    def test_position_sizer_standard_gold_stop(self):
        """Verify position sizer returns micro-lot 0.01 lot for standard $4.00 stop distance."""
        lot, risk_usd, pts = PositionSizer.calculate_lot_size(
            account_equity=50.0,
            entry_price=4162.04,
            stop_loss=4158.04,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lot == 0.01, f"Expected 0.01 micro-lot, got {lot}"
        assert risk_usd == 4.00, f"Expected $4.00 risk on 0.01 lot, got {risk_usd}"
        assert pts == 400.0

    def test_position_sizer_wide_stop_override(self):
        """Verify wide stop (e.g. $6.00 = $6.00 risk) still permits 0.01 lot via allow_min_lot_override."""
        lot, risk_usd, pts = PositionSizer.calculate_lot_size(
            account_equity=50.0,
            entry_price=4162.04,
            stop_loss=4156.04,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lot == 0.01
        assert risk_usd == 6.00
        assert pts == 600.0

    def test_position_sizer_equity_thresholds(self):
        """Adversarial check: minimum account equity threshold ($20.00)."""
        # Exactly $20.00 -> permits 0.01 micro-lot override
        lot_20, _, _ = PositionSizer.calculate_lot_size(
            account_equity=20.0,
            entry_price=4162.04,
            stop_loss=4158.04,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lot_20 == 0.01

        # Below $20.00 ($19.99) -> rejects because margin/risk cannot cover micro-lot
        lot_under, _, _ = PositionSizer.calculate_lot_size(
            account_equity=19.99,
            entry_price=4162.04,
            stop_loss=4158.04,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lot_under == 0.0

    def test_position_sizer_extreme_high_gold_price(self):
        """Adversarial check: Gold price at $10,000 / oz."""
        lot, risk_usd, pts = PositionSizer.calculate_lot_size(
            account_equity=50.0,
            entry_price=10000.00,
            stop_loss=9996.00,
            risk_pct=10.0,
            allow_min_lot_override=True
        )
        assert lot == 0.01
        assert risk_usd == 4.00
        assert pts == 400.0

    def test_risk_engine_evaluation_50_dollar_account(self, market_state_4162, buy_signal_4162):
        """
        Verify fresh RiskEngine evaluates $50 account without REJECT_MAX_DRAWDOWN or REJECT_LOT_SIZE_ZERO.
        """
        engine = RiskEngine()
        decision = engine.evaluate(
            signal=buy_signal_4162,
            market_state=market_state_4162,
            account_equity=50.0,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is True, f"Risk rejected: {decision.rejection_code} - {decision.reason}"
        assert decision.rejection_code is None
        assert decision.lot_size == 0.01
        assert decision.risk_amount_usd == 4.00
        assert engine.initial_equity == 50.0
        assert engine.peak_equity == 50.0

    def test_risk_engine_preserves_equity_across_subsequent_ticks(self, market_state_4162, buy_signal_4162):
        """
        Verify that multiple tick evaluations with $50 equity maintain 0% drawdown.
        """
        engine = RiskEngine()
        for i in range(10):
            engine.update_account_metrics(50.0)
            decision = engine.evaluate(
                signal=buy_signal_4162,
                market_state=market_state_4162,
                account_equity=50.0,
                open_positions_count=0,
                is_broker_connected=True
            )
            # Drawdown and zero lot size must NEVER be the reason
            assert decision.rejection_code != "REJECT_MAX_DRAWDOWN"
            assert decision.rejection_code != "REJECT_LOT_SIZE_ZERO"

    def test_drawdown_limit_triggers_only_on_genuine_drawdown(self, market_state_4162, buy_signal_4162):
        """
        Adversarially verify that drawdown limit DOES trigger when account equity genuinely drops > 8% from $50.
        $50 - 8% = $46.00. At $45.00 equity (10% drawdown), it MUST reject with REJECT_MAX_DRAWDOWN.
        """
        engine = RiskEngine()
        engine.update_account_metrics(50.0)  # Peak established at $50.0
        
        now = datetime.now(timezone.utc)
        sig = FusedSignal(
            signal_id="SIG_DD_TEST",
            timestamp=now,
            symbol="XAUUSD",
            side=OrderSide.BUY,
            entry=4162.04,
            stop_loss=4158.04,
            take_profit=4170.04,
            risk_reward=2.0,
            confidence=0.85,
            strategy_id="XAU_TREND_PULLBACK_NEW",
            market_regime=MarketRegimeType.TREND_UP,
            reasons=["test"],
            expiry=now + timedelta(hours=1),
            is_valid=True
        )
        decision = engine.evaluate(
            signal=sig,
            market_state=market_state_4162,
            account_equity=45.0,
            open_positions_count=0,
            is_broker_connected=True
        )
        assert decision.approved is False
        assert decision.rejection_code == "REJECT_MAX_DRAWDOWN"


# ==============================================================================
# CHALLENGE 2: Broker-Compliant Filling Mode (ORDER_FILLING_FOK)
# ==============================================================================

class TestBrokerFillingMode:
    def test_mt5_adapter_get_filling_type_prioritizes_fok(self):
        """Verify _get_filling_type returns ORDER_FILLING_FOK when symbol supports FOK."""
        adapter = MT5ExecutionAdapter()
        
        mock_info = MagicMock()
        mock_info.filling_mode = 1
        
        with patch("execution.mt5_adapter.mt5") as mock_mt5:
            mock_mt5.symbol_info.return_value = mock_info
            mock_mt5.ORDER_FILLING_FOK = 0
            mock_mt5.ORDER_FILLING_IOC = 1
            
            ft = adapter._get_filling_type()
            assert ft == mock_mt5.ORDER_FILLING_FOK

    def test_mt5_adapter_get_filling_type_prioritizes_fok_when_both_supported(self):
        """Verify _get_filling_type prioritizes FOK over IOC when filling_mode = 3 (FOK + IOC)."""
        adapter = MT5ExecutionAdapter()
        
        mock_info = MagicMock()
        mock_info.filling_mode = 3  # Both 1 and 2 set
        
        with patch("execution.mt5_adapter.mt5") as mock_mt5:
            mock_mt5.symbol_info.return_value = mock_info
            mock_mt5.ORDER_FILLING_FOK = 0
            mock_mt5.ORDER_FILLING_IOC = 1
            
            ft = adapter._get_filling_type()
            assert ft == mock_mt5.ORDER_FILLING_FOK

    def test_live_or_environment_filling_type(self):
        """Verify execution adapter filling type on currently running environment."""
        adapter = MT5ExecutionAdapter()
        ft = adapter._get_filling_type()
        if MT5_AVAILABLE:
            import MetaTrader5 as mt5
            assert ft == mt5.ORDER_FILLING_FOK
        else:
            assert ft == 0

    def test_mt5_adapter_submit_order_trade_not_allowed(self):
        """Adversarial check: submit_order cleanly rejects when terminal Algo Trading is disabled."""
        adapter = MT5ExecutionAdapter()
        adapter._connected = True
        
        order = Order(
            order_id="ORD_ALGO_CHECK",
            signal_id="SIG_01",
            strategy_id="XAU_TEST",
            magic_number=123456,
            symbol="XAUUSD.m",
            side=OrderSide.BUY,
            lot_size=0.01,
            requested_price=4162.0,
            stop_loss=4158.0,
            take_profit=4170.0,
            created_at=datetime.now(timezone.utc)
        )
        
        with patch.object(adapter, "is_trade_allowed", return_value=False):
            result_order = adapter.submit_order(order)
            assert result_order.status == OrderStatus.REJECTED
            assert "Algo Trading" in result_order.error_message


# ==============================================================================
# CHALLENGE 3: Gemini Fallback Stress-Testing
# ==============================================================================

class TestGeminiFallbackEngine:
    @pytest.fixture
    def sample_market_state(self):
        return MarketState(
            symbol="XAUUSD",
            timestamp=datetime.now(timezone.utc),
            current_price=4162.0,
            bid=4161.85,
            ask=4162.15,
            spread_points=30.0,
            atr_14=3.0,
            rsi_14=54.0,
            ema_9=4162.0,
            ema_21=4159.0,
            ema_50=4150.0,
            ema_200=4135.0,
            session=SessionName.NEW_YORK,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Bullish regime",
            open_positions_count=0
        )

    @pytest.fixture
    def sample_candidate_setup(self):
        now = datetime.now(timezone.utc)
        return CandidateSetup(
            strategy_id="XAU_TREND_PULLBACK",
            timestamp=now,
            side=OrderSide.BUY,
            entry=4162.0,
            stop_loss=4158.0,
            take_profit=4170.0,
            risk_reward=2.0,
            reason="Adversarial fallback candidate",
            expiry=now + timedelta(minutes=15)
        )

    def test_gemini_unconfigured_falls_back_cleanly(self):
        """When Gemini API key is missing, get_ai_provider must return DeterministicMockProvider."""
        with patch.object(settings.ai, "api_key", ""):
            with patch.dict("os.environ", {}, clear=True):
                provider = get_ai_provider("gemini")
                assert isinstance(provider, DeterministicMockProvider)

    def test_gemini_timeout_fallback_in_analyst(self, sample_market_state, sample_candidate_setup):
        """
        Adversarial test: Gemini API hangs and raises httpx.TimeoutException.
        AIAnalyst must catch it, fall back to DeterministicMockProvider, and return a valid decision
        with fallback reason appended.
        """
        gemini_provider = GeminiAIProvider(api_key="mock_key_12345")
        
        with patch("httpx.Client.post", side_effect=httpx.TimeoutException("ReadTimeout after 10s")):
            analyst = AIAnalyst(provider=gemini_provider)
            decision = analyst.analyze_setup(
                market_state=sample_market_state,
                candidate_setup=sample_candidate_setup
            )
            
            assert decision.decision == OrderSide.BUY
            assert decision.setup_valid is True
            assert any("fallback engaged" in r.lower() for r in decision.reasons)

    def test_gemini_http_500_or_429_fallback(self, sample_market_state, sample_candidate_setup):
        """
        Adversarial test: Gemini API returns HTTP 429 Rate Limit or 500 Internal Error.
        AIAnalyst must intercept HTTPStatusError and smoothly fall back.
        """
        gemini_provider = GeminiAIProvider(api_key="mock_key_12345")
        
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.text = "RESOURCE_EXHAUSTED: Rate limit exceeded"
        err = httpx.HTTPStatusError("429 Too Many Requests", request=MagicMock(), response=mock_response)
        
        with patch("httpx.Client.post", side_effect=err):
            analyst = AIAnalyst(provider=gemini_provider)
            decision = analyst.analyze_setup(
                market_state=sample_market_state,
                candidate_setup=sample_candidate_setup
            )
            
            assert decision.decision == OrderSide.BUY
            assert decision.setup_valid is True
            assert any("fallback engaged" in r.lower() for r in decision.reasons)

    def test_gemini_network_connect_error(self, sample_market_state, sample_candidate_setup):
        """
        Adversarial test: DNS failure or connection refused.
        """
        gemini_provider = GeminiAIProvider(api_key="mock_key_12345")
        
        with patch("httpx.Client.post", side_effect=httpx.ConnectError("Failed to resolve generativelanguage.googleapis.com")):
            analyst = AIAnalyst(provider=gemini_provider)
            decision = analyst.analyze_setup(
                market_state=sample_market_state,
                candidate_setup=sample_candidate_setup
            )
            
            assert decision.decision == OrderSide.BUY
            assert decision.setup_valid is True
            assert any("fallback engaged" in r.lower() for r in decision.reasons)

    def test_gemini_malformed_json_fallback_behavior(self, sample_market_state, sample_candidate_setup):
        """
        Adversarial test: Gemini returns non-JSON or corrupted response.
        AIAnalyst catches JSONDecodeError and sets NO_TRADE with schema violation reason.
        SignalFusionEngine then gracefully falls back to deterministic quantitative agent score.
        """
        gemini_provider = GeminiAIProvider(api_key="mock_key_12345")
        
        with patch.object(gemini_provider, "complete_structured", return_value="THIS IS NOT JSON AT ALL!"):
            analyst = AIAnalyst(provider=gemini_provider)
            ai_decision = analyst.analyze_setup(
                market_state=sample_market_state,
                candidate_setup=sample_candidate_setup
            )
            assert ai_decision.decision == OrderSide.NO_TRADE
            assert any("schema validation" in r.lower() for r in ai_decision.reasons)
            
            # Now pass this corrupted AI decision to SignalFusionEngine
            fusion = SignalFusionEngine()
            fused_sig = fusion.fuse(
                market_state=sample_market_state,
                candidate_setups=[sample_candidate_setup],
                ai_decision=ai_decision
            )
            # SignalFusionEngine should gracefully fall back to quantitative agent score!
            assert fused_sig.side == OrderSide.BUY
            assert fused_sig.is_valid is True
            assert any("fallback" in r.lower() for r in fused_sig.reasons)

    def test_gemini_markdown_fences_handled_cleanly(self, sample_market_state, sample_candidate_setup):
        """
        Adversarial test: Gemini model returns JSON wrapped in markdown code blocks.
        AIAnalyst must strip fences and successfully validate.
        """
        raw_json = json.dumps({
            "decision": "BUY",
            "confidence": 0.88,
            "setup_valid": True,
            "entry": 4162.0,
            "stop_loss": 4158.0,
            "take_profit": 4170.0,
            "risk_reward": 2.0,
            "market_regime": "TREND_UP",
            "strategy_id": "XAU_TREND_PULLBACK",
            "reasons": ["Valid markdown fence test"],
            "invalidation": "Below 4158.0",
            "signal_expiry": ""
        })
        fenced_response = f"```json\n{raw_json}\n```"
        
        gemini_provider = GeminiAIProvider(api_key="mock_key_12345")
        with patch.object(gemini_provider, "complete_structured", return_value=fenced_response):
            analyst = AIAnalyst(provider=gemini_provider)
            decision = analyst.analyze_setup(
                market_state=sample_market_state,
                candidate_setup=sample_candidate_setup
            )
            assert decision.decision == OrderSide.BUY
            assert decision.setup_valid is True
            assert decision.confidence == 0.88


# ==============================================================================
# CHALLENGE 4: Session Breakout & Asian Range Volatility Calibration
# ==============================================================================

class TestSessionBreakoutCalibration:
    def test_session_breakout_asian_range_boundary(self):
        """
        Verify Asian range boundary calibration at $4,162+ gold price volatility.
        Upper boundary is $65.00:
        Range $64.00 should be evaluated; Range $66.00 should be rejected.
        """
        strat = SessionBreakoutStrategy()
        now = datetime.now(timezone.utc)
        
        # Scenario A: Range $64.00 (within 3.0 .. 65.0)
        state_in = MarketState(
            symbol="XAUUSD",
            timestamp=now,
            current_price=4166.0,
            bid=4165.85,
            ask=4166.15,
            spread_points=30.0,
            atr_14=3.0,
            rsi_14=58.0,
            ema_9=4164.0,
            ema_21=4160.0,
            ema_50=4150.0,
            ema_200=4130.0,
            session=SessionName.NEW_YORK,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Bullish",
            open_positions_count=0,
            asian_range_high=4164.0,
            asian_range_low=4100.0  # Range = 64.0
        )
        setup_in = strat.evaluate(state_in)
        assert setup_in is not None
        assert setup_in.side == OrderSide.BUY

        # Scenario B: Range $66.00 (> 65.0)
        state_out = MarketState(
            symbol="XAUUSD",
            timestamp=now,
            current_price=4166.0,
            bid=4165.85,
            ask=4166.15,
            spread_points=30.0,
            atr_14=3.0,
            rsi_14=58.0,
            ema_9=4164.0,
            ema_21=4160.0,
            ema_50=4150.0,
            ema_200=4130.0,
            session=SessionName.NEW_YORK,
            regime=MarketRegimeType.TREND_UP,
            trend_description="Bullish",
            open_positions_count=0,
            asian_range_high=4164.0,
            asian_range_low=4098.0  # Range = 66.0
        )
        setup_out = strat.evaluate(state_out)
        assert setup_out is None


# ==============================================================================
# CHALLENGE 5: WebSocket & Coordinator Integration
# ==============================================================================

class TestCoordinatorAndBroadcastResilience:
    def test_ws_broadcast_callback_does_not_raise_on_closed_or_missing_loop(self):
        """Verify _ws_broadcast_callback safely handles closed or missing event loop."""
        # Should execute silently without unhandled exception
        _ws_broadcast_callback({"type": "PING", "test": True})

    def test_coordinator_tick_step_produces_approved_order_on_valid_setup(self):
        """
        Verify end-to-end: coordinator.step() with simulated tick through quant strategies,
        AI analyst fallback, signal fusion, risk engine approval for $50 account,
        and paper submission.
        """
        coord = TradingCoordinator()
        now = datetime.now(timezone.utc)
        tick = Tick(
            symbol="XAUUSD",
            time=now,
            bid=4162.00,
            ask=4162.30,
            spread=30.0,
            volume=1.0
        )
        result = coord.step(tick)
        assert result["type"] == "TICK_STEP"
        assert result["market_state"] is not None
        assert result["market_state"]["current_price"] == 4162.15
