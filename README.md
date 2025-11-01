<img width="1024" height="1024" alt="evenhub_logo" src="https://github.com/user-attachments/assets/346562e8-d1ec-4c2f-aa0e-ac4961309c1f" />

# EventHub API

**RESTful API for Event Management**

Powered by [Eclipse Softworks](https://eclipse-softworks.com)

---

## Overview

EventHub is a RESTful API server implemented in Go using the Gin framework. It provides endpoints to manage users, events, and attendees with security, monitoring, and performance features.

### Key Features

**Security**
- JWT-based authentication
- Rate limiting (100 requests/min per IP)
- CORS protection
- Security headers (XSS, CSRF, CSP)
- Request ID tracking for distributed tracing

**Observability**
- Health check endpoint
- Version information endpoint
- Structured request logging
- Database connection monitoring

**Performance**
- Database connection pooling
- Graceful shutdown
- Optimized timeouts
- Static asset serving

**Developer Experience**
- Auto-generated Swagger/OpenAPI documentation
- Comprehensive test coverage
- Database migrations
- Environment-based configuration

---

## Repository Structure

```
.
├── cmd/
│   ├── api/              # API server and handlers
│   │   ├── main.go       # Entry point with Swagger annotations
│   │   ├── server.go     # HTTP server with graceful shutdown
│   │   ├── routes.go     # Route definitions
│   │   ├── auth.go       # Authentication endpoints
│   │   ├── events.go     # Event management
│   │   ├── health.go     # Health & monitoring endpoints
│   │   ├── middleware.go # All middleware (JWT, CORS, rate limiting, logging, recovery)
│   │   ├── context.go    # Context helpers
│   │   └── docs/         # Auto-generated Swagger docs
│   └── migrate/          # Database migrations
│       └── migrations/   # SQL migration files
│
├── internal/
│   ├── database/         # Data models and DB layer
│   │   ├── models.go     # Database models
│   │   ├── users.go      # User operations
│   │   ├── events.go     # Event operations
│   │   └── attendees.go  # Attendee operations
│   └── env/              # Environment configuration
│
├── frontend/             # React frontend application
├── docs/                 # Documentation files
├── scripts/              # Deployment and utility scripts
├── web/                  # Static assets
│   └── swagger/          # Swagger UI files
└── .github/              # CI/CD workflows
    └── workflows/        # GitHub Actions
```

---

## Requirements

- **Go 1.21+**
- **SQLite3** development headers (`libsqlite3-dev` on Ubuntu/Debian)
- POSIX-compatible shell (bash/zsh)

---

## Quick Start

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y libsqlite3-dev
```

**Install Go dependencies:**
```bash
go mod download
```

### 2. Configure Environment

Create or update `.env` file:
```bash
PORT=8080
JWT_Secret=your-super-secure-secret-key-min-32-chars
BASE_URL=http://localhost:8080
```

**Security Warning**: Never use default secrets in production!

### 3. Run Migrations

```bash
cd cmd/migrate
go run .
cd ../..
```

### 4. Start the Server

```bash
cd cmd/api
go run .
```

The server will start with:
- API: `http://localhost:8080/api/v1`
- Health: `http://localhost:8080/health`
- Docs: `http://localhost:8080/docs`
- ℹVersion: `http://localhost:8080/version`

---

## API Endpoints

### Health & Monitoring

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check with DB status | No |
| GET | `/version` | Version and build info | No |

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Create new user account | No |
| POST | `/api/v1/auth/login` | Login and get JWT token | No |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/events` | List all events | No |
| GET | `/api/v1/events/{id}` | Get single event | No |
| POST | `/api/v1/events` | Create event | Yes |
| PUT | `/api/v1/events/{id}` | Update event (owner) | Yes |
| DELETE | `/api/v1/events/{id}` | Delete event (owner) | Yes |

### Attendees

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/events/{id}/attendees?user_id={id}` | Add attendee | Yes |
| GET | `/api/v1/events/{id}/attendees` | List attendees | Yes |
| DELETE | `/api/v1/events/{id}/attendees/{userId}` | Remove attendee | Yes |
| GET | `/api/v1/attendees/{id}/events` | User's events | Yes |

---

## Authentication

Protected endpoints require a JWT bearer token:

```bash
# Login to get token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Use token in requests
curl -X POST http://localhost:8080/api/v1/events \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Team Meeting", "location": "Office", "date": "2025-12-01T10:00:00Z"}'
```

---

## Testing

Run all tests:
```bash
go test ./... -v
```

Run with coverage:
```bash
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

---

## API Documentation

### Generate Swagger Docs

```bash
go install github.com/swaggo/swag/cmd/swag@v1.8.12
$(go env GOPATH)/bin/swag init -g cmd/api/main.go -o cmd/api/docs --parseDependency --parseInternal
```

### Access Documentation

- **Swagger UI**: http://localhost:8080/docs
- **OpenAPI JSON**: http://localhost:8080/docs/doc.json

---

## Production Deployment

### Environment Variables

Required for production:

```bash
# Server
PORT=8080
BASE_URL=https://api.yourdomain.com

# Security (REQUIRED - generate strong random values)
JWT_Secret=<256-bit-random-string>

# Database
DB_PATH=./data.db

# Optional
FORCE_MIGRATE=0  # Set to 1 to force migrations
```

### Build for Production

```bash
# Build binary with version info
go build -ldflags="-X 'main.version=1.0.0' -X 'main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)' -X 'main.gitCommit=$(git rev-parse HEAD)'" -o eventhub-api ./cmd/api

# Run
./eventhub-api
```

### Docker Deployment

```bash
# Build image
docker build -t eventhub-api:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e JWT_Secret=<your-secret> \
  -v $(pwd)/data:/app/data \
  --name eventhub \
  eventhub-api:latest
```

### Docker Compose

```bash
docker-compose up -d
```

---

## Security & Middleware Features

### JWT Authentication
- Bearer token validation
- Automatic token expiration (24 hours)
- Signing method verification
- User context injection
- Detailed error messages

### Rate Limiting
- Default: 100 requests per minute per IP
- Token bucket algorithm with automatic refill
- Temporary IP blocking on repeated violations
- Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Retry-After header for blocked requests
- Automatic cleanup of inactive visitors

### CORS (Cross-Origin Resource Sharing)
- Configurable allowed origins
- Pre-compiled origin map for performance
- Credentials support
- Automatic localhost allowance for development
- Proper preflight (OPTIONS) request handling
- Vary header for caching

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS) - production only
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

### Request Tracking & Logging
- Unique request ID per request (UUID v4)
- Request ID propagated in response headers
- Comprehensive request logging with:
  - Status code with visual indicators (🟢🟡🔴)
  - Request latency
  - Response body size
  - Client IP and User-Agent
  - Slow request detection (>1 second)
- Distributed tracing support

### Recovery & Error Handling
- Automatic panic recovery
- Graceful error responses
- Request ID included in error responses
- Stack trace logging for debugging

---

## Monitoring & Observability

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T08:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy"
  }
}
```

### Version Information

```json
{
  "version": "1.0.0",
  "build_time": "2025-10-31T08:00:00Z",
  "git_commit": "abc123...",
  "go_version": "go1.21.0",
  "vendor": "Eclipse Softworks"
}
```

---

## Performance Optimization

- **Connection Pooling**: 25 max open/idle connections
- **Timeouts**: Read (10s), Write (30s), Idle (60s)
- **Graceful Shutdown**: 30s timeout for in-flight requests
- **Static Asset Caching**: Optimized file serving

---

## CI/CD

GitHub Actions workflow includes:
- Automated testing
- Build verification
- Swagger docs generation
- Artifact uploads

See `.github/workflows/ci.yml` for details.

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Add tests for new features
- Update Swagger annotations
- Run `go test ./...` before committing
- Follow existing code patterns

---

## Support

**Eclipse Softworks Support**
- Website: https://eclipse-softworks.com
- Email: support@eclipse-softworks.com
- Documentation: https://eclipse-softworks.com/support

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

Built with:
- [Gin Web Framework](https://gin-gonic.com/)
- [Swaggo](https://github.com/swaggo/swag)
- [golang-jwt](https://github.com/golang-jwt/jwt)
- [golang-migrate](https://github.com/golang-migrate/migrate)

---

<div align="center">
  <p><strong>Powered by Eclipse Softworks</strong></p>
  <p>Leading Software Development Company in South Africa</p>
  <p><a href="https://eclipse-softworks.com">eclipse-softworks.com</a></p>
</div>
