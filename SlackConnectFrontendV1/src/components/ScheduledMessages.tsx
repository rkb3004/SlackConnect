'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, RefreshCw, MessageSquare, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useNotifications } from '@/contexts/NotificationsContext';
import { ScheduledMessage } from '@/types';
import apiClient from '@/lib/api';
import { formatDate, formatRelativeTime, truncateText } from '@/lib/utils';

interface ScheduledMessagesProps {
  refreshTrigger?: number;
}

const ScheduledMessages: React.FC<ScheduledMessagesProps> = ({ refreshTrigger }) => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const { addNotification } = useNotifications();

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getScheduledMessages();

      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        throw new Error(response.error || 'Failed to load scheduled messages');
      }
    } catch (error: any) {
      console.error('Error loading scheduled messages:', error);
      addNotification('error', error.message || 'Failed to load scheduled messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages on mount and when refresh is triggered
  useEffect(() => {
    loadMessages();
  }, [refreshTrigger]);

  const handleCancelMessage = async (messageId: string) => {
    try {
      setCancellingIds(prev => new Set(prev).add(messageId));

      const response = await apiClient.cancelScheduledMessage(messageId);

      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        addNotification('success', 'Scheduled message cancelled');
      } else {
        throw new Error(response.error || 'Failed to cancel message');
      }
    } catch (error: any) {
      console.error('Error cancelling message:', error);
      addNotification('error', error.message || 'Failed to cancel message');
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: ScheduledMessage['status']) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      sent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sent' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    };

    const { bg, text, label } = config[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return <Loading message="Loading scheduled messages..." />;
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Messages</h3>
          <p className="text-gray-500">
            Messages you schedule will appear here. You can manage and cancel them before they&apos;re sent.
          </p>
        </div>
      </div>
    );
  }

  // Sort messages: pending first, then by scheduled time
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return a.scheduled_for - b.scheduled_for;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Scheduled Messages</h2>
        <Button variant="ghost" size="sm" onClick={loadMessages}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedMessages.map((message) => {
          const isCancelling = cancellingIds.has(message.id);
          const canCancel = message.status === 'pending';
          const scheduledTime = message.scheduled_for * 1000;
          const isPastDue = scheduledTime < Date.now() && message.status === 'pending';

          return (
            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span className="font-medium">#{message.channel_name}</span>
                    </div>
                    {getStatusBadge(message.status)}
                    {isPastDue && (
                      <div className="flex items-center text-amber-600" title="Past due - processing">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Processing</span>
                      </div>
                    )}
                  </div>

                  {/* Message Preview */}
                  <div className="mb-3">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {truncateText(message.message, 200)}
                    </p>
                  </div>

                  {/* Timing Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {formatDate(message.scheduled_for)} ({formatRelativeTime(message.scheduled_for)})
                      </span>
                    </div>
                    {message.sent_at && (
                      <div className="flex items-center text-green-600">
                        <span>Sent {formatRelativeTime(message.sent_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {message.error_message && (
                    <div className="mt-2 p-2 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {message.error_message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {canCancel && (
                  <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelMessage(message.id)}
                      loading={isCancelling}
                      disabled={isCancelling}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduledMessages;
