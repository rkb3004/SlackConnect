'use client';

import React, { useState, useEffect } from 'react';
import { Bug, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DebugLog {
  id: string;
  timestamp: Date;
  type: 'api' | 'auth' | 'error' | 'info';
  message: string;
  data?: any;
}

let debugLogs: DebugLog[] = [];
const maxLogs = 50;

// Global debug logger function
export const addDebugLog = (type: DebugLog['type'], message: string, data?: any) => {
  const log: DebugLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    type,
    message,
    data
  };
  
  debugLogs = [log, ...debugLogs.slice(0, maxLogs - 1)];
  
  // Dispatch custom event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('debugLog', { detail: log }));
  }
};

export const DebugConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const handleDebugLog = (event: CustomEvent) => {
      setLogs(prev => [event.detail, ...prev.slice(0, maxLogs - 1)]);
    };

    window.addEventListener('debugLog', handleDebugLog as EventListener);
    return () => window.removeEventListener('debugLog', handleDebugLog as EventListener);
  }, []);

  useEffect(() => {
    setLogs(debugLogs);
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  const getTypeColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'api': return 'text-blue-600 bg-blue-50';
      case 'auth': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Only show in development or if debug mode is enabled
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DEBUG_MODE) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Open Debug Console"
        >
          <Bug className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border max-w-md w-96 max-h-96 overflow-hidden">
          <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              <span className="font-medium">Debug Console</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-3 border-b">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-1 border rounded text-sm"
            >
              <option value="all">All Logs</option>
              <option value="api">API Calls</option>
              <option value="auth">Authentication</option>
              <option value="error">Errors</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="overflow-y-auto max-h-64 p-2">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No logs to display</p>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className={`p-2 rounded text-xs ${getTypeColor(log.type)}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium uppercase">{log.type}</span>
                      <span className="text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-700">{log.message}</div>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-gray-600">Data</summary>
                        <pre className="mt-1 text-xs overflow-x-auto bg-gray-100 p-1 rounded">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-2 text-xs text-center text-gray-600">
            {filteredLogs.length} logs
          </div>
        </div>
      )}
    </div>
  );
};
