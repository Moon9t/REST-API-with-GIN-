#!/bin/bash
set -euo pipefail

# ============================================
# HTTPS Setup Script for EventHub API
# Domain: go-api.eclipse-softworks.com
# ============================================

DOMAIN="go-api.eclipse-softworks.com"
EMAIL="support@eclipse-softworks.com"  # Change to your email for Let's Encrypt notifications
APP_PORT=8080

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 EventHub HTTPS Setup"
echo "   Domain: $DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo ./setup-https.sh)"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Cannot detect OS"
    exit 1
fi

echo "📦 Installing nginx and certbot..."

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y nginx certbot python3-certbot-nginx
elif [ "$OS" = "amzn" ] || [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    # Amazon Linux 2023 or RHEL-based
    dnf install -y nginx certbot python3-certbot-nginx || yum install -y nginx certbot python3-certbot-nginx
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

echo "📝 Creating nginx configuration..."

# Backup existing config if present
if [ -f /etc/nginx/sites-available/eventhub ]; then
    cp /etc/nginx/sites-available/eventhub /etc/nginx/sites-available/eventhub.backup.$(date +%s)
fi

# Create nginx config
cat > /etc/nginx/sites-available/eventhub <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other HTTP traffic to HTTPS (will be enabled after SSL setup)
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# HTTPS configuration (will be populated by certbot)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name $DOMAIN;
#
#     location / {
#         proxy_pass http://localhost:$APP_PORT;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#     }
# }
EOF

# Enable site (Ubuntu/Debian pattern; adjust for RHEL if needed)
if [ -d /etc/nginx/sites-enabled ]; then
    ln -sf /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/
else
    # On RHEL/Amazon Linux, include directly in nginx.conf or conf.d
    cp /etc/nginx/sites-available/eventhub /etc/nginx/conf.d/eventhub.conf
fi

# Test nginx config
echo "🔍 Testing nginx configuration..."
nginx -t

echo "🔄 Restarting nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  DNS CONFIGURATION REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Before proceeding with SSL setup, ensure:"
echo "1. DNS A record for $DOMAIN points to this server's public IP"
echo ""
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "UNABLE_TO_DETECT")
echo "   Your public IP appears to be: $PUBLIC_IP"
echo ""
echo "2. Port 80 and 443 are open in your EC2 security group"
echo ""
echo "Once DNS is configured and propagated, run:"
echo "   sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive"
echo ""
echo "Or manually run certbot in interactive mode:"
echo "   sudo certbot --nginx"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Would you like to attempt SSL setup now? (requires DNS to be configured) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Requesting SSL certificate from Let's Encrypt..."
    certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate installed successfully!"
        echo "🔄 Reloading nginx..."
        systemctl reload nginx
        echo ""
        echo "✨ Setup complete! Your API is now available at:"
        echo "   https://$DOMAIN/health"
        echo "   https://$DOMAIN/api/v1/events"
        echo ""
        echo "📅 Certificate will auto-renew via certbot timer"
        systemctl status certbot.timer --no-pager
    else
        echo "❌ SSL setup failed. Please check:"
        echo "   1. DNS is correctly configured"
        echo "   2. Ports 80/443 are open"
        echo "   3. Domain resolves to this server: dig $DOMAIN"
        echo ""
        echo "You can retry with: sudo certbot --nginx"
        exit 1
    fi
else
    echo "⏭️  Skipping SSL setup. Run the command above when DNS is ready."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Nginx configuration complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
