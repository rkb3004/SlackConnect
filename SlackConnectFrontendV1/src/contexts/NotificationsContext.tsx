'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { NotificationState } from '@/types';
import { generateId } from '@/lib/utils';

interface NotificationsContextType {
  notifications: NotificationState[];
  addNotification: (type: NotificationState['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = useCallback((type: NotificationState['type'], message: string) => {
    // Prevent duplicate error notifications
    const isDuplicate = notifications.some(n => 
      n.type === type && n.message === message
    );
    
    // Don't show network error notifications repeatedly
    if (type === 'error' && (message.includes('Network Error') || message.includes('Failed to load') || isDuplicate)) {
      console.warn('Suppressed duplicate or network error notification:', message);
      return;
    }

    const notification: NotificationState = {
      id: generateId(),
      type,
      message,
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto remove after 5 seconds for success notifications, 10 seconds for errors
    const timeout = type === 'error' ? 10000 : 5000;
    if (type === 'success' || type === 'info' || type === 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, timeout);
    }
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue: NotificationsContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
