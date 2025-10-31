#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║   EventHub - Eclipse Softworks             ║"
echo "║   Quick Start Script                       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "go run.*cmd/api" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# Start Backend
echo ""
echo "🚀 Starting Backend API..."
cd cmd/api
go run . > ../../backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

echo "   Backend PID: $BACKEND_PID"
echo "   Logs: backend.log"

# Wait for backend to start
echo "   Waiting for backend..."
for i in {1..10}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "   ✅ Backend is ready!"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Start Frontend
echo ""
echo "🎨 Starting Frontend..."
echo "   This will open your browser automatically..."
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   📦 Installing dependencies (first time only)..."
    npm install --silent
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  🌐 Application URLs:                      ║"
echo "║                                            ║"
echo "║  Frontend: http://localhost:3000          ║"
echo "║  Backend:  http://localhost:8080          ║"
echo "║  API Docs: http://localhost:8080/docs     ║"
echo "║  Health:   http://localhost:8080/health   ║"
echo "║                                            ║"
echo "║  Press Ctrl+C to stop                     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Start frontend (this blocks)
npm start

# Cleanup on exit
echo ""
echo "🛑 Shutting down..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Stopped"
