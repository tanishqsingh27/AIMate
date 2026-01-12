# Environment Variables Setup

## Server (.env)

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aimate?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Gmail API Configuration
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

## Client (.env)

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## How to Get API Keys

### MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string from "Connect" button
4. Replace `<password>` with your database password

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or login
3. Navigate to API Keys section
4. Create new secret key
5. Copy and add to `OPENAI_API_KEY`

### Gmail API Credentials
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5000/api/auth/gmail/callback`
7. Copy Client ID and Client Secret
8. Generate refresh token using OAuth 2.0 Playground if needed

---

**Note:** Never commit `.env` files to version control!

