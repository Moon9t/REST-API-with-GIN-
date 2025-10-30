-- Down migration: recreate previous events schema with legacy columns
-- Use with caution; this attempts to restore the previous schema by recreating
-- the old table and copying data back. Depending on data loss risk, review
-- before applying in production.

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS events_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO events_old (id, user_id, title, description, start_time, end_time, created_at, updated_at)
SELECT id, user_id, COALESCE(name, ''), description, COALESCE(date, ''), COALESCE(date, ''), created_at, updated_at
FROM events;

DROP TABLE events;
ALTER TABLE events_old RENAME TO events;

COMMIT;
