#!/bin/bash

echo "🚀 Starting Next.js application..."

# Quick check for critical files
if [ ! -d ".next" ]; then
    echo "⚠️ .next directory not found, building..."
    npm run build
fi

# Start the server directly
echo "✅ Starting server..."
node server.js