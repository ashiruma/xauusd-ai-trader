import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime, timedelta

if mt5.initialize():
    print("MT5 Connected:", mt5.account_info().login)
    
    # Get history for past 7 days
    from_date = datetime.now() - timedelta(days=7)
    to_date = datetime.now() + timedelta(days=1)
    
    deals = mt5.history_deals_get(from_date, to_date)
    if deals:
        df_deals = pd.DataFrame(list(deals), columns=deals[0]._asdict().keys())
        df_deals['time'] = pd.to_datetime(df_deals['time'], unit='s')
        print("\n--- RECENT DEALS ---")
        print(df_deals[['ticket', 'order', 'time', 'type', 'entry', 'price', 'volume', 'profit', 'comment']].to_string())
    
    orders = mt5.history_orders_get(from_date, to_date)
    if orders:
        df_orders = pd.DataFrame(list(orders), columns=orders[0]._asdict().keys())
        df_orders['time_setup'] = pd.to_datetime(df_orders['time_setup'], unit='s')
        print("\n--- RECENT ORDERS ---")
        print(df_orders[['ticket', 'time_setup', 'type', 'price_open', 'sl', 'tp', 'volume_initial', 'state', 'comment']].to_string())
    
    mt5.shutdown()
else:
    print("Failed to init MT5")
