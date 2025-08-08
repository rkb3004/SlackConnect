'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, TestTube, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationsContext';
import { TestWebhookFormData } from '@/types';
import apiClient from '@/lib/api';

// Validation schema for test webhook
const testWebhookSchema = z.object({
    webhook_url: z.string().url('Please enter a valid webhook URL'),
    message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message cannot exceed 4000 characters'),
});

const TestWebhookForm: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addNotification } = useNotifications();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TestWebhookFormData>({
        resolver: zodResolver(testWebhookSchema),
        defaultValues: {
            webhook_url: '',
            message: 'Test message from SlackConnect',
        },
    });

    const onSubmit = async (data: TestWebhookFormData) => {
        try {
            setIsSubmitting(true);

            const response = await apiClient.testWebhook({
                webhook_url: data.webhook_url,
                message: data.message,
            });

            if (response.success) {
                addNotification('success', 'Test webhook sent successfully!');
                reset();
            } else {
                throw new Error(response.error || 'Failed to send test webhook');
            }
        } catch (error: any) {
            console.error('Error sending test webhook:', error);
            addNotification('error', error.message || 'Failed to send test webhook');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <TestTube className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-black">Test Webhook</h2>
                    <p className="text-sm text-black">Test any webhook URL with a custom message</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Webhook URL */}
                <div>
                    <label htmlFor="webhook-url" className="block text-sm font-medium text-black mb-2">
                        Webhook URL
                    </label>
                    <input
                        type="url"
                        id="webhook-url"
                        {...register('webhook_url')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://hooks.slack.com/services/..."
                    />
                    {errors.webhook_url && (
                        <p className="mt-1 text-sm text-red-600">{errors.webhook_url.message}</p>
                    )}
                </div>

                {/* Test Message */}
                <div>
                    <label htmlFor="test-message" className="block text-sm font-medium text-black mb-2">
                        Test Message
                    </label>
                    <textarea
                        id="test-message"
                        {...register('message')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter your test message here..."
                    />
                    {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Webhook
                    </Button>
                </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Webhook Testing</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Test any webhook URL to ensure it's working correctly</li>
                    <li>• Supports Slack incoming webhooks, Discord, Teams, and more</li>
                    <li>• Perfect for debugging webhook integrations</li>
                    <li>• The message will be sent immediately to the webhook URL</li>
                </ul>
                <div className="mt-3">
                    <a
                        href="https://api.slack.com/messaging/webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                        Learn about Slack webhooks
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TestWebhookForm;
