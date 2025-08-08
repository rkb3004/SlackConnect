'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import ConnectSlack from '@/components/ConnectSlack';
import Layout from '@/components/Layout';
import MessageForm from '@/components/MessageForm';
import ScheduledMessages from '@/components/ScheduledMessages';
import WebhookSection from '@/components/WebhookSection';
import Button from '@/components/ui/Button';
import { Webhook, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading message="Loading..." fullScreen />;
  }

  // Show connect screen if not authenticated
  if (!isAuthenticated) {
    return <ConnectSlack />;
  }

  const handleMessageSent = () => {
    // Trigger refresh of scheduled messages list
    setRefreshTrigger(prev => prev + 1);
  };

  // Show main dashboard if authenticated
  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome to Slack Connect
          </h1>
          <p className="text-lg text-black">
            Send messages instantly or schedule them for later delivery
          </p>
        </div>

        {/* Quick Access to Webhooks */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/webhooks')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Webhook className="w-5 h-5 mr-2" />
            Open Full Webhook Interface
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-black mt-2">
            Access comprehensive webhook management and API documentation
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Message Form */}
          <div>
            <MessageForm onMessageSent={handleMessageSent} />
          </div>

          {/* Scheduled Messages */}
          <div>
            <ScheduledMessages refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Webhook Integration Section */}
        <div className="mt-8">
          <WebhookSection onMessageSent={handleMessageSent} />
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-black mb-2">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-black">
            <div>
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <p>Choose a channel and compose your message</p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <p>Send immediately or schedule for later</p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <p>Manage your scheduled messages anytime</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
