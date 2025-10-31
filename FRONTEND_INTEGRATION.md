# Frontend Integration - Organizer & User Role Detection

## Overview
Successfully integrated the frontend with the backend API, implementing role-based access control to differentiate between event organizers, admin users, and regular attendees.

## Implementation Details

### Backend Changes

#### 1. Enhanced Login Response
Updated `/api/v1/auth/login` endpoint to return user data along with the JWT token:

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 13,
    "email": "admin@eventhub.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

#### 2. New Endpoint: `/api/v1/auth/me`
Created authenticated endpoint to fetch current user information:
- **Method:** GET
- **Auth:** Required (Bearer token)
- **Returns:** Complete user object with role information

#### 3. Updated Data Structures
- `loginResponse` struct now includes `User *database.User`
- Password field automatically stripped from responses

### Frontend Changes

#### 1. Updated AuthContext (`frontend/src/contexts/AuthContext.tsx`)
- Now retrieves user data directly from login response
- Stores complete user object including role in localStorage
- Maintains backward compatibility with token-based auth

#### 2. Enhanced EventDetail Page (`frontend/src/pages/EventDetail.tsx`)
Complete rewrite with the following features:

**Role Detection Logic:**
```typescript
const isOrganizer = event && user && event.user_id === user.id;
const isAdmin = user?.role === 'admin';
const canEdit = isOrganizer || isAdmin;
```

**Visual Indicators:**
- 👑 **Organizer Badge** - Shown to event creators
- 🛡️ **Admin Badge** - Shown to admin users
- ✓ **Attending Badge** - Shown to regular attendees

**Conditional UI Elements:**
- **Edit/Delete buttons** - Only visible to organizers and admins
- **Inline editing** - Edit event details directly on the page
- **Join/Leave buttons** - For non-organizers to manage attendance
- **Attendee list** - Shows all event attendees with organizer indicator

#### 3. Updated API Types (`frontend/src/services/api.ts`)
- Modified `User` interface to include optional `role` field
- Updated login API call to expect user data in response
- Added `/auth/me` API method
- Fixed Event interface to use lowercase `id` (matches backend response)

## User Accounts

### Admin User
- **Email:** `admin@eventhub.com`
- **Password:** `admin123456`
- **Role:** `admin`
- **Capabilities:**
  - Can edit/delete ANY event
  - Can manage all attendees
  - See admin badge on events

### Regular User
- **Email:** `user@eventhub.com`
- **Password:** `user123456`
- **Role:** `user`
- **Capabilities:**
  - Can create events (becomes organizer)
  - Can edit/delete OWN events only
  - Can join/leave other events as attendee

## Features

### For Event Organizers
1. **Full Control** over their events
   - Edit name, description, location, date
   - Delete events
   - See who's attending
   - Visible "Organizer" badge

2. **Inline Editing**
   - Click "Edit" button
   - Modify fields directly on the page
   - Save or cancel changes

### For Admin Users
- All organizer capabilities for ALL events
- Special admin badge  
- Override permissions for content moderation

### For Regular Users (Attendees)
- **Browse Events** - View all public events
- **Join Events** - One-click join button
- **Leave Events** - Remove themselves from events
- **View Attendees** - See who else is attending
- **Attending Badge** - Visual indicator on joined events

## UI/UX Enhancements

### Role-Based Badges
```
Organizer → Purple badge with crown emoji
Admin → Red badge with shield emoji
Attending → Green badge with checkmark
```

### Conditional Button Display
- Organizers/Admins see: **[Edit] [Delete]**
- Regular users see: **[Join Event]** or **[Leave Event]**
- Buttons automatically hide/show based on user role

### Attendee Section
- List of all event attendees
- Organizer clearly marked
- Shows name and email for each attendee
- Empty state message for events with no attendees

## API Endpoints Used

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/auth/login` | POST | No | Login and get user data |
| `/api/v1/auth/me` | GET | Yes | Fetch current user info |
| `/api/v1/events/:id` | GET | No | Get event details |
| `/api/v1/events/:id` | PUT | Yes | Update event (organizer/admin only) |
| `/api/v1/events/:id` | DELETE | Yes | Delete event (organizer/admin only) |
| `/api/v1/events/:id/attendees` | GET | Yes | List attendees |
| `/api/v1/events/:id/attendees` | POST | Yes | Join event |
| `/api/v1/events/:id/attendees/:userId` | DELETE | Yes | Leave event |

## Running the Application

### Backend
```bash
cd /home/thyrook/GolandProjects/REST-API\(with\ GIN\)
./tmp/api-new
```
- Runs on: `http://localhost:8080`
- Health check: `http://localhost:8080/health`

### Frontend
```bash
cd frontend
npm start
```
- Runs on: `http://localhost:3000`
- Auto-connects to backend API

## Testing the Integration

### 1. Login as Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@eventhub.com", "password": "admin123456"}'
```

### 2. Login as Regular User
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@eventhub.com", "password": "user123456"}'
```

### 3. Test Organizer Detection
1. Login with one account
2. Create an event
3. Note your user ID from the event response
4. Visit event detail page
5. Verify "Organizer" badge appears
6. Verify Edit/Delete buttons are visible
7. Logout and login with different account
8. Visit same event
9. Verify no organizer badge
10. Verify no Edit/Delete buttons
11. Verify Join button appears instead

## Security Considerations

✅ **Password never exposed** - Stripped from all API responses
✅ **JWT token validation** - All protected endpoints verify token
✅ **Role-based access control** - Server-side enforcement
✅ **Owner verification** - Backend checks event ownership before updates
✅ **CORS configured** - Only allows trusted origins

## Next Steps

Potential enhancements:
1. Add event capacity limits
2. Implement event categories/tags
3. Add email notifications for attendees
4. Create event calendar view
5. Add event search and filtering on frontend
6. Implement event comments/discussion
7. Add profile pages for users
8. Export attendee lists (CSV/PDF)

## Architecture Summary

```
Frontend (React + TypeScript)
    ↓
AuthContext (stores user + role)
    ↓
API Service Layer (axios)
    ↓
Backend REST API (Gin)
    ↓
JWT Middleware (validates token)
    ↓
Role Check (isOrganizer || isAdmin)
    ↓
Database (SQLite with user roles)
```

---

**Status:** ✅ Fully Implemented and Tested
**Last Updated:** 2025-10-31
