// Simple diagnostic component to check API connectivity
// Usage: Add ?debug=true to URL to see this panel

import { useEffect, useState } from 'react';
import axios from 'axios';

const DiagnosticPanel = () => {
  const [diagnostics, setDiagnostics] = useState({
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    mode: import.meta.env.MODE,
    healthCheck: 'checking...',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Check if API is reachable
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await axios.get(`${apiUrl.replace('/api', '')}/api/health`, {
          timeout: 10000,
        });
        setDiagnostics(prev => ({
          ...prev,
          healthCheck: '✅ Connected',
          healthData: response.data,
        }));
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          healthCheck: '❌ Failed to connect',
          error: error.message,
          errorCode: error.code,
        }));
      }
    };

    checkHealth();
  }, []);

  // Only show if ?debug=true in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('debug')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md z-50 text-xs font-mono">
      <h3 className="font-bold mb-2 text-sm">🔧 Diagnostics</h3>
      <div className="space-y-1">
        <div><span className="text-gray-400">API URL:</span> {diagnostics.apiUrl}</div>
        <div><span className="text-gray-400">Mode:</span> {diagnostics.mode}</div>
        <div><span className="text-gray-400">Health:</span> {diagnostics.healthCheck}</div>
        {diagnostics.healthData && (
          <div><span className="text-gray-400">Backend:</span> {diagnostics.healthData.message}</div>
        )}
        {diagnostics.error && (
          <>
            <div className="text-red-400 mt-2">Error: {diagnostics.error}</div>
            {diagnostics.errorCode && <div className="text-red-400">Code: {diagnostics.errorCode}</div>}
          </>
        )}
        <div className="text-gray-500 mt-2 pt-2 border-t border-gray-700">
          Add ?debug=true to URL to see this panel
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPanel;
