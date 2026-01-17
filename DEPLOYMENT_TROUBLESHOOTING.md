# Deployment Troubleshooting Guide

## Issues on Different Devices

### Problem: Site Not Loading on Some Devices

#### Symptoms:
- Blank page or loading spinner forever
- "Cannot connect to server" error
- Works on some devices but not others

#### Root Causes & Solutions:

**1. CORS Configuration Issues**
- **Cause:** Backend not allowing requests from frontend domain
- **Check:** Browser console (F12) shows "blocked by CORS policy" error
- **Fix:**
  ```
  On Render → Settings → Environment Variables:
  CLIENT_URL=https://your-app.vercel.app
  VERCEL_URL=https://your-app.vercel.app
  ```
  - Important: No trailing slash in URLs
  - Redeploy backend after adding variables

**2. Mixed Content (HTTP/HTTPS) Issues**
- **Cause:** Frontend (HTTPS) trying to call backend (HTTP)
- **Check:** Console shows "Mixed Content" error
- **Fix:** 
  - Ensure Render backend uses HTTPS (default for Render)
  - Verify VITE_API_URL starts with `https://`

**3. DNS/Network Issues**
- **Cause:** ISP or corporate firewall blocking requests
- **Test:** Try mobile data instead of WiFi
- **Fix:** Can't fix on your end, ask user to check firewall/VPN

**4. Browser Cache**
- **Cause:** Old cached version of app
- **Fix:** 
  - Clear browser cache
  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
  - Try incognito/private mode

---

### Problem: Registration Failed on Some Devices

#### Symptoms:
- "Registration failed" error
- Error: "Network Error" or "Request timeout"
- Works on desktop but not mobile (or vice versa)

#### Root Causes & Solutions:

**1. Timeout Issues (Slow Networks)**
- **Cause:** Request takes too long (30+ seconds)
- **Check:** Network tab in browser shows request pending for long time
- **Fix:** 
  - Already increased timeout to 30 seconds in latest code
  - Check Render isn't in cold start (first request after inactivity takes longer)
  - Wake up backend by visiting health endpoint first

**2. Invalid Data Format**
- **Cause:** Form data not being sent correctly
- **Check:** Network tab → Request payload is empty or malformed
- **Fix:** Check form validation in Register.jsx

**3. Database Connection Issues**
- **Cause:** MongoDB not connected
- **Check Render Logs:**
  ```
  Look for:
  ✅ "MongoDB connected successfully"
  ❌ "DB connection failed" or "MongoServerError"
  ```
- **Fix:** 
  - Verify MONGO_URI in Render environment variables
  - Check MongoDB Atlas → Network Access → Allow 0.0.0.0/0
  - Check MongoDB Atlas → Database Access → User has readWrite permissions

**4. JWT Secret Not Set**
- **Cause:** Can't generate authentication tokens
- **Check:** Render logs show "JWT_SECRET is not defined"
- **Fix:** Add JWT_SECRET to Render environment variables

**5. Email Already Exists**
- **Cause:** User trying to register with existing email
- **Check:** Console shows "User already exists"
- **Fix:** User should login or use different email

---

## Diagnostic Checklist

### Step 1: Verify Backend is Running
```bash
curl https://your-backend-url.onrender.com/api/health
```
Expected response:
```json
{"status":"OK","message":"AIMate API is running"}
```

### Step 2: Check Environment Variables

**Render (Backend):**
- [ ] MONGO_URI (MongoDB connection string)
- [ ] JWT_SECRET (any random string, keep it secret)
- [ ] NODE_ENV (set to "production")
- [ ] CLIENT_URL (your Vercel frontend URL)
- [ ] OPENAI_API_KEY (for AI features)

**Vercel (Frontend):**
- [ ] VITE_API_URL (your Render backend URL + /api)

### Step 3: Test Registration Manually

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

