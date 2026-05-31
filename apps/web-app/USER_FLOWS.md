# Frontend Application User Flows

## Authentication Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TicketBox Login Page                            │
│                          (/)                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    ╔══════════════════════╗                         │
│                    ║   TICKETBOX          ║                         │
│                    ╚══════════════════════╝                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Email: [________________________]                            │  │
│  │  Password: [________________________]                         │  │
│  │                                                              │  │
│  │  [           Sign In           ]                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Don't have an account? Register here                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    Form submitted with credentials
                              │
                              ▼
                    Axios Request (POST /auth/login)
                              │
                    ┌─────────────────────────────┐
                    │  REQUEST INTERCEPTOR        │
                    │  - Get token from localStorage
                    │  - Check: No token yet     │
                    │  - Continue without header │
                    └─────────────────────────────┘
                              │
                              ▼
                    Backend validates credentials
                              │
                    ┌─────────────────────────────┐
                    │  RESPONSE SUCCESS (200)     │
                    │  {                          │
                    │    access_token: "jwt...",  │
                    │    refresh_token: "jwt...", │
                    │    user: {...}              │
                    │  }                          │
                    └─────────────────────────────┘
                              │
                              ▼
                    tokenStorage.setTokens()
                    localStorage:
                      - access_token = "jwt..."
                      - refresh_token = "jwt..."
                              │
                              ▼
                    router.push('/dashboard')
                              │
                              ▼
        ┌─────────────────────────────────────────────────────────┐
        │              TicketBox Dashboard Page                  │
        │                  (/dashboard)                          │
        ├─────────────────────────────────────────────────────────┤
        │                                                         │
        │ TICKETBOX              Welcome, user@email.com [✕]    │
        │                                                         │
        │ Dashboard                                              │
        │                                                         │
        │ ┌──────────────────┐ ┌──────────────────┐             │
        │ │   My Tickets     │ │   My Orders      │             │
        │ │ View and manage  │ │ Track your...    │             │
        │ │ [View Tickets]   │ │ [View Orders]    │             │
        │ └──────────────────┘ └──────────────────┘             │
        │                                                         │
        │ ┌──────────────────┐ ┌──────────────────┐             │
        │ │ Account Settings │ │                  │             │
        │ │ Manage profile   │ │                  │             │
        │ │ [Settings]       │ │                  │             │
        │ └──────────────────┘ └──────────────────┘             │
        │                                                         │
        └─────────────────────────────────────────────────────────┘
```

## Protected Route Access Flow

```
User navigates to /dashboard
            │
            ▼
┌─────────────────────────────────────────────┐
│   ProtectedRoute Component Mounts            │
│   - Load useAuth hook                        │
│   - Show "Loading..." initially              │
└─────────────────────────────────────────────┘
            │
            ▼
    useAuth Hook Executes:
    1. useEffect on mount
    2. Get token from localStorage
    3. Check token expiration
    4. Decode token payload
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
Token Valid?    Token Invalid/Missing?
    │               │
    YES             NO
    │               │
    ▼               ▼
Set auth state: isAuthenticated = true
    │
    └──────────────────┐
                       ▼
        ProtectedRoute: condition check
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
          TRUE               FALSE
            │                 │
            ▼                 ▼
    Render children     router.push('/login')
    (Render Dashboard)
```

## API Request with JWT Token

```
Component Action (e.g., Dashboard loads)
            │
            ▼
    authService.getConcerts()
            │
            ▼
    apiClient.get('/concerts')
            │
            ▼
┌─────────────────────────────────────────┐
│   REQUEST INTERCEPTOR                    │
│   1. tokenStorage.getAccessToken()      │
│      → Returns: "eyJ0eXAi..."           │
│                                         │
│   2. Add Authentication Header:          │
│      config.headers.Authorization =     │
│        "Bearer eyJ0eXAi..."             │
│                                         │
│   3. Return modified config              │
└─────────────────────────────────────────┘
            │
            ▼
    HTTP GET /api/concerts
    Headers:
      - Content-Type: application/json
      - Authorization: Bearer eyJ0eXAi...
            │
            ▼
    Backend receives request
            │
    ┌───────┴───────────┐
    │                   │
    ▼                   ▼
Valid Token?        Invalid Token?
    │                 │
    YES               NO
    │                 │
    ▼                 ▼
Process        Response: 401
request
    │
    ▼
┌─────────────────────────┐
│  Response: 200 OK       │
│  [  Concert Data  ]     │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│   RESPONSE INTERCEPTOR                   │
│   1. Check status code: 200              │
│   2. Status is 2xx (success)             │
│   3. Return response data directly       │
└─────────────────────────────────────────┘
    │
    ▼
Promise resolves in authService
    │
    ▼
Component receives data
    │
    ▼
Update state & render
    │
    ▼
Display concerts list
```

## 401 Error Handling Flow

```
Old Token in localStorage (expired/invalid)
            │
            ▼
Component tries to access protected resource
    apiClient.get('/user-profile')
            │
            ▼
REQUEST INTERCEPTOR injects old token
    Authorization: Bearer <OLD_EXPIRED_TOKEN>
            │
            ▼
Backend validates token → INVALID
    Response: 401 Unauthorized
            │
            ▼
┌────────────────────────────────────────┐
│   RESPONSE INTERCEPTOR (401 Handler)   │
│                                        │
│   1. Check: status === 401            │
│   2. isRefreshing = true              │
│   3. Queue current request             │
│   4. failedQueue = [current_request]  │
└────────────────────────────────────────┘
            │
            ▼
    Attempt Token Refresh:
    POST /auth/refresh-token
    Body: { refresh_token: "..." }
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
Refresh   Refresh
Success   Fails
    │       │
    │       └─────────────────┐
    │                         │
    ▼                         ▼
