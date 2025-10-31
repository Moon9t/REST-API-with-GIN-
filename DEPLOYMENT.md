# 🚀 EventHub Deployment Guide

Complete guide for deploying EventHub to AWS EC2 using GitHub Actions CI/CD.

## 📋 Prerequisites

### AWS EC2 Instance
- **OS**: Ubuntu 22.04 LTS
- **Instance Type**: t2.micro or larger
- **Storage**: 10GB+
- **Security Group Ports**:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 8080 (API)

### Install on EC2

**For Ubuntu/Debian (apt):**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx sqlite3 curl
```

**For RHEL/Fedora/Amazon Linux (dnf):**
```bash
sudo dnf update -y
sudo dnf install -y nginx sqlite curl
```

## 🔐 GitHub Secrets

Add to **Settings → Secrets and variables → Actions**:

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_SSH_KEY` | Private SSH key | Contents of `.pem` file |
| `EC2_HOST` | EC2 IP or domain | `3.14.159.265` |
| `EC2_USER` | SSH username | `ubuntu` |
| `API_URL` | Production API URL | `https://api.domain.com` |

## ⚙️ EC2 Setup

### 1. Create Directories
```bash
sudo mkdir -p /opt/eventhub /opt/eventhub-backups
sudo chown -R $USER:$USER /opt/eventhub /opt/eventhub-backups
```

**For Amazon Linux / ec2-user:**
```bash
sudo mkdir -p /opt/eventhub /opt/eventhub-backups
sudo chown -R ec2-user:ec2-user /opt/eventhub /opt/eventhub-backups
```

### 2. Install Systemd Service
```bash
sudo cp scripts/eventhub.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 3. Configure Environment
```bash
sudo nano /opt/eventhub/.env
```
```env
PORT=8080
JWT_Secret=your-secure-secret-here
DATABASE_PATH=./data.db
```

### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/eventhub
```
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/eventhub/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 🔄 Deployment

### Automatic (GitHub Actions)
Push to `main` or `master` branch automatically triggers deployment.

### Manual
```bash
# Build and package
go build -o eventhub-api ./cmd/api
cd frontend && npm run build && cd ..
tar -czf deploy.tar.gz eventhub-api frontend/build cmd/migrate

# Deploy
scp deploy.tar.gz ubuntu@EC2_IP:/tmp/
scp scripts/deploy.sh ubuntu@EC2_IP:/tmp/
ssh ubuntu@EC2_IP 'bash /tmp/deploy.sh'
```

## 📊 Monitoring

```bash
# Service status
sudo systemctl status eventhub

# Logs
sudo journalctl -u eventhub -f

# Health check
curl http://localhost:8080/health
```

## 🔒 Security

1. Change JWT secret in `.env`
2. Enable HTTPS: `sudo certbot --nginx -d your-domain.com`
3. Configure firewall: `sudo ufw allow 80,443/tcp && sudo ufw enable`

## 🛠️ Troubleshooting

```bash
# Service won't start
sudo journalctl -u eventhub -n 50

# Test binary
cd /opt/eventhub && ./eventhub-api

# Rollback
sudo tar -xzf /opt/eventhub-backups/backup-TIMESTAMP.tar.gz -C /opt/eventhub
sudo systemctl restart eventhub
```

---

**Ready to deploy!** 🎉 Push your code to trigger the workflow.
