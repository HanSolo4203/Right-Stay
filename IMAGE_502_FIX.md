# Fixing 502 Bad Gateway Errors for Image Loading

## Problem Description

Your website is experiencing **502 Bad Gateway** errors when loading images, particularly for the Next.js image optimization endpoint (`/_next/image`). This happens because:

1. **Nginx timeout settings are too short** - Default Nginx timeouts (60 seconds) are insufficient for Next.js to fetch and optimize images from Supabase
2. **Image optimization is resource-intensive** - Next.js needs time to download images from Supabase, process them, and serve optimized versions
3. **Proxy chain timeouts** - The request chain (Cloudflare → Nginx → PM2/Next.js) can timeout at any point

## Symptoms

- Images fail to load with HTTP 502 errors
- Network tab shows `GET /_next/image?...` requests returning 502
- Some images load successfully while others fail (intermittent)
- Errors appear in browser console: `[HTTP/3 502]`

## Solutions

### Solution 1: Fix Nginx Timeouts (PRIMARY FIX)

**Run this script on your server:**

```bash
# Make the script executable
chmod +x fix-502-errors.sh

# Run as root
sudo ./fix-502-errors.sh
```

This script will:
- Backup your current Nginx configuration
- Update Nginx with extended timeout settings (300 seconds / 5 minutes)
- Add special handling for the `/_next/image` endpoint
- Increase buffer sizes for large images
- Test and reload Nginx

**Manual Nginx Configuration:**

If you prefer to update manually, edit `/etc/nginx/sites-available/rightstayafrica`:

```nginx
server {
    listen 80;
    server_name www.rightstayafrica.com rightstayafrica.com;

    # Increase buffer sizes
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Increase timeouts (5 minutes)
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
        
        # Timeout settings
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Special handling for image optimization
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

### Solution 2: Increase PM2 Memory Limit

Update your PM2 configuration to allow more memory for image processing:

**Edit `/var/www/rightstayafrica/ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [{
    name: 'rightstayafrica',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/rightstayafrica',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G', // Increased from 1G
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Increase Node.js memory limit
      NODE_OPTIONS: '--max-old-space-size=2048'
    }
  }]
}
```

Then restart PM2:
```bash
pm2 restart rightstayafrica
pm2 save
```

### Solution 3: Cloudflare Settings

If you're using Cloudflare, check these settings:

1. **SSL/TLS Mode:**
   - Go to Cloudflare Dashboard → SSL/TLS
   - Ensure mode is set to "Full" or "Full (strict)" (not "Flexible")
   - This ensures proper SSL termination

2. **Timeout Settings:**
   - Cloudflare has a default timeout of 100 seconds
   - For Enterprise plans, you can increase this
   - For free/pro plans, ensure your origin responds within 100 seconds

3. **Image Optimization:**
   - Go to Speed → Optimization
   - Consider disabling Cloudflare's image optimization if it conflicts with Next.js
   - Or ensure they work together properly

4. **Caching:**
   - Go to Caching → Configuration
   - Ensure images are being cached properly
   - Set cache level to "Standard"

### Solution 4: Temporary Workaround - Disable Image Optimization

If you need images working immediately while troubleshooting:

**Edit `next.config.js`:**

```javascript
images: {
  unoptimized: true, // This bypasses optimization
}
```

Then rebuild and restart:
```bash
cd /var/www/rightstayafrica
npm run build
pm2 restart rightstayafrica
```

**Note:** This will serve images directly without optimization, which may increase page load times and bandwidth usage.

## Testing the Fix

After applying the fixes, test your setup:

1. **Test direct access to Next.js:**
   ```bash
   curl -I http://localhost:3000/_next/image?url=https://dqnrofcmtxwppiywscuw.supabase.co/storage/v1/object/public/property-photos/164756/1767077580243-qxe7tu.blob&w=640&q=75
   ```

2. **Test through Nginx:**
   ```bash
   curl -I http://localhost/_next/image?url=https://dqnrofcmtxwppiywscuw.supabase.co/storage/v1/object/public/property-photos/164756/1767077580243-qxe7tu.blob&w=640&q=75
   ```

3. **Check PM2 logs:**
   ```bash
   pm2 logs rightstayafrica --lines 50
   ```

4. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

5. **Monitor in browser:**
   - Open Developer Tools → Network tab
   - Reload the page
   - Check if image requests return 200 instead of 502

## Troubleshooting

### If 502 errors persist:

1. **Check if Next.js is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Check Nginx error logs:**
   ```bash
   sudo tail -100 /var/log/nginx/error.log
   ```
   Look for timeout-related errors

3. **Check PM2 logs for errors:**
   ```bash
   pm2 logs rightstayafrica --err --lines 100
   ```

4. **Verify Supabase connectivity:**
   ```bash
   curl -I https://dqnrofcmtxwppiywscuw.supabase.co/storage/v1/object/public/property-photos/164756/1767077580243-qxe7tu.blob
   ```

5. **Check server resources:**
   ```bash
   free -h
   df -h
   top
   ```

### Common Issues:

- **Out of memory:** Increase PM2 memory limit or server RAM
- **Disk space full:** Clean up old builds and logs
- **Network issues:** Check firewall rules and Supabase connectivity
- **SSL certificate issues:** Ensure Cloudflare SSL mode matches your setup

## Prevention

To prevent this issue in the future:

1. **Monitor server resources** regularly
2. **Set up log rotation** for PM2 and Nginx
3. **Use image CDN** (like Cloudflare Images or Imgix) for better performance
4. **Pre-optimize images** before uploading to Supabase
5. **Implement image caching** at multiple levels (Cloudflare, Nginx, Next.js)

## Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Nginx Proxy Timeout Settings](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout)
- [PM2 Configuration](https://pm2.keymetrics.io/docs/usage/application-declaration/)
