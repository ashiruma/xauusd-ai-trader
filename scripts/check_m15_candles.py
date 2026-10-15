import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime

if mt5.initialize():
    rates = mt5.copy_rates_from_pos("XAUUSD.m", mt5.TIMEFRAME_M15, 0, 30)
    if rates is not None:
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        print("M15 Candles (Last 30):")
        print(df[['time', 'open', 'high', 'low', 'close', 'tick_volume']].to_string())
    mt5.shutdown()
