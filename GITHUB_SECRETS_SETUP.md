# GitHub Secrets Setup Guide

This document explains how to configure the required GitHub Secrets for automated deployment.

## Required Secrets

Your repository needs the following secrets configured in GitHub Settings > Secrets and variables > Actions:

### 1. EC2_SSH_KEY (Required)

The private SSH key for connecting to your EC2 instance.

#### Option A: Raw Key (Recommended)

1. Copy your private key file:
   ```bash
   cat ~/.ssh/your-key.pem
   ```

2. Go to GitHub repository Settings > Secrets and variables > Actions > New repository secret

3. Name: `EC2_SSH_KEY`

4. Value: Paste the entire key content, including the header and footer:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   [key content here]
   -----END RSA PRIVATE KEY-----
   ```

5. Important: 
   - Include ALL lines exactly as shown
   - Do NOT add quotes around the key
   - Do NOT remove newlines
   - GitHub will preserve the formatting

#### Option B: Base64 Encoded (If GitHub strips newlines)

If the GitHub UI strips newlines or you have issues with Option A:

1. Encode your key to base64:
   ```bash
   base64 -w0 < ~/.ssh/your-key.pem
   ```

2. Copy the output (single line of text)

3. Create the secret with this base64 value

4. The workflow will automatically detect and decode it

### 2. EC2_USER (Required)

The SSH username for your EC2 instance.

- Name: `EC2_USER`
- Value: `ec2-user` (for Amazon Linux) or `ubuntu` (for Ubuntu)

### 3. EC2_HOST (Required)

The public IP address or DNS hostname of your EC2 instance.

- Name: `EC2_HOST`
- Value: Your EC2 instance IP (e.g., `3.138.32.230`) or DNS

### 4. EC2_PORT (Optional)

SSH port if different from default 22.

- Name: `EC2_PORT`
- Value: `22` (default, can be omitted)

### 5. API_URL (Optional)

Frontend API URL for production.

- Name: `API_URL`
- Value: `https://go-api.eclipse-softworks.com` (already has default in workflow)

## Verification Steps

### Step 1: Check Secret Configuration

After adding secrets, verify in GitHub:
- Settings > Secrets and variables > Actions
- You should see all required secrets listed

### Step 2: Test SSH Connection Locally

Before pushing, verify SSH works locally:

```bash
# Test SSH connection
ssh -i ~/Documents/"EC2 Instances"/gogin-api-key.pem ec2-user@3.138.32.230 "echo 'Connection successful'"
```

If this fails, fix your local SSH setup before configuring GitHub.

### Step 3: Trigger Deployment

1. Push to main branch:
   ```bash
   git push origin main
   ```

2. Go to Actions tab in GitHub

3. Watch the deployment workflow

4. Check logs if it fails

## Common Issues and Solutions

### Issue: "SSH authentication failed"

**Symptoms:**
```
ERROR: SSH authentication failed using the provided key.
```

**Solutions:**

1. Verify key format:
   ```bash
   # Check if your key is valid
   ssh-keygen -l -f ~/.ssh/your-key.pem
   ```

2. Ensure the key has correct permissions locally:
   ```bash
   chmod 600 ~/.ssh/your-key.pem
   ```

3. If using PuTTY format (.ppk), convert to OpenSSH format:
   ```bash
   puttygen your-key.ppk -O private-openssh -o your-key.pem
   ```

4. Re-copy the key ensuring all newlines are preserved

### Issue: "EC2_USER and EC2_HOST must be set"

**Symptoms:**
```
ERROR: EC2_USER and EC2_HOST must be set as repository secrets.
```

**Solution:**
- Add both secrets as described above
- Ensure names are exactly `EC2_USER` and `EC2_HOST` (case-sensitive)

### Issue: "Deployment archive not found"

**Symptoms:**
```
ERROR: Deployment archive not found in any upload location
```

**Solution:**
This should not happen with the current workflow, but if it does:

1. Check workflow logs for build errors
2. Ensure artifacts are uploaded successfully
3. Verify the deploy script is searching correct paths

### Issue: "Permission denied" on EC2

**Symptoms:**
```
Permission denied (publickey)
```

**Solutions:**

1. Verify the public key is in EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-ip "cat ~/.ssh/authorized_keys"
   ```

2. Ensure the key pair matches:
   - Public key on EC2 in `~/.ssh/authorized_keys`
   - Private key in GitHub secret

3. Check EC2 security group allows SSH (port 22) from GitHub IPs

## Testing Secrets

You can test if secrets are properly set by adding this to your workflow temporarily:

```yaml
- name: Debug secrets
  run: |
    echo "EC2_USER is set: ${{ secrets.EC2_USER != '' }}"
    echo "EC2_HOST is set: ${{ secrets.EC2_HOST != '' }}"
    echo "SSH key length: ${#EC2_SSH_KEY}"
  env:
    EC2_SSH_KEY: ${{ secrets.EC2_SSH_KEY }}
```

Remove this step after verification (never log actual secret values).

## Quick Setup Checklist

- [ ] SSH key works locally with `ssh -i key.pem user@host`
- [ ] EC2_SSH_KEY secret added (entire key with headers)
- [ ] EC2_USER secret added (ec2-user or ubuntu)
- [ ] EC2_HOST secret added (IP or DNS)
- [ ] EC2 security group allows SSH from GitHub Actions IPs
- [ ] EC2 has correct public key in authorized_keys
- [ ] Push to main and check Actions tab

## Getting Your SSH Key

If you need to export your EC2 key from AWS:

1. EC2 keys cannot be downloaded after creation
2. You must use the key you downloaded when creating the instance
3. Key location example: `~/Documents/"EC2 Instances"/gogin-api-key.pem`
4. Copy this key content to GitHub secrets

## Support

If deployment still fails after following this guide:

1. Check the Actions logs for specific error messages
2. Verify SSH connection works locally
3. Ensure all secrets are configured exactly as shown
4. Check EC2 instance is running and accessible

## Current Production Setup

For reference, your current setup:
- EC2 IP: 3.138.32.230
- SSH User: ec2-user (Amazon Linux)
- SSH Key: gogin-api-key.pem
- Domain: go-api.eclipse-softworks.com
