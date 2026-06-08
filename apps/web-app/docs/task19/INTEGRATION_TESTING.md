# Integration Testing Guide for Frontend

This document provides step-by-step instructions for testing the Axios client and JWT interceptor integration.

## Prerequisites

- Backend API running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Valid test credentials

## Test Scenarios

### Test 1: JWT Token Injection

**Objective**: Verify that the Axios request interceptor automatically attaches JWT tokens to the Authorization header.

**Steps**:
1. Start the frontend: `npm run dev`
2. Navigate to http://localhost:3000/login
3. Enter valid test credentials and click "Sign In"
4. Wait for redirect to dashboard
5. Open DevTools (F12 → Network tab)
6. Perform any action that makes an API call (navigate to a page)
7. Click on the network request
8. Check the "Headers" section
9. Look for the Authorization header

**Expected Result**:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Verification Checklist**:
- [ ] Authorization header exists
- [ ] Header value starts with "Bearer "
- [ ] Token is a valid JWT format (3 dot-separated parts)

---

### Test 2: 401 Unauthorized Handling

**Objective**: Verify that the response interceptor handles 401 errors by clearing tokens and redirecting to login.

**Steps**:
1. Login and navigate to dashboard
2. Open DevTools Console
3. Manually clear the access_token from localStorage:
   ```javascript
   localStorage.removeItem('access_token');
   ```
4. Try to navigate to a protected page or refresh the current page
5. Observe the redirect behavior

**Expected Result**:
- Page automatically redirects to /login
- No infinite redirect loops
- Console shows "Loading..." briefly during auth check

**Verification Checklist**:
- [ ] Automatic redirect to login occurs
- [ ] No infinite redirect loops
- [ ] No console errors (except expected 401)

---

### Test 3: 403 Forbidden Handling

**Objective**: Verify that 403 errors redirect to access-denied page.

**Steps**:
1. Login successfully
2. Try to access an endpoint that returns 403
3. Observe the redirect behavior

**Expected Result**:
- Page redirects to /access-denied
- Error message is displayed
- User can click "Back to Dashboard" or "Back Home"

**Verification Checklist**:
- [ ] Redirect to /access-denied occurs
- [ ] User can navigate back
- [ ] No console errors

---

### Test 4: Protected Routes Without Authentication

**Objective**: Verify that attempting to access protected routes without authentication redirects to login.

**Steps**:
1. Clear all storage: Open DevTools Console and run:
   ```javascript
   localStorage.clear();
   ```
2. Navigate directly to http://localhost:3000/dashboard
3. Observe the redirect behavior

**Expected Result**:
- Page shows "Loading..." briefly
- Page redirects to /login
- Login form is displayed

**Verification Checklist**:
- [ ] Redirect to login occurs
- [ ] Loading state is visible
- [ ] No immediate flash of protected content

---

### Test 5: Login Success Flow

**Objective**: Verify complete login flow including token storage and redirect.

**Steps**:
1. Navigate to http://localhost:3000/login
2. Enter valid credentials:
   - Email: user@example.com
   - Password: password123
3. Click "Sign In"
4. Observe the flow

**Expected Result**:
- "Signing in..." message appears
- After successful response:
  - Tokens stored in localStorage
  - User redirected to /dashboard
  - User information displayed

**Verification Checklist**:
- [ ] No error messages appear
- [ ] "Signing in..." state is shown
- [ ] Redirect to dashboard occurs
- [ ] User data is displayed

**Verify Token Storage**:
- Open DevTools → Application → LocalStorage
- Check for keys:
  - `access_token`: Should contain JWT
  - `refresh_token`: Should contain refresh token

---

### Test 6: Registration Success Flow

**Objective**: Verify user registration and automatic login.

**Steps**:
1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
3. Click "Create Account"
4. Observe the flow

**Expected Result**:
- Form validation passes
- "Creating account..." state appears
- User is automatically logged in
- Redirect to /dashboard occurs

**Verification Checklist**:
- [ ] No validation errors
- [ ] Account creation succeeds
- [ ] Automatic redirect to dashboard
- [ ] User email shown in dashboard

---

### Test 7: Token Refresh Scenario

**Objective**: Verify that expired tokens are properly handled via the refresh mechanism.

**Steps**:
1. Login successfully
2. Wait for token expiration (or manually manipulate expiration in devtools)
3. Try to access a protected endpoint
4. Observe the retry behavior

**Expected Result**:
- System attempts to refresh token
- If successful: Request retried with new token
- If failed: User redirected to login

**Verification Checklist**:
- [ ] Queue mechanism prevents multiple refresh attempts
- [ ] Original request is retried (not lost)
- [ ] Clean redirect on refresh failure

---

### Test 8: Concurrent Request Handling

**Objective**: Verify that multiple concurrent requests are handled correctly even if 401 occurs.

