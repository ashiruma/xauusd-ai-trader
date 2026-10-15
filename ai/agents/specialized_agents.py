"""
Specialized Sub-Analyst Agents for XAUUSD.
Implements focused, purpose-driven multi-agent architecture without needless bloat:
1. TrendStructureAnalyst
2. VolatilityMomentumAnalyst
3. TradeReviewer
"""

from typing import Dict, Any, List
from data.models import MarketState, CandidateSetup, OrderSide, MarketRegimeType


class TrendStructureAnalyst:
    """Evaluates multi-timeframe trend stack, swings, and session structure."""
    def analyze(self, state: MarketState, setup: CandidateSetup) -> Dict[str, Any]:
        score = 0.5
        reasons = []

        # Check alignment with regime
        if setup.side == OrderSide.BUY:
            if state.regime == MarketRegimeType.TREND_UP:
                score += 0.35
                reasons.append("Aligned with confirmed bullish trend regime")
            elif state.regime == MarketRegimeType.RANGE:
                score += 0.15
                reasons.append("Trading long within range boundary")
            elif state.regime == MarketRegimeType.TREND_DOWN:
                score -= 0.35
                reasons.append("Counter-trend long against strong bearish regime")
        elif setup.side == OrderSide.SELL:
            if state.regime == MarketRegimeType.TREND_DOWN:
                score += 0.35
                reasons.append("Aligned with confirmed bearish trend regime")
            elif state.regime == MarketRegimeType.RANGE:
                score += 0.15
                reasons.append("Trading short within range boundary")
            elif state.regime == MarketRegimeType.TREND_UP:
                score -= 0.35
                reasons.append("Counter-trend short against strong bullish regime")

        # Check EMA structure
        if setup.side == OrderSide.BUY and state.current_price > state.ema_50:
            score += 0.1
            reasons.append("Price holds above EMA50")
        elif setup.side == OrderSide.SELL and state.current_price < state.ema_50:
            score += 0.1
            reasons.append("Price holds below EMA50")

        return {
            "agent": "TrendStructureAnalyst",
            "score": round(max(0.0, min(1.0, score)), 2),
            "reasons": reasons
        }


class VolatilityMomentumAnalyst:
    """Evaluates ATR expansion, RSI extremes, and momentum exhaustion."""
    def analyze(self, state: MarketState, setup: CandidateSetup) -> Dict[str, Any]:
        score = 0.5
        reasons = []

        # RSI conditions
        if setup.side == OrderSide.BUY:
            if 40.0 <= state.rsi_14 <= 60.0:
                score += 0.25
                reasons.append(f"RSI in healthy bullish momentum zone ({state.rsi_14:.1f})")
            elif state.rsi_14 > 75.0:
                score -= 0.3
                reasons.append(f"RSI severely overbought ({state.rsi_14:.1f}), high risk of exhaustion")
            elif state.rsi_14 < 30.0:
                score += 0.15
                reasons.append(f"Oversold bounce potential (RSI {state.rsi_14:.1f})")
        elif setup.side == OrderSide.SELL:
            if 40.0 <= state.rsi_14 <= 60.0:
                score += 0.25
                reasons.append(f"RSI in healthy bearish momentum zone ({state.rsi_14:.1f})")
            elif state.rsi_14 < 25.0:
                score -= 0.3
                reasons.append(f"RSI severely oversold ({state.rsi_14:.1f}), high risk of exhaustion")
            elif state.rsi_14 > 70.0:
                score += 0.15
                reasons.append(f"Overbought rejection potential (RSI {state.rsi_14:.1f})")

        # ATR condition
        if state.atr_14 < 1.0:
            score -= 0.15
            reasons.append(f"Gold ATR ({state.atr_14:.2f}) compressed below normal range")

        return {
            "agent": "VolatilityMomentumAnalyst",
            "score": round(max(0.0, min(1.0, score)), 2),
            "reasons": reasons
        }


class TradeReviewer:
    """Verifies setup geometry: entry, SL, TP, and Risk/Reward validity."""
    def review(self, setup: CandidateSetup) -> Dict[str, Any]:
        reasons = []
        is_viable = True

        if setup.risk_reward < 1.5:
            is_viable = False
            reasons.append(f"Risk/reward {setup.risk_reward:.2f} is under institutional minimum 1.50")
        else:
            reasons.append(f"Risk/reward ratio {setup.risk_reward:.2f} satisfies criteria")

        # Stop distance check
        stop_dist = abs(setup.entry - setup.stop_loss)
        if stop_dist < 0.15:
            is_viable = False
            reasons.append(f"Stop loss distance ${stop_dist:.2f} is dangerously tight for XAUUSD volatility")
        elif stop_dist > 10.00:
            is_viable = False
            reasons.append(f"Stop loss distance ${stop_dist:.2f} is excessively wide for intraday execution (max $10.00)")
        else:
            reasons.append(f"Stop loss distance ${stop_dist:.2f} within normal gold volatility band")

        return {
            "agent": "TradeReviewer",
            "viable": is_viable,
            "score": 0.9 if is_viable else 0.2,
            "reasons": reasons
        }
