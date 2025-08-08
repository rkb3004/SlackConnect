'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Clock, Webhook } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationsContext';
import { WebhookFormData } from '@/types';
import apiClient from '@/lib/api';
import { getMinScheduleDate, dateToTimestamp } from '@/lib/utils';

// Validation schema for webhook messages
const webhookMessageSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
    is_scheduled: z.boolean().default(false),
    scheduled_for: z.string().optional(),
}).refine((data) => {
    if (data.is_scheduled && !data.scheduled_for) {
        return false;
    }
    if (data.is_scheduled && data.scheduled_for) {
        const scheduledDate = new Date(data.scheduled_for);
        const minDate = new Date(getMinScheduleDate());
        return scheduledDate >= minDate;
    }
    return true;
}, {
    message: 'Scheduled time must be at least 1 minute from now',
    path: ['scheduled_for'],
});

interface WebhookMessageFormProps {
    onMessageSent?: () => void;
}

const WebhookMessageForm: React.FC<WebhookMessageFormProps> = ({ onMessageSent }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotifications();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<WebhookFormData>({
        resolver: zodResolver(webhookMessageSchema),
        defaultValues: {
            message: '',
            is_scheduled: false,
            scheduled_for: getMinScheduleDate(),
        },
    });

    const isScheduled = watch('is_scheduled');

    const onSubmit = async (data: WebhookFormData) => {
        try {
            setIsSubmitting(true);

            if (data.is_scheduled && data.scheduled_for) {
                // Schedule webhook message
                const scheduledTimestamp = dateToTimestamp(new Date(data.scheduled_for));

                const response = await apiClient.scheduleWebhookMessage({
                    message: data.message,
                    scheduled_for: scheduledTimestamp,
                });

                if (response.success) {
                    addNotification('success', 'Webhook message scheduled successfully!');
                    reset();
                } else {
                    throw new Error(response.error || 'Failed to schedule webhook message');
                }
            } else {
                // Send immediate webhook message
                const response = await apiClient.sendWebhookMessage({
                    message: data.message,
                });

                if (response.success) {
                    addNotification('success', 'Webhook message sent successfully!');
                    reset();
                } else {
                    throw new Error(response.error || 'Failed to send webhook message');
                }
            }

            onMessageSent?.();
        } catch (error: any) {
            console.error('Error sending webhook message:', error);
            addNotification('error', error.message || 'Failed to send webhook message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Webhook className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-black">Send Webhook Message</h2>
                    <p className="text-sm text-black">Send messages directly via webhook endpoints (no authentication required)</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Message Content */}
                <div>
                    <label htmlFor="webhook-message" className="block text-sm font-medium text-black mb-2">
                        Message Content
                    </label>
                    <textarea
                        id="webhook-message"
                        {...register('message')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Enter your message here..."
                    />
                    {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                </div>

                {/* Scheduling Options */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <input
                            type="checkbox"
                            id="webhook-schedule"
                            {...register('is_scheduled')}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="webhook-schedule" className="flex items-center text-sm font-medium text-black">
                            <Clock className="w-4 h-4 mr-1" />
                            Schedule for later
                        </label>
                    </div>

                    {isScheduled && (
                        <div>
                            <label htmlFor="webhook-scheduled-for" className="block text-sm font-medium text-black mb-2">
                                Schedule Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                id="webhook-scheduled-for"
                                {...register('scheduled_for')}
                                min={getMinScheduleDate()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            {errors.scheduled_for && (
                                <p className="mt-1 text-sm text-red-600">{errors.scheduled_for.message}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isScheduled ? (
                            <>
                                <Clock className="w-4 h-4 mr-2" />
                                Schedule Webhook Message
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Webhook Message
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">About Webhook Messages</h4>
                <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Webhook messages are sent directly to your configured default channel</li>
                    <li>• No authentication required - these endpoints are public</li>
                    <li>• Perfect for external integrations and automated systems</li>
                    <li>• Scheduled messages will be delivered at the specified time</li>
                </ul>
            </div>
        </div>
    );
};

export default WebhookMessageForm;
