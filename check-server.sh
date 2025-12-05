#!/bin/bash

# Diagnostic script to check current server setup
# Run this on your server to see what's currently configured

echo "=========================================="
echo "Server Diagnostic Check"
echo "=========================================="
echo ""

echo "1. Checking PM2 processes:"
echo "---------------------------"
pm2 list
echo ""

echo "2. Checking what's running on port 3000:"
echo "-----------------------------------------"
netstat -tulpn | grep 3000 || lsof -i :3000 || echo "Nothing found on port 3000"
echo ""

echo "3. Checking Nginx sites-enabled:"
echo "---------------------------------"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "4. Checking rightstayafrica Nginx config (if exists):"
echo "------------------------------------------------------"
if [ -f "/etc/nginx/sites-enabled/rightstayafrica" ]; then
    cat /etc/nginx/sites-enabled/rightstayafrica
else
    echo "rightstayafrica config not found"
fi
echo ""

echo "5. Checking /var/www directory:"
echo "-------------------------------"
ls -la /var/www/
echo ""

echo "6. Checking if rightstayafrica directory exists:"
echo "-------------------------------------------------"
if [ -d "/var/www/rightstayafrica" ]; then
    echo "Directory exists:"
    ls -la /var/www/rightstayafrica/ | head -20
    echo ""
    echo "Checking if it's a git repo:"
    if [ -d "/var/www/rightstayafrica/.git" ]; then
        echo "Git repo found. Current remote:"
        cd /var/www/rightstayafrica && git remote -v
    else
        echo "Not a git repository"
    fi
else
    echo "Directory does not exist"
fi
echo ""

echo "7. Checking for rslexpress processes:"
echo "-------------------------------------"
pm2 list | grep -i rslexpress || echo "No rslexpress processes found"
echo ""

echo "8. Checking all Nginx configs for proxy_pass:"
echo "----------------------------------------------"
grep -r "proxy_pass" /etc/nginx/sites-enabled/ 2>/dev/null || echo "No proxy_pass found"
echo ""

echo "=========================================="
echo "Diagnostic Complete"
echo "=========================================="


