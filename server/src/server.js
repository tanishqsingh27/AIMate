// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createUploadsDir } from './utils/createUploadsDir.js';

// Import Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import expenseRoutes from './routes/expenses.js';
import meetingRoutes from './routes/meetings.js';
import emailRoutes from './routes/emails.js';

// Initialize Express app
const app = express();

// Connect to Database (non-blocking)
connectDB().catch(err => console.error('DB connection failed:', err));

// Create uploads directory
createUploadsDir();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5000',
      process.env.CLIENT_URL,
    ];
    
    // Allow all Vercel deployments
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AIMate API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/emails', emailRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

