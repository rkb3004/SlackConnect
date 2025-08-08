'use client';

import React, { useState } from 'react';
import { Webhook, ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import WebhookMessageForm from '@/components/WebhookMessageForm';
import TestWebhookForm from '@/components/TestWebhookForm';
import WebhookScheduledMessages from '@/components/WebhookScheduledMessages';
import { useRouter } from 'next/navigation';

export default function WebhooksPage() {
    const [activeTab, setActiveTab] = useState<'send' | 'scheduled' | 'test' | 'docs'>('send');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const router = useRouter();

    const handleMessageSent = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/')}
                                className="mr-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg mr-3">
                                <Webhook className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-black">Webhook Integration</h1>
                                <p className="text-sm text-black">Send messages via webhooks without authentication</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('send')}
                            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'send'
                                ? 'border-purple-500 text-black bg-purple-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <Webhook className="w-4 h-4 inline mr-2" />
                            Send Webhook Message
                        </button>
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'scheduled'
                                ? 'border-orange-500 text-black bg-orange-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Scheduled Messages
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'test'
                                ? 'border-blue-500 text-black bg-blue-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <ExternalLink className="w-4 h-4 inline mr-2" />
                            Test External Webhook
                        </button>
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'docs'
                                ? 'border-green-500 text-black bg-green-50'
                                : 'border-transparent text-black hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            <ExternalLink className="w-4 h-4 inline mr-2" />
                            API Documentation
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'send' && (
                            <WebhookMessageForm onMessageSent={handleMessageSent} />
                        )}

                        {activeTab === 'scheduled' && (
                            <WebhookScheduledMessages refreshTrigger={refreshTrigger} />
                        )}

                        {activeTab === 'test' && (
                            <TestWebhookForm />
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-black mb-4">API Documentation</h2>
                                    <p className="text-black mb-6">
                                        Use these endpoints to integrate SlackConnect with your applications and services.
                                    </p>
                                </div>

                                {/* API Endpoints */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Send Immediate Message */}
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">Send Immediate Message</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                                    POST
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/messages/webhook/send
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Request Body:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "message": "Your message content here"
}`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "message": "Message sent successfully"
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Message */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">Schedule Message</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                    POST
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/messages/webhook/schedule
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Request Body:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "message": "Your message content",
  "scheduled_for": 1691520000
}`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "message": "Message scheduled successfully",
  "data": {
    "id": "msg_123",
    "scheduled_for": 1691520000
  }
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Test Webhook */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">Test External Webhook</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                    POST
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/test/webhook
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Request Body:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "webhook_url": "https://hooks.slack.com/...",
  "message": "Test message content"
}`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "message": "Webhook test sent successfully"
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Get Scheduled Messages */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">Get Scheduled Messages</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                                                    GET
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/messages/webhook/scheduled
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">No request body required</h4>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "message": "Scheduled message",
      "scheduled_for": 1691520000,
      "status": "pending"
    }
  ]
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Update Scheduled Message */}
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Update Scheduled Message</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                                                    PUT
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/messages/webhook/scheduled/:id
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Request Body:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "message": "Updated message",
  "scheduled_for": 1691520000
}`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "message": "Message updated successfully"
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancel Scheduled Message */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-red-900 mb-3">Cancel Scheduled Message</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                                    DELETE
                                                </span>
                                                <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">
                                                    /api/messages/webhook/scheduled/:id
                                                </code>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">No request body required</h4>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Example Response:</h4>
                                                <pre className="bg-white p-3 rounded border text-sm overflow-x-auto text-black">
                                                    {`{
  "success": true,
  "message": "Message cancelled successfully"
}`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* cURL Examples */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">cURL Examples</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Send immediate message:</h4>
                                                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                                    {`curl -X POST https://slackconnectbackendv1.onrender.com/api/messages/webhook/send \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from webhook!"}'`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Schedule message:</h4>
                                                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                                    {`curl -X POST https://slackconnectbackendv1.onrender.com/api/messages/webhook/schedule \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Scheduled message", "scheduled_for": 1691520000}'`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Get scheduled messages:</h4>
                                                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                                    {`curl -X GET https://slackconnectbackendv1.onrender.com/api/messages/webhook/scheduled`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Update scheduled message:</h4>
                                                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                                    {`curl -X PUT https://slackconnectbackendv1.onrender.com/api/messages/webhook/scheduled/msg_123 \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Updated message", "scheduled_for": 1691520000}'`}
                                                </pre>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-black mb-2">Cancel scheduled message:</h4>
                                                <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                                    {`curl -X DELETE https://slackconnectbackendv1.onrender.com/api/messages/webhook/scheduled/msg_123`}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">Important Notes</h3>
                                    <ul className="space-y-2 text-yellow-800 text-sm">
                                        <li>• No authentication required for webhook endpoints</li>
                                        <li>• Messages are sent to your configured default Slack channel (TeamAlpha)</li>
                                        <li>• Timestamps should be Unix timestamps (seconds since epoch)</li>
                                        <li>• Maximum message length is 4000 characters</li>
                                        <li>• Scheduled messages can be set at least 1 minute in the future</li>
                                        <li>• You can view, update, and cancel pending scheduled messages</li>
                                        <li>• Only pending messages can be modified or cancelled</li>
                                        <li>• All endpoints return JSON responses with success/error status</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
