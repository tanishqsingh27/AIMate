import { useEffect, useState } from 'react';
import { tasksAPI } from '../api/tasks';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Tasks = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goal, setGoal] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.createTask({
        ...newTask,
        dueDate: newTask.dueDate || null,
      });
      toast.success('Task created!');
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleGenerateTasks = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    try {
      toast.loading('AI is generating tasks from your goal...');
      const response = await tasksAPI.generateTasksFromGoal(goal);
      toast.dismiss();
      toast.success(`AI generated ${response.data.tasks.length} tasks from your goal!`);
      setGoal('');
      setShowGoalForm(false);
      fetchTasks();
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.error || 'Failed to generate tasks';
      if (errorMsg.includes('OPENAI') || errorMsg.includes('API')) {
        toast.error('AI service unavailable. Please check your OpenAI API key.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      await tasksAPI.updateTask(id, updates);
      toast.success('Task updated!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.deleteTask(id);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="text-center py-12">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Tasks
          </h1>
          <p
            className={`mt-1 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Manage your tasks and goals
          </p>
        </div>
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="btn-primary text-sm sm:text-base w-full sm:w-auto"
        >
          {showGoalForm ? 'Cancel' : 'Generate from Goal'}
        </button>
      </div>

      {/* Generate Tasks from Goal */}
      {showGoalForm && (
        <div className={`card border-2 p-4 sm:p-6 ${theme === 'dark' ? 'border-primary-400 bg-gradient-to-r from-slate-800 to-slate-900' : 'border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <h2 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🤖 AI Generate Tasks</h2>
            <span className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium w-fit">
              AI Powered
            </span>
          </div>
          <p className={`text-xs sm:text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter your goal and AI will automatically break it down into structured, actionable tasks.
          </p>
          <form onSubmit={handleGenerateTasks} className="space-y-3 sm:space-y-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Enter your goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Finish AI project, Launch product"
                className="input-field text-sm"
                required
              />
            </div>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2 w-full text-sm sm:text-base">
              <span>🤖</span>
              <span>Generate Tasks with AI</span>
            </button>
          </form>
        </div>
      )}

      {/* Create New Task */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Create Task
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No tasks yet. Create one above!</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`rounded-lg p-4 hover:shadow-md transition-shadow ${theme === 'dark' ? 'border border-gray-700 bg-gray-800/50' : 'border border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                    )}
                    {task.goal && (
                      <p className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>🎯 Goal:</span>
                        <span>{task.goal}</span>
                        {task.aiGenerated && (
                          <span className={`px-1.5 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-primary-900 text-primary-300' : 'bg-primary-100 text-primary-700'}`}>
                            AI Generated
                          </span>
                        )}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                      className={`text-sm rounded px-2 py-1 ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'border border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;

