import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Expenses from './pages/Expenses';
import Meetings from './pages/Meetings';
import Emails from './pages/Emails';
import Toaster from './components/Toaster';
import { useEffect } from 'react';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-500 to-blue-500">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🤖</div>
          <div className="text-xl">Loading AIMate...</div>
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
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="emails" element={<Emails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

