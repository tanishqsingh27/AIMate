import Task from '../models/Task.js';
import { generateTasksFromGoal } from '../services/openaiService.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for user
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, goal, priority } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (goal) query.goal = goal;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private
 */
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, goal, priority, dueDate, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a task title',
      });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      goal,
      priority: priority || 'medium',
      dueDate,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/generate
 * @desc    Generate tasks from a goal using AI
 * @access  Private
 */
export const generateTasksFromGoalRoute = async (req, res, next) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a goal',
      });
    }

    // Generate tasks using AI
    const aiTasks = await generateTasksFromGoal(goal);

    // Create tasks in database
    const tasks = await Task.insertMany(
      aiTasks.map(task => ({
        user: req.user.id,
        title: task.title,
        description: task.description || '',
        goal,
        priority: task.priority || 'medium',
        dueDate: task.estimatedDays
          ? new Date(Date.now() + task.estimatedDays * 24 * 60 * 60 * 1000)
          : null,
        aiGenerated: true,
        tags: task.tags || [],
      }))
    );

    res.status(201).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.status === 'completed' && { completedAt: new Date() }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

