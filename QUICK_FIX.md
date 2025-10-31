# Quick Fix Guide - Login/Register Issues

## 🔧 Immediate Fixes Applied

The following fixes have been applied to resolve login/register issues:

### 1. **CORS Middleware Order Fixed**
- Moved CORS middleware to be first (before security headers)
- This ensures CORS headers are added before any other processing

### 2. **Security Headers Relaxed for Development**
- Removed strict CSP that was blocking requests
- HSTS disabled for localhost
- CORS properly configured for `http://localhost:3000`

### 3. **Middleware Configuration Updated**
File: `cmd/api/routes.go`
- CORS now first in middleware chain
- Allows OPTIONS preflight requests

---

## 🧪 Testing Steps

### Step 1: Restart Backend
```bash
# Stop any running backend
pkill -f "go run"

# Start fresh
cd /home/thyrook/GolandProjects/REST-API\(with\ GIN\)
./start.sh
```

### Step 2: Test Backend Directly
```bash
# Run the test script
./test-connection.sh
```

This will verify:
- ✅ Backend is running
- ✅ Registration works
- ✅ Login works
- ✅ CORS headers present
- ✅ Events endpoint works

### Step 3: Start Frontend
```bash
cd frontend
npm start
```

### Step 4: Test in Browser
1. Open http://localhost:3000
2. Open Browser Console (F12) → Console tab
3. Click "Sign up"
4. Fill in:
   - Name: Test User
   - Email: user@test.com
   - Password: password123
   - Confirm: password123
5. Click "Create Account"

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" in Browser Console

**Cause**: Backend not running or CORS issue

**Fix**:
```bash
# Check if backend is running
curl http://localhost:8080/health

# If not, start it
./start.sh

# Test CORS
curl -I -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"

# Should see: Access-Control-Allow-Origin: http://localhost:3000
```

### Issue 2: "Failed to fetch" Error

**Cause**: Frontend trying to connect to wrong API URL

**Fix**:
```bash
# Check frontend .env
cat frontend/.env

# Should have:
REACT_APP_API_URL=http://localhost:8080/api/v1

# If missing, create it:
echo "REACT_APP_API_URL=http://localhost:8080/api/v1" > frontend/.env

# Restart frontend
cd frontend
npm start
```

### Issue 3: "401 Unauthorized" on Login

**Cause**: Wrong credentials or backend issue

**Fix**:
```bash
# Test registration first
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","confirm":"password123","name":"Test"}'

# Then test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Should return: {"token":"..."}
```

### Issue 4: "email already registered"

**Cause**: User already exists (this is normal)

**Fix**: Just try logging in with those credentials, or use a different email

### Issue 5: Browser Console Shows CORS Error

**Symptoms**:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/v1/auth/register' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix**:
1. Ensure backend has latest code:
   ```bash
   cd /home/thyrook/GolandProjects/REST-API\(with\ GIN\)
   cd cmd/api
   go run .
   ```

2. Check CORS headers:
   ```bash
   curl -v -X OPTIONS http://localhost:8080/api/v1/auth/login \
     -H "Origin: http://localhost:3000"
   ```

3. Should see these headers:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Content-Length, Accept-Encoding, Authorization, X-Request-ID
   ```

---

## 📋 Verification Checklist

Run through this checklist:

- [ ] Backend running on port 8080
  ```bash
  curl http://localhost:8080/health
  ```

- [ ] CORS headers present
  ```bash
  curl -I -X OPTIONS http://localhost:8080/api/v1/auth/login -H "Origin: http://localhost:3000"
  ```

- [ ] Registration works via curl
  ```bash
  curl -X POST http://localhost:8080/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$(date +%s)'@test.com","password":"password123","confirm":"password123","name":"Test"}'
  ```

- [ ] Login works via curl
  ```bash
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password123"}'
  ```

- [ ] Frontend running on port 3000
  ```bash
  curl -I http://localhost:3000
  ```

- [ ] No errors in browser console (F12)

- [ ] Can register new user in UI

- [ ] Can login with registered user

---

## 🔍 Debug Mode

If issues persist, enable debug logging:

### Backend Debug
```bash
# Check backend logs
tail -f backend.log

# Or run in foreground to see logs
cd cmd/api
go run .
```

### Frontend Debug
1. Open Browser Console (F12)
2. Go to Network tab
3. Try to register/login
4. Click on the failed request
5. Check:
   - Request Headers (should include Origin: http://localhost:3000)
   - Response Headers (should include Access-Control-Allow-Origin)
   - Response body (error message)

---

## ✅ Expected Behavior

### Successful Registration:
1. **Request**: POST to `/api/v1/auth/register`
2. **Response**: 201 Created
   ```json
   {"message":"User created successfully"}
   ```
3. **Then**: Automatic login
4. **Then**: Redirect to `/events`

### Successful Login:
1. **Request**: POST to `/api/v1/auth/login`
2. **Response**: 200 OK
   ```json
   {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
   ```
3. **Then**: Token saved to localStorage
4. **Then**: Redirect to `/events`

---

## 🚀 Quick Start (Fresh)

If nothing works, try a complete fresh start:

```bash
# 1. Stop everything
pkill -f "go run"
pkill -f "node"

# 2. Clean frontend
cd /home/thyrook/GolandProjects/REST-API\(with\ GIN\)/frontend
rm -rf node_modules package-lock.json
npm install

# 3. Restart backend
cd /home/thyrook/GolandProjects/REST-API\(with\ GIN\)
./start.sh

# 4. Wait 3 seconds
sleep 3

# 5. Test backend
./test-connection.sh

# 6. If tests pass, start frontend
cd frontend
npm start

# 7. Open browser
# http://localhost:3000
```

---

## 📞 Still Having Issues?

1. **Check this file**: `backend.log` for backend errors
2. **Check browser console** (F12) for frontend errors  
3. **Run**: `./test-connection.sh` to verify backend
4. **Verify ports**:
   - Backend should be on 8080
   - Frontend should be on 3000

---

**Good luck! The app should work now with the fixes applied.** 🎉
