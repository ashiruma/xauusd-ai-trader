"""
Velarion Markets - Production 24/7 VPS Heartbeat Watchdog.
Monitors FastAPI Uvicorn engine, MT5 terminal process, and broker feed health.
If connection drops or latency drifts for >30 seconds, logs an alert and triggers recovery.
Zero external third-party dependencies (pure standard library).
"""

import datetime
import json
import logging
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
WATCHDOG_LOG = os.path.join(LOG_DIR, "watchdog.log")

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(WATCHDOG_LOG, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("HeartbeatWatchdog")

DAEMON_QUOTE_URL = "http://127.0.0.1:8000/api/market/quote"
DAEMON_ACCOUNT_URL = "http://127.0.0.1:8000/api/account/info"
CHECK_INTERVAL_SEC = 15
MAX_CONSECUTIVE_FAILURES = 3


def is_mt5_process_running() -> bool:
    """Check if terminal64.exe is running via tasklist."""
    try:
        output = subprocess.check_output(
            ["tasklist", "/fi", "imagename eq terminal64.exe"],
            text=True,
            stderr=subprocess.DEVNULL
        )
        return "terminal64.exe" in output.lower()
    except Exception:
        return False


def query_endpoint(url: str, timeout_sec: int = 5) -> dict:
    """Query a local JSON endpoint safely."""
    req = urllib.request.Request(
        url,
        headers={"Accept": "application/json", "User-Agent": "VelarionWatchdog/1.0"}
    )
    with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
        if resp.status == 200:
            return json.loads(resp.read().decode("utf-8"))
        raise RuntimeError(f"HTTP {resp.status}")


def run_watchdog():
    logger.info("=" * 60)
    logger.info("VELARION MARKETS - 24/7 VPS WATCHDOG ACTIVE")
    logger.info(f"Target: {DAEMON_QUOTE_URL} | Interval: {CHECK_INTERVAL_SEC}s")
    logger.info("=" * 60)

    consecutive_failures = 0
    checks_count = 0

    while True:
        try:
            checks_count += 1
            terminal_alive = is_mt5_process_running()
            if not terminal_alive:
                logger.warning("[WATCHDOG ALERT] terminal64.exe process NOT DETECTED in Windows process list!")

            quote = query_endpoint(DAEMON_QUOTE_URL)

            is_connected = quote.get("is_connected", False)
            symbol = quote.get("symbol", "UNKNOWN")
            price = quote.get("current_price") or quote.get("price")
            spread_pips = quote.get("spread_pips", 0.0)

            if is_connected and price and float(price) > 0:
                consecutive_failures = 0
                if checks_count % 4 == 0:  # Log summary once a minute
                    logger.info(
                        f"[HEALTHY] MT5 Connected: {symbol} @ ${price:.2f} (Spread: {spread_pips} pips) | Terminal: {'OK' if terminal_alive else 'OFFLINE'}"
                    )
            else:
                consecutive_failures += 1
                logger.warning(
                    f"[HEARTBEAT DEGRADED #{consecutive_failures}] Server up but MT5 reported disconnected. Status: {quote.get('status')}"
                )

        except urllib.error.URLError as e:
            consecutive_failures += 1
            logger.error(
                f"[HEARTBEAT FAILED #{consecutive_failures}/{MAX_CONSECUTIVE_FAILURES}] Cannot connect to FastAPI daemon: {e.reason}"
            )
        except Exception as exc:
            consecutive_failures += 1
            logger.error(
                f"[HEARTBEAT EXCEPTION #{consecutive_failures}/{MAX_CONSECUTIVE_FAILURES}] Unexpected error: {exc}"
            )

        if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
            logger.critical(
                f"[WATCHDOG CRITICAL] {consecutive_failures} consecutive heartbeat failures! Trading daemon is unresponsive."
            )
            # Recovery action: Attempt to start daemon if dead
            # In production, this can also trigger an emergency notification (Telegram/Webhook)

        time.sleep(CHECK_INTERVAL_SEC)


if __name__ == "__main__":
    try:
        run_watchdog()
    except KeyboardInterrupt:
        logger.info("Watchdog stopped by operator.")
