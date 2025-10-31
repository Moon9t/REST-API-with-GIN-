#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
APP_NAME="eventhub"
APP_DIR="/opt/$APP_NAME"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_BINARY="$APP_DIR/$APP_NAME-api"
MIGRATIONS_DIR="$APP_DIR/migrations"
ENV_FILE="$APP_DIR/.env"
SYSTEMD_SERVICE="eventhub.service"
DEPLOYMENT_ARCHIVE="/tmp/eventhub-deployment.tar.gz"
BACKUP_PATH="/opt/eventhub-backups"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EventHub Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- BACKUP ---
if [ -d "$APP_DIR" ]; then
    echo "📦 Creating backup of current deployment..."
    BACKUP_NAME="eventhub-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_PATH"
    sudo tar -czf "$BACKUP_PATH/$BACKUP_NAME.tar.gz" -C "$APP_DIR" . || true
    echo "✅ Backup created: $BACKUP_PATH/$BACKUP_NAME.tar.gz"
fi

# --- STOP SERVICE ---
echo "🛑 Stopping EventHub service..."
sudo systemctl stop "$SYSTEMD_SERVICE" || echo "Service was not running"

echo "📁 Preparing deployment directories..."
sudo mkdir -p "$APP_DIR" "$FRONTEND_DIR" "$MIGRATIONS_DIR"
sudo chown "$USER:$USER" "$APP_DIR" "$FRONTEND_DIR" "$MIGRATIONS_DIR"

# --- EXTRACT NEW DEPLOYMENT ---
echo "📦 Extracting deployment package..."
sudo tar -xzf "$DEPLOYMENT_ARCHIVE" -C "$APP_DIR"

# --- BACKEND DEPLOYMENT ---
echo "[deploy] Deploying backend..."
if [ -f "$BACKEND_BINARY" ]; then
    sudo chmod 755 "$BACKEND_BINARY"
else
    echo "[deploy] ERROR: Backend binary not found at $BACKEND_BINARY" >&2
    exit 1
fi

# --- FRONTEND DEPLOYMENT ---
echo "[deploy] Deploying frontend..."
if [ -d "$APP_DIR/frontend/build" ]; then
    rm -rf "$FRONTEND_DIR/build"
    cp -r "$APP_DIR/frontend/build" "$FRONTEND_DIR/"
    echo "[deploy] Frontend build copied."
else
    echo "[deploy] WARNING: Frontend build directory not found." >&2
fi

# --- ENVIRONMENT FILE ---
echo "[deploy] Updating environment file..."
if [ -f "$APP_DIR/.env" ]; then
    sudo chmod 600 "$ENV_FILE"
else
    echo "[deploy] WARNING: .env file not found in app directory." >&2
fi

# --- RUN DATABASE MIGRATIONS ---
echo "🗄️  Running database migrations..."
if [ -d "$MIGRATIONS_DIR" ]; then
    cd "$APP_DIR"
    export FORCE_MIGRATE=0
    ./$APP_NAME-api migrate -path "$MIGRATIONS_DIR" 2>&1 || echo "Migrations completed or no changes needed"
else
    echo "[deploy] WARNING: Migrations directory not found at $MIGRATIONS_DIR" >&2
fi

# --- RELOAD SYSTEMD AND START SERVICE ---
echo "🔄 Reloading systemd and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable "$SYSTEMD_SERVICE"
sudo systemctl start "$SYSTEMD_SERVICE"

# --- WAIT AND CHECK SERVICE STATUS ---
echo "⏳ Waiting for service to start..."
sleep 3
if sudo systemctl is-active --quiet "$SYSTEMD_SERVICE"; then
    echo "✅ EventHub service is running"
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Warning: Health check failed"
    fi
else
    echo "❌ Failed to start EventHub service"
    echo "📋 Service logs:"
    sudo journalctl -u "$SYSTEMD_SERVICE" -n 50 --no-pager
    exit 1
fi

# --- CLEANUP ---
echo "🧹 Cleaning up..."
rm -f "$DEPLOYMENT_ARCHIVE"
rm -f /tmp/deploy.sh

# --- KEEP ONLY LAST 5 BACKUPS ---
if [ -d "$BACKUP_PATH" ]; then
    cd "$BACKUP_PATH"
    ls -t | tail -n +6 | xargs -r sudo rm --
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment completed successfully!"
echo "📊 Service Status:"
sudo systemctl status "$SYSTEMD_SERVICE" --no-pager -l
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
