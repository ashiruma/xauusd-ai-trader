"""
Broker Data Synchronizer and Real-Data Backtesting Script for XAUUSD.
Fetches real historical and live data from your MetaTrader 5 broker terminal.
Supports both direct API download and MT5 CSV export file imports.
"""

import argparse
import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from datetime import datetime, timezone
import pandas as pd

from config.settings import settings
from data.models import Candle, TimeFrame
from backtest.engine import BacktestEngine
from performance.metrics import PerformanceEngine


def connect_mt5():
    """Attempt connection to MetaTrader 5 terminal."""
    try:
        import MetaTrader5 as mt5
    except ImportError:
        print("ERROR: MetaTrader5 package is not installed. Run: pip install MetaTrader5")
        return None

    init_kwargs = {}
    if settings.mt5.path and os.path.exists(settings.mt5.path):
        init_kwargs["path"] = settings.mt5.path
    else:
        standard_path = r"C:\Program Files\MetaTrader 5\terminal64.exe"
        if os.path.exists(standard_path):
            init_kwargs["path"] = standard_path

    if settings.mt5.login and settings.mt5.password and settings.mt5.server:
        init_kwargs["login"] = int(settings.mt5.login)
        init_kwargs["password"] = settings.mt5.password
        init_kwargs["server"] = settings.mt5.server

    print("Attempting to connect to MetaTrader 5 terminal...")
    if not mt5.initialize(**init_kwargs):
        err = mt5.last_error()
        print(f"MT5 Init status: Failed. Code: {err[0]}, Description: {err[1]}")
        print("\nTroubleshooting tips:")
        print("1. Open your MetaTrader 5 terminal and ensure you are logged in to your broker account.")
        print("2. In MT5: Tools -> Options -> Expert Advisors -> Check 'Allow algorithmic trading'.")
        print("3. Alternatively, supply MT5__LOGIN, MT5__PASSWORD, MT5__SERVER in .env file.")
        return None

    term_info = mt5.terminal_info()
    acc_info = mt5.account_info()
    broker_name = acc_info.company if acc_info else "Unknown"
    account_id = acc_info.login if acc_info else "Unknown"
    print(f"Connected to MT5! Broker: {broker_name} | Account: #{account_id} | Connected: {term_info.connected}")
    return mt5


def find_gold_symbol(mt5, override_symbol: str = None) -> str:
    if override_symbol:
        info = mt5.symbol_info(override_symbol)
        if info is not None:
            mt5.symbol_select(override_symbol, True)
            print(f"Using explicitly specified symbol: '{override_symbol}'")
            return override_symbol

    # First check settings
    if settings.mt5.symbol:
        info = mt5.symbol_info(settings.mt5.symbol)
        if info is not None:
            mt5.symbol_select(settings.mt5.symbol, True)
            print(f"Using configured symbol from settings: '{settings.mt5.symbol}'")
            return settings.mt5.symbol

    # Direct candidate checks for popular broker conventions (e.g. Just Global Markets .m suffix)
    common_candidates = ["XAUUSD.m", "XAUUSD", "XAUUSD_", "XAUUSDm", "GOLD.m", "GOLD", "GOLD_"]
    for cand in common_candidates:
        info = mt5.symbol_info(cand)
        if info is not None:
            mt5.symbol_select(cand, True)
            print(f"Auto-detected Gold symbol via direct lookup: '{cand}'")
            return cand

    # Dynamically scan with group search across broker database
    all_symbols = (
        mt5.symbols_get(group="*XAU*")
        or mt5.symbols_get(group="*GOLD*")
        or mt5.symbols_get()
    )
    if all_symbols:
        # Priority 1: Exact matches or symbols starting with XAUUSD
        for s in all_symbols:
            name_upper = s.name.upper()
            if name_upper == "XAUUSD" or name_upper.startswith("XAUUSD.") or name_upper.startswith("XAUUSD_") or name_upper == "XAUUSDM":
                mt5.symbol_select(s.name, True)
                print(f"Auto-detected Gold symbol on broker: '{s.name}'")
                return s.name

        # Priority 2: Any symbol starting with GOLD
        for s in all_symbols:
            name_upper = s.name.upper()
            if name_upper == "GOLD" or name_upper.startswith("GOLD.") or name_upper.startswith("GOLD_") or name_upper == "GOLDM":
                mt5.symbol_select(s.name, True)
                print(f"Auto-detected Gold symbol on broker: '{s.name}'")
                return s.name

        # Priority 3: Any symbol containing XAUUSD
        for s in all_symbols:
            if "XAUUSD" in s.name.upper():
                mt5.symbol_select(s.name, True)
                print(f"Auto-detected Gold symbol on broker: '{s.name}'")
                return s.name

    print("Warning: Could not auto-detect gold symbol. Defaulting to 'XAUUSD'")
    return "XAUUSD"


