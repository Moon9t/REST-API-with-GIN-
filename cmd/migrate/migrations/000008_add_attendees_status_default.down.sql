BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS _attendees_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'declined')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO _attendees_old (id, event_id, user_id, status, created_at, updated_at)
SELECT id, event_id, user_id, status, created_at, updated_at FROM attendees;

DROP TABLE attendees;
ALTER TABLE _attendees_old RENAME TO attendees;

COMMIT;