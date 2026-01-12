import express from 'express';
import {
  getEmails,
  getEmail,
  syncEmails,
  generateReply,
  generateReplyManual,
  sendReply,
  updateEmail,
  deleteEmail,
} from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/sync', syncEmails);

router.route('/')
  .get(getEmails);

router.post('/generate-reply-manual', generateReplyManual);
router.post('/:id/generate-reply', generateReply);
router.post('/:id/send', sendReply);

router.route('/:id')
  .get(getEmail)
  .put(updateEmail)
  .delete(deleteEmail);

export default router;

