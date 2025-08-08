'use client';

import React, { useState } from 'react';
import { Webhook, TestTube, ChevronDown, ChevronUp, Calendar, Code, Send, Settings } from 'lucide-react';
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

    const tabs = [
        { id: 'send', label: 'Send Message', icon: Send },
        { id: 'scheduled', label: 'Scheduled', icon: Calendar },
        { id: 'test', label: 'Test', icon: TestTube },
        { id: 'docs', label: 'API Docs', icon: Code },
    ] as const;

    return (
        <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Webhook className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Webhook Integration</h2>
                            <p className="text-sm text-slate-400">Direct API access without authentication</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                            Public API
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-slate-700">
                    {/* Tab Navigation */}
                    <div className="flex bg-slate-800/50">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                                        isActive
                                            ? 'border-green-400 text-green-400 bg-green-500/10'
                                            : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 inline mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 bg-slate-900/50">
                        {activeTab === 'send' ? (
                            <WebhookMessageForm onMessageSent={handleMessageSent} />
                        ) : activeTab === 'scheduled' ? (
                            <WebhookScheduledMessages refreshTrigger={refreshTrigger} />
                        ) : activeTab === 'test' ? (
                            <TestWebhookForm />
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="p-3 bg-slate-500/20 rounded-full w-fit mx-auto mb-4">
                                        <Code className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">API Documentation</h3>
                                    <p className="text-slate-400 text-sm">
                                        Complete webhook API reference and integration examples
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-medium text-white mb-2">Send Instant Message</h4>
                                        <p className="text-sm text-slate-400 mb-3">POST /api/messages/webhook/send</p>
                                        <pre className="bg-slate-900 rounded p-3 text-xs text-slate-300 overflow-x-auto">
{`{
  "message": "Hello from webhook!",
  "channel_id": "C1234567890"
}`}
                                        </pre>
                                    </div>

                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-medium text-white mb-2">Schedule Message</h4>
                                        <p className="text-sm text-slate-400 mb-3">POST /api/messages/webhook/schedule</p>
                                        <pre className="bg-slate-900 rounded p-3 text-xs text-slate-300 overflow-x-auto">
{`{
  "message": "Scheduled message",
  "channel_id": "C1234567890",
  "scheduled_for": 1672531200
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default WebhookSection;
