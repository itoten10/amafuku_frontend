#!/bin/bash

# Azure App Service startup script for Next.js application
echo "🚀 Starting Azure startup script..."
echo "📍 Current directory: $(pwd)"

# CRITICAL: Remove Azure tar.gz if it exists (breaks everything)
if [ -f "node_modules.tar.gz" ]; then
    echo "⚠️ Removing Azure node_modules.tar.gz that breaks deployment..."
    rm -f node_modules.tar.gz
fi

# Ensure we have package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Clean install dependencies (remove old node_modules first)
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules

echo "📦 Installing fresh dependencies..."
npm install --production

# Verify Next.js is installed
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ Next.js not installed! Trying full install..."
    npm install
fi

# Check if .next build exists after npm install
if [ ! -d ".next" ]; then
    echo "⚠️ .next build directory not found! Building now..."
    echo "📂 Current contents:"
    ls -la
    
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

if [ ! -d "node_modules/next" ]; then
    echo "❌ Next.js not installed!"
    exit 1
fi

echo "✅ All dependencies ready"
echo "📂 Final directory structure:"
ls -la

echo "🚀 Starting Next.js server..."
exec npm start