Expected success response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@test.com"
  }
}
```

### Step 4: Check Logs

**Render Logs:**
1. Go to Render Dashboard
2. Select your service
3. Click "Logs"
4. Look for:
   - "Registration attempt" messages
   - "⚠️ CORS rejected origin" warnings
   - MongoDB connection status
   - Any error stack traces

**Browser Console (F12):**
1. Open developer tools
2. Go to Console tab
3. Try registration
4. Look for:
   - API URL being used
   - Error messages (red text)
   - CORS errors
   - Network errors

**Network Tab:**
1. F12 → Network tab
2. Try registration
3. Check:
   - Request URL (should match your backend)
   - Status code (200 = success, 400 = validation error, 500 = server error)
   - Response body (error details)
   - Request headers (Content-Type should be application/json)

---

## Device-Specific Issues

### Mobile Devices

**Issue:** Works on desktop but not mobile
- **Possible Cause:** Mobile browser cache, different network, or mobile data restrictions
- **Solutions:**
  1. Clear mobile browser cache
  2. Try different browser (Chrome, Safari, Firefox)
  3. Try WiFi instead of mobile data (or vice versa)
  4. Disable data saver mode

### Safari-Specific Issues

**Issue:** Works on Chrome but not Safari
- **Possible Cause:** Safari's strict cross-site tracking prevention
- **Solutions:**
  1. Safari → Preferences → Privacy → Uncheck "Prevent cross-site tracking"
  2. Ensure cookies are enabled
  3. Try private browsing mode

### Corporate/School Networks

**Issue:** Works at home but not at work/school
- **Possible Cause:** Firewall blocking external API requests
- **Solution:** Contact IT department or use personal hotspot

---

## Cold Start Issues (Render Free Tier)

**Problem:** First request after 15+ minutes of inactivity takes 30-60 seconds

**Why:** Free tier services sleep after inactivity to save resources

**Solutions:**
1. **Wait it out:** First request wakes server, subsequent requests are fast
2. **Add loading indicator:** Show user "Waking up server..." message
3. **Keep-alive service:** Use UptimeRobot (free) to ping API every 5 minutes:
   - Sign up at https://uptimerobot.com
   - Add monitor for: https://your-backend.onrender.com/api/health
   - Set interval to 5 minutes
4. **Upgrade to paid tier:** Render's paid tier doesn't sleep

---

## How to Debug Unknown Issues

1. **Capture exact error:**
   - Open browser console (F12)
   - Try action that fails
   - Screenshot error message
   - Check Network tab for failed requests

2. **Check both logs:**
   - Backend logs (Render)
   - Frontend logs (Browser console)

3. **Test API directly:**
   - Use curl or Postman to test backend endpoints
   - Eliminates frontend as source of issue

4. **Compare working vs non-working device:**
   - Same browser? Different browser?
   - Same network? Different network?
   - Desktop vs mobile?
   - This helps narrow down the cause

5. **Ask user for details:**
   - Which device/browser?
   - What exact error message?
   - Screenshot of console errors?

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Blank page | Clear cache, hard refresh |
| CORS error | Add CLIENT_URL to Render env vars |
| Timeout | Wait 60 seconds (cold start), try again |
| Registration failed | Check Render logs for specific error |
| Network error | Check VITE_API_URL is correct HTTPS URL |
| Site slow | First request after inactivity is slow (normal) |
| Different device works | Clear cache on non-working device |
| MongoDB error | Check MONGO_URI and MongoDB Atlas network access |

---

## Still Not Working?

1. **Redeploy everything:**
   - Push a commit to GitHub
   - Vercel will auto-redeploy
   - Manually redeploy Render service

2. **Start fresh:**
   - Delete and recreate Render service
   - Delete and recreate Vercel project
   - Double-check all environment variables

3. **Check service status:**
   - Render status: https://status.render.com
   - Vercel status: https://www.vercel-status.com
   - MongoDB Atlas status: https://status.mongodb.com

4. **Contact support:**
   - Render: https://render.com/support
   - Vercel: https://vercel.com/support
   - Include service URL, error logs, and what you've tried
