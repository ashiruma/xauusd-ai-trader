import sqlite3

conn = sqlite3.connect("data/xauusd_trader.db")
c = conn.cursor()
c.execute("SELECT MIN(timestamp), MAX(timestamp), COUNT(*) FROM market_states")
print("Market states range:", c.fetchone())

# Check how many market states between 12:30 UTC and 14:00 UTC (15:30 to 17:00 broker time)
c.execute("SELECT count(*) FROM market_states WHERE timestamp >= '2026-10-02T12:33:00' AND timestamp <= '2026-10-02T14:00:00'")
print("Market states during trade 2 (12:33 to 14:00 UTC):", c.fetchone()[0])
conn.close()
