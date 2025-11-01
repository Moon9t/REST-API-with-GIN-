# EventHub API Documentation

This document provides comprehensive information about using the EventHub REST API.

## Base URL

```
Production: https://go-api.eclipse-softworks.com
Development: http://localhost:8080
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). Include the token in the Authorization header of your requests.

### Header Format

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Tokens are valid for 24 hours after issuance.

## Authentication Endpoints

### Register New User

Create a new user account and receive an authentication token.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-11-01T12:00:00Z"
  }
}
```

**Validation Rules:**

- Name: minimum 2 characters
- Email: valid email format, must be unique
- Password: minimum 8 characters

### Login Existing User

Authenticate with existing credentials.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid email or password format
- `401 Unauthorized`: Incorrect credentials

## Events API

### List All Events

Retrieve paginated list of all events. Public endpoint, no authentication required.

**Endpoint:** `GET /api/v1/events`

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10, maximum 100
- `search` (optional): Search term for filtering by title or description

**Example Request:**

```bash
GET /api/v1/events?page=2&limit=20&search=workshop
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 16,
      "title": "Go Programming Workshop",
      "description": "Introduction to Go programming language",
      "start_time": "2025-12-01T14:00:00Z",
      "end_time": "2025-12-01T16:00:00Z",
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 80,
    "total_pages": 4
  }
}
```

### Get Single Event

Retrieve details of a specific event. Public endpoint.

**Endpoint:** `GET /api/v1/events/:id`

**Response:** `200 OK`

```json
{
  "id": 1,
  "user_id": 16,
  "title": "Go Programming Workshop",
  "description": "Introduction to Go programming language",
  "start_time": "2025-12-01T14:00:00Z",
  "end_time": "2025-12-01T16:00:00Z",
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-01T10:00:00Z"
}
```

**Error Responses:**

- `404 Not Found`: Event does not exist

### Create Event

Create a new event. Requires authentication.

**Endpoint:** `POST /api/v1/events`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Docker Workshop",
  "description": "Learn containerization and Docker fundamentals",
  "start_time": "2025-12-15T10:00:00Z",
  "end_time": "2025-12-15T12:00:00Z"
}
```

**Validation Rules:**

- Title: required, 3-100 characters
- Description: required, 10-500 characters
- Start time: required, RFC3339 format
- End time: required, RFC3339 format, must be after start time

**Response:** `201 Created`

```json
{
  "id": 81,
  "user_id": 1,
  "title": "Docker Workshop",
  "description": "Learn containerization and Docker fundamentals",
  "start_time": "2025-12-15T10:00:00Z",
  "end_time": "2025-12-15T12:00:00Z",
  "created_at": "2025-11-01T12:30:00Z",
  "updated_at": "2025-11-01T12:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Missing or invalid token

### Update Event

Update an existing event. Requires authentication. Only the event organizer can update.

**Endpoint:** `PUT /api/v1/events/:id`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Advanced Docker Workshop",
  "description": "Deep dive into Docker and Kubernetes",
  "start_time": "2025-12-15T10:00:00Z",
  "end_time": "2025-12-15T14:00:00Z"
}
```

**Response:** `200 OK`

```json
{
  "id": 81,
  "user_id": 1,
  "title": "Advanced Docker Workshop",
  "description": "Deep dive into Docker and Kubernetes",
  "start_time": "2025-12-15T10:00:00Z",
  "end_time": "2025-12-15T14:00:00Z",
  "created_at": "2025-11-01T12:30:00Z",
  "updated_at": "2025-11-01T12:45:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the event organizer
- `404 Not Found`: Event does not exist

### Delete Event

Delete an event. Requires authentication. Only the event organizer can delete.

**Endpoint:** `DELETE /api/v1/events/:id`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the event organizer
- `404 Not Found`: Event does not exist

## Attendees API

### Join Event

Register the authenticated user as an attendee for an event.

**Endpoint:** `POST /api/v1/events/:id/attendees`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "event_id": 1,
  "user_id": 1,
  "status": "confirmed",
  "created_at": "2025-11-01T13:00:00Z",
  "updated_at": "2025-11-01T13:00:00Z"
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Event does not exist
- `409 Conflict`: User already registered for this event

### Get Event Attendees

Retrieve list of attendees for a specific event. Public endpoint.

**Endpoint:** `GET /api/v1/events/:id/attendees`

**Response:** `200 OK`

```json
{
  "event_id": 1,
  "attendees": [
    {
      "id": 16,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "status": "confirmed",
      "joined_at": "2025-11-01T10:30:00Z"
    },
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": "confirmed",
      "joined_at": "2025-11-01T13:00:00Z"
    }
  ],
  "total": 2
}
```

### Leave Event

Remove the authenticated user from event attendees.

**Endpoint:** `DELETE /api/v1/events/:id/attendees/:userId`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User can only remove themselves
- `404 Not Found`: Event or attendee record not found

### Get User's Events

Retrieve all events the authenticated user is attending.

**Endpoint:** `GET /api/v1/attendees/:id/events`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "user_id": 16,
    "title": "Go Programming Workshop",
    "description": "Introduction to Go programming",
    "start_time": "2025-12-01T14:00:00Z",
    "end_time": "2025-12-01T16:00:00Z",
    "status": "confirmed",
    "created_at": "2025-11-01T10:00:00Z"
  }
]
```

## Health and Utility Endpoints

### Health Check

Check API health status. Public endpoint.

**Endpoint:** `GET /health`

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T14:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy"
  }
}
```

