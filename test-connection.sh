#!/bin/bash

# Test Backend & Frontend Connection
echo "🔍 Testing EventHub Full Stack Connection"
echo "=========================================="
echo ""

# Test Backend
echo "1️⃣  Testing Backend API..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 8080"
    echo ""
    echo "   Health Check Response:"
    curl -s http://localhost:8080/health | jq . 2>/dev/null || curl -s http://localhost:8080/health
    echo ""
else
    echo "   ❌ Backend is NOT running on port 8080"
    echo "   Start it with: ./start.sh"
    echo ""
    exit 1
fi

# Test Registration
echo ""
echo "2️⃣  Testing Registration Endpoint..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@test.com","password":"password123","confirm":"password123","name":"Test User"}')

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    echo "   ✅ Registration works! (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE_BODY"
elif [ "$HTTP_CODE" = "409" ]; then
    echo "   ⚠️  User already exists (HTTP $HTTP_CODE) - This is OK"
else
    echo "   ❌ Registration failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE_BODY"
fi

# Test Login
echo ""
echo "3️⃣  Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Login works! (HTTP $HTTP_CODE)"
    TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token' 2>/dev/null)
    if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo "   ✅ JWT Token received"
    fi
else
    echo "   ❌ Login failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE_BODY"
fi

# Test CORS
echo ""
echo "4️⃣  Testing CORS Headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -i "Access-Control-Allow-Origin" > /dev/null; then
    echo "   ✅ CORS headers present"
    echo "$CORS_RESPONSE" | grep -i "Access-Control"
else
    echo "   ❌ CORS headers missing"
fi

# Test Events endpoint
echo ""
echo "5️⃣  Testing Events Endpoint (with pagination)..."
EVENTS_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:8080/api/v1/events?page=1&limit=5")
HTTP_CODE=$(echo "$EVENTS_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Events endpoint works! (HTTP $HTTP_CODE)"
    RESPONSE_BODY=$(echo "$EVENTS_RESPONSE" | head -n-1)
    if echo "$RESPONSE_BODY" | jq '.pagination' > /dev/null 2>&1; then
        echo "   ✅ Pagination working"
    fi
else
    echo "   ❌ Events endpoint failed (HTTP $HTTP_CODE)"
fi

# Check Frontend
echo ""
echo "6️⃣  Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 3000"
    echo "   🌐 Open: http://localhost:3000"
else
    echo "   ⚠️  Frontend is NOT running on port 3000"
    echo "   Start it with: cd frontend && npm start"
fi

echo ""
echo "=========================================="
echo "✅ Backend tests complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. If backend tests passed, try frontend:"
echo "      cd frontend && npm start"
echo ""
echo "   2. Open browser to http://localhost:3000"
echo ""
echo "   3. Try registering a new user"
echo ""
echo "   4. Check browser console (F12) for errors"
echo "=========================================="
