#!/bin/bash

echo "🚀 Starting EventHub Backend API..."

# Kill any existing backend
pkill -f "go run.*cmd/api" 2>/dev/null
sleep 1

# Start backend
cd "$(dirname "$0")/cmd/api"
go run . &

# Wait for it to start
echo "⏳ Waiting for backend..."
for i in {1..15}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ Backend is running!"
        echo ""
        echo "🌐 Backend: http://localhost:8080"
        echo "📊 Health: http://localhost:8080/health"
        echo "📚 Docs: http://localhost:8080/docs"
        echo ""
        exit 0
    fi
    sleep 1
done

echo "❌ Backend failed to start. Check for errors above."
exit 1
