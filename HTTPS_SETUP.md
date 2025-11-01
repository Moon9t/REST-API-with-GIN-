# HTTPS Setup Guide for go-api.eclipse-softworks.com

## Prerequisites

1. **EC2 Instance Running**: Your EventHub API should be deployed and running on port 8080
2. **DNS Access**: Access to eclipse-softworks.com DNS settings
3. **Security Groups**: EC2 security group must allow:
   - Port 22 (SSH)
   - Port 80 (HTTP) 
   - Port 443 (HTTPS)

## Step 1: Configure DNS

Add an A record for `go-api.eclipse-softworks.com` pointing to your EC2 public IP:

```
Type: A
Name: go-api
Value: <YOUR_EC2_PUBLIC_IP>
TTL: 300 (or default)
```

**To find your EC2 public IP:**
```bash
ssh user@your-ec2-host "curl -s http://checkip.amazonaws.com"
```

**Verify DNS propagation:**
```bash
dig go-api.eclipse-softworks.com
# or
nslookup go-api.eclipse-softworks.com
```

Wait until the domain resolves to your EC2 IP before proceeding.

## Step 2: Update EC2 Security Group

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rules:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0

## Step 3: Run HTTPS Setup Script

SSH to your EC2 instance and run the setup script:

```bash
# SSH to EC2
ssh -i ~/.ssh/your-key.pem ec2-user@<EC2_IP>

# Download the setup script (it should be in /opt/eventhub after deploy)
cd /opt/eventhub
sudo bash scripts/setup-https.sh
```

The script will:
1. Install nginx and certbot
2. Configure nginx as a reverse proxy
3. Prompt you to obtain SSL certificate from Let's Encrypt

**OR** manually run certbot after the script completes:
```bash
sudo certbot --nginx -d go-api.eclipse-softworks.com --email support@eclipse-softworks.com
```

## Step 4: Verify Setup

Test the endpoints:

```bash
# Health check
curl -f https://go-api.eclipse-softworks.com/health

# API endpoint
curl https://go-api.eclipse-softworks.com/api/v1/events

# Check SSL certificate
curl -vI https://go-api.eclipse-softworks.com/health 2>&1 | grep -A 10 "SSL certificate verify"
```

## Step 5: Deploy Updated Code

The repository has been updated with:
- ✅ CORS configuration for `go-api.eclipse-softworks.com`
- ✅ Frontend API URL set to `https://go-api.eclipse-softworks.com`

Trigger a new deploy:

```bash
# From your local repo
git commit --allow-empty -m "trigger deploy after HTTPS setup"
git push origin main
```

## Troubleshooting

### DNS not resolving
```bash
# Check DNS
dig go-api.eclipse-softworks.com

# If not resolved, wait 5-10 minutes for propagation
# Or flush local DNS cache (varies by OS)
```

### SSL certificate fails
```bash
# Check nginx is running
sudo systemctl status nginx

# Check domain resolves to this server
curl -I http://go-api.eclipse-softworks.com

# Retry certbot
sudo certbot --nginx -d go-api.eclipse-softworks.com --email support@eclipse-softworks.com
```

### API not responding
```bash
# Check EventHub service
sudo systemctl status eventhub.service

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check API logs
sudo journalctl -u eventhub.service -n 100 --no-pager
```

### Certificate renewal
Certbot automatically sets up a systemd timer for renewal. Check it:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run
```

## Security Notes

1. **HTTPS Redirect**: Certbot will automatically configure nginx to redirect HTTP → HTTPS
2. **HSTS**: Consider adding HSTS header after confirming everything works
3. **Firewall**: After testing, you can restrict port 22 (SSH) to specific IPs
4. **Monitoring**: Set up uptime monitoring for https://go-api.eclipse-softworks.com/health

## Post-Setup Checklist

- [ ] DNS A record configured and resolving
- [ ] Security group allows ports 80, 443
- [ ] Nginx installed and running
- [ ] SSL certificate obtained from Let's Encrypt
- [ ] HTTPS redirects working (http → https)
- [ ] API responding at https://go-api.eclipse-softworks.com/health
- [ ] CORS working (test from browser console)
- [ ] Certificate auto-renewal timer active
- [ ] Frontend deployed with correct API_URL

## API Endpoints

After setup, your API will be available at:

- **Health**: https://go-api.eclipse-softworks.com/health
- **Events**: https://go-api.eclipse-softworks.com/api/v1/events
- **Auth**: https://go-api.eclipse-softworks.com/api/v1/auth/login
- **Docs**: https://go-api.eclipse-softworks.com/docs
- **UI**: https://go-api.eclipse-softworks.com/eventhub
