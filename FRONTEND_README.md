# EventHub Frontend

**Enterprise-grade React TypeScript application** for EventHub API

Powered by **Eclipse Softworks** | https://eclipse-softworks.com

---

## 🎨 Features

✅ **Modern UI/UX**
- Beautiful, responsive design with Tailwind CSS
- Smooth animations and transitions
- Professional Eclipse Softworks branding
- Mobile-first approach

✅ **Complete Functionality**
- 🔐 User authentication (login/register)
- 📅 Event browsing with pagination & search
- ➕ Create, edit, delete events
- 👥 Manage event attendees
- 🎫 View "My Events"

✅ **Technical Excellence**
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- JWT authentication with auto-refresh
- Protected routes
- Error handling & loading states

---

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)

From project root:
```bash
./run-full-stack.sh
```

This starts both backend (port 8080) and frontend (port 3000) automatically!

### Option 2: Frontend Only

```bash
cd frontend
npm install
npm start
```

**Note:** Ensure backend API is running on `http://localhost:8080`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Button.tsx       # Custom button component
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Registration page
│   │   ├── Events.tsx       # Events list with pagination
│   │   ├── EventDetail.tsx  # Single event view
│   │   └── MyEvents.tsx     # User's attended events
│   ├── services/            # API services
│   │   └── api.ts           # Axios setup & API calls
│   ├── App.tsx              # Main app with routing
│   └── index.tsx            # Entry point
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies
```

---

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:8080/api/v1`

### Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /events` - List events (with pagination & search)
- `GET /events/:id` - Get single event
- `POST /events` - Create event (auth required)
- `PUT /events/:id` - Update event (auth required)
- `DELETE /events/:id` - Delete event (auth required)
- `GET /events/:id/attendees` - List attendees
- `POST /events/:id/attendees` - Add attendee
- `DELETE /events/:id/attendees/:userId` - Remove attendee

### Authentication
JWT tokens are stored in `localStorage` and automatically included in requests via Axios interceptors.

---

## 🎨 Design System

### Colors
- **Primary**: Blue (`#0ea5e9`) - Eclipse Softworks brand color
- **Secondary**: Gray scale for text and backgrounds
- **Success**: Green for positive actions
- **Danger**: Red for destructive actions

### Typography
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes
- **Labels**: Medium weight, small sizes

### Components
- **Buttons**: 4 variants (primary, secondary, danger, ghost)
- **Inputs**: Focus rings, smooth transitions
- **Cards**: Subtle shadows, hover effects
- **Navigation**: Clean, accessible

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

### Environment Variables

Create `.env` in frontend directory:

```bash
# API Base URL (optional, defaults to localhost:8080)
REACT_APP_API_URL=http://localhost:8080/api/v1
```

---

## 📦 Dependencies

### Core
- `react` & `react-dom` - React library
- `typescript` - Type safety
- `react-router-dom` - Routing
- `axios` - HTTP client

### UI
- `tailwindcss` - Utility-first CSS
- `date-fns` - Date formatting
- `lucide-react` - Icons (if needed)

### Authentication
- `jwt-decode` - JWT token parsing

---

## 🎯 User Flows

### Registration Flow
1. User visits `/register`
2. Fills in name, email, password (min 8 chars)
3. Password confirmation validation
4. Auto-login after successful registration
5. Redirect to `/events`

### Login Flow
1. User visits `/login`
2. Enters email & password
3. JWT token stored in localStorage
4. Redirect to `/events`

### Event Browsing
1. User sees paginated list of events (12 per page)
2. Can search events by name, description, location
3. Click event card to view details
4. Pagination controls at bottom

### Create Event (Protected)
1. Click "Create Event" button
2. Fill event form (name, description, date, location)
3. Submit to create
4. Redirect to event detail page

---

## 🔒 Security

### Features
- JWT token validation
- Auto-logout on token expiration
- Protected routes (redirect to login)
- CORS headers handled by backend
- XSS protection via React

### Best Practices
- Tokens never exposed in URLs
- Sensitive data not logged
- HTTPS recommended for production
- Input validation on forms

---

## 🚢 Production Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/build/`.

### Deployment Options

#### 1. Static Hosting (Netlify, Vercel, etc.)
```bash
# Deploy build folder
npm run build
# Upload build/ directory
```

#### 2. Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Serve with Backend
Copy `frontend/build` contents to `backend/web/app`

---

## 🐛 Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on port 8080
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS settings in backend

### "401 Unauthorized"
- Token expired - user will be logged out automatically
- Try logging in again

### Blank page after build
- Check browser console for errors
- Verify routing configuration
- Ensure all assets loaded correctly

---

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components & hooks
- Keep components small and focused
- Add comments for complex logic

---

## 📞 Support

**Eclipse Softworks Support:**
- Email: support@eclipse-softworks.com
- Website: https://eclipse-softworks.com/support

---

<div align="center">
  <p><strong>Powered by Eclipse Softworks</strong></p>
  <p>Leading Software Development Company in South Africa</p>
  <p><a href="https://eclipse-softworks.com">eclipse-softworks.com</a></p>
</div>
