'use client';

import React, { useState } from 'react';
import { Webhook, TestTube, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import WebhookMessageForm from '@/components/WebhookMessageForm';
import TestWebhookForm from '@/components/TestWebhookForm';
import WebhookScheduledMessages from '@/components/WebhookScheduledMessages';

interface WebhookSectionProps {
    onMessageSent?: () => void;
}

const WebhookSection: React.FC<WebhookSectionProps> = ({ onMessageSent }) => {
    const [activeTab, setActiveTab] = useState<'send' | 'scheduled' | 'test' | 'docs'>('send');
    const [isExpanded, setIsExpanded] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleMessageSent = () => {
        setRefreshTrigger(prev => prev + 1);
        onMessageSent?.();
    };

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-white hover:bg-opacity-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg mr-3">
                            <Webhook className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-black">Webhook Integration</h2>
                            <p className="text-sm text-black">Send messages via webhooks without authentication</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-black bg-white px-2 py-1 rounded-full">
                            No Auth Required
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-black" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-black" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-purple-200 bg-white">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('send')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'send'
                                ? 'border-purple-500 text-black bg-purple-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <Webhook className="w-4 h-4 inline mr-2" />
                            Send Message
                        </button>
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scheduled'
                                ? 'border-green-500 text-black bg-green-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Scheduled Messages
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'test'
                                ? 'border-blue-500 text-black bg-blue-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <TestTube className="w-4 h-4 inline mr-2" />
                            Test Webhook
                        </button>
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'docs'
                                ? 'border-orange-500 text-black bg-orange-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <TestTube className="w-4 h-4 inline mr-2" />
                            API Documentation
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'send' ? (
                            <WebhookMessageForm onMessageSent={handleMessageSent} />
                        ) : activeTab === 'scheduled' ? (
                            <WebhookScheduledMessages refreshTrigger={refreshTrigger} />
                        ) : activeTab === 'test' ? (
                            <TestWebhookForm />
                        ) : (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-black">API Documentation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-medium text-black mb-2">Send Immediate</h4>
                                        <p className="text-sm text-black mb-2">POST /api/messages/webhook/send</p>
                                        <pre className="text-xs bg-gray-100 p-2 rounded text-black">{`{"message": "Your message"}`}</pre>
                                    </div>
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-medium text-black mb-2">Schedule Message</h4>
                                        <p className="text-sm text-black mb-2">POST /api/messages/webhook/schedule</p>
                                        <pre className="text-xs bg-gray-100 p-2 rounded text-black">{`{"message": "...", "scheduled_for": 1691520000}`}</pre>
                                    </div>
                                    <div className="bg-white p-4 rounded border">
                                        <h4 className="font-medium text-black mb-2">Test Webhook</h4>
                                        <p className="text-sm text-black mb-2">POST /api/test/webhook</p>
                                        <pre className="text-xs bg-gray-100 p-2 rounded text-black">{`{"webhook_url": "...", "message": "..."}`}</pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* API Endpoints Info */}
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                        <h4 className="text-sm font-medium text-black mb-3">Available Webhook Endpoints</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Send Immediate</div>
                                <div className="text-black mb-1">POST /api/messages/webhook/send</div>
                                <div className="text-black">{`{"message": "Your message"}`}</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Schedule Message</div>
                                <div className="text-black mb-1">POST /api/messages/webhook/schedule</div>
                                <div className="text-black">{`{"message": "...", "scheduled_for": 1691520000}`}</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Get Scheduled</div>
                                <div className="text-black mb-1">GET /api/messages/webhook/scheduled</div>
                                <div className="text-black">No body required</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Test Webhook</div>
                                <div className="text-black mb-1">POST /api/test/webhook</div>
                                <div className="text-black">{`{"webhook_url": "...", "message": "..."}`}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Cancel Scheduled</div>
                                <div className="text-black mb-1">DELETE /api/messages/webhook/scheduled/:id</div>
                                <div className="text-black">No body required</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-medium text-black mb-1">Update Scheduled</div>
                                <div className="text-black mb-1">PUT /api/messages/webhook/scheduled/:id</div>
                                <div className="text-black">{`{"message": "...", "scheduled_for": 1691520000}`}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebhookSection;
