#!/bin/bash

# AISim Nursing Assistant - Frontend Server Startup
# Runs frontend on port 8080 (no conflicts)

echo "🚀 Starting AISim Nursing Assistant Frontend..."
echo "📍 Port: 8080"
echo "🌐 URL: http://localhost:8080"
echo ""

cd "/Users/simeonreid/AiSIm Nursing Assisatnt/frontend"

# Try different methods to start the server
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 HTTP server..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "✅ Using Python HTTP server..."
    python -m SimpleHTTPServer 8080
elif command -v npx &> /dev/null; then
    echo "✅ Using npx http-server..."
    npx -y http-server -p 8080
else
    echo "❌ No HTTP server found. Please install Python or Node.js"
    exit 1
fi

