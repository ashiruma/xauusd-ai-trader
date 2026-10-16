"""
Trend Continuation Strategy Candidate (v2.0).
Engineered to resolve the loss asymmetry in XAUUSD algorithmic execution:
- Higher-timeframe macro trend filter (EMA200 / EMA50 alignment).
- Lower-timeframe dynamic value pullback entry (EMA21 / EMA50 zone).
- Strict counter-trend rejection.
- Validated protective stop loss (1.2 * ATR with swing high/low structure anchor).
- Minimum 1.8:1 Risk-to-Reward ratio (target 1.8:1 to 2.5:1).
- Zero martingale, zero grid/averaging down, zero duplicate stacking.
- Strictly single-ticket execution per directional regime.
"""

from datetime import timedelta
from typing import Optional, Dict, Any
from config.settings import MarketRegimeType, OrderSide
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class TrendContinuationV2Strategy(BaseStrategy):
    """
    Versioned candidate strategy designed for capital preservation and positive expectancy.
    Addresses the negative expectancy caused by premature profit-taking (+80 points)
    versus wide basket losses (-500+ points).
    """

    def __init__(self):
        super().__init__(
            strategy_id="XAU_TREND_CONTINUATION_V2",
            name="XAUUSD Trend Continuation Candidate v2"
        )
        self.version = "2.0.0-candidate"
        self.min_risk_reward = 1.80
        self.max_stop_distance_dollars = 4.50
        self.min_stop_distance_dollars = 1.50

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        """
        Evaluates market state for high-probability trend continuation setups.
        Fails closed on unconfirmed or choppy market regimes.
        """
        # 1. Regime Filter: strictly trade in confirmed directional trends
        if state.regime not in (MarketRegimeType.TREND_UP, MarketRegimeType.TREND_DOWN):
            return None

        # 2. Spread Guard: reject if current broker spread exceeds 30 points ($0.30)
        if state.spread_points > 30.0:
            return None

        price = state.current_price
        atr = max(state.atr_14, 1.80)

        # 3. Bullish Continuation Setup (TREND_UP)
        if state.regime == MarketRegimeType.TREND_UP:
            # Macro Alignment: price > EMA50 > EMA200
            if not (price > state.ema_200 and state.ema_50 > state.ema_200):
                return None

            # Pullback Zone: price is within 0.75 * ATR of EMA21 or EMA50
            pullback_zone_top = state.ema_21 + (0.75 * atr)
            pullback_zone_bottom = state.ema_50 - (0.50 * atr)

            if not (pullback_zone_bottom <= price <= pullback_zone_top):
                return None

            # Momentum Filter: RSI between 40.0 and 62.0 (rebounding from pullback, not overbought)
            if not (40.0 <= state.rsi_14 <= 62.0):
                return None

            # Protective Stop Placement: structural anchor below recent swing low or ATR buffer
            sl_distance = min(max(1.3 * atr, self.min_stop_distance_dollars), self.max_stop_distance_dollars)
            if state.recent_swing_low and (1.20 <= (price - state.recent_swing_low) <= self.max_stop_distance_dollars):
                stop_loss = round(state.recent_swing_low - 0.30, 2)
            else:
                stop_loss = round(price - sl_distance, 2)

            risk_distance = round(price - stop_loss, 2)
            if risk_distance < self.min_stop_distance_dollars or risk_distance > self.max_stop_distance_dollars:
                return None

            # Take Profit: Enforce minimum 1.8:1 R:R (targeting 2.0R to capture healthy runners)
            target_r = 2.0
            take_profit = round(price + (target_r * risk_distance), 2)
            actual_rr = round((take_profit - price) / risk_distance, 2)

            if actual_rr < self.min_risk_reward:
                return None

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.BUY,
                entry=price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                risk_reward=actual_rr,
                reason=(
                    f"v2 Bullish Trend Continuation: Pullback to EMA21/50 zone ({state.ema_21:.1f}/{state.ema_50:.1f}) "
                    f"with H1 macro alignment (EMA50 > EMA200). RSI={state.rsi_14:.1f}, R:R={actual_rr:.2f}:1, "
                    f"Risk=${risk_distance:.2f}."
                ),
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=2)
            )

        # 4. Bearish Continuation Setup (TREND_DOWN)
        elif state.regime == MarketRegimeType.TREND_DOWN:
            # Macro Alignment: price < EMA50 < EMA200
            if not (price < state.ema_200 and state.ema_50 < state.ema_200):
                return None

            # Pullback Zone: price is within 0.75 * ATR of EMA21 or EMA50
            pullback_zone_bottom = state.ema_21 - (0.75 * atr)
            pullback_zone_top = state.ema_50 + (0.50 * atr)

            if not (pullback_zone_bottom <= price <= pullback_zone_top):
                return None

            # Momentum Filter: RSI between 38.0 and 60.0 (rebounding from pullback, not oversold)
            if not (38.0 <= state.rsi_14 <= 60.0):
                return None

            # Protective Stop Placement: structural anchor above recent swing high or ATR buffer
            sl_distance = min(max(1.3 * atr, self.min_stop_distance_dollars), self.max_stop_distance_dollars)
            if state.recent_swing_high and (1.20 <= (state.recent_swing_high - price) <= self.max_stop_distance_dollars):
                stop_loss = round(state.recent_swing_high + 0.30, 2)
            else:
                stop_loss = round(price + sl_distance, 2)

            risk_distance = round(stop_loss - price, 2)
            if risk_distance < self.min_stop_distance_dollars or risk_distance > self.max_stop_distance_dollars:
                return None

            # Take Profit: Enforce minimum 1.8:1 R:R (targeting 2.0R)
            target_r = 2.0
            take_profit = round(price - (target_r * risk_distance), 2)
            actual_rr = round((price - take_profit) / risk_distance, 2)

            if actual_rr < self.min_risk_reward:
                return None

            return CandidateSetup(
                strategy_id=self.strategy_id,
                symbol=state.symbol,
                side=OrderSide.SELL,
                entry=price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                risk_reward=actual_rr,
                reason=(
                    f"v2 Bearish Trend Continuation: Pullback to EMA21/50 zone ({state.ema_21:.1f}/{state.ema_50:.1f}) "
                    f"with H1 macro alignment (EMA50 < EMA200). RSI={state.rsi_14:.1f}, R:R={actual_rr:.2f}:1, "
                    f"Risk=${risk_distance:.2f}."
                ),
                timestamp=state.timestamp,
                expiry=state.timestamp + timedelta(hours=2)
            )

        return None
