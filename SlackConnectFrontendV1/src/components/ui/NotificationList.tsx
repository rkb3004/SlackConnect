'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400',
  },
};

const NotificationList: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const config = notificationConfig[notification.type];
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start p-4 rounded-lg border shadow-lg max-w-sm',
              'transform transition-all duration-300 ease-in-out',
              'animate-in slide-in-from-right',
              config.bgColor,
              config.borderColor
            )}
          >
            <Icon className={cn('w-5 h-5 mr-3 mt-0.5 flex-shrink-0', config.iconColor)} />
            <div className="flex-1">
              <p className={cn('text-sm font-medium', config.textColor)}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={cn(
                'ml-3 flex-shrink-0 rounded-md p-1.5 inline-flex',
                'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.iconColor
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList;
