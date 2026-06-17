# Running & Testing TicketBox Frontend (Next.js)

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3001`
- Git

### Step 1: Install Dependencies

```bash
cd apps/web-app
npm install
```

### Step 2: Configure Environment (Optional)

```bash
# Linux/Mac
cp .env.example .env.local

# Windows
copy .env.example .env.local

# Check content (default is usually fine):
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

Expected output:

```
> web-app@0.1.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000
```

### Step 4: Open in Browser

- Navigate to: `http://localhost:3000`
- You should see the TicketBox home page

---

## 🧪 Running Tests

### Test 1: Manual Login Test (Basic)

**Objective**: Verify login flow and token storage

**Steps**:

1. On home page, click "Sign In" button
2. Navigate to `/login` (you should see login form)
3. Enter test credentials:
   ```
   Email: test@ticketbox.com
   Password: SecurePass123
   ```
4. Click "Sign In" button
5. Should redirect to dashboard

**Verify Success**:

- ✅ No error message appears
- ✅ Redirected to `/dashboard`
- ✅ User email displayed on dashboard
- ✅ "Logout" button visible

**Check localStorage**:

```javascript
// Open DevTools Console and run:
localStorage.getItem("access_token");
// Should return a JWT string starting with: eyJ0eXAi...
```

---

### Test 2: Verify JWT Injection (Network Test)

**Objective**: Confirm Authorization header is automatically added

**Steps**:

1. Login successfully (see Test 1)
2. Open DevTools with F12
3. Go to Network tab
4. Navigate to another page (e.g., click catalog link)
5. Look at the HTTP request in Network tab
6. Click on the request
7. Go to "Headers" section

**Verify Success**:

- ✅ Request shows header: `Authorization: Bearer eyJ0eXA...`
- ✅ Token value is present and correct
- ✅ All requests include this header

**Screenshot Example**:

```
Request Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
  Content-Type: application/json
  ...
```

---

### Test 3: 401 Error Handling

**Objective**: Verify automatic redirect when token is invalid

**Steps**:

1. Login successfully
2. Open DevTools Console (F12 → Console tab)
3. Clear the access token:
   ```javascript
   localStorage.removeItem("access_token");
   ```
4. Refresh the page (F5)
5. Try to navigate to dashboard

**Verify Success**:

- ✅ Page briefly shows "Loading..."
- ✅ Automatically redirects to `/login`
- ✅ No error message in console
- ✅ No infinite redirect loop

---

### Test 4: Protected Route Without Token

**Objective**: Verify unauthenticated users can't access protected pages

**Steps**:

1. Clear all storage:
   ```javascript
   localStorage.clear();
   ```
2. Close the browser completely
3. Reopen and go to: `http://localhost:3000/dashboard`
4. Observe behavior

**Verify Success**:

- ✅ Brief loading state appears
- ✅ Redirected to login page
- ✅ Login form displayed
- ✅ No page flash before redirect

---

### Test 5: Registration Flow

**Objective**: Verify new user can register

**Steps**:

1. On home page, click "Register" button
2. Fill in registration form:
   ```
   Full Name: John Doe
   Email: johndoe@example.com
   Password: SecurePass123!
   Confirm Password: SecurePass123!
   ```
3. Click "Create Account"
4. Observe redirect

**Verify Success**:

- ✅ Form validates password confirmation match
- ✅ Minimum 8 character requirement checked
- ✅ Redirected to dashboard after successful registration
- ✅ User email shown on dashboard

---

### Test 6: Logout Flow

**Objective**: Verify logout clears tokens and redirects

**Steps**:

1. Login successfully
2. On dashboard, click "Logout" button
3. Observe redirect behavior

**Verify Success**:

- ✅ Redirected to home page
- ✅ Navigation shows "Sign In" and "Register" buttons
- ✅ localStorage is cleared:
  ```javascript
  localStorage.getItem("access_token"); // Returns null
  localStorage.getItem("refresh_token"); // Returns null
  ```

---

### Test 7: Concurrent Requests During Token Refresh

**Objective**: Verify queue mechanism during token refresh

**Steps**:

1. Modify `src/services/api.ts` to add logging:
   ```typescript
   // Add to response interceptor
   console.log(
     "Response interceptor triggered for status:",
     error.response?.status,
   );
   ```
2. Open DevTools Console
3. Login and navigate quickly to multiple pages
4. Trigger 401 error by clearing token mid-request

**Verify Success**:

- ✅ Single token refresh attempt (not multiple)
- ✅ All requests queued during refresh
- ✅ All requests retried after refresh
- ✅ Console shows proper flow

---

### Test 8: Form Validation

**Objective**: Verify form validation and error messages

**Tests**:

**A. Invalid Login**:

1. Go to `/login`
2. Enter incorrect credentials
3. Click "Sign In"

Expected: Error message appears

**B. Registration - Mismatched Passwords**:

1. Go to `/register`
2. Password: `Test123456`
3. Confirm: `Different123`
4. Click "Create Account"

Expected: Error message: "Passwords do not match"

**C. Registration - Short Password**:

1. Go to `/register`
2. Password: `Test123`
3. Confirm: `Test123`
4. Click "Create Account"

Expected: Error message: "Password must be at least 8 characters"

---

## 📊 Testing Checklist

Run through this checklist to verify everything works:

