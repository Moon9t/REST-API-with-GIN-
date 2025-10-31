#!/usr/bin/env bash
set -euo pipefail

# serve_eventhub.sh
# Simple script to serve the scripts/ directory (so eventhub.service is downloadable)
# Usage: ./serve_eventhub.sh [PORT]
# Default port: 8000

PORT="${1:-8000}"
# Directory containing this script (the repo's scripts/)
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Serving files from: $DIR"

echo "Gathering network info..."
# Local IP (first non-loopback) - may be empty on some systems
LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
# Try to get a public IP (best-effort, may fail if offline)
PUBLIC_IP=""
if command -v curl >/dev/null 2>&1; then
  PUBLIC_IP="$(curl -s https://ifconfig.co || true)"
elif command -v wget >/dev/null 2>&1; then
  PUBLIC_IP="$(wget -qO- https://ifconfig.co || true)"
fi

if [ -n "$LOCAL_IP" ]; then
  echo "Local IP: $LOCAL_IP"
else
  echo "Local IP: (not found)"
fi

if [ -n "$PUBLIC_IP" ]; then
  echo "Public IP (if reachable from the internet): $PUBLIC_IP"
else
  echo "Public IP: (could not determine)"
fi

echo
echo "File available at: http://<HOST_IP>:$PORT/$(basename "$DIR")/eventhub.service"
echo "Or when run from $DIR: http://<HOST_IP>:$PORT/eventhub.service"

echo
echo "Starting Python HTTP server on port $PORT..."
cd "$DIR"
# Start server (python3 preferred, falls back to python)
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
else
  python -m SimpleHTTPServer "$PORT"
fi
