# 🚀 Quick Start Guide

## Step 1: Create Environment Files

### Option A: Automatic Setup (Recommended)

Run these commands in your terminal:

```powershell
# From project root
cd server
npm run setup

cd ../client
npm run setup
```

### Option B: Manual Setup

**1. Create `server/.env` file:**

Create a file named `.env` in the `server/` folder with:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/aimate
JWT_SECRET=aimate-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
```

**2. Create `client/.env` file:**

Create a file named `.env` in the `client/` folder with:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 2: Install Dependencies

```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 3: Start the Application

### Terminal 1 - Start Backend Server:

```powershell
cd server
npm start
```

You should see:
```
✅ Created uploads directory
✅ MongoDB Connected: ... (or warning if no DB)
🚀 Server running on port 5000
```

### Terminal 2 - Start Frontend Client:

```powershell
cd client
npm start
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

## Step 4: Open the Application

Open your browser and go to: **http://localhost:5173**

## 📝 Important Notes

1. **MongoDB**: 
   - If you don't have MongoDB, the server will start but show a warning
   - For MongoDB Atlas (cloud): Get connection string from https://www.mongodb.com/cloud/atlas
   - For local MongoDB: Use `mongodb://localhost:27017/aimate`

2. **OpenAI API Key**:
   - Optional for now - app will run without it
   - AI features won't work without a valid key
   - Get from: https://platform.openai.com/

3. **Ports**:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## ✅ Verify Everything Works

1. Open http://localhost:5173
2. You should see the login page
3. Click "Register" to create an account
4. Start using the app!

---

**Troubleshooting?** See `SETUP_INSTRUCTIONS.md` for detailed help.

