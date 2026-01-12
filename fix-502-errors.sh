#!/bin/bash
# fix-502-errors.sh - Run this on your Digital Ocean server to fix 502 image loading errors
# This script updates Nginx configuration with proper timeout settings for Next.js image optimization

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NGINX_SITE_NAME="rightstayafrica"
DOMAIN="www.rightstayafrica.com"

echo -e "${YELLOW}=========================================="
echo "Fixing 502 Image Loading Errors"
echo "==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Backup current config
if [ -f "/etc/nginx/sites-available/${NGINX_SITE_NAME}" ]; then
    echo -e "${YELLOW}Backing up current Nginx configuration...${NC}"
    cp /etc/nginx/sites-available/${NGINX_SITE_NAME} /etc/nginx/sites-available/${NGINX_SITE_NAME}.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}Backup created${NC}"
else
    echo -e "${RED}Nginx config not found at /etc/nginx/sites-available/${NGINX_SITE_NAME}${NC}"
    echo "Please ensure your site is configured first."
    exit 1
fi

echo ""
echo -e "${YELLOW}Updating Nginx configuration with proper timeouts...${NC}"

# Create updated Nginx configuration with proper timeouts
cat > /etc/nginx/sites-available/${NGINX_SITE_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} rightstayafrica.com;

    # Increase buffer sizes for large images
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Increase timeouts for image optimization (5 minutes)
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Additional timeout settings for this location
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Special handling for Next.js image optimization endpoint
    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Extended timeouts for image processing
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Don't buffer responses for images
        proxy_buffering off;
    }
}
EOF

echo -e "${GREEN}Configuration file created${NC}"
echo ""

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
    echo ""
    echo -e "${YELLOW}Reloading Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configuration updated successfully!${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors. Restoring backup...${NC}"
    if [ -f "/etc/nginx/sites-available/${NGINX_SITE_NAME}.backup.$(date +%Y%m%d_%H%M%S)" ]; then
        # Find the most recent backup
        BACKUP_FILE=$(ls -t /etc/nginx/sites-available/${NGINX_SITE_NAME}.backup.* | head -1)
        cp "$BACKUP_FILE" /etc/nginx/sites-available/${NGINX_SITE_NAME}
        echo "Backup restored from: $BACKUP_FILE"
    fi
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Fix Applied Successfully!"
echo "==========================================${NC}"
echo ""
echo "The following changes were made:"
echo "  ✓ Increased proxy timeouts to 300 seconds (5 minutes)"
echo "  ✓ Added special handling for /_next/image endpoint"
echo "  ✓ Increased client body size limits"
echo "  ✓ Disabled buffering for image responses"
echo ""
echo "Next steps:"
echo "  1. Test your website: https://${DOMAIN}"
echo "  2. Check PM2 logs: pm2 logs rightstayafrica"
echo "  3. Monitor Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
echo "If issues persist, check the troubleshooting guide: IMAGE_502_FIX.md"
echo ""
