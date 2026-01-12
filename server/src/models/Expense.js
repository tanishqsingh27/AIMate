import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'food',
        'transport',
        'entertainment',
        'shopping',
        'bills',
        'healthcare',
        'education',
        'travel',
        'other',
      ],
      default: 'other',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'digital', 'other'],
      default: 'card',
    },
    aiClassified: {
      type: Boolean,
      default: false,
      // True if category was classified by AI
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;

