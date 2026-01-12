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

// Connect to Database
connectDB();

// Create uploads directory
createUploadsDir();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://*.vercel.app', // Allow all Vercel deployments
  ],
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

