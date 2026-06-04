# Getting Started with TicketBox Frontend

## 🚀 First Time Setup

### Step 1: Navigate to Web App Directory
```bash
cd apps/web-app
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
copy .env.example .env.local          # Windows
# cp .env.example .env.local          # Linux/Mac

# Edit .env.local (optional)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Step 4: Verify Setup
```bash
npm run type-check    # Check TypeScript
```

---

## 📱 Running the Application

### Development Mode
```bash
npm run dev

# Application will start on:
# ✓ Local:        http://localhost:3000
# ✓ Network:      http://<your-ip>:3000
```

### Production Build
```bash
npm run build        # Compile and build
npm run start        # Start production server
```

---

## 🧪 Testing Authentication

### Manual Test - Full Login Flow

**1. Start Both Services (in separate terminals)**
```bash
# Terminal 1: Backend
npm run start:api

# Terminal 2: Frontend
npm run start:web
```

**2. Open Browser**
- Navigate to: `http://localhost:3000`
- You should see the TicketBox Home page

**3. Test Login**
- Click "Sign In" → Go to `/login`
- Enter test credentials:
  ```
  Email: test@ticketbox.com
  Password: SecurePass123
  ```
- Click "Sign In" button
- Should redirect to `/dashboard` if credentials are valid

**4. Verify JWT Injection**
- Open DevTools (F12)
- Go to Network tab
- Make any request (or navigate to a page)
- Click on the request
- Go to Headers section
- Look for: `Authorization: Bearer eyJ0eXA...`

**5. Test Logout**
- On dashboard, click "Logout" button
- Should redirect to home page
- Navigation should show "Sign In" button again

---

## 🔌 Available Commands

### Development
```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint and fix issues
npm run type-check       # TypeScript type checking
```

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Home page /
│   ├── login/          # Login at /login
│   ├── register/       # Register at /register
│   ├── catalog/        # Catalog at /catalog
│   ├── dashboard/      # Protected dashboard
│   └── access-denied/  # 403 Error page
│
├── services/           # API integration
│   ├── api.ts         # Axios client
│   └── auth.service.ts # Auth methods
│
├── hooks/              # React hooks
│   └── useAuth.ts     # Auth state
│
├── components/         # Reusable components
│   └── ProtectedRoute.tsx
│
├── utils/              # Utilities
│   ├── token.utils.ts  # JWT management
│   └── error.utils.ts  # Error helpers
│
├── types/              # TypeScript types
│   └── auth.types.ts
│
└── styles/             # CSS
    └── globals.css
```

---

## 🔐 Authentication

### How It Works

1. **User logs in** → Form submission
2. **Credentials sent** → Axios POST /auth/login
3. **Backend validates** → Returns JWT tokens
4. **Tokens stored** → localStorage
5. **Redirect** → Dashboard with redirect component
6. **Future requests** → Interceptor adds Authorization header

### Token Storage
```javascript
// Stored in localStorage as:
access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
refresh_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### Debugging in Console
```javascript
// Check current token
localStorage.getItem('access_token')

// Decode token
function decodeToken(token) {
  const parts = token.split('.');
  return JSON.parse(atob(parts[1]));
}

// Clear all tokens
localStorage.clear()
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
```
Access to XMLHttpRequest at 'http://localhost:3001/api/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:
- Ensure backend is running
- Check backend CORS settings
- Verify API_BASE_URL matches backend port

### Issue: Token Not Injected in Headers
```
Network tab shows request without Authorization header
```

**Solution**:
```javascript
// Check token in localStorage
localStorage.getItem('access_token')  // Should return JWT string

// Check if token is valid
const token = localStorage.getItem('access_token');
if (!token) console.log("No token found!");
```

### Issue: Infinite Redirect Loop
```
Page keeps redirecting to /login
```

**Solution**:
```javascript
// Clear localStorage
localStorage.clear()

// Restart development server
# Ctrl+C in terminal
npm run dev
```

### Issue: Page Blank After Login
```
Redirected but nothing shows
```

**Solution**:
- Check browser console for errors (F12)
- Check that backend API is running
- Verify backend response format

---

## 📊 Health Check

Run this to verify everything is set up:

```bash
# 1. Check Node version
node --version              # Should be 18+

# 2. Check dependencies
npm list                    # Should show all packages

# 3. Type check
npm run type-check          # Should have 0 errors

# 4. Build check
npm run build               # Should complete successfully

# 5. Start dev
npm run dev                 # Should start on port 3000
```

---

## 🌍 Environment Variables

### .env.local (Development)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### .env.production (Production)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.ticketbox.com/api
NEXT_PUBLIC_APP_URL=https://ticketbox.com
```

---

## 📚 Documentation

All documentation files are in the root of `apps/web-app/`:

```
README.md                      # Project overview
IMPLEMENTATION_COMPLETE.md    # Setup & usage guide
INTEGRATION_TESTING.md        # Testing scenarios
ARCHITECTURE.md               # Architecture diagrams
USER_FLOWS.md                 # User flow diagrams
TASK19_COMPLETION_CHECKLIST.md # Requirements checklist
TASK19_SUMMARY.md             # Executive summary
GETTING_STARTED.md            # This file
```

---

## 🔗 Useful Links

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Axios Docs**: https://axios-http.com
- **JWT Debugger**: https://jwt.io

---

## 💡 Tips & Tricks

### Quick Development Workflow
```bash
# Terminal 1: Start backend
npm run start:api

# Terminal 2: Start frontend with hot reload
npm run dev

# Code changes auto-refresh in browser
# Edit src/app/page.tsx → See changes instantly
```

### Debugging API Requests
```javascript
// In src/services/api.ts, log all requests:
apiClient.interceptors.request.use((config) => {
  console.log('Request:', config.url, config.method);
  return config;
});

// Log all responses:
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  }
);
```

### ViewToken Details
```javascript
// In browser console:
const token = localStorage.getItem('access_token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log(decoded);  // See user info, expiration, etc.
```

### Simulate 401 Error
```javascript
// In browser console - clear token to trigger 401:
localStorage.removeItem('access_token');

// Make any request - should trigger refresh flow
// Check Network tab to see redirect to /login
```

---

## 🚨 Before Starting Development

Make sure you have:

- ✅ Node.js 18+ installed
- ✅ Backend API running on http://localhost:3001
- ✅ Dependencies installed (`npm install`)
- ✅ TypeScript check passing (`npm run type-check`)
- ✅ Environment file configured (`.env.local`)

---

## ❓ Need Help?

1. **Check the relevant documentation file**
   - Setup: `README.md`
   - Testing: `INTEGRATION_TESTING.md`
   - Architecture: `ARCHITECTURE.md`

2. **Look at the inline code comments**
   - Each file has comments explaining the purpose

3. **Review error messages in browser console**
   - Open DevTools (F12)
   - Check Console tab for errors

4. **Verify backend is running**
   - Backend should be at http://localhost:3001
   - Check `/api/health` endpoint if available

---

## 🎉 Success Indicators

You know everything is working when:

- ✅ Frontend loads at http://localhost:3000
- ✅ Can navigate to http://localhost:3000/login
- ✅ Can login with valid credentials
- ✅ Redirected to /dashboard after login
- ✅ Authorization header shows in Network tab
- ✅ Logout clears tokens and redirects
- ✅ No errors in browser console

---

**Ready to code!** 🚀

Start with: `npm run dev`
