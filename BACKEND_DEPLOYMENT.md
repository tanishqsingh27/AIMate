# Backend Deployment Guide

Your frontend is deployed on Vercel, but the backend needs to be deployed separately to enable the app to work in production.

## Quick Solution: Deploy to Render (Free Tier)

### Step 1: Push your code to GitHub (Already done ✅)

### Step 2: Create Render Account & Deploy Backend

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select **"AIMate"** repository
5. Configure:
   - **Name:** `aimate-api` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server`

6. Click **"Create Web Service"** and wait for deployment (2-3 mins)

### Step 3: Add Environment Variables on Render

In Render dashboard for your service:

1. Go to **Settings** → **Environment**
2. Add these variables:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/aimate
   JWT_SECRET = your-secret-key-here
   NODE_ENV = production
   ```

3. Save and service will redeploy

### Step 4: Update Vercel with Backend URL

1. From Render, copy your service URL (e.g., `https://aimate-api.onrender.com`)
2. Go to https://vercel.com/dashboard
3. Select **ai-mate** project
4. Go to **Settings** → **Environment Variables**
5. Add/Update:
   ```
   VITE_API_URL = https://aimate-api.onrender.com/api
   ```
6. Redeploy on Vercel (push a commit or click Redeploy)

### Step 5: Test

- Visit https://ai-mate-two.vercel.app
- Try to login - it should work now! ✅

## Troubleshooting

### Common Issues on Different Devices

#### 1. Site Not Loading on Some Devices

**Possible Causes:**
- CORS configuration issues
- Mixed content (HTTP/HTTPS) problems
- DNS or network restrictions
- Browser cache issues

**Solutions:**
- Clear browser cache and cookies
- Try different browser or incognito mode
- Check if HTTPS is enforced (some devices block mixed content)
- Verify `CLIENT_URL` environment variable on Render includes your Vercel URL

**To Fix CORS Issues:**
1. On Render, add these environment variables:
   ```
   CLIENT_URL=https://your-app-name.vercel.app
   VERCEL_URL=https://your-app-name.vercel.app
   ```
2. Make sure your Vercel URL doesn't have trailing slash

#### 2. Registration Failed on Some Devices

**Possible Causes:**
- Timeout issues (slow network)
- Request blocked by firewall/antivirus
- Invalid data format
- MongoDB connection issues

**Solutions:**
1. **Check backend is running:**
   - Visit `https://aimate-api.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"AIMate API is running"}`

2. **Check environment variables on Render:**
   - Verify `MONGO_URI` is set correctly
   - Verify `JWT_SECRET` is set
   - Add `NODE_ENV=production`

3. **Check browser console (F12):**
   - Look for specific error messages
   - Check if API URL is correct
   - Look for CORS errors (red text mentioning "CORS" or "origin")

4. **Check Render logs:**
   - Go to Render dashboard → Your service → **Logs**
   - Look for "Registration attempt" logs
   - Check for MongoDB connection errors
   - Look for "\u26a0\ufe0f CORS rejected origin" warnings

5. **Test API directly:**
   ```bash
   # Test registration endpoint
   curl -X POST https://aimate-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

#### 3. Slow Performance or Timeouts

**Free tier services sleep after inactivity:**
- First request may take 30-60 seconds (cold start)
- This is normal on free tier
- Subsequent requests will be faster

**To improve:**
- Consider paid tier on Render
- Use keep-alive service (like UptimeRobot) to ping your API every 5 minutes

## Alternative: Deploy to Railway

If Render doesn't work, try [Railway.app](https://railway.app):
- Similar process
- Connect GitHub → Select repository
- Add environment variables
- Deploy

---

**Note:** Free tier services may have cold starts. If app is slow after inactivity, it's normal - the server is waking up.
