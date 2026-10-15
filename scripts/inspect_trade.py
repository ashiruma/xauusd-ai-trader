import sqlite3
import json

conn = sqlite3.connect("data/xauusd_trader.db")
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("--- SIGNAL SIG_9eaad17c924a ---")
for row in c.execute("SELECT * FROM signals WHERE signal_id='SIG_9eaad17c924a'"):
    print(json.dumps(dict(row), indent=2))

print("\n--- CANDIDATE SETUPS AROUND 14:05 UTC ---")
for row in c.execute("SELECT * FROM candidate_setups ORDER BY id DESC LIMIT 10"):
    print(dict(row))

print("\n--- AI DECISIONS AROUND 14:05 UTC ---")
for row in c.execute("SELECT * FROM ai_decisions ORDER BY id DESC LIMIT 5"):
    print(dict(row))

conn.close()
