import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: '📊' },
    { name: 'Tasks', href: '/app/tasks', icon: '✅' },
    { name: 'Expenses', href: '/app/expenses', icon: '💰' },
    { name: 'Meetings', href: '/app/meetings', icon: '🎤' },
    { name: 'Emails', href: '/app/emails', icon: '📧' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`min-h-screen transition-colors ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F7FA]'
      }`}
    >
      {/* Top Bar */}
      <header
        className={`w-full px-4 sm:px-6 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b transition-colors ${
          theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
          <div>
            <h1
              className={`text-xl font-bold ${
                theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
              }`}
            >
              AIMate
            </h1>
          </div>

          {/* Horizontal Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-[#50B4F7] font-medium'
                      : 'bg-primary-100 text-primary-700 font-medium'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <span className="text-lg">☀️</span>
            ) : (
              <span className="text-lg">🌙</span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              aria-label="User menu"
            >
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50 border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-700 text-gray-100'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {user?.name || 'Logged in'}
                  </p>
                  {user?.email && (
                    <p
                      className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Mobile Navigation - shown only on small screens */}
                <nav className="md:hidden py-1 border-b border-gray-200 dark:border-gray-700">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive(item.href)
                          ? theme === 'dark'
                            ? 'bg-gray-800 text-[#50B4F7] font-medium'
                            : 'bg-primary-50 text-primary-700 font-medium'
                          : theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-800'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>

                <div className="px-3 py-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className={`w-full text-left text-sm py-2 px-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-gray-800'
                        : 'text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`px-4 sm:px-6 md:px-8 py-6 transition-colors max-w-full overflow-x-hidden ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F7FA]'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

