import express from 'express';
import {
  register,
  login,
  getMe,
  getGmailAuthUrl,
  handleGmailCallback,
  disconnectGmail,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/gmail/url', protect, getGmailAuthUrl);
router.post('/gmail/callback', protect, handleGmailCallback);
router.post('/gmail/disconnect', protect, disconnectGmail);

export default router;