def fetch_from_mt5(mt5, symbol: str, count: int = 5000) -> list[Candle]:
    """Download real M15 candles directly from broker server."""
    print(f"Downloading {count} real M15 candles for {symbol} from broker...")
    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M15, 0, count)
    if rates is None or len(rates) == 0:
        err = mt5.last_error()
        print(f"Failed to copy rates from MT5. Error: {err}")
        return []

    candles = []
    for r in rates:
        dt = datetime.fromtimestamp(int(r["time"]), tz=timezone.utc)
        candles.append(Candle(
            symbol=symbol,
            timeframe=TimeFrame.M15,
            timestamp=dt,
            open=float(r["open"]),
            high=float(r["high"]),
            low=float(r["low"]),
            close=float(r["close"]),
            volume=float(r["tick_volume"])
        ))
    print(f"Successfully retrieved {len(candles)} real candles! (From {candles[0].timestamp.strftime('%Y-%m-%d')} to {candles[-1].timestamp.strftime('%Y-%m-%d')})")
    return candles


def load_from_csv(csv_path: str, symbol: str = "XAUUSD") -> list[Candle]:
    """Load candles from MT5 exported CSV file."""
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return []

    print(f"Loading real broker data from CSV: {csv_path}")
    df = pd.read_csv(csv_path)
    # Standardize column headers
    df.columns = [c.strip().lower() for c in df.columns]

    candles = []
    for _, row in df.iterrows():
        # Handle datetime parsing
        if "time" in row:
            raw_time = row["time"]
        elif "date" in row:
            raw_time = f"{row['date']} {row.get('time', '00:00:00')}"
        else:
            continue

        try:
            dt = pd.to_datetime(raw_time).to_pydatetime()
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue

        candles.append(Candle(
            symbol=symbol,
            timeframe=TimeFrame.M15,
            timestamp=dt,
            open=float(row["open"]),
            high=float(row["high"]),
            low=float(row["low"]),
            close=float(row["close"]),
            volume=float(row.get("tick_volume", row.get("volume", 0.0)))
        ))
    print(f"Loaded {len(candles)} candles from CSV file.")
    return candles


def run_real_backtest(candles: list[Candle]):
    if not candles:
        print("No candles available for backtest.")
        return

    print("\nRunning event-driven backtest against REAL BROKER DATA...")
    engine = BacktestEngine(initial_balance=100000.0, spread_points=25.0, slippage_points=2.0)
    results = engine.run(candles)
    perf = PerformanceEngine.compute_metrics(results["trades"], initial_capital=100000.0)

    print("\n" + "=" * 55)
    print("XAUUSD QUANTITATIVE BACKTEST REPORT (REAL BROKER DATA)")
    print("=" * 55)
    print(f"Data Source:             Real Broker Data ({len(candles)} M15 bars)")
    print(f"Period:                  {candles[0].timestamp.strftime('%Y-%m-%d')} to {candles[-1].timestamp.strftime('%Y-%m-%d')}")
    print(f"Initial Capital:         ${results['initial_balance']:,.2f}")
    print(f"Final Balance:           ${results['final_balance']:,.2f}")
    print(f"Net Profit:              ${results['net_profit']:,.2f}")
    print(f"Total Trades:            {perf['total_trades']}")
    print(f"Win Rate:                {perf['win_rate_pct']:.2f}% ({perf['winning_trades']} wins / {perf['losing_trades']} losses)")
    print(f"Profit Factor:           {perf['profit_factor']:.2f}")
    print(f"Expectancy:              ${perf['expectancy_usd']:.2f} per trade")
    print(f"Max Drawdown:            {perf['max_drawdown_pct']:.2f}% (${perf['max_drawdown_usd']:,.2f})")
    print(f"Avg Holding Time:        {perf['avg_holding_time_minutes']:.1f} minutes")
    print("=" * 55)

    if perf["by_strategy"]:
        print("\nPerformance by Strategy:")
        for strat, s_data in perf["by_strategy"].items():
            print(f"  - {strat:<22}: {s_data['trades']} trades | Win Rate: {s_data['win_rate_pct']}% | Net: ${s_data['net_pnl']:,.2f}")

    if perf["by_session"]:
        print("\nPerformance by Session:")
        for sess, s_data in perf["by_session"].items():
            print(f"  - {sess:<22}: {s_data['trades']} trades | Win Rate: {s_data['win_rate_pct']}% | Net: ${s_data['net_pnl']:,.2f}")
    print("=" * 55 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Sync broker data and run real backtests")
    parser.add_argument("--csv", type=str, help="Path to exported CSV file from MT5")
    parser.add_argument("--bars", type=int, default=5000, help="Number of real bars to download from MT5")
    args = parser.parse_args()

    candles = []
    if args.csv:
        candles = load_from_csv(args.csv)
    else:
        mt5 = connect_mt5()
        if mt5:
            symbol = find_gold_symbol(mt5)
            candles = fetch_from_mt5(mt5, symbol, count=args.bars)
            mt5.shutdown()

    if candles:
        # Save to local cache
        save_path = os.path.join("data", "historical", "xauusd_broker_real.csv")
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        records = [{
            "time": c.timestamp.isoformat(),
            "open": c.open,
            "high": c.high,
            "low": c.low,
            "close": c.close,
            "volume": c.volume
        } for c in candles]
        pd.DataFrame(records).to_csv(save_path, index=False)
        print(f"Saved real broker data to: {save_path}")

        # Run real backtest
        run_real_backtest(candles)


if __name__ == "__main__":
    main()
