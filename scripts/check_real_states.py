import sqlite3

conn = sqlite3.connect("data/xauusd_trader.db")
c = conn.cursor()
c.execute("SELECT MIN(timestamp), MAX(timestamp), COUNT(*) FROM market_states WHERE bid > 4000")
print("Real quotes (bid > 4000):", c.fetchone())

c.execute("SELECT timestamp, current_price, bid, ask FROM market_states WHERE bid > 4000 ORDER BY id DESC LIMIT 5")
for r in c.fetchall():
    print(r)
conn.close()
