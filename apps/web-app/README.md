# TicketBox Web App

A modern React/Next.js frontend application for TicketBox ticket management system.

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client with automatic JWT injection
- **React Hooks**: State management with custom hooks

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── catalog/           # Concert catalog (public)
│   ├── dashboard/         # Dashboard (protected)
│   └── access-denied/     # Access denied page
├── components/            # Reusable React components
│   └── ProtectedRoute.tsx
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── services/              # API service layer
│   ├── api.ts            # Axios client with interceptors
│   └── auth.service.ts   # Authentication service
├── types/                 # TypeScript type definitions
│   └── auth.types.ts
├── utils/                 # Utility functions
│   └── token.utils.ts    # JWT token utilities
└── styles/                # CSS files
    └── globals.css       # Global TailwindCSS
```

## Features

### Authentication
- ✅ JWT-based authentication
- ✅ Automatic token injection via Axios interceptors
- ✅ Token refresh mechanism
- ✅ Login/Registration pages
- ✅ Protected routes with automatic redirect

### Routing
- **Public Routes**: Home, Catalog, Register, Login
- **Protected Routes**: Dashboard with automatic auth checks
- **Access Control**: 403 Forbidden handling

### API Integration
- **Axios Client**: Centralized HTTP client with configurable base URL
- **Request Interceptors**: Automatic JWT token attachment
- **Response Interceptors**: 
  - 401 Unauthorized: Clear credentials and redirect to login
  - 403 Forbidden: Redirect to access-denied page
  - Token refresh queue management

### Security
- ✅ Token storage in localStorage
- ✅ Bearer token authentication
- ✅ Automatic 401/403 error handling
- ✅ Protected route guards
- ✅ Prevention of redirect loops

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Update NEXT_PUBLIC_API_BASE_URL in .env.local
# Default: http://localhost:3001/api
```

### Development

```bash
# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## API Contract

### Auth Endpoints

**Login**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER"
  }
}
```

**Register**
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "full_name": "John Doe"
}

Response: Same as Login
```

## Integration Testing

### Test 1: Token Injection
1. Start frontend: `npm run dev`
2. Go to http://localhost:3000/login
3. Login with valid credentials
4. Open browser DevTools → Network tab
5. Navigate to protected route
6. Verify Authorization header contains `Bearer <token>`

### Test 2: 401 Error Handling
1. Login and get token
2. Manually clear token from localStorage in DevTools
3. Refresh page or navigate to protected route
4. Should automatically redirect to /login

### Test 3: Protected Routes
1. Without token: Navigate to /dashboard → Should redirect to /login
2. With token: Navigate to /dashboard → Should display dashboard

## Troubleshooting

### CORS Issues
- Ensure backend API is running on the configured base URL
- Backend should allow requests from frontend origin

### Token Not Being Injected
- Check `tokenStorage.getAccessToken()` returns a value
- Verify Authorization header in DevTools Network tab
- Check localStorage for access_token key

### Infinite Redirect Loop
- Check isRefreshing flag in interceptor
- Verify refresh token exists before attempting refresh
- Clear localStorage if stuck: `localStorage.clear()`

## Future Enhancements
- [ ] OAuth2 integration
- [ ] Multi-language support
- [ ] Advanced error boundaries
- [ ] API request retry logic
- [ ] Comprehensive e2e tests
