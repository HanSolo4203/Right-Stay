# Quick Fix Instructions - 502 Image Errors

## ⚠️ Important: You Must Run This on Your Server

Just pulling the code from GitHub is **not enough**. You need to apply the fixes on your Digital Ocean server.

## Quick Fix (Run on Your Server)

SSH into your Digital Ocean server and run:

```bash
cd /var/www/rightstayafrica
git pull origin main
sudo bash apply-fixes.sh
```

This script will:
1. ✅ Pull latest code
2. ✅ Update Nginx with proper timeouts
3. ✅ Rebuild Next.js app
4. ✅ Restart PM2
5. ✅ Verify everything is working

## Manual Steps (If Script Doesn't Work)

### 1. Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/rightstayafrica
```

Replace the entire file with:

```nginx
server {
    listen 80;
    server_name www.rightstayafrica.com rightstayafrica.com;

    client_max_body_size 50M;
    client_body_buffer_size 128k;

    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
}
```

Then test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Rebuild and Restart

```bash
cd /var/www/rightstayafrica
npm run build
pm2 restart rightstayafrica
```

### 3. Check if Image File Exists

```bash
ls -la /var/www/rightstayafrica/public/cpt-lions-head-1.jpg
```

If it doesn't exist, you may need to copy it from your local machine or re-upload it.

## Verify It's Working

1. **Check PM2:**
   ```bash
   pm2 status
   pm2 logs rightstayafrica --lines 20
   ```

2. **Test locally:**
   ```bash
   curl -I http://localhost:3000
   ```

3. **Check Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Test image endpoint:**
   ```bash
   curl -I "http://localhost:3000/_next/image?url=https://dqnrofcmtxwppiywscuw.supabase.co/storage/v1/object/public/property-photos/164756/1767077580243-qxe7tu.blob&w=640&q=75"
   ```

## Common Issues

### Issue: "Permission denied" when running script
**Fix:** Run with sudo:
```bash
sudo bash apply-fixes.sh
```

### Issue: PM2 process not found
**Fix:** Start it manually:
```bash
cd /var/www/rightstayafrica
pm2 start ecosystem.config.js
pm2 save
```

### Issue: Image file missing
**Fix:** The file should be in `/var/www/rightstayafrica/public/cpt-lions-head-1.jpg`. If missing:
- Check if it exists in your local repo
- Copy it to the server: `scp public/cpt-lions-head-1.jpg user@server:/var/www/rightstayafrica/public/`

### Issue: Still getting 502 after all fixes
**Check:**
1. Is Next.js running? `pm2 status`
2. Can you access it directly? `curl http://localhost:3000`
3. Check Nginx error logs: `sudo tail -100 /var/log/nginx/error.log`
4. Check PM2 logs: `pm2 logs rightstayafrica --err --lines 50`

## Still Having Issues?

See the full troubleshooting guide: `IMAGE_502_FIX.md`
