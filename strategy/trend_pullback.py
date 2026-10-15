"""
XAU_TREND_PULLBACK Strategy.
Specialized for XAUUSD trend continuation after healthy pullbacks to key dynamic moving average zones.
"""

from datetime import timedelta
from typing import Optional
from config.settings import MarketRegimeType, OrderSide
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class TrendPullbackStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(strategy_id="XAU_TREND_PULLBACK", name="XAUUSD Trend Pullback")

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        # Only trade in confirmed directional regimes
        if state.regime not in (MarketRegimeType.TREND_UP, MarketRegimeType.TREND_DOWN):
            return None

        price = state.current_price
        atr = max(state.atr_14, 1.5)

        # 1. Bullish Setup (TREND_UP)
        if state.regime == MarketRegimeType.TREND_UP:
            # Macro trend alignment: price and EMA50 must remain above EMA200
            if price < state.ema_200 or state.ema_50 < state.ema_200:
                return None

            # Price pulls back close to EMA21 or between EMA21 and EMA50
            pullback_zone_top = max(state.ema_21, state.ema_9) + (0.6 * atr)
            pullback_zone_bottom = state.ema_50 - (0.6 * atr)

            if pullback_zone_bottom <= price <= pullback_zone_top:
                # RSI not overbought, showing room to run (between 35 and 65)
                if 35.0 <= state.rsi_14 <= 65.0:
                    # Deterministic Stop Loss: tightly bounded between $1.50 and $4.00
                    sl_dist = min(max(1.2 * atr, 1.80), 3.80)
                    if state.recent_swing_low and 1.0 <= (price - state.recent_swing_low) <= 4.0:
                        sl = state.recent_swing_low - 0.40
                    else:
                        sl = price - sl_dist

                    # Guarantee SL is never pushed further than $4.50 away
                    sl = round(max(sl, price - 4.50), 2)
                    risk_dist = price - sl
                    if risk_dist <= 0 or risk_dist > 4.50:
                        return None

                    # Take Profit at 2.0x Risk (1:2.0 R:R)
                    tp = round(price + (2.0 * risk_dist), 2)
                    rr = round((tp - price) / risk_dist, 2)

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.BUY,
                        entry=price,
                        stop_loss=sl,
                        take_profit=tp,
                        risk_reward=rr,
                        reason=f"Bullish pullback to EMA21 ({state.ema_21:.1f}) in TREND_UP. RSI={state.rsi_14:.1f}",
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        # 2. Bearish Setup (TREND_DOWN)
        elif state.regime == MarketRegimeType.TREND_DOWN:
            # Macro trend alignment: price and EMA50 must remain below EMA200
            if price > state.ema_200 or state.ema_50 > state.ema_200:
                return None

            # Price pulls back up to EMA21 or between EMA21 and EMA50
            pullback_zone_bottom = min(state.ema_21, state.ema_9) - (0.6 * atr)
            pullback_zone_top = state.ema_50 + (0.3 * atr)

            if pullback_zone_bottom <= price <= pullback_zone_top:
                # RSI not oversold (between 35 and 65)
                if 35.0 <= state.rsi_14 <= 65.0:
                    sl_dist = min(max(1.2 * atr, 1.80), 3.80)
                    if state.recent_swing_high and 1.0 <= (state.recent_swing_high - price) <= 4.0:
                        sl = state.recent_swing_high + 0.40
                    else:
                        sl = price + sl_dist

                    # Guarantee SL is never pushed further than $4.50 away
                    sl = round(min(sl, price + 4.50), 2)
                    risk_dist = sl - price
                    if risk_dist <= 0 or risk_dist > 4.50:
                        return None

                    tp = round(price - (2.0 * risk_dist), 2)
                    rr = round((price - tp) / risk_dist, 2)

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.SELL,
                        entry=price,
                        stop_loss=sl,
                        take_profit=tp,
                        risk_reward=rr,
                        reason=f"Bearish pullback to EMA21 ({state.ema_21:.1f}) in TREND_DOWN. RSI={state.rsi_14:.1f}",
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        return None
