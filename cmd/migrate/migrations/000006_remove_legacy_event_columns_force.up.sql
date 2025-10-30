-- Forcefully recreate events table without legacy columns by disabling foreign keys briefly.
-- This migration will:
-- 1) Turn off foreign key enforcement
-- 2) Create a new table with the desired schema
-- 3) Copy data from the old table mapping legacy columns
-- 4) Drop the old table and rename the new table
-- 5) Re-enable foreign key enforcement

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS events_tmp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO events_tmp (id, user_id, name, description, date, location, created_at, updated_at)
SELECT id, user_id, COALESCE(name, title), description, COALESCE(date, start_time), COALESCE(location, ''), created_at, updated_at
FROM events;

DROP TABLE IF EXISTS events;
ALTER TABLE events_tmp RENAME TO events;

PRAGMA foreign_keys = ON;
