'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, RefreshCw, MessageSquare, AlertTriangle, CheckCircle, Hash, Lock } from 'lucide-react';
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
      pending: { 
        bg: 'bg-yellow-500/20', 
        text: 'text-yellow-400', 
        icon: Clock,
        label: 'Pending' 
      },
      sent: { 
        bg: 'bg-green-500/20', 
        text: 'text-green-400', 
        icon: CheckCircle,
        label: 'Delivered' 
      },
      cancelled: { 
        bg: 'bg-slate-500/20', 
        text: 'text-slate-400', 
        icon: AlertTriangle,
        label: 'Cancelled' 
      },
      failed: { 
        bg: 'bg-red-500/20', 
        text: 'text-red-400', 
        icon: AlertTriangle,
        label: 'Failed' 
      },
    };

    const { bg, text, icon: Icon, label } = config[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text} border border-current/20`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  if (isLoading) {
    return <Loading message="Loading scheduled messages..." />;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-slate-500/10 rounded-full w-fit mx-auto mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Scheduled Messages</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Messages you schedule will appear here. You can manage and cancel them before delivery.
        </p>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-white">Scheduled Messages</h3>
          <span className="bg-slate-500/20 text-slate-300 text-xs px-2 py-1 rounded-full">
            {messages.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadMessages}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {sortedMessages.map((message) => {
          const isCancelling = cancellingIds.has(message.id);
          const canCancel = message.status === 'pending';
          const scheduledTime = message.scheduled_for * 1000;
          const isPastDue = scheduledTime < Date.now() && message.status === 'pending';

          return (
            <div key={message.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
              <div className="flex items-start justify-between space-x-4">
                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Hash className="w-3 h-3" />
                      <span>{message.channel_name || 'Unknown Channel'}</span>
                    </div>
                    {getStatusBadge(message.status)}
                    {isPastDue && (
                      <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/20">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white text-sm mb-3 leading-relaxed">
                    {truncateText(message.message, 120)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(scheduledTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(scheduledTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {canCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelMessage(message.id)}
                    disabled={isCancelling}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 shrink-0"
                  >
                    {isCancelling ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
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
