# AIMate Server

Express.js backend for AIMate - AI Productivity Assistant.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
CLIENT_URL=http://localhost:5173
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## API Documentation

See main README.md for complete API documentation.

## Features

- RESTful API with Express.js
- MongoDB with Mongoose
- JWT authentication
- OpenAI GPT-4 integration
- Whisper API for speech-to-text
- Gmail API integration
- File upload handling

## Project Structure

```
src/
├── controllers/    # Route controllers
├── models/         # Mongoose models
├── routes/         # Express routes
├── services/       # External service integrations
├── middleware/     # Auth & error handling
├── utils/          # Utility functions
└── config/         # Configuration
```

