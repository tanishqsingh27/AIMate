import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  generateTasksFromGoalRoute,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/generate', generateTasksFromGoalRoute);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;

