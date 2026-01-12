import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

const envTemplate = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Replace with your MongoDB Atlas connection string or use local MongoDB
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/aimate?retryWrites=true&w=majority
# Local: mongodb://localhost:27017/aimate
MONGO_URI=mongodb://localhost:27017/aimate

# JWT Configuration
JWT_SECRET=aimate-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# OpenAI Configuration (Optional - AI features won't work without this)
# Get your API key from https://platform.openai.com/
OPENAI_API_KEY=sk-your-openai-api-key-here

# Gmail API Configuration (Optional - for email features)
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file in server/ directory');
  console.log('📝 Please edit server/.env and add your MongoDB connection string');
} else {
  console.log('⚠️  .env file already exists in server/ directory');
  console.log('📝 Edit it manually if needed');
}

