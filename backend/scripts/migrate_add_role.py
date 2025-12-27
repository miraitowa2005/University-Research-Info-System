import os
import sqlite3

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_path = os.path.join(base_dir, "database.sqlite")
    db_path = os.path.abspath(db_path)
    con = sqlite3.connect(db_path)
    try:
        cur = con.cursor()
        cur.execute("PRAGMA table_info(users)")
        cols = [c[1] for c in cur.fetchall()]
        if "role" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'teacher'")
        cur.execute("UPDATE users SET role='sys_admin' WHERE is_superuser=1")
        cur.execute("UPDATE users SET role='teacher' WHERE is_superuser=0 AND (role IS NULL OR role='')")
        con.commit()
    finally:
        con.close()

if __name__ == "__main__":
    main()
