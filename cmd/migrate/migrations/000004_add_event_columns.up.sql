-- Add columns to events table to match application Event model
-- This migration is additive and safe: it adds `name`, `date`, and `location`
-- then copies data from existing `title`, `start_time`, `end_time` where present.

ALTER TABLE events ADD COLUMN name TEXT;
ALTER TABLE events ADD COLUMN date DATETIME;
ALTER TABLE events ADD COLUMN location TEXT;

-- Copy existing data where possible
UPDATE events SET name = title WHERE name IS NULL AND title IS NOT NULL;
UPDATE events SET date = start_time WHERE date IS NULL AND start_time IS NOT NULL;
UPDATE events SET location = '' WHERE location IS NULL;
