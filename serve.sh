#!/bin/bash
# Simple HTTP server to test extracted websites

SITE_DIR="${1:-extracted_site}"
PORT="${2:-8000}"

if [ ! -d "$SITE_DIR" ]; then
    echo "❌ Directory not found: $SITE_DIR"
    echo ""
    echo "Usage: ./serve.sh [directory] [port]"
    echo ""
    echo "Example:"
    echo "  ./serve.sh extracted_site 8000"
    exit 1
fi

echo "🌐 Starting local web server..."
echo ""
echo "  Directory: $SITE_DIR"
echo "  Port:      $PORT"
echo "  URL:       http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$SITE_DIR" && python3 -m http.server "$PORT"