### Version Information

Get API version details. Public endpoint.

**Endpoint:** `GET /version`

**Response:** `200 OK`

```json
{
  "version": "1.0.0",
  "build_time": "2025-11-01T00:00:00Z",
  "go_version": "go1.21"
}
```

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no response body
- `400 Bad Request`: Invalid request format or validation failed
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized for this action
- `404 Not Found`: Requested resource does not exist
- `409 Conflict`: Resource conflict (e.g., duplicate entry)
- `500 Internal Server Error`: Server error occurred

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- Limit: 100 requests per minute per IP address
- Headers included in response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

When rate limit is exceeded:

**Response:** `429 Too Many Requests`

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:

- `https://go-api.eclipse-softworks.com`
- `http://localhost:3000` (development)

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Code Examples

### JavaScript/TypeScript

```javascript
const API_URL = 'https://go-api.eclipse-softworks.com';

// Register user
async function register(name, email, password) {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Get events with pagination
async function getEvents(page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/api/v1/events?page=${page}&limit=${limit}`
  );
  return response.json();
}

// Create event (authenticated)
async function createEvent(eventData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  
  return response.json();
}

// Join event (authenticated)
async function joinEvent(eventId) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/api/v1/events/${eventId}/attendees`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to join event');
  }
  
  return response.json();
}
```

### Python

```python
import requests

API_URL = 'https://go-api.eclipse-softworks.com'

class EventHubClient:
    def __init__(self):
        self.token = None
    
    def register(self, name, email, password):
        response = requests.post(
            f'{API_URL}/api/v1/auth/register',
            json={'name': name, 'email': email, 'password': password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data['token']
        return data
    
    def get_events(self, page=1, limit=10):
        response = requests.get(
            f'{API_URL}/api/v1/events',
            params={'page': page, 'limit': limit}
        )
        response.raise_for_status()
        return response.json()
    
    def create_event(self, event_data):
        response = requests.post(
            f'{API_URL}/api/v1/events',
            json=event_data,
            headers={'Authorization': f'Bearer {self.token}'}
        )
        response.raise_for_status()
        return response.json()
    
    def join_event(self, event_id):
        response = requests.post(
            f'{API_URL}/api/v1/events/{event_id}/attendees',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        response.raise_for_status()
        return response.json()

# Usage
client = EventHubClient()
client.register('John Doe', 'john@example.com', 'password123')
events = client.get_events(page=1, limit=20)
```

### cURL

```bash
# Register
curl -X POST https://go-api.eclipse-softworks.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST https://go-api.eclipse-softworks.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get events
curl https://go-api.eclipse-softworks.com/api/v1/events?page=1&limit=10

# Create event (replace TOKEN with actual JWT)
curl -X POST https://go-api.eclipse-softworks.com/api/v1/events \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Workshop",
    "description":"Learn something new",
    "start_time":"2025-12-01T10:00:00Z",
    "end_time":"2025-12-01T12:00:00Z"
  }'

# Join event
curl -X POST https://go-api.eclipse-softworks.com/api/v1/events/1/attendees \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

## Interactive Documentation

For interactive API testing and exploration, visit the Swagger UI documentation:

```
https://go-api.eclipse-softworks.com/docs
```

The interactive documentation allows you to:

- Test all endpoints directly from your browser
- See request and response examples
- Understand parameter requirements
- Authorize with your JWT token

## Security Best Practices

When using the API:

1. Store JWT tokens securely (never in localStorage for sensitive apps)
2. Always use HTTPS in production
3. Implement token refresh logic before expiration
4. Validate and sanitize all user input
5. Handle errors gracefully
6. Log authentication failures for security monitoring
7. Use environment variables for API URLs and secrets

## Support

For API issues or questions:

- Check the interactive documentation at `/docs`
- Review error messages in API responses
- Contact the development team with specific error details
- Include request/response details when reporting issues

## Changelog

Version 1.0.0 (2025-11-01):

- Initial API release
- Authentication endpoints
- Event management
- Attendee registration
- Health monitoring
- Interactive documentation
