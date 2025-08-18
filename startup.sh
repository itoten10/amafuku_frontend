#!/bin/bash

# Azure App Service startup script for Next.js application
echo "🚀 Starting Azure startup script..."
echo "📍 Current directory: $(pwd)"

# Ensure we have package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Check if .next build exists first
if [ ! -d ".next" ]; then
    echo "❌ .next build directory not found!"
    exit 1
fi

# Ultra-fast dependency installation with aggressive optimization
echo "⚡ Ultra-fast npm install starting..."
npm ci --production --silent --prefer-offline --no-audit --no-fund --no-optional --ignore-scripts --no-bin-links 2>/dev/null || npm install --production --silent --prefer-offline --no-audit --no-fund --no-optional --ignore-scripts --no-bin-links

# Minimal verification - only check Next.js core
if [ ! -d "node_modules/next" ]; then
    echo "❌ Next.js not installed!"
    exit 1
fi

echo "✅ Dependencies ready"
echo "🚀 Starting Next.js server..."
exec npm start