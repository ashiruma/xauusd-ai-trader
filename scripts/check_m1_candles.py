import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime

if mt5.initialize():
    rates = mt5.copy_rates_from("XAUUSD.m", mt5.TIMEFRAME_M1, datetime(2026, 10, 2, 15, 33), 30)
    if rates is not None:
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        print("M1 Candles after 15:33:")
        print(df[['time', 'open', 'high', 'low', 'close', 'tick_volume']])
    mt5.shutdown()
