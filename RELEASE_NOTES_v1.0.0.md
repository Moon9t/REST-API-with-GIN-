# EventHub v1.0.0 Release Notes

**Release Date:** November 1, 2025

## Overview

EventHub v1.0.0 is a production-ready REST API for event management built with Go and the Gin framework. This release includes a complete backend API, React frontend, automated CI/CD deployment, and HTTPS configuration for secure production hosting.

## Features

### Core API

#### Authentication
- User registration with email validation
- Secure login with JWT token generation
- Password hashing using bcrypt
- Token-based authentication for protected endpoints
- 24-hour token expiration

#### Event Management
- Create, read, update, and delete events
- Pagination support (configurable page size, max 100 items)
- Search functionality (filter by title and description)
- Event validation (title, description, dates)
- Owner-only modification permissions

#### Attendee Management
- Join and leave events
- View event attendees list
- Attendee status tracking (confirmed)
- Duplicate registration prevention
- Self-removal capability

#### API Documentation
- Interactive Swagger UI at `/docs`
- Complete endpoint documentation
- Request/response examples
- Authentication flow documentation

### Infrastructure

#### Database
- SQLite database with automatic migrations
- Schema versioning and migration management
- Foreign key constraints
- Automatic timestamp tracking (created_at, updated_at)

#### Security
- HTTPS with Let's Encrypt SSL certificate
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Secure password storage
- Rate limiting (100 requests/minute)

#### Deployment
- Automated CI/CD via GitHub Actions
- Systemd service management
- Automatic backup system (retains last 5 backups)
- Zero-downtime deployment process
- Health check verification
- Rollback capability

#### Monitoring
- Health check endpoint with database status
- Version information endpoint
- Systemd integration for logging
- Service status monitoring

### Frontend

#### React Application
- Modern responsive UI
- Event browsing and search
- User authentication
- Event creation and management
- Attendee registration
- Offline support with localStorage queueing
- Automatic sync when connection restored

## Technical Specifications

### Backend
- **Language:** Go 1.21
- **Framework:** Gin Web Framework
- **Database:** SQLite with golang-migrate
- **Authentication:** JWT tokens
- **Password Hashing:** bcrypt

### Frontend
- **Framework:** React 18
- **Build Tool:** Create React App with craco
- **HTTP Client:** Axios
- **Styling:** CSS with responsive design

### Infrastructure
- **Platform:** AWS EC2 (Amazon Linux 2023)
- **Web Server:** Nginx (reverse proxy)
- **SSL:** Let's Encrypt with auto-renewal
- **Service Manager:** systemd
- **Domain:** go-api.eclipse-softworks.com

## API Endpoints

### Public Endpoints

```
GET  /health                    - Health check
GET  /version                   - Version information
GET  /api/v1/events             - List all events (paginated)
GET  /api/v1/events/:id         - Get single event
GET  /api/v1/events/:id/attendees - List event attendees
POST /api/v1/auth/register      - Register new user
POST /api/v1/auth/login         - Login user
```

### Protected Endpoints (Require Authentication)

```
POST   /api/v1/events                      - Create event
PUT    /api/v1/events/:id                  - Update event (owner only)
DELETE /api/v1/events/:id                  - Delete event (owner only)
POST   /api/v1/events/:id/attendees        - Join event
DELETE /api/v1/events/:id/attendees/:userId - Leave event
GET    /api/v1/attendees/:id/events        - Get user's events
```

## Deployment

### Automated Deployment

The project includes automated CI/CD via GitHub Actions:

1. Push to main branch triggers deployment
2. Backend and frontend are built in parallel
3. Deployment package is created
4. Package is uploaded to EC2 via SSH
5. Deployment script runs automatically
6. Health checks verify successful deployment

### Manual Deployment

For manual deployments or staging environments:

```bash
# Build locally
./scripts/build.sh

# Deploy to server
./scripts/deploy.sh
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Configuration

### Environment Variables

```bash
DB_PATH=/opt/eventhub/data.db
JWT_SECRET=your-secure-secret-key
PORT=8080
GIN_MODE=release
ALLOWED_ORIGINS=https://go-api.eclipse-softworks.com
```

### GitHub Secrets (for CI/CD)

```
EC2_SSH_KEY    - SSH private key for EC2 access
EC2_USER       - SSH username (ec2-user)
EC2_HOST       - EC2 instance IP or hostname
API_URL        - Frontend API URL (optional)
```

See `GITHUB_SECRETS_SETUP.md` for configuration instructions.

## Production Setup

### Current Deployment

- **API URL:** https://go-api.eclipse-softworks.com
- **Server:** AWS EC2 (3.138.32.230)
- **SSL Certificate:** Let's Encrypt (auto-renewing)
- **Database:** SQLite with 80+ seeded events
- **Status:** Active and healthy

### Performance

- Response time: < 10ms for most endpoints
- Database queries: Optimized with proper indexing
- Connection pooling: Configured for concurrent requests
- Resource usage: Minimal (suitable for t2.micro instances)

## Testing

All tests passing:
- Unit tests for API endpoints
- Integration tests for database operations
- Authentication flow tests
- Authorization tests (owner-only operations)
- Error handling tests

Run tests:
```bash
go test ./cmd/api -v
```

## Documentation

Comprehensive documentation included:

- `README.md` - Project overview and quick start
- `API_USAGE.md` - Complete API reference with examples
- `DEPLOYMENT_GUIDE.md` - Deployment instructions and troubleshooting
- `GITHUB_SECRETS_SETUP.md` - CI/CD configuration guide
- `/docs` endpoint - Interactive Swagger documentation

## Breaking Changes

This is the first stable release. Future versions will maintain backward compatibility where possible.

## Known Issues

None reported for v1.0.0.

## Upgrade Instructions

This is the initial release. For future upgrades:

1. Backup current deployment (automatic during deployment)
2. Push new code to main branch
3. CI/CD handles deployment automatically
4. Rollback available if needed

## Contributors

Developed by Eclipse Softworks.

## License

MIT License - see LICENSE file for details.

## Support

- API Documentation: https://go-api.eclipse-softworks.com/docs
- GitHub Issues: https://github.com/Moon9t/REST-API-with-GIN-/issues
- Email: support@eclipse-softworks.com

## What's Next

Planned features for v1.1.0:
- Event categories and tags
- Advanced search filters
- Email notifications
- User profiles
- Event capacity limits
- Waitlist functionality

## Acknowledgments

Built with:
- Go and Gin framework
- React and Create React App
- GitHub Actions
- AWS EC2
- Let's Encrypt
- Swagger/OpenAPI

---

**Full Changelog:** https://github.com/Moon9t/REST-API-with-GIN-/commits/v1.0.0
