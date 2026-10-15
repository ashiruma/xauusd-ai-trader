import sqlite3
import json

conn = sqlite3.connect("data/xauusd_trader.db")
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("SELECT * FROM signals WHERE signal_id='SIG_ca96c5751e26'")
sig = c.fetchone()
if sig:
    print("--- TRADE 2 SIGNAL (15:33:45) ---")
    print(json.dumps(dict(sig), indent=2))

c.execute("SELECT * FROM candidate_setups WHERE timestamp LIKE '2026-10-02T12:33%'")
setups = c.fetchall()
print(f"--- CANDIDATE SETUPS AT 12:33 ({len(setups)}) ---")
for s in setups:
    print(dict(s))

conn.close()
