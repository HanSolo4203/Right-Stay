#!/bin/bash

# Right-Stay Deployment Script for Digital Ocean Server
# Run this script on your server to deploy the Right-Stay project

set -e  # Exit on error

echo "=========================================="
echo "Right-Stay Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/rightstayafrica"
GITHUB_REPO="https://github.com/HanSolo4203/Right-Stay.git"
PM2_APP_NAME="rightstayafrica"
NGINX_SITE_NAME="rightstayafrica"
DOMAIN="www.rightstayafrica.com"

echo -e "${YELLOW}Step 1: Checking current setup...${NC}"
echo ""

# Check what PM2 processes are running
echo "Current PM2 processes:"
pm2 list
echo ""

# Check Nginx configuration
echo "Checking Nginx configuration..."
if [ -f "/etc/nginx/sites-enabled/${NGINX_SITE_NAME}" ]; then
    echo "Nginx config found:"
    cat /etc/nginx/sites-enabled/${NGINX_SITE_NAME}
else
    echo -e "${RED}Nginx config not found for ${NGINX_SITE_NAME}${NC}"
fi
echo ""

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Project directory doesn't exist. Creating it...${NC}"
    mkdir -p $PROJECT_DIR
fi

echo -e "${YELLOW}Step 2: Stopping old processes...${NC}"
# Stop all PM2 processes
pm2 stop all || true
pm2 delete all || true
echo ""

echo -e "${YELLOW}Step 3: Setting up Right-Stay project...${NC}"
cd /var/www

# Remove old directory if it exists and is wrong
if [ -d "$PROJECT_DIR" ] && [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "Removing old non-git directory..."
    rm -rf $PROJECT_DIR
fi

# Clone or update the repository
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd $PROJECT_DIR
    git pull origin main
else
    echo "Cloning repository..."
    rm -rf $PROJECT_DIR
    git clone $GITHUB_REPO $PROJECT_DIR
    cd $PROJECT_DIR
fi

echo ""
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
npm install
echo ""

echo -e "${YELLOW}Step 5: Checking for .env.local...${NC}"
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo -e "${RED}WARNING: .env.local file not found!${NC}"
    echo "Creating template .env.local file..."
    cat > $PROJECT_DIR/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Uplisting API (optional)
UPLISTING_API_KEY=your_uplisting_key_here

# Cron Secret (optional)
CRON_SECRET=$(openssl rand -base64 32)
EOF
    echo -e "${RED}Please edit $PROJECT_DIR/.env.local with your actual values!${NC}"
    echo "Press Enter to continue after updating .env.local, or Ctrl+C to exit..."
    read
else
    echo -e "${GREEN}.env.local file found${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Building Next.js application...${NC}"
npm run build
echo ""

echo -e "${YELLOW}Step 7: Setting up PM2...${NC}"
# Create ecosystem.config.js
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${PROJECT_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
echo ""

echo -e "${YELLOW}Step 8: Configuring Nginx...${NC}"
# Create Nginx configuration
cat > /etc/nginx/sites-available/${NGINX_SITE_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} rightstayafrica.com;

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
    }
}
EOF

# Enable the site
rm -f /etc/nginx/sites-enabled/${NGINX_SITE_NAME}
ln -s /etc/nginx/sites-available/${NGINX_SITE_NAME} /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
    systemctl reload nginx
else
    echo -e "${RED}Nginx configuration has errors!${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 9: Verifying deployment...${NC}"
sleep 2
pm2 list
echo ""
echo "Testing application..."
curl -s http://localhost:3000 | head -20
echo ""
echo ""

echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Your application should now be running at:"
echo "  - http://localhost:3000 (direct)"
echo "  - http://${DOMAIN} (via Nginx)"
echo ""
echo "Useful commands:"
echo "  pm2 logs ${PM2_APP_NAME}     # View logs"
echo "  pm2 restart ${PM2_APP_NAME}  # Restart app"
echo "  pm2 status                   # Check status"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update DNS to point ${DOMAIN} to your server IP"
echo "2. Run: certbot --nginx -d ${DOMAIN} -d rightstayafrica.com"
echo "3. Verify the site is working: curl http://localhost:3000"
echo ""


