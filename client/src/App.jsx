import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Suspense, lazy, useEffect } from 'react';
import Toaster from './components/Toaster';
import DiagnosticPanel from './components/DiagnosticPanel';

// Code splitting - lazy load pages for faster initial load
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Meetings = lazy(() => import('./pages/Meetings'));
const Emails = lazy(() => import('./pages/Emails'));

// Subtle loading component
function SimpleLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center text-gray-600 dark:text-gray-400">
        <div className="text-sm">Loading...</div>
      </div>
    </div>
  );
}

// Gmail OAuth Callback Handler Component
function GmailCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the code from URL and redirect to emails page with it
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
      navigate('/app/emails?error=' + error);
    } else if (code) {
      navigate('/app/emails?code=' + code);
    } else {
      navigate('/app/emails');
    }
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-2xl mb-2">Connecting Gmail...</div>
        <div className="text-gray-500">Please wait</div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <div className="text-sm">Loading AIMate...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/landing" />;
}

function App() {
  return (
    <>
      <Toaster />
      <DiagnosticPanel />
      <Suspense fallback={<SimpleLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emails" element={<GmailCallback />} />
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Suspense fallback={<SimpleLoader />}><Dashboard /></Suspense>} />
            <Route path="tasks" element={<Suspense fallback={<SimpleLoader />}><Tasks /></Suspense>} />
            <Route path="expenses" element={<Suspense fallback={<SimpleLoader />}><Expenses /></Suspense>} />
            <Route path="meetings" element={<Suspense fallback={<SimpleLoader />}><Meetings /></Suspense>} />
            <Route path="emails" element={<Suspense fallback={<SimpleLoader />}><Emails /></Suspense>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

