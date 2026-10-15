import sqlite3

conn = sqlite3.connect("data/xauusd_trader.db")
c = conn.cursor()
c.execute("SELECT count(*) FROM system_events WHERE event_type LIKE '%POSITION%' OR message LIKE '%adjusted%'")
print("Position modified events:", c.fetchone()[0])
for row in c.execute("SELECT * FROM system_events WHERE event_type LIKE '%POSITION%' OR message LIKE '%adjusted%'"):
    print(row)
conn.close()
