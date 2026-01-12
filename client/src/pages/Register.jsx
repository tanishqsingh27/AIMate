import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created successfully! Welcome to AIMate!');
      navigate('/app');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 transition-colors ${
      theme === 'dark' 
        ? 'bg-[#0A1128]' 
        : 'bg-[#F5F7FA]'
    }`}>
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <span className="text-xl">☀️</span>
            ) : (
              <span className="text-xl">🌙</span>
            )}
          </button>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-block mb-4">
            <span className="text-5xl">🤖</span>
          </Link>
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
          }`}>Join AIMate</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Start your AI-powered productivity journey
          </p>
        </div>

        {/* Register Card */}
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl p-8 ${
          theme === 'dark' 
            ? 'bg-gray-900/80 border border-gray-800' 
            : 'bg-white/90 border border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' 
                    : 'border border-gray-300'
                }`}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' 
                    : 'border border-gray-300'
                }`}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500' 
                    : 'border border-gray-300'
                }`}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>Must be at least 6 characters long</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Already have an account?{' '}
              <Link to="/login" className="text-[#50B4F7] font-semibold hover:text-[#2A80B9] hover:underline">
                Sign in
              </Link>
            </p>
            <Link
              to="/landing"
              className={`block mt-4 text-sm hover:underline ${
                theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ← Back to home
            </Link>
          </div>

          {/* Benefits */}
          <div className={`mt-6 pt-6 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className={`text-xs text-center mb-3 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>What you'll get:</p>
            <div className={`grid grid-cols-2 gap-2 text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-1">
                <span>✅</span>
                <span>AI Task Manager</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✅</span>
                <span>Smart Expenses</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✅</span>
                <span>Meeting Notes</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✅</span>
                <span>Email Assistant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
