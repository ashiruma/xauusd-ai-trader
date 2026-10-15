"""
XAU_LIQUIDITY_SWEEP Strategy.
Institutional smart-money liquidity sweep strategy specialized for XAUUSD.
Detects stop-runs and false breakouts past key swing points, PDH/PDL, and Asian extremes,
capitalizing on rapid mean-reversion rejections with asymmetric R:R.
"""

from datetime import timedelta
from typing import Optional
from config.settings import OrderSide, MarketRegimeType
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class LiquiditySweepStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(strategy_id="XAU_LIQUIDITY_SWEEP", name="XAUUSD Liquidity Sweep Rejection")

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        # Do not trade during high-impact news windows
        if state.regime == MarketRegimeType.NEWS_EVENT:
            return None

        price = state.current_price
        atr = max(state.atr_14, 1.2)

        # -------------------------------------------------------------
        # 1. Bullish Liquidity Sweep (Swept Lows with Rapid Rejection)
        # -------------------------------------------------------------
        # Candidate support levels to sweep: Recent Swing Low, PDL, Asian Low
        support_candidates = [
            ("SwingLow", state.recent_swing_low),
            ("PDL", state.previous_day_low),
            ("AsianLow", state.asian_range_low),
        ]

        for label, support_level in support_candidates:
            if not support_level or state.regime == MarketRegimeType.TREND_DOWN:
                continue

            # Price swept low (dipped near/below support) and is now holding within 0.8 ATR above it
            dist_from_support = price - support_level
            # Sweep criteria: price is between -0.5 ATR (below) and +0.8 ATR (just recovered above)
            if -0.5 * atr <= dist_from_support <= 0.8 * atr:
                # RSI confirming reversal or oversold recovery (RSI <= 46)
                if state.rsi_14 <= 46.0:
                    sl_dist = min(max(1.1 * atr, 1.50), 3.50)
                    sl = round(max(min(price, support_level) - sl_dist, price - 4.50), 2)
                    risk_dist = price - sl
                    if risk_dist <= 0 or risk_dist > 4.50:
                        continue

                    tp = round(price + (2.0 * risk_dist), 2)
                    rr = round((tp - price) / risk_dist, 2)
                    if rr < 1.5:
                        continue

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.BUY,
                        entry=price,
                        stop_loss=sl,
                        take_profit=tp,
                        risk_reward=rr,
                        reason=f"Bullish liquidity sweep of {label} ({support_level:.2f}) with rejection bounce. RSI={state.rsi_14:.1f}",
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        # -------------------------------------------------------------
        # 2. Bearish Liquidity Sweep (Swept Highs with Rapid Rejection)
        # -------------------------------------------------------------
        resistance_candidates = [
            ("SwingHigh", state.recent_swing_high),
            ("PDH", state.previous_day_high),
            ("AsianHigh", state.asian_range_high),
        ]

        for label, resistance_level in resistance_candidates:
            if not resistance_level or state.regime == MarketRegimeType.TREND_UP:
                continue

            dist_from_resistance = resistance_level - price
            # Sweep criteria: price is between -0.5 ATR (above) and +0.8 ATR (just recovered below)
            if -0.5 * atr <= dist_from_resistance <= 0.8 * atr:
                # RSI confirming exhaustion (RSI >= 54)
                if state.rsi_14 >= 54.0:
                    sl_dist = min(max(1.1 * atr, 1.50), 3.50)
                    sl = round(min(max(price, resistance_level) + sl_dist, price + 4.50), 2)
                    risk_dist = sl - price
                    if risk_dist <= 0 or risk_dist > 4.50:
                        continue

                    tp = round(price - (2.0 * risk_dist), 2)
                    rr = round((price - tp) / risk_dist, 2)
                    if rr < 1.5:
                        continue

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.SELL,
                        entry=price,
                        stop_loss=sl,
                        take_profit=tp,
                        risk_reward=rr,
                        reason=f"Bearish liquidity sweep of {label} ({resistance_level:.2f}) with rejection reversal. RSI={state.rsi_14:.1f}",
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        return None
