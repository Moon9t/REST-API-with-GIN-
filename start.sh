#!/bin/bash

# EventHub API - Quick Start Script
# Powered by Eclipse Softworks

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EventHub API - Eclipse Softworks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if data.db exists, if not run migrations
if [ ! -f "data.db" ]; then
    echo "📦 Database not found. Running migrations..."
    cd cmd/migrate && go run . && cd ../..
    echo "✅ Migrations complete"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Using defaults."
    echo "   Copy .env.example to .env and configure for production."
    echo ""
fi

echo "🔥 Starting server..."
echo ""
cd cmd/api && go run .
