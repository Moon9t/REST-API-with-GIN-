#!/usr/bin/env bash
# Executable test script for the REST API (auto-sources .env and exits on first failure)
set -euo pipefail

# Load .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  . .env
fi

BASE_URL=${BASE_URL:-http://localhost:8080}
API_BASE="${BASE_URL}/api/v1"

echo "Using BASE_URL=$BASE_URL"

run() {
  echo
  echo "$@"
  # run the command; if it fails, exit with error
  eval "$@"
}

echo "=== General Connectivity ==="
run "curl -i \"$BASE_URL/\""
run "curl -i \"$BASE_URL/healthz\" || true"

echo "=== Create user ==="
run "curl -i -X POST \"$API_BASE/users\" -H 'Content-Type: application/json' -d '{\"email\":\"alice@example.com\",\"name\":\"Alice\",\"password\":\"secret123\",\"confirm\":\"secret123\"}'"

echo "=== List events ==="
run "curl -i \"$API_BASE/events\""

echo "=== Create event ==="
run "curl -i -X POST \"$API_BASE/events\" -H 'Content-Type: application/json' -d '{\"user_id\":1,\"name\":\"End of Year Party\",\"description\":\"Company year-end celebration\",\"date\":\"2025-12-31T20:00:00Z\",\"location\":\"Main Hall\"}'"

echo "=== Get event id=1 ==="
run "curl -i \"$API_BASE/events/1\" || true"

echo "=== Update event id=1 ==="
run "curl -i -X PUT \"$API_BASE/events/1\" -H 'Content-Type: application/json' -d '{\"user_id\":1,\"name\":\"Updated Party\",\"description\":\"Updated description\",\"date\":\"2025-12-31T21:00:00Z\",\"location\":\"New Venue\"}' || true"

echo "=== Delete event id=1 ==="
run "curl -i -X DELETE \"$API_BASE/events/1\" || true"

echo
echo "Script completed. If a command failed, the script exited early." 
