#!/bin/bash

# Azure App Service startup script for Next.js application
echo "🚀 Starting Azure startup script..."
echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Ensure we have package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Ultra-fast dependency installation FIRST (before checking .next)
echo "⚡ Installing dependencies..."
npm ci --production --silent --prefer-offline --no-audit --no-fund --no-optional --ignore-scripts --no-bin-links 2>/dev/null || npm install --production --silent --prefer-offline --no-audit --no-fund --no-optional --ignore-scripts --no-bin-links

# Check if .next build exists after npm install
if [ ! -d ".next" ]; then
    echo "⚠️ .next build directory not found! Building now..."
    echo "📂 Current contents:"
    ls -la
    
    # Emergency build if .next is missing
    echo "🔨 Running emergency build..."
    npm run build || {
        echo "❌ Build failed!"
        exit 1
    }
fi

# Minimal verification - only check Next.js core
if [ ! -d "node_modules/next" ]; then
    echo "❌ Next.js not installed!"
    exit 1
fi

echo "✅ Dependencies ready"
echo "🚀 Starting Next.js server..."
exec npm start