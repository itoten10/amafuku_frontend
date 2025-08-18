#!/bin/bash

echo "🚀 Starting Next.js application..."

# Install all dependencies for build
if [ ! -d "node_modules" ]; then
    echo "⚡ Installing dependencies..."
    npm install --no-optional --silent
fi

# Quick check for critical files
if [ ! -d ".next" ]; then
    echo "⚠️ .next directory not found, building..."
    npm run build
fi

# Start the server directly
echo "✅ Starting server..."
node server.js