# Quick Fix Guide - Device Compatibility Issues

## 🚨 Quick Diagnostics

### 1. Site Not Loading?
```
✅ Open: https://your-backend-url.onrender.com/api/health
Expected: {"status":"OK","message":"AIMate API is running"}

If fails → Backend is down, check Render dashboard
```

### 2. Registration Failing?
```
✅ Add ?debug=true to your URL
Example: https://your-app.vercel.app?debug=true

Check diagnostic panel (bottom-right corner):
- Health: Should show "✅ Connected"
- API URL: Should match your Render backend URL
```

### 3. Different Devices Show Different Results?
```
Device works:
- Clear cache: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
- Try incognito mode
- Try different browser
- Check internet connection
```

---

## ⚡ Environment Variables Setup

### Render (Backend) - REQUIRED
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aimate
JWT_SECRET=any-random-secret-string-here
NODE_ENV=production
CLIENT_URL=https://your-app-name.vercel.app
```

### Vercel (Frontend) - REQUIRED
```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** 
- No trailing slashes in URLs
- VITE_API_URL must include `/api` at the end
- After adding variables, redeploy both services

---

## 🔍 Common Errors & Instant Fixes

### "Cannot connect to server"
**Problem:** Frontend can't reach backend
**Fix:**
1. Check VITE_API_URL on Vercel is correct
2. Verify backend is running (visit /api/health)
3. Check CLIENT_URL on Render includes your Vercel URL

### "Registration failed"
**Problem:** Multiple possible causes
**Fix:**
1. Check browser console (F12) for specific error
2. Check Render logs for "Registration attempt" message
3. Verify MONGO_URI and JWT_SECRET are set on Render

### "Request timeout"
**Problem:** Slow network or cold start
**Fix:**
1. Wait 60 seconds if backend was sleeping
2. Try again - subsequent requests are faster
3. Check internet connection speed

### "User already exists"
**Problem:** Email already registered
**Fix:**
1. Try logging in instead
2. Use different email
3. Reset password if you forgot it

### "CORS blocked" (in console)
**Problem:** Backend rejecting frontend requests
**Fix:**
1. Add CLIENT_URL to Render environment variables
2. Make sure it matches your Vercel URL exactly
3. Redeploy backend on Render

---

## 📱 Device-Specific Issues

### Works on Desktop, Not Mobile
```
1. Clear mobile browser cache
2. Try different mobile browser
3. Check mobile data vs WiFi
4. Disable data saver mode
5. Update mobile browser
```

### Works on Chrome, Not Safari
```
1. Safari → Preferences → Privacy
2. Uncheck "Prevent cross-site tracking"
3. Enable cookies
4. Try private browsing mode
```

### Works at Home, Not at Work/School
```
Problem: Corporate/school firewall
Solution: Contact IT or use personal hotspot
```

---

## 🛠️ Debugging Steps

### 1. Check Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

### 2. Test Registration API Directly
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

### 3. Check Browser Console
```
1. Press F12 (Windows) or Cmd+Option+I (Mac)
2. Go to Console tab
3. Try registration
4. Look for red errors
5. Screenshot and check against this guide
```

### 4. Check Render Logs
```
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for:
   - "Registration attempt" (should appear when someone registers)
   - "⚠️ CORS rejected origin" (means CORS issue)
   - "MongoDB connected successfully" (should be at start)
   - Any red error messages
```

---

## ⏱️ Cold Start Issues (Free Tier)

**Symptom:** First request takes 30-60 seconds, then everything works fast

**Explanation:** Free tier services sleep after 15 minutes of inactivity. First request wakes them up.

**This is NORMAL, not a bug!**

**Options:**
1. **Wait:** First request wakes server, next requests are fast
2. **Keep-alive:** Use UptimeRobot.com (free) to ping every 5 minutes
3. **Upgrade:** Paid tier doesn't sleep

---

## 📋 Deployment Checklist

After pushing code to GitHub:

- [ ] Both Vercel and Render auto-deployed
- [ ] Health endpoint works: /api/health
- [ ] Environment variables set on Render
- [ ] Environment variables set on Vercel  
- [ ] Can register new account on desktop
- [ ] Can register new account on mobile
- [ ] Can login on desktop
- [ ] Can login on mobile
- [ ] Diagnostic panel shows green (with ?debug=true)
- [ ] No CORS errors in console

---

## 🆘 Still Having Issues?

### Get Detailed Help:
1. Read: [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)
2. Check: [DEPLOYMENT_FIXES_SUMMARY.md](DEPLOYMENT_FIXES_SUMMARY.md)
3. Verify: [BACKEND_DEPLOYMENT.md](BACKEND_DEPLOYMENT.md)

### Share These When Asking For Help:
1. Exact error message from browser console
2. Screenshot of diagnostic panel (?debug=true)
3. Last 50 lines from Render logs
4. Which device/browser/network
5. Whether it works on any device

---

## 💡 Pro Tips

- **Use ?debug=true** in URL to see diagnostic panel
- **Check Render logs** for backend issues
- **Check browser console** for frontend issues  
- **Clear cache** when switching between environments
- **Wait 60 seconds** after inactivity (cold start)
- **Test on multiple devices** before declaring it fixed

---

**Need the URLs?**
- Frontend: Your Vercel dashboard
- Backend: Your Render dashboard
- Health Check: `https://your-backend.onrender.com/api/health`
