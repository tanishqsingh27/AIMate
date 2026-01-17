import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HeroIllustration, TaskIllustration, MeetingIllustration, ExpenseIllustration, EmailIllustration } from '../components/Illustrations';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      title: 'Automated meeting notes',
      description: 'AI transcribes and summarizes your meetings automatically.',
      illustration: MeetingIllustration,
    },
    {
      title: 'Smart expense summaries',
      description: 'Get intelligent insights on your spending patterns.',
      illustration: ExpenseIllustration,
    },
    {
      title: 'Actionable task suggestions',
      description: 'AI breaks down goals into structured daily tasks.',
      illustration: TaskIllustration,
    },
    {
      title: 'AI email replies',
      description: 'Generate professional email responses instantly.',
      illustration: EmailIllustration,
    },
  ];

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' 
        ? 'bg-[#0A1128] text-white' 
        : 'bg-[#FAFAF8] text-gray-900'
    }`}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-[#50B4F7]/20 to-[#2A80B9]/20' 
                : 'bg-gradient-to-br from-primary-100 to-blue-100'
            }`}>
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
              }`}>AIMATE</h1>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>AI Productivity</p>
            </div>
          </div>

          {/* Center-Right: Auth Links */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                theme === 'dark'
                  ? 'text-[#50B4F7] hover:bg-gray-800/50'
                  : 'text-primary-600 hover:bg-primary-100/50'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#50B4F7] to-[#2A80B9] text-white'
                  : 'bg-gradient-to-r from-primary-500 to-blue-500 text-white'
              }`}
            >
              Sign Up
            </Link>

            {/* Right: Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-all transform hover:scale-110 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700' 
                  : 'bg-primary-100/50 hover:bg-primary-200/50 border border-primary-200'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <span className="text-xl">☀️</span>
              ) : (
                <span className="text-xl">🌙</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* New AI-boosted Tag */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
              theme === 'dark'
                ? 'border border-[#50B4F7]/30 bg-gray-900/50'
                : 'border border-primary-300 bg-primary-50'
            }`}>
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
              }`}>New</span>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>·</span>
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>AI-boosted</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="block">Build faster.</span>
                <span className="block">Focus smarter.</span>
                <span className="block">Ship more.</span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className={`text-xl md:text-2xl leading-relaxed max-w-2xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              A lightweight AI productivity assistant for teams — tasks, meetings, and insights in one place.
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-colors ${
                    theme === 'dark'
                      ? 'border border-gray-700 bg-gray-900/50 hover:border-[#50B4F7]/50'
                      : 'border border-gray-200 bg-white/80 hover:border-primary-400'
                  }`}
                >
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className={`text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity text-center ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-[#50B4F7] to-[#2A80B9]'
                    : 'bg-gradient-to-r from-primary-500 to-blue-500'
                }`}
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center ${
                  theme === 'dark'
                    ? 'border-2 border-gray-600 text-white hover:border-[#50B4F7] hover:text-[#50B4F7]'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Side - Hero Illustration */}
          <div className="relative">
            <div className="relative">
              {/* Glow Effect */}
              {theme === 'dark' && (
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#50B4F7]/20 rounded-full blur-3xl"></div>
              )}
              
              {/* Hero Dashboard Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <HeroIllustration theme={theme} className="w-full h-full object-cover" />
                {/* Overlay for better text readability if needed */}
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  theme === 'dark' ? 'from-[#0A1128]/20 to-transparent' : 'from-white/20 to-transparent'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section with Images */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Everything you need in one place
            </h2>
            <p className={`text-xl ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Powered by advanced AI to boost your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            {features.map((feature, index) => {
              const Illustration = feature.illustration;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-start gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Illustration */}
                  <div className="flex-1">
                    <div className="rounded-2xl overflow-hidden shadow-lg mb-0">
                      <Illustration className="w-full h-64" theme={theme} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <span
                      className={
                        theme === 'dark'
                          ? 'inline-flex text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-100'
                          : 'inline-flex text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700'
                      }
                    >
                      AI Feature
                    </span>
                    <h3 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className={`mt-32 rounded-3xl p-12 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border border-gray-800' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              How It Works
            </h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get started in minutes, see results immediately
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-[#50B4F7]/20' : 'bg-primary-100'
              }`}>
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Sign Up
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Create your free account in seconds
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-[#50B4F7]/20' : 'bg-primary-100'
              }`}>
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Connect & Setup
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Link your Gmail, add your first task or expense
              </p>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === 'dark' ? 'bg-[#50B4F7]/20' : 'bg-primary-100'
              }`}>
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Let AI Work
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Watch AI automate your workflow
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className={`text-6xl font-bold mb-2 ${
              theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
            }`}>4</div>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>AI Modules</p>
          </div>
          <div>
            <div className={`text-6xl font-bold mb-2 ${
              theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
            }`}>100%</div>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>AI Powered</p>
          </div>
          <div>
            <div className={`text-6xl font-bold mb-2 ${
              theme === 'dark' ? 'text-[#50B4F7]' : 'text-primary-600'
            }`}>24/7</div>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Available</p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className={`mt-32 rounded-3xl p-12 text-center ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-[#50B4F7]/10 to-[#2A80B9]/10 border border-[#50B4F7]/20'
            : 'bg-gradient-to-r from-[#EBF4FF] to-[#DBEAFE] border border-primary-200'
        }`}>
          <h2 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Boost Your Productivity?
          </h2>
          <p className={`text-xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of users who are already using AI to work smarter.
          </p>
          <Link
            to="/register"
            className={`inline-block px-10 py-5 rounded-lg font-bold text-xl hover:opacity-90 transition-opacity ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-[#50B4F7] to-[#2A80B9] text-white'
                : 'bg-gradient-to-r from-primary-500 to-blue-500 text-white'
            }`}
          >
            Start Your Free Journey →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className={`border-t mt-32 py-8 ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className={`container mx-auto px-4 text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p>© 2026 AIMate - AI Productivity Assistant | Built with ❤️ using MERN Stack</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
