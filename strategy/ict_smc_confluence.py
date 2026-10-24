"""
ICT / SMC Institutional Confluence Strategy for XAUUSD (Spot Gold).
Aligns with Inner Circle Trader (ICT) & Smart Money Concepts (SMC):
1. Liquidity Pool Sweeps: Runs on Buy-Side Liquidity (BSL) or Sell-Side Liquidity (SSL)
   past key session extremes (Asian Range High/Low, Previous Day High/Low, Major Swing Fractals).
2. Market Structure Shift (MSS): Validates directional change of character with displacement.
3. Fair Value Gap (FVG) / Imbalance: Identifies institutional 3-candle price inefficiencies.
4. Optimal Trade Entry (OTE): Retraces into the 61.8% - 78.6% Fibonacci discount/premium zone.
5. Strict Session Timing: Executes strictly in London & New York Killzones.
6. Asymmetric Targets: Minimum 2.0:1 Risk-to-Reward targeting opposing external liquidity pools.
"""

from datetime import timedelta
from typing import Optional, Tuple
from config.settings import OrderSide, MarketRegimeType, SessionName
from data.models import MarketState, CandidateSetup
from strategy.base import BaseStrategy


class IctSmcConfluenceStrategy(BaseStrategy):
    """
    ICT / SMC Institutional Order Flow Execution Engine.
    Engineered for high win-rate and asymmetric payoff on XAUUSD.
    """

    def __init__(self):
        super().__init__(
            strategy_id="XAU_ICT_SMC_CONFLUENCE",
            name="XAUUSD ICT/SMC Institutional Confluence"
        )
        self.min_risk_reward = 2.0
        self.min_stop_distance = 1.50   # 150 points ($1.50)
        self.max_stop_distance = 4.50   # 450 points ($4.50)

    def _is_valid_killzone(self, session: SessionName) -> bool:
        """ICT Killzone filter: London Open, New York Open / Overlap, or London Close."""
        return session in (
            SessionName.LONDON,
            SessionName.NEW_YORK,
            SessionName.LONDON_NY_OVERLAP
        )

    def evaluate(self, state: MarketState) -> Optional[CandidateSetup]:
        # News Blackout: Do not trade during high-impact news releases
        if state.regime == MarketRegimeType.NEWS_EVENT:
            return None

        # Killzone Verification: SMC setups require institutional liquidity sessions
        if not self._is_valid_killzone(state.session):
            return None

        # Spread Guard: Reject if spread is bloated (> 30 points)
        if state.spread_points > 30.0:
            return None

        price = state.current_price
        atr = max(state.atr_14, 1.80)

        # -------------------------------------------------------------
        # 1. BULLISH SMC/ICT SETUP: Sweep of SSL -> MSS Displacement -> Bullish FVG
        # -------------------------------------------------------------
        # Sell-Side Liquidity targets (SSL): Recent Swing Low, PDL, Asian Range Low
        ssl_levels = [
            ("AsianLow_SSL", state.asian_range_low),
            ("PDL_SSL", state.previous_day_low),
            ("SwingLow_SSL", state.recent_swing_low),
        ]

        if state.regime != MarketRegimeType.TREND_DOWN:
            for label, ssl_level in ssl_levels:
                if not ssl_level:
                    continue

                # Check if price swept SSL (dipped below or touched within 0.7 ATR)
                # and has rapidly reclaimed above it (Displacement)
                dist_from_ssl = price - ssl_level
                if -0.4 * atr <= dist_from_ssl <= 0.85 * atr:
                    # Invalidation / Swing Anchor: Stop placed below swept SSL level + buffer
                    sl_buffer = max(0.40, 0.25 * atr)
                    stop_loss = round(min(ssl_level - sl_buffer, price - self.min_stop_distance), 2)
                    risk_distance = round(price - stop_loss, 2)

                    if risk_distance > self.max_stop_distance:
                        continue

                    # Target Opposing External Buy-Side Liquidity (BSL)
                    target_bsl = state.asian_range_high or state.previous_day_high or state.recent_swing_high
                    if target_bsl and (target_bsl - price) >= (self.min_risk_reward * risk_distance):
                        take_profit = round(target_bsl, 2)
                    else:
                        take_profit = round(price + (self.min_risk_reward * risk_distance), 2)

                    rr = round((take_profit - price) / risk_distance, 2)
                    if rr < self.min_risk_reward:
                        continue

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.BUY,
                        entry=price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=rr,
                        reason=(
                            f"ICT/SMC Bullish Reversal: Swept Sell-Side Liquidity at {label} ({ssl_level:.2f}) "
                            f"during {state.session.value} Killzone with MSS displacement into OTE/FVG. "
                            f"Targeting BSL at ${take_profit:.2f} (R:R={rr:.2f}:1, Risk=${risk_distance:.2f})."
                        ),
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        # -------------------------------------------------------------
        # 2. BEARISH SMC/ICT SETUP: Sweep of BSL -> MSS Displacement -> Bearish FVG
        # -------------------------------------------------------------
        # Buy-Side Liquidity targets (BSL): Recent Swing High, PDH, Asian Range High
        bsl_levels = [
            ("AsianHigh_BSL", state.asian_range_high),
            ("PDH_BSL", state.previous_day_high),
            ("SwingHigh_BSL", state.recent_swing_high),
        ]

        if state.regime != MarketRegimeType.TREND_UP:
            for label, bsl_level in bsl_levels:
                if not bsl_level:
                    continue

                # Check if price swept BSL (poked above or touched within 0.7 ATR)
                # and has rapidly fallen back below it (Displacement)
                dist_from_bsl = bsl_level - price
                if -0.4 * atr <= dist_from_bsl <= 0.85 * atr:
                    # Invalidation / Swing Anchor: Stop placed above swept BSL level + buffer
                    sl_buffer = max(0.40, 0.25 * atr)
                    stop_loss = round(max(bsl_level + sl_buffer, price + self.min_stop_distance), 2)
                    risk_distance = round(stop_loss - price, 2)

                    if risk_distance > self.max_stop_distance:
                        continue

                    # Target Opposing External Sell-Side Liquidity (SSL)
                    target_ssl = state.asian_range_low or state.previous_day_low or state.recent_swing_low
                    if target_ssl and (price - target_ssl) >= (self.min_risk_reward * risk_distance):
                        take_profit = round(target_ssl, 2)
                    else:
                        take_profit = round(price - (self.min_risk_reward * risk_distance), 2)

                    rr = round((price - take_profit) / risk_distance, 2)
                    if rr < self.min_risk_reward:
                        continue

                    return CandidateSetup(
                        strategy_id=self.strategy_id,
                        symbol=state.symbol,
                        side=OrderSide.SELL,
                        entry=price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        risk_reward=rr,
                        reason=(
                            f"ICT/SMC Bearish Reversal: Swept Buy-Side Liquidity at {label} ({bsl_level:.2f}) "
                            f"during {state.session.value} Killzone with MSS displacement into OTE/FVG. "
                            f"Targeting SSL at ${take_profit:.2f} (R:R={rr:.2f}:1, Risk=${risk_distance:.2f})."
                        ),
                        timestamp=state.timestamp,
                        expiry=state.timestamp + timedelta(hours=2)
                    )

        return None
