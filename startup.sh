#!/bin/bash

# Azure App Service startup script for Next.js application
echo "🚀 Starting Azure startup script..."
echo "📍 Current directory: $(pwd)"

# CRITICAL: Remove Azure tar.gz if it exists (breaks everything)
if [ -f "node_modules.tar.gz" ]; then
    echo "⚠️ Removing Azure node_modules.tar.gz that breaks deployment..."
    rm -f node_modules.tar.gz
fi

# Check if node_modules already exists (from previous deployment)
if [ -d "node_modules" ] && [ -d "node_modules/next" ]; then
    echo "✅ Dependencies already installed from previous deployment"
    
    # Quick verify of critical dependencies
    if [ ! -f "node_modules/.bin/next" ]; then
        echo "⚠️ Next.js binary missing, reinstalling..."
        npm install next
    fi
else
    echo "📦 Installing dependencies (first time)..."
    # Use minimal install for production
    npm install --production --no-optional --no-audit --no-fund --ignore-scripts
fi

# Check if .next build exists
if [ ! -d ".next" ]; then
    echo "⚠️ .next build directory not found! Building now..."
    
    # Build the application
    echo "🔨 Running Next.js build..."
    npm run build || {
        echo "❌ Build failed!"
        exit 1
    }
fi

# Final verification
if [ ! -d ".next" ]; then
    echo "❌ .next directory still missing after build!"
    exit 1
fi

echo "✅ All ready"
echo "🚀 Starting Next.js server..."
exec npm start