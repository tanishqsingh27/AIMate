# 🤖 AI Integration & MongoDB Connection Guide

## ✅ Button Sizes Fixed
The theme toggle and three-line menu buttons are now the same size and properly aligned.

---

## 📊 Part 1: MongoDB Connection Setup

### Step 1: Choose Your MongoDB Option

You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended for beginners)
- **Free tier available**
- No installation needed
- Accessible from anywhere
- Automatic backups

#### Option B: Local MongoDB
- Requires MongoDB installation
- Runs on your computer
- Good for development

---

### Step 2A: Setup MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free" or "Sign Up"
   - Create your account

2. **Create a Cluster**
   - After login, click "Build a Database"
   - Choose "M0 FREE" (Free tier)
   - Select a cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to you
   - Click "Create"

3. **Create Database User**
   - Wait for cluster to finish creating (2-3 minutes)
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter username (e.g., `aimateuser`)
   - Click "Autogenerate Secure Password" or create your own
   - **SAVE THE PASSWORD** (you'll need it!)
   - Click "Add User"

4. **Whitelist Your IP Address**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
     - Or add your specific IP for production
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update Connection String**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name at the end: `/aimate`
   - Final string should look like:
     ```
     mongodb+srv://aimateuser:yourpassword@cluster0.xxxxx.mongodb.net/aimate?retryWrites=true&w=majority
     ```

---

### Step 2B: Setup Local MongoDB

1. **Install MongoDB**
   - **Windows:** Download from https://www.mongodb.com/try/download/community
   - **Mac:** `brew install mongodb-community`
   - **Linux:** Follow official docs

2. **Start MongoDB Service**
   - **Windows:** MongoDB should start automatically as a service
   - **Mac/Linux:** `brew services start mongodb-community` or `sudo systemctl start mongod`

3. **Verify Installation**
   - Open terminal/command prompt
   - Run: `mongod --version` (should show version)

4. **Connection String**
   - Use: `mongodb://localhost:27017/aimate`

---

### Step 3: Add MongoDB to Your Project

1. **Navigate to Server Directory**
   ```bash
   cd server
   ```

2. **Create/Edit .env File**
   - If `.env` doesn't exist, run: `npm run setup`
   - Or create manually: `touch .env` (Mac/Linux) or create file in Windows

3. **Add MongoDB Connection String**
   Open `server/.env` and add:
   
   **For MongoDB Atlas:**
   ```env
   MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/aimate?retryWrites=true&w=majority
   ```
   
   **For Local MongoDB:**
   ```env
   MONGO_URI=mongodb://localhost:27017/aimate
   ```

4. **Save the File**

5. **Test Connection**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   🚀 Server running on port 5000
   ```

---

## 🤖 Part 2: AI Integration Setup (OpenAI)

### Step 1: Get OpenAI API Key

1. **Create Account**
   - Go to https://platform.openai.com/
   - Click "Sign Up" or "Log In"
   - Complete registration

2. **Add Payment Method** (Required)
   - OpenAI requires a payment method even for free tier
   - Go to "Billing" → "Payment methods"
   - Add a credit card (you get $5 free credits to start)

3. **Create API Key**
   - Click your profile icon (top right)
   - Go to "API Keys"
   - Click "Create new secret key"
   - Give it a name (e.g., "AIMate Project")
   - **COPY THE KEY IMMEDIATELY** (you won't see it again!)
   - It looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Save Your Key Securely**
   - Store it in a password manager or secure note
   - Never share it publicly or commit to GitHub

---

### Step 2: Add OpenAI Key to Your Project

1. **Open Server .env File**
   ```bash
   cd server
   # Open .env file in your editor
   ```

2. **Add OpenAI API Key**
   Add this line to `server/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   ```
   
   Replace `sk-proj-your-actual-api-key-here` with your actual key from Step 1.

3. **Save the File**

---

### Step 3: Verify AI Integration

1. **Check OpenAI Service**
   - The service is already set up in `server/src/services/openaiService.js`
   - It handles:
     - ✅ Task generation from goals
     - ✅ Meeting summaries
     - ✅ Expense classification
     - ✅ Budget insights
     - ✅ Email reply generation

2. **Test AI Features**
   - Start your server: `npm start`
   - Start your client: `cd ../client && npm run dev`
   - Try creating a task from a goal (Tasks page)
   - Try getting budget insights (Expenses page)
   - Try generating an email reply (Emails page)

---

## 🔧 Complete .env File Example

Your `server/.env` file should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For Atlas (Cloud):
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aimate?retryWrites=true&w=majority

# For Local MongoDB:
# MONGO_URI=mongodb://localhost:27017/aimate

# JWT Configuration
JWT_SECRET=aimate-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here

# Gmail API Configuration (Optional - for email features)
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Quick Start Commands

### 1. Setup Environment Files
```bash
# Server
cd server
npm run setup  # Creates .env template
# Then edit server/.env with your credentials

# Client
cd ../client
npm run setup  # Creates .env template
# Then edit client/.env if needed
```

### 2. Install Dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Start Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] MongoDB connection successful (check server console)
- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Can register/login
- [ ] Can create tasks
- [ ] AI task generation works (Tasks page → "Generate from Goal")
- [ ] AI expense insights work (Expenses page → "Get AI Budget Insights")
- [ ] AI email replies work (Emails page → "Generate AI Reply")

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError: failed to connect"**
- Check your connection string is correct
- For Atlas: Verify IP is whitelisted
- For Local: Make sure MongoDB service is running

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check database user exists in Atlas

### OpenAI API Issues

**Error: "OPENAI_API_KEY is not set"**
- Check `.env` file exists in `server/` directory
- Verify key is on a single line (no line breaks)
- Restart server after adding key

**Error: "Insufficient quota"**
- Check your OpenAI account billing
- Add payment method if needed
- Check usage limits in OpenAI dashboard

**Error: "Invalid API key"**
- Verify key starts with `sk-`
- Make sure no extra spaces or quotes
- Generate a new key if needed

### General Issues

**Server won't start**
- Check all required packages installed: `npm install`
- Verify Node.js version (should be 16+)
- Check port 5000 is not in use

**Client can't connect to server**
- Verify server is running
- Check `VITE_API_URL` in `client/.env` matches server URL
- Check CORS settings in server

---

## 📚 Additional Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **OpenAI API Docs:** https://platform.openai.com/docs
- **Mongoose Docs:** https://mongoosejs.com/docs/

---

## 🔒 Security Notes

1. **Never commit .env files to Git**
   - `.env` should be in `.gitignore`
   - Use `.env.example` for templates

2. **Use strong JWT secrets in production**
   - Generate random strings
   - Use environment variables

3. **Protect your API keys**
   - Don't share them
   - Rotate them if exposed
   - Use different keys for dev/prod

4. **MongoDB Security**
   - Use strong passwords
   - Whitelist only necessary IPs in production
   - Enable MongoDB authentication

---

## 🎉 You're All Set!

Once both MongoDB and OpenAI are configured:
- Your app will store data in MongoDB
- AI features will work throughout the app
- You can start using all productivity features!

Need help? Check the error messages in your server console - they usually point to the issue.

