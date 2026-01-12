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

echo "5. Checking /home/richard directory:"
echo "-------------------------------------"
ls -la /home/richard/ 2>/dev/null || echo "Cannot access /home/richard"
echo ""

echo "6. Checking if app directory exists:"
echo "-------------------------------------"
if [ -d "/home/richard/app" ]; then
    echo "Directory exists:"
    ls -la /home/richard/app/ | head -20
    echo ""
    echo "Checking if it's a git repo:"
    if [ -d "/home/richard/app/.git" ]; then
        echo "Git repo found. Current remote:"
        cd /home/richard/app && git remote -v
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





