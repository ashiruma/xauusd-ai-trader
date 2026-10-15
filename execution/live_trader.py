"""
Autonomous Live Trading Engine for XAUUSD.
Connects real-time MT5 tick stream to Quantitative Strategy Engine, AI Analyst,
Deterministic Risk Guardrails, and Direct MT5 Order Execution.
"""

from datetime import datetime, timezone
import logging
import threading
import time
from typing import Optional, Dict, Any

from config.settings import settings, TradingMode, DataMode
from data.models import Tick, Candle, TimeFrame, OrderSide
from data.feed import feed
from service import coordinator

logger = logging.getLogger(__name__)

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    mt5 = None
    MT5_AVAILABLE = False


class LiveTrader:
    def __init__(self, poll_interval_sec: float = 0.5):
        self.poll_interval = poll_interval_sec
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self._last_tick_time: Optional[float] = None
        self._symbol = settings.mt5.symbol
        self._trade_allowed_warned = False

    def warm_up_feed(self) -> bool:
        """Download latest 300 M15 candles from MT5 to initialize technical indicators."""
        if not MT5_AVAILABLE:
            logger.error("MetaTrader5 library is not available.")
            return False

        logger.info(f"Warming up market feed with historical M15 candles for '{self._symbol}'...")
        rates = mt5.copy_rates_from_pos(self._symbol, mt5.TIMEFRAME_M15, 0, 300)
        if rates is None or len(rates) == 0:
            logger.warning(f"Could not fetch M15 rates for '{self._symbol}': {mt5.last_error()}")
            return False

        candles = []
        for r in rates:
            dt = datetime.fromtimestamp(int(r['time']), tz=timezone.utc)
            candle = Candle(
                symbol="XAUUSD",
                timeframe=TimeFrame.M15,
                timestamp=dt,
                open=float(r['open']),
                high=float(r['high']),
                low=float(r['low']),
                close=float(r['close']),
                volume=float(r['tick_volume'])
            )
            candles.append(candle)

        coordinator.feed.load_historical_candles(TimeFrame.M15, candles)
        coordinator.latest_market_state = coordinator.state_engine.build_current_state()
        logger.info(f"Loaded {len(candles)} real broker M15 candles. Indicators primed!")
        return True

    def check_algo_trading_status(self) -> bool:
        """Check if Algo Trading is enabled in MT5 and warn operator if not."""
        if not MT5_AVAILABLE:
            return False
        terminal_info = mt5.terminal_info()
        if not terminal_info:
            return False

        if not terminal_info.trade_allowed:
            if not self._trade_allowed_warned:
                print("\n" + "=" * 70)
                print(">>> ATTENTION: MT5 ALGO TRADING IS DISABLED IN TERMINAL <<<")
                print("1. Look at the top toolbar in your MetaTrader 5 application.")
                print("2. Click the 'Algo Trading' button (or press Ctrl + E).")
                print("3. Ensure the icon turns GREEN.")
                print("Until enabled, live orders will be blocked by MT5 security policy.")
                print("=" * 70 + "\n")
                self._trade_allowed_warned = True
            return False
        else:
            if self._trade_allowed_warned:
                print("\n[OK] MetaTrader 5 Algo Trading has been ENABLED! Automated execution active.\n")
                self._trade_allowed_warned = False
            return True

    def start(self, background: bool = False) -> bool:
        """Start the live market data and execution loop."""
        if self.is_running:
            return True

        if not MT5_AVAILABLE:
            print("ERROR: MetaTrader5 Python package not available.")
            return False

        # Connect adapter
        if not coordinator.mt5_adapter.connect():
            print(f"ERROR: Failed to connect to MetaTrader 5 terminal: {coordinator.mt5_adapter._last_error}")
            return False

        # Refresh symbol from adapter
        self._symbol = coordinator.mt5_adapter._symbol
        print(f"[LIVE TRADER] Connected to MT5. Active Symbol: '{self._symbol}'")

        # Check Algo Trading status
        self.check_algo_trading_status()

        # Warm up feed with real candles
        self.warm_up_feed()

        self.is_running = True

        if background:
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()
            print("[LIVE TRADER] Running in background thread.")
            return True
        else:
            self._run_loop()
            return True

    def stop(self):
        """Stop the live loop gracefully."""
        self.is_running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=3.0)
        print("[LIVE TRADER] Stopped.")

    def _run_loop(self):
        """Core real-time ingestion and execution loop."""
        last_logged_time = 0.0
        last_heartbeat_time = time.time()
        last_bid = 0.0
        last_ask = 0.0

        print("\n" + "=" * 60)
        print("XAUUSD AUTONOMOUS LIVE TRADING LOOP ACTIVE")
        print(f"Monitoring: {self._symbol} | Polling: {self.poll_interval}s")
        print("Deterministic Risk Rules: Active | AI Decision Support: Active")
        print("=" * 60 + "\n")

        try:
            while self.is_running:
                # 1. Periodically check terminal trade allowed
                now_sec = time.time()
                if now_sec - last_heartbeat_time >= 5.0:
                    self.check_algo_trading_status()
                    last_heartbeat_time = now_sec

                # 2. Fetch live tick from MT5
                tick_info = mt5.symbol_info_tick(self._symbol)
                if tick_info is None:
                    time.sleep(self.poll_interval)
                    continue

                # 3. Only process if quote has moved or at least 1 second passed
                tick_time = float(tick_info.time)
                quote_changed = (tick_info.bid != last_bid) or (tick_info.ask != last_ask)

                if quote_changed or (now_sec - last_logged_time >= 2.0):
                    last_bid = tick_info.bid
                    last_ask = tick_info.ask

                    tick_dt = datetime.fromtimestamp(int(tick_info.time), tz=timezone.utc)
                    spread_pts = round((tick_info.ask - tick_info.bid) / settings.contract.point_size, 1)

                    tick = Tick(
                        symbol="XAUUSD",
                        time=tick_dt,
                        bid=tick_info.bid,
                        ask=tick_info.ask,
                        spread=spread_pts,
                        volume=float(getattr(tick_info, "volume", 1.0))
                    )

                    # Step the entire quantitative lifecycle (tick ingested in step)
                    step_res = coordinator.step(tick)

                    mkt = step_res.get("market_state") or {}
                    sig = step_res.get("fused_signal") or {}
                    ord_res = step_res.get("order_result")
                    positions = step_res.get("open_positions") or []

                    # Periodic console progress telemetry
                    if now_sec - last_logged_time >= 2.0:
                        regime = mkt.get("regime", "UNKNOWN")
                        session = mkt.get("session", "UNKNOWN")
                        sig_side = sig.get("side", "NO_TRADE")
                        conf = sig.get("confidence", 0.0)

                        regime_str = getattr(regime, "value", str(regime))
                        session_str = getattr(session, "value", str(session))
                        side_str = getattr(sig_side, "value", str(sig_side))

                        pos_count = len(positions)
                        pos_info = f"{pos_count} pos" if pos_count > 0 else "0 pos"

                        print(
                            f"[{datetime.now().strftime('%H:%M:%S')}] "
                            f"Spot: ${tick_info.bid:.2f}/{tick_info.ask:.2f} "
                            f"(Spread: {spread_pts} pts) | "
                            f"{session_str} [{regime_str}] | "
                            f"Signal: {side_str} ({conf:.0%}) | {pos_info}"
                        )
                        last_logged_time = now_sec

                    # Log actual order executions
                    if ord_res:
                        ticket = ord_res.get("ticket")
                        status = ord_res.get("status")
                        side = ord_res.get("side")
                        lots = ord_res.get("lot_size")
                        fill_px = ord_res.get("filled_price")
                        err = ord_res.get("error_message")

                        if status == "FILLED":
                            print(f"\n>>> [TRADE EXECUTED] #{ticket} {side} {lots} lots @ ${fill_px:.2f} <<<\n")
                        elif status == "REJECTED":
                            print(f"\n[ORDER REJECTED] {side} {lots} lots - Reason: {err}\n")

                time.sleep(self.poll_interval)

        except KeyboardInterrupt:
            print("\nLive trading loop interrupted by operator.")
        except Exception as e:
            logger.error(f"Live trader unhandled error: {e}", exc_info=True)
            print(f"\n[LIVE TRADER ERROR] {e}")
        finally:
            self.is_running = False


# Global LiveTrader singleton instance
live_trader = LiveTrader()
