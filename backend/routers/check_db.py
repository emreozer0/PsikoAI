import sqlite3

conn = sqlite3.connect('therapy.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tablolar:", tables)

for t in tables:
    tname = t[0]
    print(f"\n--- {tname} ---")
    try:
        cur.execute(f"SELECT * FROM {tname}")
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
        print("Kolonlar:", cols)
        for r in rows:
            print(tuple(repr(x) for x in r))
    except Exception as e:
        print("Hata:", e)

conn.close()