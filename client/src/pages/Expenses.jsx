import { useEffect, useState } from 'react';
import { expensesAPI } from '../api/expenses';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Expenses = () => {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'card',
    date: (() => {
      const d = new Date();
      const iso = d.toISOString();
      return iso.slice(0, 10); // YYYY-MM-DD for input type=date
    })(),
  });

  const categories = [
    'food',
    'transport',
    'entertainment',
    'shopping',
    'bills',
    'healthcare',
    'education',
    'travel',
    'other',
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expensesAPI.getExpenses();
      setExpenses(response.data.expenses || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await expensesAPI.createExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date ? new Date(newExpense.date) : undefined,
      });
      toast.success('Expense added!');
      setNewExpense({
        amount: '',
        description: '',
        category: '',
        paymentMethod: 'card',
        date: newExpense.date,
      });
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleGetInsights = async () => {
    setShowInsights(true);
    try {
      toast.loading('AI is analyzing your expenses and generating insights...');
      const response = await expensesAPI.getBudgetInsights();
      toast.dismiss();
      // Ensure currency shows as INR (₹) even if the model defaults to $ in rare cases
      const txt = response.data.insights || '';
      setInsights(txt.replace(/\$/g, '₹'));
      toast.success('AI insights generated successfully!');
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.error || 'Failed to generate insights';
      if (errorMsg.includes('OPENAI') || errorMsg.includes('API')) {
        toast.error('AI service unavailable. Please check your OpenAI API key.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.deleteExpense(id);
      toast.success('Expense deleted!');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Monthly aggregation for display
  const monthlyAggregates = Object.entries(
    expenses.reduce((acc, expense) => {
      const dateObj = expense.date ? new Date(expense.date) : null;
      const isValidDate = dateObj instanceof Date && !Number.isNaN(dateObj.getTime());
      const key = isValidDate
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        : 'Unknown';

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, date: isValidDate ? dateObj : null };
      }

      acc[key].total += expense.amount;
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => {
      // Unknown stays at the end
      if (!a.date && b.date) return 1;
      if (a.date && !b.date) return -1;
      if (!a.date && !b.date) return 0;
      return a.date - b.date;
    });

  if (loading) {
    return <div className="text-center py-12">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Expenses
          </h1>
          <p
            className={`mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Track and analyze your spending
          </p>
        </div>
        <button onClick={handleGetInsights} className="btn-primary flex items-center gap-2">
          <span>🤖</span>
          <span>Get AI Budget Insights</span>
        </button>
      </div>

      {/* AI Insights */}
      {showInsights && (
        <div className={`card border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200'}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-primary-900'}`}>🤖 AI Budget Insights</h2>
              <span className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium">
                AI Powered
              </span>
            </div>
            <button
              onClick={() => setShowInsights(false)}
              className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-primary-600 hover:text-primary-800'}`}
            >
              ✕
            </button>
          </div>
          <p className={`whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{insights}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`card transition-colors ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : ''
          }`}
        >
          <p
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Total Expenses
          </p>
          <p
            className={`text-3xl font-bold mt-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            ₹{total.toFixed(2)}
          </p>
        </div>
        <div
          className={`card transition-colors ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : ''
          }`}
        >
          <p
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Number of Transactions
          </p>
          <p
            className={`text-3xl font-bold mt-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {expenses.length}
          </p>
        </div>
        <div
          className={`card transition-colors ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : ''
          }`}
        >
          <p
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Average per Transaction
          </p>
          <p
            className={`text-3xl font-bold mt-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            ₹{expenses.length > 0 ? (total / expenses.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Expense Analytics Image */}
      {expenses.length > 0 && (
        <div
          className={`card overflow-hidden p-0 rounded-2xl transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 p-6 pb-0 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Expense Analytics
          </h2>
          <div className="h-80 w-full mb-0">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&h=600&fit=crop&q=80" 
              alt="Expense Analytics by Category"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(
                expenses.reduce((acc, expense) => {
                  acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                  return acc;
                }, {})
              ).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <p
                    className={`text-xs mb-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {category}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
                    }`}
                  >
                    ₹{amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {monthlyAggregates.length > 0 && (
        <div className={`card ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Monthly Breakdown
            </h2>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Totals by month</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {monthlyAggregates.map((month) => {
              const label = month.date
                ? month.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                : 'Unknown date';
              return (
                <div
                  key={month.key}
                  className={`rounded-xl border p-4 ${
                    theme === 'dark'
                      ? 'border-gray-700 bg-gray-900'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ₹{month.total.toFixed(2)}
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {month.count} {month.count === 1 ? 'transaction' : 'transactions'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Expense */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Category <span className="text-primary-600">(🤖 AI will auto-classify if left empty)</span>
              </label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="input-field"
              >
                <option value="">🤖 Auto-classify with AI</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Date
              </label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="input-field"
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <select
              value={newExpense.paymentMethod}
              onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
              className="input-field"
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="digital">Digital</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Add Expense
          </button>
        </form>
      </div>

      {/* Expenses List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No expenses yet. Add one above!</p>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">₹{expense.amount.toFixed(2)}</h3>
                      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                        {expense.category}
                        {expense.aiClassified && (
                          <span className="text-primary-600" title="AI Classified">🤖</span>
                        )}
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{expense.description}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(expense.date).toLocaleDateString()} • {expense.paymentMethod}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;