New tokens            tokenStorage.clearTokens()
returned
    │                 window.location.href = '/login'
    ▼
tokenStorage.setAccessToken(new_token)
    │
    ▼
isRefreshing = false
processQueue() → Retry queued requests
    │
    ▼
Original request: /user-profile
with NEW token:
Authorization: Bearer <NEW_TOKEN>
    │
    ▼
Backend: NEW token valid ✓
    │
    ▼
Response: 200 OK + data
    │
    ▼
Component receives data
Application continues seamlessly
```

## Logout Flow

```
User clicks [Logout] Button
            │
            ▼
handleLogout() triggered
            │
            ▼
authService.logout()
    │
    ├─ tokenStorage.clearTokens()
    │   ├─ localStorage.removeItem('access_token')
    │   └─ localStorage.removeItem('refresh_token')
    │
    └─ useAuth.logout()
        ├─ setIsAuthenticated(false)
        └─ setUser(null)
            │
            ▼
    router.push('/')
            │
            ▼
Redirect to Home Page
            │
            ▼
┌────────────────────────────┐
│   Home Page / Login View   │
├────────────────────────────┤
│                            │
│ Welcome to TicketBox       │
│                            │
│ [Browse Concerts]          │
│ [Sign In]  [Register]      │
│                            │
└────────────────────────────┘
```

## Concurrent Requests During Token Refresh

```
User Action triggers 3 concurrent requests:
  1. GET /concerts
  2. GET /user-info
  3. GET /orders
            │
            ▼
All 3 reach API layer
REQUEST INTERCEPTOR adds token to each
All sent to backend with same token
            │
            ▼
Backend: Token validation
  Response 401 for all 3
            │
            ▼
RESPONSE INTERCEPTOR (Request 1 arrives first):
  ├─ Check: 401 error
  ├─ isRefreshing = true (global flag)
  ├─ Add Request 1 to failedQueue
  └─ Start token refresh
            │
RESPONSE INTERCEPTOR (Request 2 arrives):
  ├─ Check: 401 error
  ├─ isRefreshing = true (already true)
  ├─ Add Request 2 to failedQueue
  └─ Wait (don't start another refresh!)
            │
RESPONSE INTERCEPTOR (Request 3 arrives):
  ├─ Check: 401 error
  ├─ isRefreshing = true (still true)
  ├─ Add Request 3 to failedQueue
  └─ Wait
            │
            ▼
Token Refresh Completes Successfully:
  ├─ Get new token
  ├─ tokenStorage.setAccessToken(new_token)
  ├─ isRefreshing = false
  └─ processQueue() → Retry all 3
            │
            ▼
Retry All Queued Requests:
  1. GET /concerts (with NEW token) → 200 OK
  2. GET /user-info (with NEW token) → 200 OK
  3. GET /orders (with NEW token) → 200 OK
            │
            ▼
All 3 resolve successfully
Application continues
```

---

## Error States Display

### Login Error
```
┌──────────────────────────────────────┐
│         TicketBox Login              │
├──────────────────────────────────────┤
│                                      │
│ ┌────────────────────────────────┐  │
│ │ ✗ Invalid email or password    │  │
│ └────────────────────────────────┘  │
│                                      │
│ Email: [user@example.com________]   │
│ Password: [__________________]      │
│                                      │
│ [               Sign In          ]   │
│                                      │
│ Don't have an account? Register      │
│                                      │
└──────────────────────────────────────┘
```

### 403 Forbidden
```
┌────────────────────────────────────────┐
│          Access Denied                 │
├────────────────────────────────────────┤
│                                        │
│              403                       │
│         Access Denied                  │
│                                        │
│  You don't have permission to          │
│  access this resource.                 │
│                                        │
│  [     Back to Dashboard    ]         │
│                                        │
└────────────────────────────────────────┘
```

---

## Page Examples

### Home Page (Public)
```
┌────────────────────────────────────────────────┐
│ TicketBox         [Browse] [Sign In] [Register]│
├────────────────────────────────────────────────┤
│                                                │
│           Welcome to TicketBox                │
│                                                │
│    Your Premium Ticket Management Platform    │
│                                                │
│          [Browse Concerts]                    │
│                  or                           │
│          [Sign In]                            │
│                                                │
└────────────────────────────────────────────────┘
```

### Catalog Page (Public)
```
┌────────────────────────────────────────────────┐
│ TicketBox         [Dashboard]                 │
├────────────────────────────────────────────────┤
│                                                │
│  Browse Concerts                              │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │          │  │          │  │          │   │
│  │   ♪♪     │  │   ♪♪     │  │   ♪♪     │   │
│  │          │  │          │  │          │   │
│  ├──────────┤  ├──────────┤  ├──────────┤   │
│  │Cool Band │  │Jazz Night│  │Rock Icon │   │
│  │June 15   │  │June 22   │  │July 1    │   │
│  │[Details ]│  │[Details ]│  │[Details ]│   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                                │
│              [More concerts coming soon!]     │
│              Subscribe to updates             │
│                                                │
└────────────────────────────────────────────────┘
```

### Registration Page
```
┌─────────────────────────────────────────┐
│           TicketBox                     │
│        Create Account                   │
├─────────────────────────────────────────┤
│                                         │
│  Full Name: [_____________________]    │
│  Email: [_____________________]        │
│  Password: [_____________________]     │
│  Confirm Password: [________________]  │
│                                         │
│  [        Create Account       ]       │
│                                         │
│  Already have an account?              │
│  Sign in here                           │
│                                         │
└─────────────────────────────────────────┘
```

---

This visual guide shows how the TicketBox frontend application works in practice!
