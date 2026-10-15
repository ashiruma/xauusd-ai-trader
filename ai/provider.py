"""
AI Model Provider Abstraction for XAUUSD Trading System.
Decouples LLM implementations (OpenAI, Anthropic, Gemini, OpenRouter, and Deterministic Mock).
"""

from abc import ABC, abstractmethod
import json
import logging
import os
from typing import Dict, Any, Optional
import httpx
from config.settings import settings

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    @abstractmethod
    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        """
        Send structured payload and return raw response string (expected to be JSON).
        """
        pass


class DeterministicMockProvider(AIProvider):
    """
    Deterministic rules-based quantitative model provider for zero-cost offline backtesting,
    paper trading verification, and fallback when API keys are absent.
    """
    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        setup = user_payload.get("candidate_setup")
        regime = user_payload.get("market_regime", "UNCERTAIN")
        spread = user_payload.get("spread_points", 25.0)
        news_status = user_payload.get("news_status", "NORMAL")

        # Fallback if no candidate setup
        if not setup:
            return json.dumps({
                "decision": "NO_TRADE",
                "confidence": 0.0,
                "setup_valid": False,
                "entry": 0.0,
                "stop_loss": 0.0,
                "take_profit": 0.0,
                "risk_reward": 0.0,
                "market_regime": regime,
                "strategy_id": "NONE",
                "reasons": ["No candidate setup provided for analysis"],
                "invalidation": "N/A",
                "signal_expiry": ""
            })

        side = setup.get("side", "NO_SETUP")
        entry = setup.get("entry", 0.0)
        sl = setup.get("stop_loss", 0.0)
        tp = setup.get("take_profit", 0.0)
        rr = setup.get("risk_reward", 0.0)
        strategy_id = setup.get("strategy_id", "UNKNOWN")

        # Quantitative filter rules
        rejection_reasons = []
        if news_status == "NEWS_LOCKOUT":
            rejection_reasons.append("High-impact news lockout active")
        if spread > settings.risk.max_spread_points:
            rejection_reasons.append(f"Excessive spread: {spread} > {settings.risk.max_spread_points}")
        if rr < settings.risk.min_risk_reward_ratio:
            rejection_reasons.append(f"Risk/reward {rr:.2f} below required minimum {settings.risk.min_risk_reward_ratio}")

        if rejection_reasons:
            return json.dumps({
                "decision": "NO_TRADE",
                "confidence": 0.35,
                "setup_valid": False,
                "entry": entry,
                "stop_loss": sl,
                "take_profit": tp,
                "risk_reward": rr,
                "market_regime": regime,
                "strategy_id": strategy_id,
                "reasons": rejection_reasons,
                "invalidation": "Quantitative filter criteria violated",
                "signal_expiry": setup.get("expiry", "")
            })

        # Base confidence calculation based on regime alignment
        confidence = 0.82
        if regime in ("TREND_UP", "TREND_DOWN"):
            confidence = 0.88
        elif regime in ("RANGE", "LOW_VOLATILITY"):
            confidence = 0.78
        elif regime == "HIGH_VOLATILITY":
            confidence = 0.65

        decision_side = "BUY" if side == "BUY" else ("SELL" if side == "SELL" else "NO_TRADE")

        return json.dumps({
            "decision": decision_side,
            "confidence": round(confidence, 2),
            "setup_valid": True,
            "entry": entry,
            "stop_loss": sl,
            "take_profit": tp,
            "risk_reward": rr,
            "market_regime": regime,
            "strategy_id": strategy_id,
            "reasons": [
                f"Candidate setup aligns with market regime {regime}",
                f"Calculated risk/reward of {rr:.2f} satisfies criteria",
                f"Entry at {entry} with protective stop at {sl}"
            ],
            "invalidation": f"Price breach of opposite structure at {sl}",
            "signal_expiry": setup.get("expiry", "")
        })


class OpenRouterAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "anthropic/claude-3.5-sonnet"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/HKUDS/AI-Trader",
            "X-Title": "XAUUSD AI Trading System"
        }
        prompt_content = (
            f"You are the quantitative trading analyst. Analyze this structured market payload:\n"
            f"{json.dumps(user_payload, indent=2)}\n"
            f"Respond ONLY with a valid JSON object matching the required schema. No conversational markdown."
        )
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_content}
            ],
            "temperature": settings.ai.temperature,
            "response_format": {"type": "json_object"}
        }
        with httpx.Client(timeout=settings.ai.timeout_seconds) as client:
            resp = client.post(self.base_url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        prompt_content = (
            f"Analyze this structured market state and candidate setup:\n"
            f"{json.dumps(user_payload, indent=2)}\n"
            f"Respond with strict JSON matching the schema."
        )
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_content}
            ],
            "temperature": settings.ai.temperature,
            "response_format": {"type": "json_object"}
        }
        with httpx.Client(timeout=settings.ai.timeout_seconds) as client:
            resp = client.post(self.base_url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


class GeminiAIProvider(AIProvider):
    """
    Google Gemini AI Provider utilizing the official Google Generative Language REST API.
    Sends structured quantitative market data and returns validated JSON analysis.
    """
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model = model or "gemini-2.5-flash"
        clean_model = self.model.replace("models/", "")
        self.endpoint_url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent"

    def complete_structured(self, system_prompt: str, user_payload: Dict[str, Any]) -> str:
        prompt_content = (
            f"You are the senior quantitative trading analyst for XAUUSD. Analyze this structured market payload:\n"
            f"{json.dumps(user_payload, indent=2)}\n"
            f"Respond ONLY with a valid JSON object matching the required schema. No conversational preamble, no markdown formatting."
        )
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": self.api_key
        }
        body = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt_content}]
                }
            ],
            "generationConfig": {
                "temperature": settings.ai.temperature,
                "responseMimeType": "application/json"
            }
        }
        with httpx.Client(timeout=settings.ai.timeout_seconds) as client:
            resp = client.post(self.endpoint_url, headers=headers, params=params, json=body)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Gemini API returned no candidates in response")
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text


def get_ai_provider(provider_name: Optional[str] = None) -> AIProvider:
    name = (provider_name or settings.ai.provider).strip().lower()
    api_key = settings.ai.api_key or os.environ.get("GEMINI_API_KEY")
    
    if name in ("gemini", "google", "gemini-ai"):
        if not api_key:
            logger.info("Gemini provider selected but no API key configured. Operating in graceful deterministic quantitative fallback.")
            return DeterministicMockProvider()
        return GeminiAIProvider(api_key=api_key, model=settings.ai.model if settings.ai.model and "gemini" in settings.ai.model else "gemini-2.5-flash")
    elif name == "mock" or not api_key:
        return DeterministicMockProvider()
    elif name == "openrouter":
        return OpenRouterAIProvider(api_key=api_key, model=settings.ai.model)
    elif name in ("openai", "gpt"):
        return OpenAIProvider(api_key=api_key, model=settings.ai.model)
    else:
        logger.warning(f"Unknown or unconfigured AI provider '{name}'. Falling back to DeterministicMockProvider.")
        return DeterministicMockProvider()
