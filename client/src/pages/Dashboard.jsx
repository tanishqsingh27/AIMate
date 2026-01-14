import { useEffect, useState } from 'react';
import { tasksAPI } from '../api/tasks';
import { expensesAPI } from '../api/expenses';
import { meetingsAPI } from '../api/meetings';
import { emailsAPI } from '../api/emails';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0 },
    expenses: { total: 0, count: 0 },
    meetings: { total: 0, aiGenerated: 0 },
    emails: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch critical data first (tasks), then fetch rest in background
      const tasksRes = await tasksAPI.getTasks();
      const tasksData = tasksRes.data.tasks || [];
      setTasks(tasksData);
      
      // Show partial data immediately
      setStats(prev => ({
        ...prev,
        tasks: {
          total: tasksData.length,
          completed: tasksData.filter(t => t.status === 'completed').length,
        },
      }));
      
      setLoading(false); // Stop loading spinner here
      
      // Fetch remaining data in background
      const [expensesRes, meetingsRes, emailsRes] = await Promise.all([
        expensesAPI.getExpenses(),
        meetingsAPI.getMeetings(),
        emailsAPI.getEmails(),
      ]);

      const expensesData = expensesRes.data.expenses || [];
      const meetingsData = meetingsRes.data.meetings || [];

      setExpenses(expensesData);
      
      // Count AI-generated meetings strictly by the explicit flag
      // Only meetings created via AI (isAIGenerated === true) are counted
      const aiGeneratedCount = meetingsData.filter(m => m.isAIGenerated === true).length;
      
      setStats({
        tasks: {
          total: tasksData.length,
          completed: tasksData.filter(t => t.status === 'completed').length,
        },
        expenses: {
          total: expensesRes.data.total || 0,
          count: expensesData.length,
        },
        meetings: { 
          total: meetingsData.length,
          aiGenerated: aiGeneratedCount,
        },
        emails: emailsRes.data.count || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const taskCompletion = stats.tasks.total
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const meetingAIPercent = stats.meetings.total
    ? Math.round((stats.meetings.aiGenerated / stats.meetings.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Dashboard
            </h1>
            <p
              className={`mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Welcome back! Here's your AI-powered productivity overview.
            </p>
          </div>
          <span
            className={
              theme === 'dark'
                ? 'text-sm font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-100'
                : 'text-sm font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700'
            }
          >
            AI Powered
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700 hover:border-blue-400/60'
              : 'bg-white/80 border-blue-100 hover:border-blue-300'
          } shadow-sm hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={theme === 'dark' ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>Workload</p>
                <p className={theme === 'dark' ? 'text-white text-lg font-semibold' : 'text-gray-900 text-lg font-semibold'}>
                  Tasks
                </p>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={theme === 'dark' ? 'text-4xl font-bold text-white' : 'text-4xl font-bold text-blue-700'}>
                {stats.tasks.total}
              </p>
              <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                {stats.tasks.completed} done
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${taskCompletion}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Completion</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-blue-700'}>{taskCompletion}%</span>
            </div>
          </div>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700 hover:border-blue-400/60'
              : 'bg-white/80 border-blue-100 hover:border-blue-300'
          } shadow-sm hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={theme === 'dark' ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>Spending</p>
                <p className={theme === 'dark' ? 'text-white text-lg font-semibold' : 'text-gray-900 text-lg font-semibold'}>
                  Expenses
                </p>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">₹ INR</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={theme === 'dark' ? 'text-4xl font-bold text-white' : 'text-4xl font-bold text-blue-700'}>
                ₹{stats.expenses.total.toFixed(2)}
              </p>
              <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                {stats.expenses.count} transactions
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${Math.min(stats.expenses.count * 10, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Activity</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-blue-700'}>{stats.expenses.count} entries</span>
            </div>
          </div>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700 hover:border-blue-400/60'
              : 'bg-white/80 border-blue-100 hover:border-blue-300'
          } shadow-sm hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={theme === 'dark' ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>Collaboration</p>
                <p className={theme === 'dark' ? 'text-white text-lg font-semibold' : 'text-gray-900 text-lg font-semibold'}>
                  Meetings
                </p>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Created</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={theme === 'dark' ? 'text-4xl font-bold text-white' : 'text-4xl font-bold text-blue-700'}>
                {stats.meetings.total}
              </p>
              <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                {stats.meetings.total > 0 ? `${meetingAIPercent}% AI` : 'No meetings yet'}
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${meetingAIPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>AI generated</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-blue-700'}>
                {stats.meetings.aiGenerated}/{stats.meetings.total || 0}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border-gray-700 hover:border-blue-400/60'
              : 'bg-white/80 border-blue-100 hover:border-blue-300'
          } shadow-sm hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={theme === 'dark' ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>Inbox</p>
                <p className={theme === 'dark' ? 'text-white text-lg font-semibold' : 'text-gray-900 text-lg font-semibold'}>
                  Emails
                </p>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Synced</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={theme === 'dark' ? 'text-4xl font-bold text-white' : 'text-4xl font-bold text-blue-700'}>
                {stats.emails}
              </p>
              <p className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Connected accounts</p>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${Math.min(stats.emails * 10, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-blue-700'}>Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`card transition-colors overflow-hidden p-0 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 p-6 pb-0 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Task Status Overview</h2>
          <div className="h-64 w-full mb-0">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80" 
              alt="Task Status Analytics"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Completed: <strong className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>{stats.tasks.completed}</strong>
              </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                In Progress: <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{tasks.filter(t => t.status === 'in-progress').length}</strong>
              </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Pending: <strong className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>{tasks.filter(t => t.status === 'pending').length}</strong>
              </span>
            </div>
          </div>
        </div>

        <div
          className={`card transition-colors overflow-hidden p-0 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 p-6 pb-0 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Expense Analytics</h2>
          <div className="h-64 w-full mb-0">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&q=80" 
              alt="Expense Analytics"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Total: <strong className={theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'}>₹{stats.expenses.total.toFixed(2)}</strong>
              </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Transactions: <strong className={theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'}>{stats.expenses.count}</strong>
              </span>
            </div>
          </div>
        </div>

        <div
          className={`card transition-colors overflow-hidden p-0 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 p-6 pb-0 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Meetings Overview</h2>
          <div className="h-64 w-full mb-0">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80" 
              alt="Meetings Analytics"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Total Meetings: <strong className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>{stats.meetings.total}</strong>
              </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                AI Generated: <strong className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                  {stats.meetings.total > 0 
                    ? `${Math.round((stats.meetings.aiGenerated / stats.meetings.total) * 100)}%`
                    : 'N/A'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div
          className={`card transition-colors overflow-hidden p-0 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 p-6 pb-0 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Email Activity</h2>
          <div className="h-64 w-full mb-0">
            <img 
              src="https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop&q=80" 
              alt="Email Analytics"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Total Emails: <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{stats.emails}</strong>
              </span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Status: <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Connected</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

