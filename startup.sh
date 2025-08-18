#!/bin/bash

# Azure App Service startup script for Next.js application
echo "🚀 Starting Azure startup script..."
echo "📍 Current directory: $(pwd)"
echo "📦 Contents: $(ls -la)"

# Ensure we have package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm cache clean --force
npm install --production --no-optional

# Verify critical dependencies are installed
echo "🔍 Verifying dependencies..."
if [ ! -d "node_modules/next" ]; then
    echo "❌ Next.js not installed!"
    exit 1
fi

if [ ! -d "node_modules/react" ]; then
    echo "❌ React not installed!"
    exit 1
fi

# Check if .next build exists
if [ ! -d ".next" ]; then
    echo "❌ .next build directory not found!"
    echo "📦 Available directories: $(ls -la)"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo "🔍 Node modules verification:"
ls -la node_modules/ | head -5

echo "🚀 Starting Next.js server..."
exec npm start