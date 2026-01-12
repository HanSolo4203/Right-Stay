#!/bin/bash
# apply-fixes.sh - Complete fix script to run on your server
# This script applies all fixes for 502 errors: Nginx config, rebuild, and restart

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/rightstayafrica"
NGINX_SITE_NAME="rightstayafrica"
DOMAIN="www.rightstayafrica.com"

echo -e "${YELLOW}=========================================="
echo "Applying All 502 Error Fixes"
echo "==========================================${NC}"
echo ""

# Check if running as root for Nginx operations
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some operations require root. You may be prompted for sudo.${NC}"
    SUDO="sudo"
else
    SUDO=""
fi

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code from GitHub...${NC}"
cd $PROJECT_DIR
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 2: Update Nginx configuration
echo -e "${YELLOW}Step 2: Updating Nginx configuration...${NC}"
if [ -f "$PROJECT_DIR/fix-502-errors.sh" ]; then
    $SUDO bash $PROJECT_DIR/fix-502-errors.sh
else
    echo -e "${RED}fix-502-errors.sh not found. Updating Nginx manually...${NC}"
    
    # Backup current config
    if [ -f "/etc/nginx/sites-available/${NGINX_SITE_NAME}" ]; then
        $SUDO cp /etc/nginx/sites-available/${NGINX_SITE_NAME} /etc/nginx/sites-available/${NGINX_SITE_NAME}.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Create updated config
    $SUDO tee /etc/nginx/sites-available/${NGINX_SITE_NAME} > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN} rightstayafrica.com;

    client_max_body_size 50M;
    client_body_buffer_size 128k;

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
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
}
EOF

    # Test and reload
    if $SUDO nginx -t; then
        $SUDO systemctl reload nginx
        echo -e "${GREEN}✓ Nginx updated${NC}"
    else
        echo -e "${RED}✗ Nginx configuration error${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: Check if image file exists
echo -e "${YELLOW}Step 3: Checking for required image files...${NC}"
if [ -f "$PROJECT_DIR/public/cpt-lions-head-1.jpg" ]; then
    echo -e "${GREEN}✓ cpt-lions-head-1.jpg found${NC}"
else
    echo -e "${YELLOW}⚠ cpt-lions-head-1.jpg not found in public directory${NC}"
    echo "  This may cause 502 errors for local images"
fi
echo ""

# Step 4: Update PM2 ecosystem config if needed
echo -e "${YELLOW}Step 4: Updating PM2 configuration...${NC}"
if [ -f "$PROJECT_DIR/ecosystem.config.example.js" ]; then
    if [ ! -f "$PROJECT_DIR/ecosystem.config.js" ] || [ "$PROJECT_DIR/ecosystem.config.example.js" -nt "$PROJECT_DIR/ecosystem.config.js" ]; then
        echo "Updating ecosystem.config.js from example..."
        cp $PROJECT_DIR/ecosystem.config.example.js $PROJECT_DIR/ecosystem.config.js
        # Update paths in the config
        sed -i "s|/var/www/rightstayafrica|$PROJECT_DIR|g" $PROJECT_DIR/ecosystem.config.js
        echo -e "${GREEN}✓ PM2 config updated${NC}"
    else
        echo -e "${GREEN}✓ PM2 config already up to date${NC}"
    fi
else
    echo -e "${YELLOW}⚠ ecosystem.config.example.js not found, skipping${NC}"
fi
echo ""

# Step 5: Install dependencies (if package.json changed)
echo -e "${YELLOW}Step 5: Checking dependencies...${NC}"
if [ "$PROJECT_DIR/package.json" -nt "$PROJECT_DIR/node_modules" ] 2>/dev/null || [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "Installing/updating dependencies..."
    cd $PROJECT_DIR
    npm install
    echo -e "${GREEN}✓ Dependencies updated${NC}"
else
    echo -e "${GREEN}✓ Dependencies up to date${NC}"
fi
echo ""

# Step 6: Rebuild Next.js app
echo -e "${YELLOW}Step 6: Rebuilding Next.js application...${NC}"
cd $PROJECT_DIR
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 7: Restart PM2
echo -e "${YELLOW}Step 7: Restarting PM2 application...${NC}"
pm2 restart rightstayafrica || pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ PM2 restarted${NC}"
echo ""

# Step 8: Verify
echo -e "${YELLOW}Step 8: Verifying setup...${NC}"
sleep 3
echo "Checking PM2 status:"
pm2 list | grep rightstayafrica || echo "PM2 process not found"
echo ""
echo "Testing local server:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Server is responding${NC}"
else
    echo -e "${YELLOW}⚠ Server may not be responding correctly${NC}"
fi
echo ""

echo -e "${GREEN}=========================================="
echo "All Fixes Applied!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Test your website: https://${DOMAIN}"
echo "  2. Check PM2 logs: pm2 logs rightstayafrica"
echo "  3. Monitor for errors: tail -f /var/log/nginx/error.log"
echo ""
echo "If issues persist, check IMAGE_502_FIX.md for troubleshooting"
echo ""
