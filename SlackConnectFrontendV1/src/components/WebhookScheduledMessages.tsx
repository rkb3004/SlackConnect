'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Edit2, X, Check, AlertCircle, Webhook } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useNotifications } from '@/contexts/NotificationsContext';
import { ScheduledMessage } from '@/types';
import apiClient from '@/lib/api';
import { formatDate, getMinScheduleDate, dateToTimestamp } from '@/lib/utils';

interface WebhookScheduledMessagesProps {
    refreshTrigger?: number;
}

const WebhookScheduledMessages: React.FC<WebhookScheduledMessagesProps> = ({ refreshTrigger = 0 }) => {
    const [messages, setMessages] = useState<ScheduledMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState('');
    const [editScheduledFor, setEditScheduledFor] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const { addNotification } = useNotifications();

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.getWebhookScheduledMessages();

            if (response.success) {
                setMessages(response.data || []);
            } else {
                throw new Error(response.error || 'Failed to fetch scheduled messages');
            }
        } catch (error: any) {
            console.error('Error fetching webhook scheduled messages:', error);
            addNotification('error', error.message || 'Failed to load scheduled messages');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [refreshTrigger]);

    const handleCancel = async (messageId: string) => {
        try {
            const response = await apiClient.cancelWebhookScheduledMessage(messageId);

            if (response.success) {
                addNotification('success', 'Webhook message cancelled successfully');
                fetchMessages(); // Refresh the list
            } else {
                throw new Error(response.error || 'Failed to cancel message');
            }
        } catch (error: any) {
            console.error('Error cancelling message:', error);
            addNotification('error', error.message || 'Failed to cancel message');
        }
    };

    const handleStartEdit = (message: ScheduledMessage) => {
        setEditingId(message.id);
        setEditMessage(message.message);

        // Convert timestamp to datetime-local format
        const date = new Date(message.scheduled_for * 1000);
        const localDateTime = date.toISOString().slice(0, 16);
        setEditScheduledFor(localDateTime);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditMessage('');
        setEditScheduledFor('');
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            setIsUpdating(true);

            const scheduledTimestamp = dateToTimestamp(new Date(editScheduledFor));

            const response = await apiClient.updateWebhookScheduledMessage(editingId, {
                message: editMessage,
                scheduled_for: scheduledTimestamp,
            });

            if (response.success) {
                addNotification('success', 'Webhook message updated successfully');
                setEditingId(null);
                setEditMessage('');
                setEditScheduledFor('');
                fetchMessages(); // Refresh the list
            } else {
                throw new Error(response.error || 'Failed to update message');
            }
        } catch (error: any) {
            console.error('Error updating message:', error);
            addNotification('error', error.message || 'Failed to update message');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'sent':
                return 'text-green-600 bg-green-100';
            case 'cancelled':
                return 'text-black bg-gray-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-black bg-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Webhook className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-black">Webhook Scheduled Messages</h2>
                </div>
                <Loading message="Loading webhook scheduled messages..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Webhook className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-black">Webhook Scheduled Messages</h2>
                        <p className="text-sm text-black">Manage messages scheduled via webhooks</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchMessages}
                    className="text-purple-600 hover:text-purple-700"
                >
                    Refresh
                </Button>
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-black mx-auto mb-3" />
                    <p className="text-black">No webhook scheduled messages found</p>
                    <p className="text-sm text-black mt-1">
                        Messages scheduled via webhook endpoints will appear here
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            {editingId === message.id ? (
                                // Edit mode
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Scheduled For
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={editScheduledFor}
                                            onChange={(e) => setEditScheduledFor(e.target.value)}
                                            min={getMinScheduleDate()}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            disabled={isUpdating}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            loading={isUpdating}
                                            disabled={isUpdating}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // View mode
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-purple-600">
                                                    TeamAlpha Workspace
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        message.status
                                                    )}`}
                                                >
                                                    {message.status}
                                                </span>
                                            </div>
                                            <p className="text-black mb-2 whitespace-pre-wrap">{message.message}</p>
                                            <div className="text-sm text-black space-y-1">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>
                                                        Scheduled: {formatDate(message.scheduled_for)}
                                                    </span>
                                                </div>
                                                {message.sent_at && (
                                                    <div className="flex items-center text-green-600">
                                                        <Check className="w-4 h-4 mr-1" />
                                                        <span>Sent: {formatDate(message.sent_at)}</span>
                                                    </div>
                                                )}
                                                {message.error_message && (
                                                    <div className="flex items-center text-red-600">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        <span>Error: {message.error_message}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {message.status === 'pending' && (
                                            <div className="flex space-x-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStartEdit(message)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancel(message.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Webhook Messages Info</h4>
                <ul className="text-xs text-purple-700 space-y-1">
                    <li>• These messages are scheduled via webhook endpoints without authentication</li>
                    <li>• All webhook messages are sent to the TeamAlpha workspace</li>
                    <li>• You can edit or cancel pending messages</li>
                    <li>• Sent, cancelled, or failed messages cannot be modified</li>
                </ul>
            </div>
        </div>
    );
};

export default WebhookScheduledMessages;
