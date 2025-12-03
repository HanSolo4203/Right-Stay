#!/bin/bash

# Rollback Script - Revert to Original Setup
# This script attempts to restore the original server configuration

set -e  # Exit on error

echo "=========================================="
echo "Server Rollback Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ORIGINAL_PROJECT_DIR="/var/www/RSA-SABBATICAL-V1"
NEW_PROJECT_DIR="/var/www/rightstayafrica"
ORIGINAL_NGINX_CONFIG="/etc/nginx/sites-available/RSA-SABBATICAL-V1"
NEW_NGINX_CONFIG="/etc/nginx/sites-available/rightstayafrica"

echo -e "${YELLOW}Step 1: Stopping Right-Stay processes...${NC}"
# Stop and delete rightstayafrica PM2 process
pm2 stop rightstayafrica || true
pm2 delete rightstayafrica || true
pm2 save
echo ""

echo -e "${YELLOW}Step 2: Checking for backup of original project...${NC}"
# Look for backup directories
BACKUP_DIRS=$(ls -d /var/www/RSA-SABBATICAL-V1-backup-* 2>/dev/null | sort -r | head -1)

if [ -n "$BACKUP_DIRS" ]; then
    echo -e "${GREEN}Found backup: $BACKUP_DIRS${NC}"
    echo "Restoring original project..."
    
    # Remove current rightstayafrica if it exists
    if [ -d "$NEW_PROJECT_DIR" ]; then
        echo "Backing up rightstayafrica before removal..."
        mv $NEW_PROJECT_DIR ${NEW_PROJECT_DIR}-backup-$(date +%Y%m%d-%H%M%S) || true
    fi
    
    # Restore original project
    if [ -d "$ORIGINAL_PROJECT_DIR" ]; then
        echo "Original directory already exists, skipping restore"
    else
        cp -r $BACKUP_DIRS $ORIGINAL_PROJECT_DIR
        echo -e "${GREEN}Original project restored${NC}"
    fi
else
    echo -e "${YELLOW}No backup found. Checking if original directory exists...${NC}"
    if [ -d "$ORIGINAL_PROJECT_DIR" ]; then
        echo -e "${GREEN}Original directory found at $ORIGINAL_PROJECT_DIR${NC}"
    else
        echo -e "${RED}Original project directory not found!${NC}"
        echo "You may need to manually restore it."
    fi
fi
echo ""

echo -e "${YELLOW}Step 3: Restoring original Nginx configuration...${NC}"
# Check if original Nginx config exists
if [ -f "$ORIGINAL_NGINX_CONFIG" ]; then
    echo "Found original Nginx config, restoring..."
    
    # Remove rightstayafrica symlink
    rm -f /etc/nginx/sites-enabled/rightstayafrica
    
    # Create symlink to original config
    ln -sf $ORIGINAL_NGINX_CONFIG /etc/nginx/sites-enabled/RSA-SABBATICAL-V1
    
    echo -e "${GREEN}Original Nginx config restored${NC}"
else
    echo -e "${YELLOW}Original Nginx config not found. Checking for rslexpress config...${NC}"
    
    # Check for rslexpress config (mentioned in user's issue)
    if [ -f "/etc/nginx/sites-available/rslexpress" ]; then
        echo "Found rslexpress config, restoring..."
        rm -f /etc/nginx/sites-enabled/rightstayafrica
        ln -sf /etc/nginx/sites-available/rslexpress /etc/nginx/sites-enabled/rslexpress
        echo -e "${GREEN}rslexpress Nginx config restored${NC}"
    else
        echo -e "${RED}No original Nginx config found!${NC}"
        echo "You may need to manually restore the Nginx configuration."
    fi
fi
echo ""

echo -e "${YELLOW}Step 4: Restoring original PM2 processes...${NC}"
# Check if original project has ecosystem.config.js
if [ -f "$ORIGINAL_PROJECT_DIR/ecosystem.config.js" ]; then
    echo "Found ecosystem.config.js in original project, starting it..."
    cd $ORIGINAL_PROJECT_DIR
    pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js || true
    pm2 save
    echo -e "${GREEN}Original PM2 process started${NC}"
else
    echo -e "${YELLOW}No ecosystem.config.js found. Checking for other PM2 configs...${NC}"
    
    # Look for any other ecosystem configs in /var/www
    OTHER_CONFIGS=$(find /var/www -name "ecosystem.config.js" -not -path "*/rightstayafrica/*" 2>/dev/null | head -1)
    
    if [ -n "$OTHER_CONFIGS" ]; then
        echo "Found ecosystem config at: $OTHER_CONFIGS"
        cd $(dirname $OTHER_CONFIGS)
        pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js || true
        pm2 save
    else
        echo -e "${RED}No PM2 config found. You may need to manually start the original application.${NC}"
        echo "Common commands:"
        echo "  cd /var/www/RSA-SABBATICAL-V1"
        echo "  pm2 start npm --name 'original-app' -- start"
        echo "  pm2 save"
    fi
fi
echo ""

echo -e "${YELLOW}Step 5: Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}Nginx reloaded${NC}"
else
    echo -e "${RED}Nginx configuration has errors!${NC}"
    echo "Please fix the configuration manually."
fi
echo ""

echo -e "${YELLOW}Step 6: Verifying rollback...${NC}"
echo "Current PM2 processes:"
pm2 list
echo ""

echo "Current Nginx enabled sites:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "Testing localhost:3000..."
curl -s http://localhost:3000 | head -5 || echo "Nothing responding on port 3000"
echo ""

echo -e "${GREEN}=========================================="
echo "Rollback Complete!"
echo "==========================================${NC}"
echo ""
echo "Summary:"
echo "  - Right-Stay PM2 process: Stopped and removed"
echo "  - Original project: Checked/restored"
echo "  - Nginx config: Restored to original"
echo "  - PM2 processes: Attempted to restore"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. Verify your original application is running: pm2 status"
echo "2. Check Nginx is pointing to the correct app"
echo "3. Test your website to ensure it's working"
echo "4. If something is missing, you may need to manually restore from backups"
echo ""

