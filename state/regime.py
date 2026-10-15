"""
Deterministic Market Regime Classifier for XAUUSD.
Classifies market state into explainable regimes:
TREND_UP, TREND_DOWN, RANGE, HIGH_VOLATILITY, LOW_VOLATILITY, NEWS_EVENT, UNCERTAIN.
"""

from typing import Tuple, List
from config.settings import MarketRegimeType
from data.models import Candle


class MarketRegimeEngine:
    @staticmethod
    def classify_regime(
        current_price: float,
        ema_9: float,
        ema_21: float,
        ema_50: float,
        ema_200: float,
        atr_14: float,
        historical_atr_mean: float,
        rsi_14: float,
        is_news_active: bool = False
    ) -> Tuple[MarketRegimeType, str]:
        """
        Deterministic, rule-based regime classifier.
        Returns (MarketRegimeType, explanation_string).
        """
        # 1. News Event Priority
        if is_news_active:
            return (
                MarketRegimeType.NEWS_EVENT,
                "High-impact economic event window active; spreads and directional whipsaws elevated"
            )

        # 2. Extreme Volatility check (ATR expansion)
        if historical_atr_mean > 0:
            atr_ratio = atr_14 / historical_atr_mean
            if atr_ratio >= 1.9:
                return (
                    MarketRegimeType.HIGH_VOLATILITY,
                    f"Volatility expansion detected (ATR ratio {atr_ratio:.2f} >= 1.90x baseline)"
                )
            if atr_ratio <= 0.55:
                return (
                    MarketRegimeType.LOW_VOLATILITY,
                    f"Volatility compression detected (ATR ratio {atr_ratio:.2f} <= 0.55x baseline)"
                )

        # 3. Deterministic Trend Checks
        # Bullish trend: Structure supported (EMA21 > EMA50) and Price above EMA50 zone
        if ema_21 > ema_50 and (ema_50 >= ema_200 or current_price >= ema_200):
            # If price breaks below EMA50 or RSI dumps into oversold (< 35), trend structure is impaired
            if current_price < (ema_50 - 0.2 * atr_14) or rsi_14 < 35.0:
                return (
                    MarketRegimeType.UNCERTAIN,
                    f"Bullish momentum broken: Price ({current_price:.1f}) below EMA50 ({ema_50:.1f}) or RSI ({rsi_14:.1f}) < 35.0"
                )
            if current_price >= (ema_50 - (0.5 * atr_14)) and 35.0 <= rsi_14 <= 78.0:
                return (
                    MarketRegimeType.TREND_UP,
                    f"Bullish trend confirmed: EMA21 ({ema_21:.1f}) > EMA50 ({ema_50:.1f}), RSI={rsi_14:.1f}"
                )

        # Bearish trend: Structure inverted (EMA21 < EMA50) and Price below EMA50 zone
        if ema_21 < ema_50 and (ema_50 <= ema_200 or current_price <= ema_200):
            # If price surges above EMA50 or RSI spikes into overbought (> 65), trend structure is impaired
            if current_price > (ema_50 + 0.2 * atr_14) or rsi_14 > 65.0:
                return (
                    MarketRegimeType.UNCERTAIN,
                    f"Bearish momentum broken: Price ({current_price:.1f}) above EMA50 ({ema_50:.1f}) or RSI ({rsi_14:.1f}) > 65.0"
                )
            if current_price <= (ema_50 + (0.5 * atr_14)) and 22.0 <= rsi_14 <= 65.0:
                return (
                    MarketRegimeType.TREND_DOWN,
                    f"Bearish trend confirmed: EMA21 ({ema_21:.1f}) < EMA50 ({ema_50:.1f}), RSI={rsi_14:.1f}"
                )

        # 4. Range Condition
        # Flat moving averages or compressed spread between EMA9 and EMA21
        ema_separation = abs(ema_9 - ema_21) / current_price * 10000.0  # basis points
        if ema_separation < 18.0 or abs(ema_21 - ema_50) / current_price * 10000.0 < 22.0:
            return (
                MarketRegimeType.RANGE,
                f"Range-bound consolidation: Low EMA spread ({ema_separation:.1f} bps) around mean"
            )

        # 5. Fallback Uncertain / Transition
        return (
            MarketRegimeType.UNCERTAIN,
            f"Market in structural transition or choppy oscillation (RSI={rsi_14:.1f}, EMA sep={ema_separation:.1f} bps)"
        )
