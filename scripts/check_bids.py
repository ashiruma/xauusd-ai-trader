import sqlite3

conn = sqlite3.connect("data/xauusd_trader.db")
c = conn.cursor()
c.execute("SELECT MIN(bid), MAX(bid), AVG(bid) FROM market_states WHERE timestamp >= '2026-10-02T12:33:45' AND timestamp <= '2026-10-02T13:00:00'")
print("Bid range 12:33 to 13:00 UTC:", c.fetchone())
conn.close()
