# AIMate – AI Productivity Assistant

A full-stack MERN application that combines AI-powered task management, meeting notes, expense tracking, and email automation.

## 🚀 Features

### 1. AI Task Manager
- Set goals and let AI break them down into structured daily tasks
- Track task progress with status updates
- Priority-based task organization

### 2. Smart Meeting Notes
- Upload meeting audio files
- AI transcription using Whisper API
- Automatic summarization and key point extraction
- Convert action items directly to tasks

### 3. AI Expense Tracker
- Manual expense entry or voice input
- AI-powered category classification
- Budget insights and spending analytics
- Visual charts for expense breakdown

### 4. AI Email Replier
- Connect Gmail API for email sync
- AI-generated smart email replies using GPT-4
- Store and manage sent replies
- Thread-based email management

### 5. Dashboard
- Productivity analytics with charts
- Spending insights
- Performance metrics
- Overview of all modules

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **TailwindCSS** - Styling
- **Chart.js** - Data visualization
- **Context API** - State management
- **React Router** - Routing
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### AI & Services
- **OpenAI GPT-4** - AI task generation, summaries, email replies
- **Whisper API** - Speech-to-text transcription
- **LangChain** - AI chaining
- **Gmail API** - Email integration

### Authentication
- **JWT** - Token-based auth
- **bcrypt** - Password hashing

## 📁 Project Structure

```
aimate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context API
│   │   ├── api/            # API utilities
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Express backend
    ├── src/
    │   ├── controllers/    # Route controllers
    │   ├── models/         # Mongoose models
    │   ├── routes/         # Express routes
    │   ├── services/       # AI & external services
    │   ├── middleware/     # Auth & error handling
    │   ├── utils/          # Utility functions
    │   ├── config/         # Database config
    │   └── server.js
    └── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- Gmail API credentials (for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aimate
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   **Server (.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   OPENAI_API_KEY=sk-your-openai-api-key
   GMAIL_CLIENT_ID=your-gmail-client-id
   GMAIL_CLIENT_SECRET=your-gmail-client-secret
   GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/gmail/callback
   CLIENT_URL=http://localhost:5173
   ```

   **Client (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Run the application**

   **Start the server** (from `server/` directory)
   ```bash
   npm run dev
   ```

   **Start the client** (from `client/` directory)
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📝 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/gmail/url` - Get Gmail OAuth URL
- `POST /api/auth/gmail/callback` - Handle Gmail OAuth callback

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `POST /api/tasks/generate` - Generate tasks from goal
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `GET /api/expenses/insights` - Get AI budget insights
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Meetings
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/:id` - Get single meeting
- `POST /api/meetings` - Create meeting
- `POST /api/meetings/:id/upload-audio` - Upload and transcribe audio
- `POST /api/meetings/:id/action-items/:actionItemId/convert` - Convert action item to task
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Emails
- `GET /api/emails` - Get all emails
- `GET /api/emails/:id` - Get single email
- `GET /api/emails/sync` - Sync emails from Gmail
- `POST /api/emails/:id/generate-reply` - Generate AI reply
- `POST /api/emails/:id/send` - Send email reply
- `PUT /api/emails/:id` - Update email
- `DELETE /api/emails/:id` - Delete email

## 🔧 Configuration

### Gmail API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/gmail/callback`
6. Copy Client ID and Client Secret to `.env`

### OpenAI API Setup
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Get your API key from the dashboard
3. Add to `.env` as `OPENAI_API_KEY`

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL`

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from `.env`

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Add to backend `.env` as `MONGO_URI`

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using MERN stack and AI

