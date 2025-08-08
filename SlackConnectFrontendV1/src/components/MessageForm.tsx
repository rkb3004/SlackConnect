'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Clock, ChevronDown } from 'lucide-react';
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

  // Load channels on mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await apiClient.getChannels();
        if (response.success && response.data) {
          setChannels(response.data);
        } else {
          throw new Error(response.error || 'Failed to load channels');
        }
      } catch (error: any) {
        console.error('Error loading channels:', error);
        addNotification('error', error.message || 'Failed to load channels');
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

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-black mb-4">
        {isScheduled ? 'Schedule Message' : 'Send Message'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Channel Selection */}
        <div>
          <label htmlFor="channel_id" className="block text-sm font-medium text-black mb-2">
            Channel
          </label>
          <div className="relative">
            <select
              id="channel_id"
              {...register('channel_id')}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white"
              disabled={isLoadingChannels}
            >
              <option value="">
                {isLoadingChannels ? 'Loading channels...' : 'Select a channel'}
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.is_private ? '🔒' : '#'} {channel.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.channel_id && (
            <p className="mt-1 text-sm text-red-600">{errors.channel_id.message}</p>
          )}
          {selectedChannel && (
            <p className="mt-1 text-xs text-black">
              {selectedChannel.is_private ? 'Private channel' : 'Public channel'}
              {selectedChannel.is_general && ' • General channel'}
            </p>
          )}
        </div>

        {/* Message Content */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your message here..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
          <div className="mt-1 flex justify-between">
            <p className="text-xs text-black">
              Supports Slack formatting (markdown, mentions, etc.)
            </p>
            <p className="text-xs text-black">
              {watch('message')?.length || 0}/4000
            </p>
          </div>
        </div>

        {/* Schedule Toggle */}
        <div className="flex items-center">
          <input
            id="is_scheduled"
            type="checkbox"
            {...register('is_scheduled')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_scheduled" className="ml-2 block text-sm text-black">
            Schedule for later
          </label>
        </div>

        {/* Schedule Date/Time */}
        {isScheduled && (
          <div className="animate-in slide-in-from-top duration-200">
            <label htmlFor="scheduled_for" className="block text-sm font-medium text-black mb-2">
              Schedule Date & Time
            </label>
            <input
              id="scheduled_for"
              type="datetime-local"
              {...register('scheduled_for')}
              min={getMinScheduleDate()}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.scheduled_for && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_for.message}</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || isLoadingChannels}
            className="w-full"
          >
            {isScheduled ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Schedule Message
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageForm;