```
SETUP:
  ☐ Node.js 18+ installed
  ☐ npm install completed
  ☐ Backend running on http://localhost:3001
  ☐ Frontend started with npm run dev

BASIC FUNCTIONALITY:
  ☐ Home page loads at http://localhost:3000
  ☐ Can navigate to /login
  ☐ Can navigate to /register
  ☐ Can navigate to /catalog

AUTHENTICATION:
  ☐ Login with valid credentials works
  ☐ Error message shown with invalid credentials
  ☐ Registration creates new account
  ☐ Logout clears tokens and redirects

PROTECTED ROUTES:
  ☐ /dashboard requires authentication
  ☐ Unauthenticated users redirected to /login
  ☐ Authenticated users can access /dashboard

API INTEGRATION:
  ☐ Authorization header present in requests
  ☐ Bearer token format correct (Bearer eyJ...)
  ☐ 401 errors handled (redirect to login)
  ☐ 403 errors handled (redirect to /access-denied)

STATE MANAGEMENT:
  ☐ User info displayed on dashboard
  ☐ User role shown correctly
  ☐ Permissions checked if present

STORAGE:
  ☐ Tokens stored in localStorage
  ☐ Tokens cleared on logout
  ☐ Tokens persist on page refresh
  ☐ Tokens cleared on 401 error
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🐛 Debugging Tips

### In Browser DevTools

**View Current Token**:

```javascript
// Console
localStorage.getItem("access_token");
```

**Decode Token to See Content**:

```javascript
function decodeToken(token) {
  const parts = token.split(".");
  return JSON.parse(atob(parts[1]));
}
const decoded = decodeToken(localStorage.getItem("access_token"));
console.log(decoded);
```

**Simulate 401 Error**:

```javascript
localStorage.removeItem("access_token");
// Next request will get 401
```

**Check All Requests**:

1. Open DevTools → Network tab
2. Check the "Authorization" header in request headers
3. Should show: `Authorization: Bearer eyJ...`

### Backend Not Running?

```bash
# In another terminal, start backend:
npm run start:api

# Should output:
# [Nest] 12345 - 05/31/2026, 10:00:00 AM   LOG [NestFactory] Nest application successfully started
# Server running on http://localhost:3001
```

### CORS Error?

**Error Message**:

```
Access to XMLHttpRequest at 'http://localhost:3001/api/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:

- Verify backend is running
- Check backend allows `http://localhost:3000` in CORS config
- Try adding to backend: `@UseCors()`

---

## 🧩 Testing Environment Setup

### Full Setup (Both Frontend + Backend)

**Terminal 1: Backend**

```bash
cd apps/backend-api
npm run start:api
# Wait for message: Server running on http://localhost:3001
```

**Terminal 2: Frontend**

```bash
cd apps/web-app
npm install
npm run dev
# Wait for message: ✓ Ready on http://localhost:3000
```

**Terminal 3: Testing**

```bash
# Run manual tests from previous section
# Or open browser to http://localhost:3000
```

---

## 📝 Test Scenarios from Documentation

For detailed test scenarios, see: `INTEGRATION_TESTING.md`

These include:

1. JWT Token Injection verification
2. 401 Unauthorized handling
3. 403 Forbidden handling
4. Protected routes without auth
5. Login success flow
6. Registration flow
7. Token refresh scenario
8. Concurrent requests handling
9. Error display on failures
10. Logout flow

---

## ✅ Automated Health Check

Run this script to verify setup:

```bash
# Check Node version
node --version          # Should be 18+

# Check npm version
npm --version           # Should be 7+

# Check dependencies
npm list                # Should show all packages

# Check TypeScript
npm run type-check      # Should have 0 errors

# Try building
npm run build           # Should complete without errors

# Check file structure
find src -type f -name "*.ts*" | wc -l  # Should show 14 files
```

---

## 🎓 Understanding Test Results

### Expected Behaviors

**Login Success**:

- No error message
- Redirect to `/dashboard`
- User info displayed
- localStorage has tokens

**Login Failure**:

- Red error message shown
- Form remains on page
- Can retry login
- No tokens stored

**Protected Route Access**:

- User with valid token → See dashboard
- User without token → Redirect to `/login`
- User with expired token → Auto-refresh or redirect

**API Requests**:

- All requests include Authorization header
- Token format: `Bearer <JWT_TOKEN>`
- Failed requests properly handled

---

## 🚀 Next Steps

1. **Run basic tests** (Test 1-3 above)
2. **Verify JWT injection** (Test 2)
3. **Test error handling** (Test 3-4)
4. **Complete checklist** (above)
5. **Review documentation** (see /docs/task19/)
6. **Prepare for Task #20** (API integration)

---

## 📚 Related Documentation

- `00_TASK19_OVERVIEW.md` - Task summary
- `INTEGRATION_TESTING.md` - 10 detailed test scenarios
- `GETTING_STARTED.md` - Setup guide
- `ARCHITECTURE.md` - Architecture details
- `README.md` (in apps/web-app) - Project README

---

## 💬 Quick Troubleshooting

| Issue                    | Solution                                                       |
| ------------------------ | -------------------------------------------------------------- |
| Port 3000 already in use | `lsof -i :3000` then kill process                              |
| Dependencies error       | Delete node_modules, run `npm install`                         |
| TypeScript errors        | Run `npm run type-check` to see details                        |
| API 404 errors           | Ensure backend running at http://localhost:3001                |
| Token not injecting      | Check browser console for errors, verify token in localStorage |
| Blank page after login   | Check browser console (F12) for errors                         |
| Build fails              | Run `npm run type-check` to identify issues                    |

---

**Happy Testing!** 🎉

Start with: `npm run dev`
