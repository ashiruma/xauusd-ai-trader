"""
Market Structure Engine for XAUUSD.
Identifies Swing Highs/Lows, Liquidity Pools, Previous Day/Week High/Low,
Asian Range extremes, and breakout/pullback characteristics.
"""

from datetime import datetime, time, timezone, timedelta
from typing import List, Optional, Tuple
from data.models import Candle, SwingPoint, SessionName


class MarketStructureAnalyzer:
    @staticmethod
    def identify_swings(candles: List[Candle], lookback: int = 5) -> Tuple[List[SwingPoint], List[SwingPoint]]:
        """
        Identify swing highs and swing lows using fractal pivot logic:
        A swing high has `lookback` lower highs to its left and right.
        """
        highs: List[SwingPoint] = []
        lows: List[SwingPoint] = []
        
        n = len(candles)
        if n < (lookback * 2 + 1):
            return highs, lows

        for i in range(lookback, n - lookback):
            current = candles[i]
            is_high = True
            is_low = True

            for j in range(i - lookback, i + lookback + 1):
                if j == i:
                    continue
                if candles[j].high >= current.high:
                    is_high = False
                if candles[j].low <= current.low:
                    is_low = False

            if is_high:
                highs.append(SwingPoint(timestamp=current.timestamp, price=current.high, type="HIGH"))
            if is_low:
                lows.append(SwingPoint(timestamp=current.timestamp, price=current.low, type="LOW"))

        return highs, lows

    @staticmethod
    def get_recent_swing_levels(candles: List[Candle]) -> Tuple[Optional[float], Optional[float]]:
        """Returns the most recent verified swing high and swing low."""
        highs, lows = MarketStructureAnalyzer.identify_swings(candles, lookback=3)
        recent_high = highs[-1].price if highs else None
        recent_low = lows[-1].price if lows else None
        return recent_high, recent_low

    @staticmethod
    def calculate_previous_day_levels(daily_candles: List[Candle]) -> Tuple[Optional[float], Optional[float]]:
        """Returns (PDH, PDL) from daily candles."""
        if not daily_candles or len(daily_candles) < 2:
            return None, None
        prev_day = daily_candles[-2]
        return prev_day.high, prev_day.low

    @staticmethod
    def calculate_previous_week_levels(candles: List[Candle]) -> Tuple[Optional[float], Optional[float]]:
        """Calculates Previous Week High (PWH) and Low (PWL) based on timestamp windows."""
        if len(candles) < 100:
            return None, None
        # Approximate 5 trading days = 480 M15 candles
        week_candles = candles[-480:-96] if len(candles) >= 480 else candles[:-96]
        if not week_candles:
            return None, None
        pwh = max(c.high for c in week_candles)
        pwl = min(c.low for c in week_candles)
        return pwh, pwl

    @staticmethod
    def calculate_asian_session_range(m15_candles: List[Candle], current_time: datetime) -> Tuple[Optional[float], Optional[float]]:
        """
        Asian session: 00:00 UTC to 08:00 UTC.
        Computes high and low of the most recent Asian session.
        """
        current_date = current_time.date()
        asian_candles = [
            c for c in m15_candles
            if c.timestamp.date() == current_date and 0 <= c.timestamp.hour < 8
        ]
        if not asian_candles:
            # Check previous day's Asian session
            prev_date = current_date - timedelta(days=1)
            asian_candles = [
                c for c in m15_candles
                if c.timestamp.date() == prev_date and 0 <= c.timestamp.hour < 8
            ]
        if not asian_candles:
            return None, None
        return max(c.high for c in asian_candles), min(c.low for c in asian_candles)

    @staticmethod
    def determine_session(dt: datetime) -> SessionName:
        """
        Classifies current time into institutional forex/gold trading sessions:
        - Asian: 00:00 - 08:00 UTC
        - London: 07:00 - 15:30 UTC
        - New York: 12:00 - 20:30 UTC
        - Overlap (London/NY): 12:00 - 15:30 UTC
        - Rollover / Low liquidity: 21:00 - 23:00 UTC
        """
        hour = dt.hour
        minute = dt.minute
        time_dec = hour + minute / 60.0

        if 21.0 <= time_dec <= 23.0:
            return SessionName.ROLLOVER_CAUTION
        if 12.0 <= time_dec <= 15.5:
            return SessionName.LONDON_NY_OVERLAP
        if 7.0 <= time_dec < 12.0:
            return SessionName.LONDON
        if 15.5 < time_dec <= 20.5:
            return SessionName.NEW_YORK
        if 0.0 <= time_dec < 7.0:
            return SessionName.ASIAN
        return SessionName.OFF_HOURS
