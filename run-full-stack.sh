#!/bin/bash

# EventHub Full Stack - Quick Start Script
# Starts both backend API and frontend React app

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 EventHub Full Stack - Eclipse Softworks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running from project root
if [ ! -f "go.mod" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start Backend API
echo "📦 Starting Backend API..."
if [ ! -f "data.db" ]; then
    echo "   Creating database..."
    cd cmd/migrate && go run . && cd ../..
fi

# Start backend in background
echo "   Starting API server on :8080..."
cd cmd/api
go run . > ../../backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

echo "   ✅ Backend API started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "⚠️  Backend health check failed, but continuing..."
fi

# Start Frontend
echo "📱 Starting Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

echo "   Starting React development server on :3000..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Full Stack Running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8080"
echo "📊 API Health: http://localhost:8080/health"
echo "📚 API Docs: http://localhost:8080/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start frontend (this will block)
npm start

# Cleanup when frontend stops
echo ""
echo "🛑 Stopping backend..."
kill $BACKEND_PID 2>/dev/null || true
echo "✅ Stopped"
