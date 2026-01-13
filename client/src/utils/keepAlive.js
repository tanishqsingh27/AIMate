/**
 * Keep the backend server alive by pinging it periodically
 * This helps prevent cold starts on Render free tier
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const startKeepAlive = () => {
  // Ping every 10 minutes (Render free tier spins down after 15 min of inactivity)
  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const ping = async () => {
    try {
      await fetch(`${API_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      console.log('🏓 Server pinged successfully');
    } catch (error) {
      // Silently fail - server might be cold starting
      console.log('🔴 Server ping failed (might be cold starting)');
    }
  };

  // Initial ping
  ping();

  // Set up interval
  const intervalId = setInterval(ping, PING_INTERVAL);

  // Return cleanup function
  return () => clearInterval(intervalId);
};
