/**
 * Keep the backend server alive by pinging it periodically
 * This helps prevent cold starts on Render free tier
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const startKeepAlive = () => {
  // Ping every 5 minutes to keep server warm (Vercel cold starts after 10 min inactivity)
  const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  let isActive = true;
  let intervalId;

  const ping = async () => {
    // Skip if not active or if page is hidden
    if (!isActive || document.hidden) return;
    
    try {
      await fetch(`${API_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
        priority: 'low' // Don't interfere with user requests
      });
      console.log('🏓 Keep-alive ping sent');
    } catch (error) {
      // Silently fail - don't log to reduce noise
    }
  };

  // Start pinging after 5 seconds (let the app initialize first)
  setTimeout(() => {
    ping();
    intervalId = setInterval(ping, PING_INTERVAL);
  }, 5000);

  // Pause pinging when page is hidden
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isActive = false;
    } else {
      isActive = true;
      ping(); // Ping when user returns
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
