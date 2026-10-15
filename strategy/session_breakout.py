"""
XAU_SESSION_BREAKOUT Strategy.
Focuses on Asian Range expansion during London / New York high liquidity sessions.
"""

from datetime import timedelta
from typing import Optional
from config.settings import SessionName, OrderSide, MarketRegimeType
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class SessionBreakoutStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(strategy_id="XAU_SESSION_BREAKOUT", name="XAUUSD Session Range Breakout")

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        # Only active during London, NY, or Overlap
        if state.session not in (SessionName.LONDON, SessionName.NEW_YORK, SessionName.LONDON_NY_OVERLAP):
            return None

        # Requires valid Asian session extremes
        if not state.asian_range_high or not state.asian_range_low:
            return None

        price = state.current_price
        asian_range = state.asian_range_high - state.asian_range_low
        # Asian range must be reasonable (e.g. between $3.00 and $65.00 on Gold)
        if not (3.0 <= asian_range <= 65.0):
            return None

        atr = max(state.atr_14, 1.5)

        # Bullish Breakout above Asian High (only enter near breakout level, do not chase runaway moves)
        max_breakout_distance = min(1.5 * atr, 4.00)
        if price > state.asian_range_high and price <= (state.asian_range_high + max_breakout_distance) and state.regime != MarketRegimeType.TREND_DOWN:
            sl_dist = min(max(0.6 * atr, 1.50), 3.00)
            sl = round(max(state.asian_range_high - sl_dist, price - 4.50), 2)
            risk_dist = price - sl
            if risk_dist <= 0 or risk_dist > 4.50:
                return None
            tp = round(price + (1.8 * risk_dist), 2)
            rr = round((tp - price) / risk_dist, 2)

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.BUY,
                entry=price,
                stop_loss=sl,
                take_profit=tp,
                risk_reward=rr,
                reason=f"Bullish London/NY breakout above Asian High ({state.asian_range_high:.2f}). Session={state.session.value}",
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=1, minutes=30)
            )

        # Bearish Breakout below Asian Low (only enter near breakdown level, do not chase runaway moves)
        if price < state.asian_range_low and price >= (state.asian_range_low - max_breakout_distance) and state.regime != MarketRegimeType.TREND_UP:
            sl_dist = min(max(0.6 * atr, 1.50), 3.00)
            sl = round(min(state.asian_range_low + sl_dist, price + 4.50), 2)
            risk_dist = sl - price
            if risk_dist <= 0 or risk_dist > 4.50:
                return None
            tp = round(price - (1.8 * risk_dist), 2)
            rr = round((price - tp) / risk_dist, 2)

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.SELL,
                entry=price,
                stop_loss=sl,
                take_profit=tp,
                risk_reward=rr,
                reason=f"Bearish London/NY breakdown below Asian Low ({state.asian_range_low:.2f}). Session={state.session.value}",
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=1, minutes=30)
            )

        return None
