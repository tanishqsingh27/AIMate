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

If login still doesn't work:

1. **Check backend is running:**
   - Visit `https://aimate-api.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"AIMate API is running"}`

2. **Check environment variables:**
   - On Render, verify `MONGO_URI` and `JWT_SECRET` are set correctly

3. **Check browser console (F12):**
   - Look for any API errors
   - Verify requests go to correct API URL

4. **Check Render logs:**
   - Go to Render dashboard → Your service → **Logs**
   - Look for connection errors

## Alternative: Deploy to Railway

If Render doesn't work, try [Railway.app](https://railway.app):
- Similar process
- Connect GitHub → Select repository
- Add environment variables
- Deploy

---

**Note:** Free tier services may have cold starts. If app is slow after inactivity, it's normal - the server is waking up.
