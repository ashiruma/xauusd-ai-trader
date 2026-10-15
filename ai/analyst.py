"""
AI Analyst Engine for XAUUSD.
Constructs structured inputs, invokes the AI Provider, and strictly validates
output against AISignalDecision schema.
"""

import json
import logging
import uuid
from typing import Dict, Any, Optional
from pydantic import ValidationError

from config.settings import settings
from data.models import MarketState, CandidateSetup, AISignalDecision, OrderSide, MarketRegimeType
from ai.provider import AIProvider, get_ai_provider
from data.storage import db

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are the Senior Quantitative Analyst for an institutional XAUUSD (Gold) trading system.
Your role is DECISION SUPPORT and VALIDATION. You do NOT execute trades.
Analyze the structured market data, technical regime, session dynamics, and candidate setup.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "decision": "BUY" | "SELL" | "NO_TRADE",
  "confidence": float between 0.0 and 1.0,
  "setup_valid": boolean,
  "entry": float,
  "stop_loss": float,
  "take_profit": float,
  "risk_reward": float,
  "market_regime": "TREND_UP" | "TREND_DOWN" | "RANGE" | "HIGH_VOLATILITY" | "LOW_VOLATILITY" | "NEWS_EVENT" | "UNCERTAIN",
  "strategy_id": string,
  "reasons": [string],
  "invalidation": string,
  "signal_expiry": string
}

Rules:
1. If the candidate setup violates structure, risk parameters, or macro caution, output "decision": "NO_TRADE" and "setup_valid": false.
2. Ensure stop_loss and take_profit provide a minimum 1.5 risk/reward.
3. Return raw JSON ONLY. No markdown formatting, no conversational preamble.
"""


class AIAnalyst:
    def __init__(self, provider: Optional[AIProvider] = None):
        self.provider = provider or get_ai_provider()

    def analyze_setup(
        self,
        market_state: MarketState,
        candidate_setup: Optional[CandidateSetup],
        news_status: str = "NORMAL",
        recent_performance_summary: Optional[Dict[str, Any]] = None
    ) -> AISignalDecision:
        """
        Send structured market state and candidate setup to AI model.
        Strictly validate returned JSON against AISignalDecision.
        """
        ai_decision_id = f"AI_{uuid.uuid4().hex[:12]}"
        setup_id = candidate_setup.strategy_id if candidate_setup else None

        # Build clean structured payload - DO NOT dump raw unstructured history
        payload = {
            "symbol": market_state.symbol,
            "timestamp": market_state.timestamp.isoformat(),
            "current_price": market_state.current_price,
            "bid": market_state.bid,
            "ask": market_state.ask,
            "spread_points": market_state.spread_points,
            "market_regime": market_state.regime.value,
            "session": market_state.session.value,
            "indicators": {
                "atr_14": market_state.atr_14,
                "rsi_14": market_state.rsi_14,
                "ema_9": market_state.ema_9,
                "ema_21": market_state.ema_21,
                "ema_50": market_state.ema_50,
                "ema_200": market_state.ema_200
            },
            "market_structure": {
                "recent_swing_high": market_state.recent_swing_high,
                "recent_swing_low": market_state.recent_swing_low,
                "previous_day_high": market_state.previous_day_high,
                "previous_day_low": market_state.previous_day_low,
                "asian_range_high": market_state.asian_range_high,
                "asian_range_low": market_state.asian_range_low
            },
            "news_status": news_status,
            "candidate_setup": {
                "strategy_id": candidate_setup.strategy_id,
                "side": candidate_setup.side.value,
                "entry": candidate_setup.entry,
                "stop_loss": candidate_setup.stop_loss,
                "take_profit": candidate_setup.take_profit,
                "risk_reward": candidate_setup.risk_reward,
                "reason": candidate_setup.reason,
                "expiry": candidate_setup.expiry.isoformat()
            } if candidate_setup else None,
            "recent_performance": recent_performance_summary or {"win_rate": 0.5, "consecutive_losses": 0}
        }

        is_fallback = False
        try:
            try:
                raw_response = self.provider.complete_structured(SYSTEM_PROMPT, payload)
            except Exception as prov_err:
                logger.warning(f"AI Provider ({type(self.provider).__name__}) unavailable or failed: {prov_err}. Activating deterministic quantitative fallback.")
                from ai.provider import DeterministicMockProvider
                raw_response = DeterministicMockProvider().complete_structured(SYSTEM_PROMPT, payload)
                is_fallback = True

            # Clean markdown fences if model inadvertently added them
            clean_json = raw_response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            clean_json = clean_json.strip()

            parsed = json.loads(clean_json)
            decision = AISignalDecision.model_validate(parsed)
            if is_fallback:
                decision.reasons.append(f"AI Provider fallback engaged: {type(self.provider).__name__} offline or error")
            
        except (json.JSONDecodeError, ValidationError, Exception) as exc:
            logger.error(f"AI response schema validation failed: {exc}")
            # Rejection fallback: safety first
            decision = AISignalDecision(
                decision=OrderSide.NO_TRADE,
                confidence=0.0,
                setup_valid=False,
                entry=candidate_setup.entry if candidate_setup else 0.0,
                stop_loss=candidate_setup.stop_loss if candidate_setup else 0.0,
                take_profit=candidate_setup.take_profit if candidate_setup else 0.0,
                risk_reward=candidate_setup.risk_reward if candidate_setup else 0.0,
                market_regime=market_state.regime,
                strategy_id=candidate_setup.strategy_id if candidate_setup else "ERROR",
                reasons=[f"AI output failed schema validation: {str(exc)[:150]}"],
                invalidation="Schema violation",
                signal_expiry=""
            )

        # Audit decision in database
        provider_name = type(self.provider).__name__
        db.record_ai_decision(ai_decision_id, setup_id, decision, provider_name)
        
        return decision
