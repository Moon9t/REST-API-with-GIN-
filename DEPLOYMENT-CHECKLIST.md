# EventHub Deployment Checklist ✅

Use this checklist to ensure your deployment is properly configured.

## 🔐 GitHub Secrets (Repository Settings)

- [ ] `EC2_SSH_KEY` - Private SSH key for EC2 access
- [ ] `EC2_HOST` - EC2 instance IP or domain
- [ ] `EC2_USER` - SSH username (usually `ubuntu`)
- [ ] `API_URL` - Production API URL (optional)

## 🖥️ EC2 Instance Setup

- [ ] Ubuntu 22.04 LTS or Amazon Linux 2023 installed
- [ ] Security group allows ports: 22, 80, 443, 8080
- [ ] nginx installed:
  - Ubuntu: `sudo apt install nginx`
  - Amazon Linux: `sudo dnf install nginx`
- [ ] sqlite installed:
  - Ubuntu: `sudo apt install sqlite3`
  - Amazon Linux: `sudo dnf install sqlite`
- [ ] curl installed (usually pre-installed)

## 📁 EC2 Directory Structure

```bash
- [ ] sudo mkdir -p /opt/eventhub
- [ ] sudo mkdir -p /opt/eventhub-backups
- [ ] sudo chown -R $USER:$USER /opt/eventhub
```

## ⚙️ Systemd Service

- [ ] Copy `scripts/eventhub.service` to `/etc/systemd/system/`
- [ ] Run `sudo systemctl daemon-reload`
- [ ] Update User/Group in service file if not using `ubuntu`

## 🔧 Environment Configuration

- [ ] Create `/opt/eventhub/.env` file
- [ ] Set `PORT=8080`
- [ ] Set secure `JWT_Secret` (IMPORTANT!)
- [ ] Set `DATABASE_PATH=./data.db`

## 🌐 Nginx Configuration

- [ ] Create `/etc/nginx/sites-available/eventhub`
- [ ] Update `server_name` with your domain
- [ ] Create symlink: `sudo ln -s /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Restart nginx: `sudo systemctl restart nginx`

## 🔒 SSL/HTTPS (Recommended)

- [ ] Install certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Run certbot: `sudo certbot --nginx -d your-domain.com`
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

## 🔥 Firewall Configuration

- [ ] Enable UFW: `sudo ufw enable`
- [ ] Allow SSH: `sudo ufw allow 22/tcp`
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`

## 🚀 First Deployment

- [ ] Push code to `main` or `master` branch
- [ ] Check GitHub Actions workflow runs successfully
- [ ] Verify service is running: `sudo systemctl status eventhub`
- [ ] Test health endpoint: `curl http://localhost:8080/health`
- [ ] Check logs: `sudo journalctl -u eventhub -n 50`

## ✅ Post-Deployment Verification

- [ ] Frontend accessible at: `http://your-domain.com`
- [ ] API health check: `http://your-domain.com/health`
- [ ] Login/Register works
- [ ] Create test event
- [ ] Database persists after restart

## 📝 Documentation

- [ ] Update `JWT_Secret` in production
- [ ] Document your domain/IP for team
- [ ] Save SSH key securely (backup!)
- [ ] Note database backup location

## 🎯 Optional Enhancements

- [ ] Set up CloudWatch monitoring
- [ ] Configure automated database backups
- [ ] Add CDN for frontend assets
- [ ] Set up custom domain with Route53
- [ ] Configure log rotation
- [ ] Set up alerting for service failures

---

**Tip**: Keep this checklist in your docs and update as needed!
