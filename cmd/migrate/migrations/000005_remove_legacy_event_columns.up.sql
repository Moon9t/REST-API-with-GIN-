-- Recreate events table without legacy columns (title, start_time, end_time)
-- Steps:
-- 1) Create new table with desired schema
-- 2) Copy data mapping legacy columns to new columns
-- 3) Drop old table
-- 4) Rename new table to events

CREATE TABLE IF NOT EXISTS events_new (
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

-- Copy and map data from old table into new table. Use COALESCE to prefer new columns
INSERT INTO events_new (id, user_id, name, description, date, location, created_at, updated_at)
SELECT id, user_id, COALESCE(name, title), description, COALESCE(date, start_time), COALESCE(location, ''), created_at, updated_at
FROM events;

DROP TABLE events;

ALTER TABLE events_new RENAME TO events;
