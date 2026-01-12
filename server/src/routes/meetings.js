import express from 'express';
import {
  getMeetings,
  getMeeting,
  createMeeting,
  createMeetingWithAI,
  uploadAndTranscribe,
  convertActionItemToTask,
  updateMeeting,
  deleteMeeting,
  upload,
} from '../controllers/meetingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Specific routes must come BEFORE parameterized routes
router.post('/create-with-ai', createMeetingWithAI);
router.post('/:id/upload-audio', upload.single('audio'), uploadAndTranscribe);
router.post('/:id/action-items/:actionItemId/convert', convertActionItemToTask);

router.route('/')
  .get(getMeetings)
  .post(createMeeting);

router.route('/:id')
  .get(getMeeting)
  .put(updateMeeting)
  .delete(deleteMeeting);

export default router;

