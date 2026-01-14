import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { startKeepAlive } from './utils/keepAlive';
import './index.css';

// Start keep-alive asynchronously to not block initial render
if ('requestIdleCallback' in window) {
  // Use requestIdleCallback if available (modern browsers)
  requestIdleCallback(() => startKeepAlive());
} else {
  // Fallback to setTimeout
  setTimeout(() => startKeepAlive(), 2000);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

