'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Clock, ChevronDown, Hash, Users, MessageCircle, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationsContext';
import { SlackChannel, MessageFormData } from '@/types';
import apiClient from '@/lib/api';
import { getMinScheduleDate, dateToTimestamp } from '@/lib/utils';

// Validation schema
const messageSchema = z.object({
  channel_id: z.string().min(1, 'Please select a channel'),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
  is_scheduled: z.boolean().default(false),
  scheduled_for: z.string().optional(),
}).refine((data) => {
  if (data.is_scheduled && !data.scheduled_for) {
    return false;
  }
  if (data.is_scheduled && data.scheduled_for) {
    const scheduledDate = new Date(data.scheduled_for);
    return scheduledDate.getTime() > Date.now();
  }
  return true;
}, {
  message: 'Please select a valid future date and time',
  path: ['scheduled_for'],
});

interface MessageFormProps {
  onMessageSent?: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onMessageSent }) => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<SlackChannel | null>(null);
  const [messageLength, setMessageLength] = useState(0);
  const { addNotification } = useNotifications();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      channel_id: '',
      message: '',
      is_scheduled: false,
      scheduled_for: '',
    },
  });

  const isScheduled = watch('is_scheduled');
  const selectedChannelId = watch('channel_id');

  // Load channels on mount with authentication check
  useEffect(() => {
    const loadChannels = async () => {
      // Only load channels if user is authenticated and has a token
      if (!apiClient.getToken()) {
        setIsLoadingChannels(false);
        return;
      }

      try {
        // Add a small delay to prevent simultaneous requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await apiClient.getChannels();
        if (response.success && response.data) {
          setChannels(response.data);
        } else {
          throw new Error(response.error || 'Failed to load channels');
        }
      } catch (error: any) {
        console.error('Error loading channels:', error);
        // Only show error notification if it's not a network/auth error
        if (error.status !== 401 && !error.message?.includes('Network Error')) {
          addNotification('error', error.message || 'Failed to load channels');
        }
      } finally {
        setIsLoadingChannels(false);
      }
    };

    loadChannels();
  }, [addNotification]);

  const onSubmit = async (data: MessageFormData) => {
    try {
      setIsSubmitting(true);

      const selectedChannel = channels.find(c => c.id === data.channel_id);
      if (!selectedChannel) {
        throw new Error('Selected channel not found');
      }

      if (data.is_scheduled && data.scheduled_for) {
        // Schedule message
        const scheduledTimestamp = dateToTimestamp(new Date(data.scheduled_for));

        const response = await apiClient.scheduleMessage({
          channel_id: data.channel_id,
          channel_name: selectedChannel.name,
          message: data.message,
          scheduled_for: scheduledTimestamp,
        });

        if (response.success) {
          addNotification('success', 'Message scheduled successfully!');
          reset();
        } else {
          throw new Error(response.error || 'Failed to schedule message');
        }
      } else {
        // Send immediate message
        const response = await apiClient.sendMessage({
          channel_id: data.channel_id,
          message: data.message,
        });

        if (response.success) {
          addNotification('success', 'Message sent successfully!');
          reset();
        } else {
          throw new Error(response.error || 'Failed to send message');
        }
      }

      onMessageSent?.();
    } catch (error: any) {
      console.error('Error sending message:', error);
      addNotification('error', error.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedChannelData = channels.find(c => c.id === selectedChannelId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isScheduled ? 'Schedule Message Delivery' : 'Compose Message'}
            </h2>
            <p className="text-sm text-slate-400">
              {isScheduled ? 'Set a future delivery time for your message' : 'Send instant message to Slack channel'}
            </p>
          </div>
        </div>
        
        {/* Delivery Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setValue('is_scheduled', false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              !isScheduled 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3 h-3 inline mr-1" />
            Instant
          </button>
          <button
            type="button"
            onClick={() => setValue('is_scheduled', true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              isScheduled 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />
            Scheduled
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Channel Selection */}
        <div className="space-y-2">
          <label htmlFor="channel_id" className="block text-sm font-medium text-white">
            Target Channel
          </label>
          <div className="relative">
            <select
              id="channel_id"
              {...register('channel_id')}
              onChange={(e) => {
                const channel = channels.find(c => c.id === e.target.value);
                setSelectedChannel(channel || null);
              }}
              className="block w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white placeholder-slate-400 appearance-none transition-colors"
              disabled={isLoadingChannels}
            >
              <option value="" className="bg-slate-800">
                {isLoadingChannels ? 'Loading channels...' : 'Select a channel'}
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id} className="bg-slate-800">
                  {channel.is_private ? '🔒' : '#'} {channel.name}
                  {channel.is_general ? ' (General)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          
          {errors.channel_id && (
            <p className="text-sm text-red-400 flex items-center">
              <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
              {errors.channel_id.message}
            </p>
          )}
          
          {selectedChannel && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              {selectedChannel.is_private ? (
                <Users className="w-3 h-3" />
              ) : (
                <Hash className="w-3 h-3" />
              )}
              <span>
                {selectedChannel.is_private ? 'Private channel' : 'Public channel'}
                {selectedChannel.is_general && ' • Default channel'}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="message" className="block text-sm font-medium text-white">
              Message Content
            </label>
            <span className={`text-xs ${
              messageLength > 3500 ? 'text-red-400' : 
              messageLength > 3000 ? 'text-yellow-400' : 
              'text-slate-400'
            }`}>
              {messageLength}/4000
            </span>
          </div>
          <textarea
            id="message"
            {...register('message')}
            onChange={(e) => setMessageLength(e.target.value.length)}
            rows={4}
            className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white placeholder-slate-400 resize-none transition-colors"
            placeholder="Type your message here..."
          />
          {errors.message && (
            <p className="text-sm text-red-400 flex items-center">
              <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Scheduling Options */}
        {isScheduled && (
          <div className="space-y-2 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <label htmlFor="scheduled_for" className="block text-sm font-medium text-white">
              Delivery Schedule
            </label>
            <input
              type="datetime-local"
              id="scheduled_for"
              {...register('scheduled_for')}
              min={getMinScheduleDate()}
              className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg text-white transition-colors"
            />
            {errors.scheduled_for && (
              <p className="text-sm text-red-400 flex items-center">
                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                {errors.scheduled_for.message}
              </p>
            )}
            <p className="text-xs text-purple-300">
              <Clock className="w-3 h-3 inline mr-1" />
              Message will be delivered at the specified time
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || isLoadingChannels}
          className={`w-full py-3 font-medium rounded-lg transition-all ${
            isScheduled
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isScheduled ? 'Scheduling...' : 'Sending...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {isScheduled ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Message
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageForm;
