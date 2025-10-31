# 🎉 EventHub - Full Stack Application

**Production-Ready Event Management System**

Powered by **Eclipse Softworks** | https://eclipse-softworks.com

---

## ⚡ Quick Start (3 Steps!)

### Step 1: Navigate to Project
```bash
cd "/home/thyrook/GolandProjects/REST-API(with GIN)"
```

### Step 2: Run the Application
```bash
./START_HERE.sh
```

### Step 3: Open Browser
- Frontend will open automatically at: **http://localhost:3000**
- Or manually open it in your browser

**That's it! 🎊**

---

## 📱 Using the Application

### 1. Register a New Account
- Click "Sign up"
- Enter your details:
  - Name: Your Name
  - Email: your@email.com
  - Password: (minimum 8 characters)
  - Confirm Password
- Click "Create Account"
- You'll be logged in automatically!

### 2. Browse Events
- View all events in a beautiful grid
- Use search bar to find specific events
- Navigate pages with pagination controls

### 3. Create Your First Event
- Click "Create Event" button
- Fill in:
  - Event Name
  - Description  
  - Date
  - Location
- Submit to create!

### 4. Manage Events
- Click any event to view details
- Edit or delete your own events
- Manage attendees

---

## 🔧 Alternative: Manual Start

If `START_HERE.sh` doesn't work:

### Terminal 1 - Backend:
```bash
cd "/home/thyrook/GolandProjects/REST-API(with GIN)"
cd cmd/api
go run .
```

### Terminal 2 - Frontend:
```bash
cd "/home/thyrook/GolandProjects/REST-API(with GIN)/frontend"
npm install  # First time only
npm start
```

---

## 🌐 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React Web App |
| **Backend API** | http://localhost:8080/api/v1 | REST API |
| **API Health** | http://localhost:8080/health | Health Check |
| **API Docs** | http://localhost:8080/docs | Swagger UI |
| **Version** | http://localhost:8080/version | Build Info |

---

## ✅ Features

### Backend (Go + Gin)
- ✅ RESTful API with full CRUD
- ✅ JWT Authentication
- ✅ Rate Limiting (100 req/min)
- ✅ CORS & Security Headers
- ✅ Pagination & Search
- ✅ Health Monitoring
- ✅ Graceful Shutdown
- ✅ SQLite Database
- ✅ Auto Migrations

### Frontend (React + TypeScript + Tailwind)
- ✅ Beautiful Modern UI
- ✅ Fully Responsive
- ✅ User Authentication
- ✅ Event Management
- ✅ Search & Pagination
- ✅ Protected Routes
- ✅ Error Handling
- ✅ Loading States

---

## 🧪 Testing

### Test Backend Only:
```bash
./test-connection.sh
```

This verifies:
- Backend is running
- Registration works
- Login works
- CORS is configured
- Events API works

### Test via Browser:
1. Open http://localhost:3000
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Try registering/logging in
5. Check for errors

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:8080/health

# If not running, start it:
cd cmd/api && go run .
```

### "Port already in use"
```bash
# Kill existing processes
pkill -f "go run"
pkill -f "node"

# Then restart
./START_HERE.sh
```

### "Frontend won't start"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### "Login/Register not working"
1. Open Browser Console (F12)
2. Check for CORS errors
3. Verify backend is running: `curl http://localhost:8080/health`
4. Check `backend.log` for errors
5. See `QUICK_FIX.md` for detailed troubleshooting

---

## 📚 Documentation

- **FULL_STACK_GUIDE.md** - Complete feature guide
- **FRONTEND_README.md** - Frontend development
- **DEPLOYMENT.md** - Production deployment (571 lines)
- **QUICK_FIX.md** - Troubleshooting guide
- **PRODUCTION_ENHANCEMENTS.md** - Feature summary

---

## 🛠️ Development Commands

### Backend:
```bash
make run          # Start server
make test         # Run tests
make build        # Build binary
make swagger      # Generate docs
make docker-build # Build Docker image
```

### Frontend:
```bash
npm start         # Development server
npm run build     # Production build
npm test          # Run tests
```

---

## 📊 API Endpoints

### Public Endpoints:
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/events` - List events (paginated)
- `GET /api/v1/events/:id` - Get event

### Protected Endpoints (requires JWT):
- `POST /api/v1/events` - Create event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event
- `POST /api/v1/events/:id/attendees` - Add attendee
- `GET /api/v1/events/:id/attendees` - List attendees
- `DELETE /api/v1/events/:id/attendees/:userId` - Remove attendee

---

## 🔒 Security Features

- ✅ JWT Authentication (24h expiration)
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting (100 req/min per IP)
- ✅ CORS Protection
- ✅ Security Headers (XSS, CSRF, CSP)
- ✅ Input Validation
- ✅ Protected Routes
- ✅ Request ID Tracking

---

## 🚀 Production Deployment

See `DEPLOYMENT.md` for detailed instructions on:
- Binary deployment with systemd
- Docker deployment
- Kubernetes deployment
- Environment configuration
- SSL/TLS setup

Quick production build:
```bash
make prod                    # Build backend
cd frontend && npm run build # Build frontend
```

---

## 📈 Performance

- **Backend**: 100+ requests/sec
- **Frontend**: Lighthouse score 90+
- **Database**: 25 concurrent connections
- **Load Time**: < 2s initial load

---

## 🎨 Technology Stack

**Backend:**
- Go 1.21+
- Gin Web Framework
- SQLite Database
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- date-fns

---

## 📞 Support

**Eclipse Softworks:**
- Email: support@eclipse-softworks.com
- Website: https://eclipse-softworks.com
- Documentation: This repository

---

## 📝 Next Steps

1. ✅ Run `./START_HERE.sh`
2. ✅ Register an account
3. ✅ Create your first event
4. 📖 Read documentation
5. 🎨 Customize branding
6. 🚀 Deploy to production

---

## ⚠️ Important Notes

### For Development:
- Default JWT secret is **insecure**
- Change it in `.env` for production
- Backend runs on port 8080
- Frontend runs on port 3000

### For Production:
- Generate strong JWT secret: `openssl rand -base64 48`
- Enable HTTPS/TLS
- Configure firewall
- Set up monitoring
- Regular backups
- See `DEPLOYMENT.md`

---

<div align="center">
  <h2>🎉 You're All Set!</h2>
  <p>Run <code>./START_HERE.sh</code> to begin!</p>
  <br>
  <p><strong>Powered by Eclipse Softworks</strong></p>
  <p>Leading Software Development Company in South Africa</p>
  <p><a href="https://eclipse-softworks.com">eclipse-softworks.com</a></p>
</div>
