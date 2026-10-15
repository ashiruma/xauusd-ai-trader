import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime

if mt5.initialize():
    # Broker server time: Oct 2, 2026 15:33
    rates = mt5.copy_rates_range("XAUUSD.m", mt5.TIMEFRAME_M1, datetime(2026, 10, 2, 15, 33), datetime(2026, 10, 2, 15, 50))
    if rates is not None and len(rates) > 0:
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        print(df[['time', 'open', 'high', 'low', 'close', 'tick_volume']].to_string())
    else:
        print("No rates found in range")
    mt5.shutdown()
