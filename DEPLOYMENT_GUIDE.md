# EventHub Deployment Guide

This document provides comprehensive instructions for deploying EventHub to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Methods](#deployment-methods)
3. [Server Setup](#server-setup)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- Linux server (Ubuntu 20.04+, Amazon Linux 2023, or similar)
- Sudo/root access on target server
- SSH key for server access
- Go 1.21 or later (for local builds)
- Node.js 16 or later (for frontend builds)

### Optional Requirements

For automated CI/CD deployment:

- GitHub repository access
- AWS EC2 instance or equivalent
- GitHub Secrets configured with deployment credentials

## Deployment Methods

### Method 1: Automated CI/CD (Recommended)

The repository includes GitHub Actions workflows that automate the entire deployment process.

#### How It Works

1. Push code changes to the main branch
2. GitHub Actions automatically builds backend and frontend
3. Creates deployment package
4. Uploads to EC2 via SCP
5. Executes deployment script
6. Runs health checks to verify deployment

#### Setup Instructions

Configure the following GitHub Secrets in your repository:

```
EC2_SSH_KEY    : Private SSH key content (raw format or base64 encoded)
EC2_HOST       : Server IP address or hostname
EC2_USER       : SSH username (typically ec2-user or ubuntu)
EC2_PORT       : SSH port (optional, defaults to 22)
```

#### Triggering Deployment

```bash
git add .
git commit -m "Deploy new features"
git push origin main
```

Monitor progress in the GitHub Actions tab of your repository.

### Method 2: Manual Deployment

For staging environments or when automated deployment is unavailable.

#### Step 1: Build Application Locally

```bash
# Navigate to project directory
cd /path/to/eventhub

# Build backend binary for Linux
cd cmd/api
GOOS=linux GOARCH=amd64 go build -o ../../deployment/eventhub-api

# Build frontend production bundle
cd ../../frontend
npm install
npm run build

# Copy built files to deployment directory
cp -r build ../deployment/frontend/

# Copy database migrations
cp -r ../cmd/migrate/migrations ../deployment/

# Copy environment configuration (if applicable)
cp ../.env.production ../deployment/.env

# Create deployment archive
cd ../deployment
tar -czf eventhub-deployment.tar.gz *
```

#### Step 2: Upload to Server

```bash
# Upload deployment package
scp -i /path/to/key.pem \
    eventhub-deployment.tar.gz \
    user@server-ip:~/deploy/

# Upload deployment script
scp -i /path/to/key.pem \
    ../scripts/deploy.sh \
    user@server-ip:~/deploy/
```

#### Step 3: Execute Deployment

```bash
# SSH to server
ssh -i /path/to/key.pem user@server-ip

# Run deployment script
sudo bash ~/deploy/deploy.sh
```

The script will handle backup, service restart, and verification automatically.

## Server Setup

### Directory Structure

The deployment creates the following directory structure:

```
/opt/eventhub/
├── eventhub-api              Main backend binary
├── frontend/
│   └── build/                Production React application
├── migrate/
│   └── migrations/           Database migration files
├── data.db                   SQLite database file
└── .env                      Environment configuration

/opt/eventhub-backups/        Automatic backups (last 5 retained)
└── eventhub-backup-TIMESTAMP.tar.gz

/etc/systemd/system/
└── eventhub.service          Systemd service configuration
```

### Systemd Service

The application runs as a systemd service for reliability and automatic restart. Service file location: `/etc/systemd/system/eventhub.service`

Key service features:

- Automatic restart on failure
- Runs on system boot
- Controlled resource limits
- Centralized logging via journald

## Configuration

### Environment Variables

Create a `.env` file in `/opt/eventhub/` with these settings:

```bash
# Database Configuration
DB_PATH=/opt/eventhub/data.db

# JWT Secret (required for production)
JWT_SECRET=generate-a-secure-random-string-here

# Server Configuration
PORT=8080
GIN_MODE=release

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000
```

### Security Considerations

- Never commit `.env` files to version control
- Generate strong random JWT secrets (minimum 32 characters)
- Restrict file permissions: `chmod 600 /opt/eventhub/.env`
- Use HTTPS in production environments
- Keep database backups in secure locations

### SSL/HTTPS Setup

For production deployments with custom domains:

```bash
# Run HTTPS setup script (included in deployment)
sudo bash /opt/eventhub/scripts/setup-https.sh
```

This script configures:

- Nginx reverse proxy
- Let's Encrypt SSL certificate
- Automatic certificate renewal
- HTTP to HTTPS redirect

## Monitoring

### Service Status

Check if the service is running:

```bash
sudo systemctl status eventhub.service
```

### View Application Logs

```bash
# View recent logs
sudo journalctl -u eventhub.service -n 100

# Follow logs in real-time
sudo journalctl -u eventhub.service -f

# View logs from specific time
sudo journalctl -u eventhub.service --since "1 hour ago"
```

### Health Checks

The application exposes health check endpoints:

```bash
# Local health check
curl http://localhost:8080/health

# Production health check
curl https://your-domain.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy"
  }
}
```

## Troubleshooting

### Service Won't Start

Check logs for errors:

```bash
sudo journalctl -u eventhub.service -n 100 --no-pager
```

Common issues:

1. Port 8080 already in use:
   ```bash
   sudo lsof -i :8080
   sudo fuser -k 8080/tcp
   ```

2. Database file permissions:
   ```bash
   sudo chown ec2-user:ec2-user /opt/eventhub/data.db
   sudo chmod 644 /opt/eventhub/data.db
   ```

3. Missing migration files:
   ```bash
   ls -la /opt/eventhub/migrate/migrations/
   ```

### Database Issues

Force migration re-run (development only):

```bash
sudo systemctl stop eventhub.service
sudo rm /opt/eventhub/data.db
sudo systemctl start eventhub.service
```

Check database contents:

```bash
sqlite3 /opt/eventhub/data.db ".tables"
sqlite3 /opt/eventhub/data.db "SELECT * FROM schema_migrations;"
```

### Frontend Not Loading

Verify nginx configuration:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Check frontend files:

```bash
ls -la /opt/eventhub/frontend/build/
```

### Rollback to Previous Version

If a deployment fails, restore from automatic backup:

```bash
# List available backups
ls -lh /opt/eventhub-backups/

# Stop service
sudo systemctl stop eventhub.service

# Restore from backup
cd /opt/eventhub
sudo tar -xzf /opt/eventhub-backups/eventhub-backup-YYYYMMDD-HHMMSS.tar.gz

# Start service
sudo systemctl start eventhub.service

# Verify
curl http://localhost:8080/health
```

### Debugging Checklist

When experiencing issues:

1. Check service status: `sudo systemctl status eventhub.service`
2. Review recent logs: `sudo journalctl -u eventhub.service -n 50`
3. Verify health endpoint: `curl http://localhost:8080/health`
4. Check disk space: `df -h /opt/eventhub`
5. Verify file permissions: `ls -la /opt/eventhub/`
6. Test database: `sqlite3 /opt/eventhub/data.db ".tables"`

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Frontend build successful
- [ ] SSL certificate valid and not expiring soon
- [ ] Backup created (automatic during deployment)
- [ ] Health checks configured
- [ ] Monitoring alerts set up
- [ ] Team notified of deployment window
- [ ] Rollback procedure verified

## Additional Resources

- API Documentation: `https://your-domain.com/docs`
- GitHub Repository: Project README and issues
- Server Logs: `/var/log/nginx/` for web server logs

## Support

For deployment issues:

1. Check application logs for error messages
2. Review this troubleshooting guide
3. Verify all prerequisites are met
4. Contact the development team with specific error details

## Deployment Script Reference

The `scripts/deploy.sh` script performs these operations:

1. Create timestamped backup of current deployment
2. Stop running service gracefully
3. Extract new deployment package
4. Deploy backend binary with correct permissions
5. Deploy frontend static files
6. Configure environment variables
7. Start service via systemd
8. Run health verification
9. Clean up temporary files
10. Remove old backups (keeps last 5)

Backups are stored in `/opt/eventhub-backups/` with timestamp format `YYYYMMDD-HHMMSS`.
