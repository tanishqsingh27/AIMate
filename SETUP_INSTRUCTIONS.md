# 🚀 Quick Setup Instructions

Follow these steps to get both client and server running:

## Step 1: Create Environment Files

### Server (.env file)

Create a file named `.env` in the `server/` directory with this content:

```env
PORT=5000
NODE_ENV=development

# MongoDB - Choose one option below:

# Option 1: MongoDB Atlas (Cloud - Recommended)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aimate?retryWrites=true&w=majority

# Option 2: Local MongoDB (if you have MongoDB installed locally)
# MONGO_URI=mongodb://localhost:27017/aimate

# JWT Secret (use any random string)
JWT_SECRET=aimate-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# OpenAI API Key (Optional - AI features won't work without this)
# Get from: https://platform.openai.com/
OPENAI_API_KEY=sk-your-openai-api-key-here

# Gmail API (Optional - for email features)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Client (.env file)

Create a file named `.env` in the `client/` directory with this content:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 2: Install Dependencies

### Server
```bash
cd server
npm install
```

### Client
```bash
cd client
npm install
```

## Step 3: Start the Servers

### Terminal 1 - Start Backend Server
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on port 5000
```

### Terminal 2 - Start Frontend Client
```bash
cd client
npm start
# or
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

## Step 4: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🔧 Troubleshooting

### Server won't start

1. **Missing MONGO_URI:**
   - The server will start but show a warning
   - Create `.env` file in `server/` directory
   - Add `MONGO_URI=...` (see Step 1)

2. **Port already in use:**
   - Change `PORT=5000` to another port in `server/.env`
   - Update `VITE_API_URL` in `client/.env` to match

3. **MongoDB connection error:**
   - Check your MongoDB connection string
   - For MongoDB Atlas: Make sure your IP is whitelisted
   - For local MongoDB: Make sure MongoDB service is running

### Client won't start

1. **Port already in use:**
   - Vite will automatically try the next available port
   - Or change port in `client/vite.config.js`

2. **API connection error:**
   - Make sure backend server is running first
   - Check `VITE_API_URL` in `client/.env` matches backend URL

## 📝 Getting MongoDB Connection String

### MongoDB Atlas (Free Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Add to `server/.env` as `MONGO_URI`

### Local MongoDB

If you have MongoDB installed locally:
```env
MONGO_URI=mongodb://localhost:27017/aimate
```

## ✅ Verification

Once both servers are running:

1. Open http://localhost:5173 in your browser
2. You should see the login page
3. Register a new account
4. Start using the application!

---

**Note:** AI features require a valid `OPENAI_API_KEY`. The app will work without it, but AI-powered features won't function.

