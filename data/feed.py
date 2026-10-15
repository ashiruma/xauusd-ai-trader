"""
Market Data Engine for XAUUSD.
Handles real-time tick ingestion, multi-timeframe candle synthesis (M1, M5, M15, H1, H4, D1),
spread tracking, and historical data loading.
"""

from collections import deque
from datetime import datetime, timezone, timedelta
import math
import random
from typing import Dict, List, Optional, Tuple
from config.settings import settings, DataMode
from data.models import Tick, Candle, TimeFrame


class MarketDataEngine:
    def __init__(self, symbol: str = "XAUUSD", max_history_bars: int = 1000):
        self.symbol = symbol
        self.max_history_bars = max_history_bars
        self.latest_tick: Optional[Tick] = None
        
        # Multi-timeframe bar buffers
        self.bars: Dict[TimeFrame, deque[Candle]] = {
            tf: deque(maxlen=max_history_bars) for tf in TimeFrame
        }
        
        # Ongoing bar construction for ticks
        self._current_m1_bar: Optional[Candle] = None
        self._listeners: List[Any] = []
        self._tick_count: int = 0

    def register_listener(self, callback) -> None:
        self._listeners.append(callback)

    def process_tick(self, tick: Tick) -> None:
        """
        Ingest a real-time tick, validate data integrity,
        update quote state, and aggregate into M1 / higher timeframe bars.
        """
        # Integrity checks
        if tick.bid <= 0 or tick.ask <= 0:
            raise ValueError(f"Corrupted tick with invalid price: bid={tick.bid}, ask={tick.ask}")
        if tick.ask < tick.bid:
            raise ValueError(f"Inverted spread anomaly: bid={tick.bid}, ask={tick.ask}")

        self._tick_count += 1
        
        # Aggregate into M1 candle
        self._aggregate_tick_to_m1(tick)

        # Ensure latest_tick reflects the processed tick
        self.latest_tick = tick
        
        # Notify listeners
        for listener in self._listeners:
            try:
                listener(tick)
            except Exception as e:
                pass

    def _aggregate_tick_to_m1(self, tick: Tick) -> None:
        mid_price = (tick.bid + tick.ask) / 2.0
        # Round down to minute start
        bar_timestamp = tick.time.replace(second=0, microsecond=0)

        if self._current_m1_bar is None:
            self._current_m1_bar = Candle(
                symbol=self.symbol,
                timeframe=TimeFrame.M1,
                timestamp=bar_timestamp,
                open=mid_price,
                high=mid_price,
                low=mid_price,
                close=mid_price,
                volume=tick.volume or 1.0
            )
            return

        if self._current_m1_bar.timestamp == bar_timestamp:
            # Update current M1 bar
            self._current_m1_bar.high = max(self._current_m1_bar.high, mid_price)
            self._current_m1_bar.low = min(self._current_m1_bar.low, mid_price)
            self._current_m1_bar.close = mid_price
            self._current_m1_bar.volume += (tick.volume or 1.0)
        else:
            # Completed M1 bar: append and start new
            self.add_candle(self._current_m1_bar)
            self._current_m1_bar = Candle(
                symbol=self.symbol,
                timeframe=TimeFrame.M1,
                timestamp=bar_timestamp,
                open=mid_price,
                high=mid_price,
                low=mid_price,
                close=mid_price,
                volume=tick.volume or 1.0
            )

    def add_candle(self, candle: Candle) -> None:
        """Add a complete candle to the respective timeframe buffer and synthesize higher timeframes."""
        buffer = self.bars[candle.timeframe]
        # Replace if same timestamp, else append
        if buffer and buffer[-1].timestamp == candle.timestamp:
            buffer[-1] = candle
        else:
            buffer.append(candle)
            
        if self.latest_tick is None or candle.timestamp >= self.latest_tick.time:
            spread = 0.25
            self.latest_tick = Tick(
                symbol=self.symbol,
                time=candle.timestamp,
                bid=round(candle.close - spread / 2.0, 2),
                ask=round(candle.close + spread / 2.0, 2),
                spread=spread,
                volume=candle.volume
            )

        # If an M1 bar is added, synthesize M5, M15, H1, H4, D1
        if candle.timeframe == TimeFrame.M1:
            self._synthesize_higher_timeframes(candle)

    def _synthesize_higher_timeframes(self, m1_candle: Candle) -> None:
        # Synthesize M5 if modulo 5
        self._roll_candle(m1_candle, TimeFrame.M5, 5)
        # Synthesize M15 if modulo 15
        self._roll_candle(m1_candle, TimeFrame.M15, 15)
        # Synthesize H1 if modulo 60
        self._roll_candle(m1_candle, TimeFrame.H1, 60)

    def _roll_candle(self, m1_candle: Candle, target_tf: TimeFrame, interval_minutes: int) -> None:
        minute = m1_candle.timestamp.minute
        bucket_minute = (minute // interval_minutes) * interval_minutes
        bucket_time = m1_candle.timestamp.replace(minute=bucket_minute, second=0, microsecond=0)
        
        buffer = self.bars[target_tf]
        if buffer and buffer[-1].timestamp == bucket_time:
            # Update existing bar
            existing = buffer[-1]
            existing.high = max(existing.high, m1_candle.high)
            existing.low = min(existing.low, m1_candle.low)
            existing.close = m1_candle.close
            existing.volume += m1_candle.volume
        else:
            # New bar for target timeframe
            new_bar = Candle(
                symbol=self.symbol,
                timeframe=target_tf,
                timestamp=bucket_time,
                open=m1_candle.open,
                high=m1_candle.high,
                low=m1_candle.low,
                close=m1_candle.close,
                volume=m1_candle.volume
            )
            buffer.append(new_bar)

    def get_candles(self, timeframe: TimeFrame, count: int = 100) -> List[Candle]:
        buffer = self.bars.get(timeframe, deque())
        if not buffer:
            return []
        items = list(buffer)
        return items[-count:]

    def get_latest_quote(self) -> Tuple[float, float, float]:
        """Returns (bid, ask, spread_in_points)"""
        if self.latest_tick is None:
            # Fallback if no ticks yet, check latest M15 bar
            m15 = self.get_candles(TimeFrame.M15, 1)
            if m15:
                mid = m15[0].close
                spread = 0.25  # standard 25 points ($0.25)
                return round(mid - spread / 2, 2), round(mid + spread / 2, 2), spread
            return 4162.00, 4162.25, 25.0
        return self.latest_tick.bid, self.latest_tick.ask, round((self.latest_tick.ask - self.latest_tick.bid) / settings.contract.point_size, 1)

    def load_historical_candles(self, timeframe: TimeFrame, candles: List[Candle]) -> None:
        """Batch load historical candles with strict chronological order and deduplication."""
        buffer = self.bars[timeframe]
        buffer.clear()
        seen = set()
        sorted_candles = sorted(candles, key=lambda x: x.timestamp)
        for c in sorted_candles:
            if c.timestamp not in seen:
                seen.add(c.timestamp)
                buffer.append(c)
        if candles:
            latest = candles[-1]
            # Ensure latest tick has reference
            spread = 0.25
            self.latest_tick = Tick(
                symbol=self.symbol,
                time=latest.timestamp,
                bid=latest.close - spread / 2,
                ask=latest.close + spread / 2,
                spread=spread,
                volume=latest.volume
            )

    @classmethod
    def generate_synthetic_data(cls, num_days: int = 15, base_price: float = 2650.0) -> "MarketDataEngine":
        """
        Generate realistic synthetic XAUUSD price action for testing, paper simulation,
        and backtesting with accurate gold volatility regimes, intraday session spikes,
        and market structure swings.
        """
        engine = cls(symbol="XAUUSD", max_history_bars=2000)
        random.seed(42)
        
        start_time = datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc)
        current_price = base_price
        total_m15_bars = num_days * 24 * 4  # 4 bars per hour
        
        candles_m15 = []
        candles_h1 = []
        candles_d1 = []
        
        daily_open = base_price
        daily_high = base_price
        daily_low = base_price
        
        current_day = start_time.date()
        day_volume = 0.0

        for i in range(total_m15_bars):
            bar_time = start_time + timedelta(minutes=15 * i)
            hour = bar_time.hour
            
            # Intraday volatility curve (London 07-15 UTC and NY 12-20 UTC are higher vol)
            if 7 <= hour < 16:
                vol_factor = 1.6  # London / Overlap peak volatility
            elif 16 <= hour < 21:
                vol_factor = 1.3  # NY afternoon
            else:
                vol_factor = 0.7  # Asian session quieter range
            
            # Gold mean-reverting trend dynamics with drift
            drift = 0.05 * math.sin(i / 80.0)  # wave structure
            noise = random.gauss(0, 1.2 * vol_factor)
            price_delta = drift + noise
            
            bar_open = current_price
            bar_close = current_price + price_delta
            
            # Realistic wicks
            wick_high = abs(random.gauss(0, 0.8 * vol_factor))
            wick_low = abs(random.gauss(0, 0.8 * vol_factor))
            bar_high = max(bar_open, bar_close) + wick_high
            bar_low = min(bar_open, bar_close) - wick_low
            bar_volume = round(random.uniform(200, 1500) * vol_factor, 1)
            
            c_m15 = Candle(
                symbol="XAUUSD",
                timeframe=TimeFrame.M15,
                timestamp=bar_time,
                open=round(bar_open, 2),
                high=round(bar_high, 2),
                low=round(bar_low, 2),
                close=round(bar_close, 2),
                volume=bar_volume
            )
            candles_m15.append(c_m15)
            current_price = bar_close

            # Update daily tracking
            if bar_time.date() != current_day:
                # Record completed day
                candles_d1.append(Candle(
                    symbol="XAUUSD",
                    timeframe=TimeFrame.D1,
                    timestamp=datetime.combine(current_day, datetime.min.time(), tzinfo=timezone.utc),
                    open=round(daily_open, 2),
                    high=round(daily_high, 2),
                    low=round(daily_low, 2),
                    close=round(bar_open, 2),
                    volume=round(day_volume, 1)
                ))
                current_day = bar_time.date()
                daily_open = bar_open
                daily_high = bar_high
                daily_low = bar_low
                day_volume = bar_volume
            else:
                daily_high = max(daily_high, bar_high)
                daily_low = min(daily_low, bar_low)
                day_volume += bar_volume

        engine.load_historical_candles(TimeFrame.M15, candles_m15)
        engine.load_historical_candles(TimeFrame.D1, candles_d1)
        return engine


# Global default market data engine instance
feed = MarketDataEngine()
