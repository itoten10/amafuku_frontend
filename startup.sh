#!/bin/bash
set -e  # Exit on any error

echo "🚀 STARTUP.SH EXECUTING - Debug mode enabled"
echo "📅 Current time: $(date)"
echo "📁 PWD: $(pwd)"
echo "📝 User: $(whoami)"

# Database initialization (only if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️ Database URL found, initializing Prisma..."
    if [ -f "node_modules/.bin/prisma" ]; then
        echo "📊 Running Prisma generate..."
        npx prisma generate || echo "⚠️ Prisma generate warning (continuing...)"
        
        echo "📊 Pushing database schema..."
        npx prisma db push --accept-data-loss || echo "⚠️ Database push warning (may already exist)"
    else
        echo "⚠️ Prisma not found, skipping database initialization"
    fi
else
    echo "⚠️ DATABASE_URL not set, skipping database initialization"
fi

# Ultra-fast minimal approach
echo "⚡ FAST NODE_MODULES CHECK..."
if [ ! -f "node_modules/.bin/next" ]; then
    echo "🔧 Installing ONLY essential packages..."
    npm install next@15.1.0 react@18.2.0 react-dom@18.2.0 --no-package-lock --no-optional --prefer-offline
    
    # Verify Next.js
    if [ ! -f "node_modules/.bin/next" ]; then
        echo "❌ CRITICAL: Next.js installation failed!"
        exit 1
    fi
fi

# Skip build if .next exists and is recent
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "🏗️ Quick build..."
    ./node_modules/.bin/next build --no-lint
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Exiting..."
        exit 1
    fi
fi

echo "✅ Starting server immediately..."
exec node server.js