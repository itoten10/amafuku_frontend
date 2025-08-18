#!/bin/bash

echo "🚀 Starting Next.js application..."

# Force clean install with detailed logging
echo "🔍 Current directory: $(pwd)"
echo "🔍 Files present: $(ls -la | head -10)"

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
    echo "⚡ Force installing ALL dependencies..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
    
    # Install with full logging
    npm install --verbose --no-optional
    
    # Validate critical modules
    echo "🔍 Checking Next.js installation..."
    if [ ! -f "node_modules/.bin/next" ]; then
        echo "❌ Next.js binary not found! Installing manually..."
        npm install next@15.1.0 --save
    fi
    
    echo "✅ Dependencies installed"
    ls -la node_modules/.bin/ | grep next || echo "❌ Next.js still missing!"
fi

# Build with error handling
if [ ! -d ".next" ]; then
    echo "⚠️ Building Next.js..."
    
    # Try using npx first
    if ./node_modules/.bin/next build; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed, trying alternative..."
        npx next build || npm run build
    fi
fi

# Final validation before server start
echo "🔍 Final validation..."
ls -la .next/ | head -5
ls -la node_modules/.bin/next* || echo "❌ Next.js binary missing"

echo "✅ Starting server..."
node server.js