**Steps**:
1. Login successfully
2. Quickly trigger multiple API requests
3. Simulate 401 response for one request
4. Observe how other requests are handled

**Expected Result**:
- First 401 triggers refresh
- Other requests are queued
- All requests are retried after refresh completes
- No duplicate refresh attempts

**Verification Checklist**:
- [ ] Multiple requests don't cause multiple refresh attempts
- [ ] All requests eventually succeed
- [ ] Queue clears properly

---

### Test 9: Error Display on Login Failure

**Objective**: Verify that login errors are properly displayed to users.

**Steps**:
1. Navigate to /login
2. Enter invalid credentials:
   - Email: invalid@example.com
   - Password: wrongpassword
3. Click "Sign In"
4. Observe error handling

**Expected Result**:
- Error message appears in red box
- Form remains populated
- "Sign In" button becomes enabled again
- User can retry

**Verification Checklist**:
- [ ] Error message is displayed
- [ ] Form state is preserved
- [ ] User can retry without reloading

---

### Test 10: Logout Flow

**Objective**: Verify that logout properly clears tokens and redirects.

**Steps**:
1. Login and navigate to dashboard
2. Click "Logout" button
3. Observe the behavior

**Expected Result**:
- User is logged out
- Redirected to home page
- Tokens cleared from localStorage
- Login button appears in navigation

**Verification Checklist**:
- [ ] User is logged out
- [ ] Redirect to home occurs
- [ ] localStorage is cleared
- [ ] Navigation shows login option

---

## Automated Testing Checklist

### Unit Tests (Recommended to Add)

```typescript
// tests/utils/token.utils.test.ts
describe('tokenStorage', () => {
  it('should store and retrieve tokens', () => {
    const token = 'test-token';
    tokenStorage.setAccessToken(token);
    expect(tokenStorage.getAccessToken()).toBe(token);
  });

  it('should clear tokens', () => {
    tokenStorage.setAccessToken('test');
    tokenStorage.clearTokens();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});

describe('decodeToken', () => {
  it('should decode valid JWT', () => {
    const payload = decodeToken(validToken);
    expect(payload?.email).toBe('user@example.com');
  });

  it('should return null for invalid JWT', () => {
    expect(decodeToken('invalid')).toBeNull();
  });
});
```

### Integration Tests

```typescript
// tests/services/api.test.ts
describe('API Client Interceptors', () => {
  it('should inject JWT token in request', async () => {
    // Setup: Store token
    // Action: Make API call
    // Assert: Authorization header contains Bearer token
  });

  it('should redirect on 401', async () => {
    // Setup: Mock 401 response
    // Action: Make API call
    // Assert: Redirected to login
  });
});
```

---

## Common Issues and Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Authorization header not present | Token not in localStorage | Check token storage after login |
| Infinite redirect loop | isRefreshing flag stuck | Clear localStorage, restart |
| 401 on every request | Token expired or invalid | Login again, check token validity |
| CORS errors | Backend not configured | Check backend CORS settings |
| Page flashes during auth check | Loading state not shown | Verify ProtectedRoute component |
| Tokens stored but not used | Interceptor not running | Check Axios instance creation |

---

## Browser DevTools Tips

### Viewing Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Filter requests
4. Click on request to see headers
5. Look for Authorization header

### Inspecting localStorage

1. Open DevTools (F12)
2. Go to Application tab
3. Expand LocalStorage
4. Click on http://localhost:3000
5. View keys: `access_token`, `refresh_token`

### Console Debugging

```javascript
// Check current token
localStorage.getItem('access_token')

// Decode token
function decodeToken(token) {
  const parts = token.split('.');
  return JSON.parse(atob(parts[1]));
}

// Clear all storage
localStorage.clear()
```

---

## Performance Considerations

### Request Latency
- Measure time from click to response
- Should be < 1 second for auth endpoints
- Log slow requests in DevTools

### Token Refresh
- Should complete within 500ms
- Shouldn't block queued requests
- Test with slow network (DevTools throttling)

### Memory
- Monitor localStorage size
- Check for token leaks
- Verify cleanup on logout

---

## Success Criteria

All tests are considered passing when:

- ✅ JWT tokens are automatically injected
- ✅ 401 errors redirect to login (no loops)
- ✅ 403 errors redirect to access-denied
- ✅ Protected routes require authentication
- ✅ Token refresh works correctly
- ✅ Logout clears all data
- ✅ Multiple requests handled concurrently
- ✅ No console errors (except expected 401)
- ✅ Performance is acceptable
- ✅ User experience is smooth

---

## Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [JWT.io](https://jwt.io/) - JWT Debugger
- [Next.js App Router](https://nextjs.org/docs/app)
- [TailwindCSS](https://tailwindcss.com/)
