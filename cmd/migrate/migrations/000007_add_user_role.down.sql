BEGIN TRANSACTION;
CREATE TABLE users_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users_old (id, email, name, password, created_at, updated_at)
    SELECT id, email, name, password, created_at, updated_at FROM users;
DROP TABLE users;
ALTER TABLE users_old RENAME TO users;
COMMIT;
