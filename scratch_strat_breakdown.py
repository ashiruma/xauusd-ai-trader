import os
from scripts.broker_data_sync import load_from_csv
from backtest.engine import BacktestEngine
from performance.metrics import PerformanceEngine
from config.settings import settings

candles = load_from_csv('data/historical/xauusd_broker_real.csv')
bars_count = 15 * 24 * 4
recent_candles = candles[-bars_count:]

engine = BacktestEngine(initial_balance=100000.0)
old_risk = settings.risk.max_risk_per_trade_pct
settings.risk.max_risk_per_trade_pct = 1.0
res = engine.run(recent_candles)
settings.risk.max_risk_per_trade_pct = old_risk

perf = PerformanceEngine.compute_metrics(res['trades'], initial_capital=100000.0)
print('By Strategy:')
for s, data in perf['by_strategy'].items():
    print(f"  {s}: trades={data['trades']}, WR={data['win_rate_pct']}%, Net={data['net_pnl']}")
