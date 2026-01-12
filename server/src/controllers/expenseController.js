import Expense from '../models/Expense.js';
import { classifyExpense, generateBudgetInsights } from '../services/openaiService.js';

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for user
 * @access  Private
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    // Calculate totals
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      count: expenses.length,
      total,
      byCategory,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense
 * @access  Private
 */
export const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    res.json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
export const createExpense = async (req, res, next) => {
  try {
    const { amount, description, category, date, paymentMethod, notes } = req.body;

    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide amount and description',
      });
    }

    // If category not provided, classify using AI
    let finalCategory = category;
    if (!category && description) {
      finalCategory = await classifyExpense(description);
    }

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      description,
      category: finalCategory,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'card',
      notes,
      aiClassified: !category && !!description,
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/insights
 * @desc    Get AI-generated budget insights
 * @access  Private
 */
export const getBudgetInsights = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    if (expenses.length === 0) {
      return res.json({
        success: true,
        insights: 'No expenses found for the selected period.',
      });
    }

    const insights = await generateBudgetInsights(expenses);

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private
 */
export const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

