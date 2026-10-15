"""
Market State Engine for XAUUSD.
Synthesizes indicators (ATR, RSI, EMAs), market structure, sessions, and regimes
into a complete deterministic MarketState object.
"""

from datetime import datetime, timezone
from typing import List, Optional, Tuple
import numpy as np

from data.models import Candle, MarketState, TimeFrame, SessionName, MarketRegimeType
from data.feed import MarketDataEngine
from state.structure import MarketStructureAnalyzer
from state.regime import MarketRegimeEngine


class MarketStateEngine:
    def __init__(self, data_engine: MarketDataEngine):
        self.data_engine = data_engine

    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> float:
        if not prices:
            return 0.0
        if len(prices) < period:
            return float(np.mean(prices))
        
        # Exponential Moving Average calculation
        multiplier = 2.0 / (period + 1)
        ema = float(np.mean(prices[:period]))
        for price in prices[period:]:
            ema = (price - ema) * multiplier + ema
        return float(ema)

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> float:
        if len(prices) <= period:
            return 50.0

        deltas = np.diff(prices)
        seed = deltas[:period]
        up = seed[seed >= 0].sum() / period
        down = -seed[seed < 0].sum() / period

        if down == 0:
            return 100.0

        rs = up / down
        rsi = 100.0 - 100.0 / (1.0 + rs)

        for delta in deltas[period:]:
            up_val = delta if delta > 0 else 0.0
            down_val = -delta if delta < 0 else 0.0
            up = (up * (period - 1) + up_val) / period
            down = (down * (period - 1) + down_val) / period
            if down == 0:
                rsi = 100.0
            else:
                rs = up / down
                rsi = 100.0 - 100.0 / (1.0 + rs)

        return float(np.clip(rsi, 0.0, 100.0))

    @staticmethod
    def calculate_atr(candles: List[Candle], period: int = 14) -> Tuple[float, float]:
        """Returns (current_atr, historical_mean_atr)"""
        if len(candles) < 2:
            return 2.5, 2.5

        true_ranges = []
        for i in range(1, len(candles)):
            curr = candles[i]
            prev = candles[i - 1]
            tr = max(
                curr.high - curr.low,
                abs(curr.high - prev.close),
                abs(curr.low - prev.close)
            )
            true_ranges.append(tr)

        if len(true_ranges) < period:
            mean_tr = float(np.mean(true_ranges)) if true_ranges else 2.5
            return mean_tr, mean_tr

        # Wilder's Smoothing for ATR
        atr = float(np.mean(true_ranges[:period]))
        all_atrs = [atr]
        for tr in true_ranges[period:]:
            atr = (atr * (period - 1) + tr) / period
            all_atrs.append(atr)

        hist_mean = float(np.mean(all_atrs))
        return float(atr), hist_mean

    def build_current_state(self, open_positions_count: int = 0, is_news_active: bool = False) -> MarketState:
        """Construct the complete MarketState snapshot."""
        candles_m15 = self.data_engine.get_candles(TimeFrame.M15, 300)
        candles_d1 = self.data_engine.get_candles(TimeFrame.D1, 30)

        bid, ask, spread_points = self.data_engine.get_latest_quote()
        current_price = (bid + ask) / 2.0
        if self.data_engine.latest_tick:
            now = self.data_engine.latest_tick.time
        elif candles_m15:
            now = candles_m15[-1].timestamp
        else:
            now = datetime.now(timezone.utc)

        if not candles_m15:
            # Fallback baseline state
            return MarketState(
                timestamp=now,
                symbol=self.data_engine.symbol,
                current_price=current_price,
                bid=bid,
                ask=ask,
                spread_points=spread_points,
                atr_14=2.5,
                rsi_14=50.0,
                ema_9=current_price,
                ema_21=current_price,
                ema_50=current_price,
                ema_200=current_price,
                session=MarketStructureAnalyzer.determine_session(now),
                regime=MarketRegimeType.UNCERTAIN,
                trend_description="Insufficient candle history",
                open_positions_count=open_positions_count
            )

        close_prices = [c.close for c in candles_m15]
        
        # Indicator calculations
        ema_9 = self.calculate_ema(close_prices, 9)
        ema_21 = self.calculate_ema(close_prices, 21)
        ema_50 = self.calculate_ema(close_prices, 50)
        ema_200 = self.calculate_ema(close_prices, 200)
        rsi_14 = self.calculate_rsi(close_prices, 14)
        atr_14, hist_atr_mean = self.calculate_atr(candles_m15, 14)

        # Market structure levels
        recent_sh, recent_sl = MarketStructureAnalyzer.get_recent_swing_levels(candles_m15)
        pdh, pdl = MarketStructureAnalyzer.calculate_previous_day_levels(candles_d1)
        pwh, pwl = MarketStructureAnalyzer.calculate_previous_week_levels(candles_m15)
        asian_h, asian_l = MarketStructureAnalyzer.calculate_asian_session_range(candles_m15, now)
        session = MarketStructureAnalyzer.determine_session(now)

        # Regime classification
        regime, trend_desc = MarketRegimeEngine.classify_regime(
            current_price=current_price,
            ema_9=ema_9,
            ema_21=ema_21,
            ema_50=ema_50,
            ema_200=ema_200,
            atr_14=atr_14,
            historical_atr_mean=hist_atr_mean,
            rsi_14=rsi_14,
            is_news_active=is_news_active
        )

        return MarketState(
            timestamp=now,
            symbol=self.data_engine.symbol,
            current_price=round(current_price, 2),
            bid=round(bid, 2),
            ask=round(ask, 2),
            spread_points=spread_points,
            atr_14=round(atr_14, 2),
            rsi_14=round(rsi_14, 2),
            ema_9=round(ema_9, 2),
            ema_21=round(ema_21, 2),
            ema_50=round(ema_50, 2),
            ema_200=round(ema_200, 2),
            recent_swing_high=round(recent_sh, 2) if recent_sh else None,
            recent_swing_low=round(recent_sl, 2) if recent_sl else None,
            previous_day_high=round(pdh, 2) if pdh else None,
            previous_day_low=round(pdl, 2) if pdl else None,
            previous_week_high=round(pwh, 2) if pwh else None,
            previous_week_low=round(pwl, 2) if pwl else None,
            asian_range_high=round(asian_h, 2) if asian_h else None,
            asian_range_low=round(asian_l, 2) if asian_l else None,
            session=session,
            regime=regime,
            trend_description=trend_desc,
            open_positions_count=open_positions_count
        )
