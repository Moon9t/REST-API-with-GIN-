#!/usr/bin/env bash
set -euo pipefail

# Simple DB backup: copies data.db to backups/ with a timestamp.
# Usage: ./scripts/backup_db.sh [path/to/data.db]

DB_PATH=${1:-./data.db}
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "Database file not found: $DB_PATH"
  exit 1
fi

TS=$(date +%Y%m%d%H%M%S)
BASENAME=$(basename "$DB_PATH")
cp "$DB_PATH" "$BACKUP_DIR/${BASENAME%.db}-$TS.db"
chmod 600 "$BACKUP_DIR/${BASENAME%.db}-$TS.db"

echo "Backup created: $BACKUP_DIR/${BASENAME%.db}-$TS.db"