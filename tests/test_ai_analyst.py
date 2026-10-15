"""
Tests for AI Analyst and Provider abstraction.
Validates strict schema validation and error fallback.
"""

from datetime import datetime, timezone, timedelta
import pytest

from config.settings import MarketRegimeType, SessionName, OrderSide
from data.models import MarketState, CandidateSetup, AISignalDecision
from ai.analyst import AIAnalyst
from ai.provider import DeterministicMockProvider, AIProvider


class MalformedResponseProvider(AIProvider):
    def complete_structured(self, system_prompt, user_payload):
        # Returns invalid non-JSON or missing mandatory fields
        return "Not a JSON response at all"


@pytest.fixture
def mock_state_and_setup():
    now = datetime.now(timezone.utc)
    state = MarketState(
        timestamp=now,
        symbol="XAUUSD",
        current_price=2650.0,
        bid=2649.9,
        ask=2650.1,
        spread_points=20.0,
        atr_14=2.0,
        rsi_14=48.0,
        ema_9=2651.0,
        ema_21=2649.5,
        ema_50=2647.0,
        ema_200=2635.0,
        session=SessionName.LONDON,
        regime=MarketRegimeType.TREND_UP,
        trend_description="Bullish trend",
        open_positions_count=0
    )
    setup = CandidateSetup(
        strategy_id="XAU_TREND_PULLBACK",
        symbol="XAUUSD",
        side=OrderSide.BUY,
        entry=2650.0,
        stop_loss=2645.0,
        take_profit=2660.0,
        risk_reward=2.0,
        reason="Test setup",
        timestamp=now,
        expiry=now + timedelta(hours=2)
    )
    return state, setup


def test_deterministic_mock_provider_output(mock_state_and_setup):
    state, setup = mock_state_and_setup
    analyst = AIAnalyst(provider=DeterministicMockProvider())
    decision = analyst.analyze_setup(state, setup)

    assert isinstance(decision, AISignalDecision)
    assert decision.decision == OrderSide.BUY
    assert decision.setup_valid is True
    assert decision.confidence >= 0.70
    assert len(decision.reasons) > 0


def test_malformed_ai_response_is_strictly_rejected(mock_state_and_setup):
    state, setup = mock_state_and_setup
    analyst = AIAnalyst(provider=MalformedResponseProvider())
    decision = analyst.analyze_setup(state, setup)

    # Must fall back safely to NO_TRADE and setup_valid=False
    assert decision.decision == OrderSide.NO_TRADE
    assert decision.setup_valid is False
    assert "schema validation" in decision.reasons[0].lower()


def test_gemini_provider_unconfigured_falls_back_to_deterministic():
    from ai.provider import get_ai_provider
    provider = get_ai_provider("gemini")
    assert isinstance(provider, DeterministicMockProvider)


def test_gemini_provider_live_format_with_mock_client(mock_state_and_setup, monkeypatch):
    import json
    import httpx
    from ai.provider import GeminiAIProvider

    state, setup = mock_state_and_setup
    provider = GeminiAIProvider(api_key="test-mock-key", model="gemini-2.5-flash")

    mock_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "decision": "BUY",
                                "confidence": 0.88,
                                "setup_valid": True,
                                "entry": 2650.0,
                                "stop_loss": 2645.0,
                                "take_profit": 2660.0,
                                "risk_reward": 2.0,
                                "market_regime": "TREND_UP",
                                "strategy_id": "XAU_TREND_PULLBACK",
                                "reasons": ["Gemini confirms trend continuation with macro stability"],
                                "invalidation": "Breach below 2645.0",
                                "signal_expiry": ""
                            })
                        }
                    ]
                }
            }
        ]
    }

    class MockResponse:
        def raise_for_status(self):
            pass
        def json(self):
            return mock_gemini_response

    monkeypatch.setattr(httpx.Client, "post", lambda *args, **kwargs: MockResponse())

    analyst = AIAnalyst(provider=provider)
    decision = analyst.analyze_setup(state, setup)
    assert decision.decision == OrderSide.BUY
    assert decision.setup_valid is True
    assert decision.confidence == 0.88
    assert "Gemini confirms" in decision.reasons[0]


def test_gemini_provider_offline_gracefully_falls_back(mock_state_and_setup, monkeypatch):
    import httpx
    from ai.provider import GeminiAIProvider

    state, setup = mock_state_and_setup
    provider = GeminiAIProvider(api_key="test-mock-key", model="gemini-2.5-flash")

    def mock_post_raise(*args, **kwargs):
        raise httpx.ConnectError("Connection refused by generative language host")

    monkeypatch.setattr(httpx.Client, "post", mock_post_raise)

    analyst = AIAnalyst(provider=provider)
    decision = analyst.analyze_setup(state, setup)
    # Must NOT fail with unhandled crash or hard NO_TRADE when quant setup is valid
    assert decision.decision == OrderSide.BUY
    assert decision.setup_valid is True
    assert any("fallback engaged" in r.lower() for r in decision.reasons)
