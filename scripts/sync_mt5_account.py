import sys, os
sys.path.insert(0, os.path.abspath("."))
from data.storage import db

with db.get_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET equity = 44.38, 
            server = 'JustMarkets-Demo3',
            full_name = 'Standard Trader (#1200533810)'
        WHERE justmarkets_account_id = '1200533810'
    """)
    conn.commit()

print("Successfully synced user records for MT5 #1200533810 to 44.38 USD and JustMarkets-Demo3!")
