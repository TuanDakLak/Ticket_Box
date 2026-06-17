# Frontend Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser / React App                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Next.js Pages / Components                          │
├─────────────────────────────────────────────────────────────────────────┤
│ • /login             → Login form                                       │
│ • /register          → Registration form                                │
│ • /catalog           → Concert listings (public)                        │
│ • /dashboard         → Protected dashboard (auth required)              │
│ • /access-denied     → 403 error page                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          useAuth Hook                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ • Manages authentication state                                          │
│ • Validates token on mount                                              │
│ • Provides user info & permissions                                      │
│ • Used by ProtectedRoute component                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Auth Service Layer                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • authService.login(email, password)                                    │
│ • authService.register(email, password, name)                           │
│ • authService.logout()                                                  │
│ • authService.refreshToken()                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Axios HTTP Client                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  REQUEST INTERCEPTOR:                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Get access token from localStorage                            │  │
│  │ 2. Attach as Authorization: Bearer <token>                       │  │
│  │ 3. Pass to API endpoint                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  RESPONSE INTERCEPTOR:                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 401 Response                                                      │  │
│  │  ├─→ Queue pending requests                                      │  │
│  │  ├─→ Attempt token refresh                                       │  │
│  │  ├─→ Retry all queued requests                                   │  │
│  │  └─→ If failed: Clear tokens → Redirect to /login               │  │
│  │                                                                   │  │
│  │ 403 Response                                                      │  │
│  │  └─→ Redirect to /access-denied                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Configuration:                                                          │
│  • baseURL: http://localhost:3001/api (configurable)                   │
│  • timeout: 30000ms                                                    │
│  • headers: Content-Type: application/json                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Token Management                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ localStorage:                                                           │
│  ├─ access_token      (JWT token)                                       │
│  └─ refresh_token     (JWT token)                                       │
│                                                                         │
│ Token Operations:                                                       │
│  ├─ tokenStorage.getAccessToken()   → Get current token                │
│  ├─ tokenStorage.setTokens()        → Store both tokens                │
│  ├─ tokenStorage.clearTokens()      → Remove all tokens                │
│  ├─ decodeToken(token)              → Parse JWT payload                │
│  └─ isTokenExpired(token)           → Check expiration                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Backend API Server                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • http://localhost:3001/api                                             │
│ • Validates JWT signature                                               │
│ • Returns 401 if token invalid/expired                                  │
│ • Returns 403 if insufficient permissions                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Login Flow

```
User Input (email, password)
         │
         ▼
   Login Form
         │
         ▼
   authService.login()
         │
         ▼
   axios.post('/auth/login')
         │
         ▼
   Backend validates & returns {access_token, refresh_token, user}
         │
         ▼
   tokenStorage.setTokens() → Store in localStorage
         │
         ▼
   router.push('/dashboard')
         │
         ▼
   useAuth validates token on mount
         │
         ▼
   Dashboard rendered with user info
```

### Protected Route Access

```
User navigates to /dashboard
         │
         ▼
   ProtectedRoute component mounts
         │
         ▼
   useAuth() checks token
         │─ Token valid? ─→ Render children
         │
         └─ No token? ─→ Redirect to /login
```

### API Request with Token

```
API Request (e.g., GET /concerts)
         │
         ▼
   Request Interceptor
         │
         ├─ tokenStorage.getAccessToken()
         ├─ Attach: Authorization: Bearer <token>
         └─ Allow request to proceed
         │
         ▼
   Backend receives request with Authorization header
         │
         ├─ Valid token? ─→ Process request
         └─ Invalid? ─→ 401 response
         │
         ▼
   Response Interceptor (if 401)
         │
         ├─ Queue other pending requests
         ├─ Attempt token refresh
         ├─ Retry original request
         └─ If refresh fails: Clear tokens & redirect to /login
```

### Logout Flow

```
User clicks Logout
         │
         ▼
   authService.logout()
         │
         ├─ tokenStorage.clearTokens()
         ├─ useAuth.logout()
         └─ router.push('/')
         │
         ▼
   localStorage cleared
         │
         ▼
   User redirected to home
         │
         ▼
   Next API request without Authorization header
```

---

## Component Hierarchy

```
RootLayout
    ├── ProtectedRoute (wrapper for sensitive pages)
    │   ├── useAuth (hook for auth state)
    │   └── [Protected Component]
    │
    ├── Page (Public)
    │   ├── Home
    │   ├── Login
    │   ├── Register
    │   └── Catalog
    │
    └── Dashboard (Protected)
        ├── Tickets (Protected)
        ├── Orders (Protected)
        └── Profile (Protected)
```

---

## Error Handling Flow

