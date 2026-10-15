"""
XAU_MEAN_REVERSION Strategy.
Exploits liquidity sweeps and range-bound overextension on XAUUSD.
"""

from datetime import timedelta
from typing import Optional
from config.settings import MarketRegimeType, OrderSide
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class MeanReversionStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(strategy_id="XAU_MEAN_REVERSION", name="XAUUSD Range Liquidity Reversion")

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        # Avoid trading against strong trend regimes or during high-impact news
        if state.regime in (MarketRegimeType.TREND_UP, MarketRegimeType.TREND_DOWN, MarketRegimeType.NEWS_EVENT):
            return None

        price = state.current_price
        atr = max(state.atr_14, 1.2)

        # Bullish Mean Reversion: Price touches/sweeps recent swing low or PDL with RSI <= 38
        support_level = state.recent_swing_low or state.previous_day_low
        if support_level and abs(price - support_level) <= (0.8 * atr) and state.rsi_14 <= 38.0:
            sl_dist = min(max(1.2 * atr, 1.50), 3.50)
            sl = round(max(min(price, support_level) - sl_dist, price - 4.50), 2)
            risk_dist = price - sl
            if risk_dist <= 0 or risk_dist > 4.50:
                return None
            tp = round(price + (1.6 * risk_dist), 2)
            rr = round((tp - price) / risk_dist, 2)

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.BUY,
                entry=price,
                stop_loss=sl,
                take_profit=tp,
                risk_reward=rr,
                reason=f"Oversold bounce at support level ({support_level:.2f}) with RSI={state.rsi_14:.1f}",
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=1)
            )

        # Bearish Mean Reversion: Price touches/sweeps recent swing high or PDH with RSI >= 62
        resistance_level = state.recent_swing_high or state.previous_day_high
        if resistance_level and abs(price - resistance_level) <= (0.8 * atr) and state.rsi_14 >= 62.0:
            sl_dist = min(max(1.2 * atr, 1.50), 3.50)
            sl = round(min(max(price, resistance_level) + sl_dist, price + 4.50), 2)
            risk_dist = sl - price
            if risk_dist <= 0 or risk_dist > 4.50:
                return None
            tp = round(price - (1.6 * risk_dist), 2)
            rr = round((price - tp) / risk_dist, 2)

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.SELL,
                entry=price,
                stop_loss=sl,
                take_profit=tp,
                risk_reward=rr,
                reason=f"Overbought rejection at resistance level ({resistance_level:.2f}) with RSI={state.rsi_14:.1f}",
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=1)
            )

        return None
