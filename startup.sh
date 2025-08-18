#!/bin/bash

echo "🚀 Starting Next.js application..."

# Fast production install if node_modules missing
if [ ! -d "node_modules" ]; then
    echo "⚡ Installing production dependencies only..."
    npm install --production --no-optional --silent
fi

# Quick check for critical files
if [ ! -d ".next" ]; then
    echo "⚠️ .next directory not found, building..."
    npm run build
fi

# Start the server directly
echo "✅ Starting server..."
node server.js