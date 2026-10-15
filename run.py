"""
Unified Command-Line Interface and Entrypoint for XAUUSD Trading System.
"""

import argparse
import os
import sys
import time
from datetime import datetime, timezone
import uvicorn

from config.settings import settings, TradingMode
from data.feed import MarketDataEngine, feed
from data.models import TimeFrame, Tick
from service import coordinator
from backtest.engine import BacktestEngine
from performance.metrics import PerformanceEngine
from performance.trade_journal import TradeJournal


def run_server(start_live_feed: bool = False, host: str = None, port: int = None):
    h = host or settings.api_host
    p = port or settings.api_port
    print(f"Starting XAUUSD Quantitative Trading Server on http://{h}:{p}")
    print(f"Active Trading Mode: {settings.trading_mode.value} | Data Mode: {settings.data_mode.value}")
    print(f"Access Dashboard at: http://{h}:{p}/")

    if start_live_feed or settings.trading_mode == TradingMode.LIVE:
        from execution.live_trader import live_trader
        print("[SERVER] Starting live MT5 market ingestion & execution engine in background...")
        live_trader.start(background=True)

    uvicorn.run("api.app:app", host=h, port=p, reload=False)


def run_live_loop():
    from execution.live_trader import live_trader
    print("Initiating Autonomous Live Trading on MetaTrader 5...")
    live_trader.start(background=False)


def run_backtest_cli(days: int = 15, base_price: float = 2650.0, csv_path: str = None):
    if csv_path and os.path.exists(csv_path):
        from scripts.broker_data_sync import load_from_csv
        print(f"Initializing event-driven backtest on real data from {csv_path}...")
        candles = load_from_csv(csv_path)
    else:
        print(f"Initializing event-driven backtest for {days} days on XAUUSD...")
        sim_engine = MarketDataEngine.generate_synthetic_data(num_days=days, base_price=base_price)
        candles = sim_engine.get_candles(TimeFrame.M15, 3000)
    print(f"Loaded {len(candles)} M15 historical candles without lookahead bias.")

    engine = BacktestEngine(initial_balance=100000.0)
    results = engine.run(candles)
    perf = PerformanceEngine.compute_metrics(results["trades"], initial_capital=100000.0)

    print("\n" + "=" * 50)
    print("XAUUSD QUANTITATIVE BACKTEST REPORT")
    print("=" * 50)
    print(f"Initial Capital:         ${results['initial_balance']:,.2f}")
    print(f"Final Balance:           ${results['final_balance']:,.2f}")
    print(f"Net Profit:              ${results['net_profit']:,.2f}")
    print(f"Total Trades Executed:   {perf['total_trades']}")
    print(f"Win Rate:                {perf['win_rate_pct']:.2f}% ({perf['winning_trades']} wins / {perf['losing_trades']} losses)")
    print(f"Profit Factor:           {perf['profit_factor']:.2f}")
    print(f"Expectancy:              ${perf['expectancy_usd']:.2f} per trade")
    print(f"Max Drawdown:            {perf['max_drawdown_pct']:.2f}% (${perf['max_drawdown_usd']:,.2f})")
    print(f"Max Consecutive Losses:  {perf['max_consecutive_losses']}")
    print(f"Avg Holding Time:        {perf['avg_holding_time_minutes']:.1f} minutes")
    print("=" * 50)

    if perf["by_strategy"]:
        print("\nPerformance by Strategy:")
        for strat, s_data in perf["by_strategy"].items():
            print(f"  - {strat:<22}: {s_data['trades']} trades | Win Rate: {s_data['win_rate_pct']}% | Net: ${s_data['net_pnl']:,.2f}")

    if perf["by_session"]:
        print("\nPerformance by Session:")
        for sess, s_data in perf["by_session"].items():
            print(f"  - {sess:<22}: {s_data['trades']} trades | Win Rate: {s_data['win_rate_pct']}% | Net: ${s_data['net_pnl']:,.2f}")
    print("=" * 50 + "\n")


def run_paper_loop(interval_sec: float = 2.0):
    print("Starting real-time paper trading loop...")
    # Initialize history
    synthetic = MarketDataEngine.generate_synthetic_data(num_days=10, base_price=2650.0)
    coordinator.feed.load_historical_candles(TimeFrame.M15, synthetic.get_candles(TimeFrame.M15, 300))
    current_price = 2650.0

    try:
        while True:
            import random
            current_price += round(random.gauss(0, 0.25), 2)
            tick = Tick(
                symbol="XAUUSD",
                time=datetime.now(timezone.utc),
                bid=round(current_price - 0.12, 2),
                ask=round(current_price + 0.13, 2),
                spread=0.25,
                volume=random.uniform(50, 300)
            )
            res = coordinator.step(tick)
            mkt = res.get("market_state") or {}
            sig = res.get("fused_signal") or {}
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Spot: ${mkt.get('current_price', 0):.2f} | Regime: {mkt.get('regime')} | Signal: {sig.get('side', 'NO_TRADE')} (Conf: {sig.get('confidence', 0):.2f})")
            time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("\nPaper loop terminated by user.")


def main():
    parser = argparse.ArgumentParser(description="XAUUSD Quantitative Trading System CLI")
    parser.add_argument("command", choices=["serve", "live", "backtest", "paper", "status", "sync-broker"], help="Action to execute")
    parser.add_argument("--days", type=int, default=15, help="Number of days for backtest")
    parser.add_argument("--price", type=float, default=2650.0, help="Initial gold price")
    parser.add_argument("--bars", type=int, default=5000, help="Number of real bars to download from MT5")
    parser.add_argument("--csv", type=str, help="Path to exported CSV file from MT5")
    parser.add_argument("--live-feed", action="store_true", help="Start background live MT5 feed with server")
    parser.add_argument("--host", type=str, default=None, help="Host to bind server to (e.g. 0.0.0.0)")
    parser.add_argument("--port", type=int, default=None, help="Port to bind server to (e.g. 8000)")

    args = parser.parse_args()

    if args.command == "serve":
        run_server(start_live_feed=args.live_feed, host=args.host, port=args.port)
    elif args.command == "live":
        run_live_loop()
    elif args.command == "backtest":
        run_backtest_cli(days=args.days, base_price=args.price, csv_path=args.csv)
    elif args.command == "paper":
        run_paper_loop()
    elif args.command == "status":
        status = coordinator.get_system_status()
        import json
        print(json.dumps(status, indent=2, default=str))
    elif args.command == "sync-broker":
        from scripts.broker_data_sync import main as sync_main
        sys.argv = ["broker_data_sync.py"]
        if args.csv:
            sys.argv.extend(["--csv", args.csv])
        else:
            sys.argv.extend(["--bars", str(args.bars)])
        sync_main()


if __name__ == "__main__":
    main()