```
HTTP Request
         │
         ▼
   Response with status code
         │
    ┌────┴────┬──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
  2xx        401        403      4xx/5xx
  │          │          │         │
  │          ▼          ▼         ▼
  │     Refresh    Redirect   Error
  │     Token      to         message
  │     then       access-
  │     retry      denied
  │
  └────────────────────────────┬──────────┐
                                │          │
                        Success │          │ Fail
                                ▼          ▼
                            Resolve    Redirect
                            Promise    to login
```

---

## State Management

### useAuth Hook State

```typescript
{
  isAuthenticated: boolean,    // User has valid token
  isLoading: boolean,          // Auth check in progress
  user: {                      // Decoded JWT payload
    sub: string,               // User ID
    email: string,             // User email
    role: string,              // User role (USER, ADMIN, etc)
    permissions: string[],     // Array of permissions
  },
  logout: () => void,          // Clear auth state
  hasPermission: (permission) => boolean  // Check specific permission
}
```

### Token Storage

```
localStorage:
{
  access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  refresh_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## Interceptor Queue Mechanism

Prevents multiple token refresh attempts:

```
Request 1 ──────┐
Request 2 ──────┤  401 Error → Start refresh
Request 3 ──────┤
          failedQueue = [req1, req2, req3]
          isRefreshing = true
          │
          ▼
          Refresh token attempt
          │
    ┌─────┴─────┐
    │           │
 Success     Failure
    │           │
    ▼           ▼
 Process      Reject
 queue &      queue &
 retry all    redirect to
 requests     login
```

---

## Security Architecture

```
Frontend                          Backend
├─ localStorage                   ├─ Protected Route Endpoint
│  │                              │  │
│  ├─ access_token                │  ├─ GET /api/protected
│  └─ refresh_token               │  │  └─ Requires: Bearer token
│                                 │  │
├─ Axios Interceptor              │  ├─ Auth Validation
│  │                              │  │  ├─ Verify JWT signature
│  ├─ Add: Authorization header   │  │  ├─ Check expiration
│  │  Authorization: Bearer <...> │  │  └─ Check permissions
│  │  │                           │  │
│  │  ▼                           │  ├─ Response
│  │ [API Request]                │  │  ├─ 200: Success
│  │  │                           │  │  ├─ 401: Token invalid
│  │  └──────────────────────────→├─ │  └─ 403: Access denied
│  │                              │  │
│  ├─ Response Handler            │  │
│  │  ├─ 401: Refresh token       │  │
│  │  ├─ 403: Redirect            │  │
│  │  └─ 2xx: Continue            │  │
│  │                              │  │
│  └─ Prevent redirect loops      │  └─ Prevent token reuse
│                                 │
```

---

## Request/Response Lifecycle

```
1. User Action → State Update
2. Component renders with form
3. Form submission → authService.login()
4. ================== NETWORK LAYER ==================
5. Axios created with request interceptor
6. Request interceptor: Add Authorization header
7. HTTP POST request to /auth/login
8. Backend receives and validates
9. Backend responds with tokens or error
10. ================== RESPONSE LAYER ==================
11. Response interceptor checks status
12. If 401: Attempt refresh (if applicable)
13. If 403: Redirect to /access-denied
14. If 200: Return data
15. ================== APPLICATION LAYER ==================
16. Promise resolves in authService
17. tokenStorage.setTokens() stores JWT
18. Component state updates
19. router.push('/dashboard')
20. Dashboard page loads
21. useAuth validates token
22. Dashboard renders with user data
```

---

## Performance Optimization Notes

### Caching Strategy

- Tokens cached in localStorage
- Can add SWR/React Query for API response caching
- User data cached in state

### Bundle Size

- Current: ~200KB (gzipped)
- Can reduce with:
  - Tree-shaking unused code
  - Dynamic imports for routes
  - Image optimization

### Network

- Timeout: 30s
- Can implement retry logic for failed requests
- Can add request debouncing for repeated queries

---

## Testing Vectors

```
Happy Path:
  ✓ Login with valid credentials
  ✓ Token injected in requests
  ✓ Redirect to dashboard
  ✓ Logout clears tokens

Error Cases:
  ✓ Login with invalid credentials
  ✓ 401 response → Redirect to login
  ✓ 403 response → Redirect to access-denied
  ✓ Network error → Error message

Edge Cases:
  ✓ Token expiration mid-session
  ✓ Multiple concurrent requests with 401
  ✓ Rapid logout and login
  ✓ Token refresh failure
  ✓ Access token without refresh token
```

---

This architecture ensures:

- **Security**: Tokens properly injected and validated
- **Reliability**: Error handling prevents cascading failures
- **User Experience**: Automatic redirects and error messages
- **Scalability**: Modular structure allows easy expansion
