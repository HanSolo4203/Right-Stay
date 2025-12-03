# Manual Rollback Guide

If the automated rollback script doesn't work perfectly, use these manual commands.

## Quick Rollback Commands

### 1. Stop Right-Stay Application
```bash
pm2 stop rightstayafrica
pm2 delete rightstayafrica
pm2 save
```

### 2. Restore Original Project Directory
```bash
# Check for backups
ls -la /var/www/ | grep RSA-SABBATICAL-V1

# If backup exists (format: RSA-SABBATICAL-V1-backup-YYYYMMDD)
# Restore it:
cd /var/www
mv RSA-SABBATICAL-V1-backup-YYYYMMDD RSA-SABBATICAL-V1

# Or if you need to restore from a specific backup:
cp -r RSA-SABBATICAL-V1-backup-YYYYMMDD RSA-SABBATICAL-V1
```

### 3. Restore Original Nginx Configuration
```bash
# Remove rightstayafrica config
rm -f /etc/nginx/sites-enabled/rightstayafrica

# Check what original configs exist
ls -la /etc/nginx/sites-available/

# Restore original (choose one based on what you had):
# Option A: If you had RSA-SABBATICAL-V1 config
ln -s /etc/nginx/sites-available/RSA-SABBATICAL-V1 /etc/nginx/sites-enabled/

# Option B: If you had rslexpress config
ln -s /etc/nginx/sites-available/rslexpress /etc/nginx/sites-enabled/

# Option C: If you had a different config, restore it
ln -s /etc/nginx/sites-available/YOUR-ORIGINAL-CONFIG /etc/nginx/sites-enabled/

# Test and reload
nginx -t
systemctl reload nginx
```

### 4. Restore Original PM2 Process
```bash
# Navigate to original project
cd /var/www/RSA-SABBATICAL-V1

# If ecosystem.config.js exists:
pm2 start ecosystem.config.js
pm2 save

# OR start manually:
pm2 start npm --name "rsa-sabbatical" -- start
pm2 save

# OR if you know the original command:
pm2 start "npm start" --name "original-app"
pm2 save
```

### 5. Verify Everything is Working
```bash
# Check PM2
pm2 list
pm2 logs

# Check Nginx
systemctl status nginx
nginx -t

# Test the site
curl http://localhost:3000
```

## If You Don't Have Backups

If the original project was completely removed and you don't have backups:

### Option 1: Restore from Git (if original was in git)
```bash
cd /var/www
git clone YOUR-ORIGINAL-REPO-URL RSA-SABBATICAL-V1
cd RSA-SABBATICAL-V1
npm install
npm run build
pm2 start ecosystem.config.js
```

### Option 2: Check PM2 Dump File
```bash
# PM2 saves process list, check it:
cat ~/.pm2/dump.pm2

# This might show you the original process configuration
```

### Option 3: Check Nginx Logs
```bash
# See what was running before:
grep -r "proxy_pass" /etc/nginx/sites-available/
tail -100 /var/log/nginx/access.log
```

## Complete Clean Slate Rollback

If you want to completely remove Right-Stay and start fresh:

```bash
# 1. Stop and remove Right-Stay
pm2 stop rightstayafrica
pm2 delete rightstayafrica

# 2. Remove Right-Stay directory
rm -rf /var/www/rightstayafrica

# 3. Remove Right-Stay Nginx config
rm -f /etc/nginx/sites-enabled/rightstayafrica
rm -f /etc/nginx/sites-available/rightstayafrica

# 4. Restore original (if you know what it was)
# ... follow steps above

# 5. Reload everything
pm2 save
nginx -t && systemctl reload nginx
```

## Finding Your Original Setup

If you're not sure what the original setup was:

```bash
# Check all PM2 processes (including stopped ones)
pm2 list
pm2 resurrect  # This restores from dump file

# Check all Nginx configs
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check what's in /var/www
ls -la /var/www/

# Check what ports are in use
netstat -tulpn | grep LISTEN

# Check PM2 logs for clues
pm2 logs --lines 100
```

## Emergency: Restore from Digital Ocean Snapshot

If you have a Digital Ocean snapshot from before the deployment:

1. Go to Digital Ocean Dashboard
2. Navigate to Snapshots
3. Restore from snapshot taken before running the deployment script

