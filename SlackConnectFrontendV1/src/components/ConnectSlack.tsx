'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slack, ExternalLink, Send, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationsContext';
import apiClient from '@/lib/api';

const ConnectSlack: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { addNotification } = useNotifications();
  const router = useRouter();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await apiClient.getAuthUrl();

      if (response.success && response.data) {
        // Store state for verification after callback
        if (response.data.state) {
          sessionStorage.setItem('oauth_state', response.data.state);
        }

        // Redirect to Slack OAuth
        window.location.href = response.data.auth_url;
      } else {
        throw new Error(response.error || 'Failed to get authorization URL');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      addNotification('error', error.message || 'Failed to connect to Slack');
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Logo/Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Slack className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-black mb-2">
            Welcome to Slack Connect
          </h1>

          <p className="text-black mb-8">
            Send instant messages and schedule messages for later delivery to your Slack workspace.
          </p>

          {/* Features List */}
          <div className="text-left mb-8 space-y-3">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Send Instant Messages</p>
                <p className="text-xs text-black">Send messages immediately to any channel</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Schedule for Later</p>
                <p className="text-xs text-black">Schedule messages for future delivery</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-100 rounded-full p-1 mr-3 mt-0.5">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Manage Scheduled Messages</p>
                <p className="text-xs text-black">View and cancel scheduled messages</p>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            loading={isConnecting}
            disabled={isConnecting}
            className="w-full mb-4"
            size="lg"
          >
            <Slack className="w-5 h-5 mr-2" />
            Connect to Slack
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          {/* Send or Schedule Message Button */}
          <Button
            onClick={() => router.push('/webhooks')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
            size="lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Send or Schedule a Message
            <Calendar className="w-4 h-4 ml-2" />
          </Button>

          {/* Security Note */}
          <p className="text-xs text-black mt-4">
            🔒 We only request permissions to read your channels and send messages.
            Your data is secure and never stored permanently.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-black">
            Need help? Check our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              setup guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectSlack;
