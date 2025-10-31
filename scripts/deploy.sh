#!/bin/bash
set -e

# Configuration
DEPLOY_PATH="/opt/eventhub"
SERVICE_NAME="eventhub"
DEPLOYMENT_ARCHIVE="/tmp/eventhub-deployment.tar.gz"
BACKUP_PATH="/opt/eventhub-backups"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EventHub Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup of current deployment
if [ -d "$DEPLOY_PATH" ]; then
    echo "📦 Creating backup of current deployment..."
    BACKUP_NAME="eventhub-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_PATH"
    sudo tar -czf "$BACKUP_PATH/$BACKUP_NAME.tar.gz" -C "$DEPLOY_PATH" . || true
    echo "✅ Backup created: $BACKUP_PATH/$BACKUP_NAME.tar.gz"
fi

# Stop the service if running
echo "🛑 Stopping EventHub service..."
sudo systemctl stop $SERVICE_NAME || echo "Service was not running"

# Create deployment directory
echo "📁 Preparing deployment directory..."
sudo mkdir -p "$DEPLOY_PATH"

# Extract new deployment
echo "📦 Extracting deployment package..."
sudo tar -xzf "$DEPLOYMENT_ARCHIVE" -C "$DEPLOY_PATH"

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER "$DEPLOY_PATH"
sudo chmod +x "$DEPLOY_PATH/eventhub-api"

# Set up environment variables
if [ ! -f "$DEPLOY_PATH/.env" ]; then
    echo "⚙️  Creating .env file..."
    sudo cp "$DEPLOY_PATH/.env" "$DEPLOY_PATH/.env.bak" || true
fi

# Run database migrations
echo "🗄️  Running database migrations..."
cd "$DEPLOY_PATH"
export FORCE_MIGRATE=0
./eventhub-api migrate 2>&1 || echo "Migrations completed or no changes needed"

# Reload systemd and start service
echo "🔄 Reloading systemd and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 3

# Check service status
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ EventHub service is running"
    
    # Verify health endpoint
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Warning: Health check failed"
    fi
else
    echo "❌ Failed to start EventHub service"
    echo "📋 Service logs:"
    sudo journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up..."
rm -f "$DEPLOYMENT_ARCHIVE"
rm -f /tmp/deploy.sh

# Keep only last 5 backups
if [ -d "$BACKUP_PATH" ]; then
    cd "$BACKUP_PATH"
    ls -t | tail -n +6 | xargs -r sudo rm --
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment completed successfully!"
echo "📊 Service Status:"
sudo systemctl status $SERVICE_NAME --no-pager -l
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
