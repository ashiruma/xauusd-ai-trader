"""
Live Real-Time Tick Streamer from MetaTrader 5 Terminal.
Directly syncs live JustMarkets XAUUSD.m quotes into data/live_quote.json.
Includes automatic fallback to real-time global gold spot feed if MT5 is offline.
"""

import time
import json
import os
import sys
import urllib.request

def fetch_tradingview_spot():
    try:
        url = "https://scanner.tradingview.com/cfd/scan"
        req = urllib.request.Request(
            url,
            data=json.dumps({
                "symbols": {"tickers": ["OANDA:XAUUSD"]},
                "columns": ["close", "bid", "ask", "change", "change_abs", "high", "low", "open"]
            }).encode("utf-8"),
            headers={"User-Agent": "Mozilla/5.0", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            d = data["data"][0]["d"]
            raw_bid = float(d[1])
            raw_ask = float(d[2])
            raw_close = float(d[0])
            price = round((raw_bid + raw_ask) / 2.0, 2) if (raw_bid > 0 and raw_ask > 0) else round(raw_close, 2)
            bid = round(raw_bid, 2) if raw_bid > 0 else round(price - 0.25, 2)
            ask = round(raw_ask, 2) if raw_ask > 0 else round(price + 0.25, 2)
            spread = round((ask - bid) * 10, 1)
            change_pct = round(float(d[3] or 0), 2)
            change_abs = round(float(d[4] or 0), 2)
            delta = f"{'+' if change_abs >= 0 else ''}{change_abs:.2f} ({'+' if change_pct >= 0 else ''}{change_pct:.2f}%)"
            return {
                "symbol": "XAUUSD.m",
                "price": price,
                "bid": bid,
                "ask": ask,
                "spread": f"{spread if spread > 0 else 2.6} PIPS",
                "spreadPips": spread if spread > 0 else 2.6,
                "delta": delta,
                "timestamp": int(time.time() * 1000),
                "source": "TRADINGVIEW_XAUUSD_LIVE",
                "status": "ONLINE"
            }
    except Exception:
        return None

def fetch_fallback_spot():
    try:
        url = "https://api.binance.com/api/v3/ticker/bookTicker?symbol=PAXGUSDT"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            bid = round(float(data["bidPrice"]), 2)
            ask = round(float(data["askPrice"]), 2)
            price = round((bid + ask) / 2, 2)
            spread = round((ask - bid) * 10, 1)
            return {
                "symbol": "XAUUSD.m",
                "price": price,
                "bid": bid,
                "ask": ask,
                "spread": f"{spread if spread > 0 else 2.6} PIPS",
                "spreadPips": spread if spread > 0 else 2.6,
                "delta": "+0.00",
                "timestamp": int(time.time() * 1000),
                "source": "GLOBAL_GOLD_SPOT_REALTIME",
                "status": "ONLINE"
            }
    except Exception:
        return None

def main():
    has_mt5 = False
    try:
        import MetaTrader5 as mt5
        has_mt5 = True
    except ImportError:
        print("MetaTrader5 package not found, falling back to public spot feed.")

    mt5_initialized = False
    if has_mt5:
        exe_path = r"C:\Program Files\MetaTrader 5\terminal64.exe"
        if os.path.exists(exe_path):
            mt5_initialized = mt5.initialize(path=exe_path)
        else:
            mt5_initialized = mt5.initialize()

        if mt5_initialized:
            for s in ["XAUUSD.m", "XAUUSD"]:
                mt5.symbol_select(s, True)
            acc = mt5.account_info()
            acc_login = acc.login if acc else "Unknown"
            print(f"Connected to JustMarkets MT5! Account #{acc_login}. Streaming live gold ticks...")
        else:
            print("MT5 initialization failed, will stream via Global Spot Gold API.")

    os.makedirs("data", exist_ok=True)
    out_file = os.path.join("data", "live_quote.json")
    last_price = 0.0

    while True:
        payload = None

        # 1. Try MT5 first if initialized
        if mt5_initialized:
            try:
                for sym in ["XAUUSD.m", "XAUUSD"]:
                    tick = mt5.symbol_info_tick(sym)
                    if tick and tick.bid > 0 and tick.ask > 0:
                        bid = round(tick.bid, 2)
                        ask = round(tick.ask, 2)
                        price = round((bid + ask) / 2, 2)
                        spread = round((ask - bid) * 10, 1)
                        payload = {
                            "symbol": sym,
                            "price": price,
                            "bid": bid,
                            "ask": ask,
                            "spread": spread if spread > 0 else 2.6,
                            "timestamp": int(time.time() * 1000),
                            "source": "JUSTMARKETS_MT5_DIRECT",
                            "status": "ONLINE"
                        }
                        break
            except Exception:
                pass

        # 2. Fallback to real-time TradingView gold spot if MT5 didn't return
        if not payload:
            payload = fetch_tradingview_spot()

        # 3. Fallback to secondary spot if TradingView is unreachable
        if not payload:
            payload = fetch_fallback_spot()

        # 3. Write payload atomically if available
        if payload:
            try:
                temp_file = out_file + ".tmp"
                with open(temp_file, "w") as f:
                    json.dump(payload, f)
                os.replace(temp_file, out_file)
                if abs(payload["price"] - last_price) > 0.05:
                    last_price = payload["price"]
                    print(f"[{time.strftime('%H:%M:%S')}] Live XAUUSD: ${payload['price']:.2f} (Bid: ${payload['bid']:.2f} | Ask: ${payload['ask']:.2f} | Source: {payload['source']})")
            except Exception as e:
                print(f"Error writing quote file: {e}")

        time.sleep(0.5) # Update every 500ms

    if mt5_initialized:
        mt5.shutdown()

if __name__ == "__main__":
    main()
