"""
Live Real-Time Tick Streamer from MetaTrader 5 Terminal.
Directly syncs live JustMarkets XAUUSD.m quotes into data/live_quote.json.
"""

import time
import json
import os
import sys

def main():
    try:
        import MetaTrader5 as mt5
    except ImportError:
        print("MetaTrader5 package not found. Run: pip install MetaTrader5")
        sys.exit(1)

    print("Initializing MetaTrader 5 live ticker stream...")
    if not mt5.initialize():
        print(f"MT5 Init failed: {mt5.last_error()}")
        sys.exit(1)

    symbol = "XAUUSD.m"
    if not mt5.symbol_select(symbol, True):
        symbol = "XAUUSD"
        mt5.symbol_select(symbol, True)

    acc = mt5.account_info()
    acc_login = acc.login if acc else "Unknown"
    print(f"Connected to MT5! Account #{acc_login} | Streaming live {symbol} ticks...")

    os.makedirs("data", exist_ok=True)
    out_file = os.path.join("data", "live_quote.json")
    last_bid = 0.0

    while True:
        try:
            tick = mt5.symbol_info_tick(symbol)
            if tick and (tick.bid != last_bid or (time.time() * 1000 - tick.time_msc < 5000)):
                last_bid = tick.bid
                bid = round(tick.bid, 2)
                ask = round(tick.ask, 2)
                price = round((bid + ask) / 2, 2)
                spread = round((ask - bid) * 10, 1)

                payload = {
                    "symbol": symbol,
                    "price": price,
                    "bid": bid,
                    "ask": ask,
                    "spread": spread,
                    "timestamp": tick.time_msc,
                    "source": "JUSTMARKETS_MT5_DIRECT"
                }

                temp_file = out_file + ".tmp"
                with open(temp_file, "w") as f:
                    json.dump(payload, f)
                os.replace(temp_file, out_file)

            time.sleep(0.1) # 100ms polling for live sub-second precision
        except KeyboardInterrupt:
            break
        except Exception as e:
            time.sleep(1)

    mt5.shutdown()
    print("MT5 ticker stream stopped.")

if __name__ == "__main__":
    main()
