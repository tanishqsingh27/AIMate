import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before API call
    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (error) {
      // Enhanced error handling for different scenarios
      console.error('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection and try again.');
      } else if (error.message === 'Network Error') {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else if (error.response) {
        // Server responded with error
        const errorMsg = error.response.data?.error || 'Login failed';
        toast.error(errorMsg);
      } else {
        // Unknown error
        toast.error('Login failed. Please try again.');
      }
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
          }`}>AIMate</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Sign in to your AI-powered workspace
          </p>
        </div>

        {/* Login Card */}
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl p-8 ${
          theme === 'dark' 
            ? 'bg-gray-900/80 border border-gray-800' 
            : 'bg-white/95'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                } ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                } ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Signing in... (Server might be waking up, please wait)</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Don't have an account?{' '}
              <Link to="/register" className="text-[#50B4F7] font-semibold hover:text-[#2A80B9] hover:underline">
                Create one now
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
        </div>
      </div>
    </div>
  );
};

export default Login;
