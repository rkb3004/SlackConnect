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
import { 
  Webhook, 
  ArrowRight, 
  Zap, 
  Clock, 
  MessageSquare, 
  Settings,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Stats component
const StatCard = ({ icon: Icon, label, value, description }: {
  icon: any, 
  label: string, 
  value: string,
  description: string
}) => (
  <div className="card rounded-xl p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center space-x-3 mb-3">
      <div className="p-2 bg-blue-500/20 rounded-lg">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{value}</h3>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
    <p className="text-xs text-slate-500">{description}</p>
  </div>
);

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading message="Connecting to Slack..." fullScreen />;
  }

  // Show connect screen if not authenticated
  if (!isAuthenticated) {
    return <ConnectSlack />;
  }

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Show main dashboard if authenticated
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="card rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Settings className="w-12 h-12 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-0.5" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Slack Connect Dashboard
            </h1>
            
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Manage your Slack messaging, schedule communications, and integrate webhooks 
              with our professional communication platform.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                icon={Zap} 
                label="Message Delivery" 
                value="Instant" 
                description="Real-time message processing"
              />
              <StatCard 
                icon={Clock} 
                label="Scheduling" 
                value="Flexible" 
                description="Custom timing options"
              />
              <StatCard 
                icon={CheckCircle} 
                label="Reliability" 
                value="99.9%" 
                description="Guaranteed delivery rate"
              />
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => router.push('/webhooks')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg text-base group"
            >
              <Webhook className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Access Webhook Management
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-slate-400 mt-4">
              Advanced webhook configuration and API documentation
            </p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Message Center */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-blue-400" />
                Message Center
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Connected</span>
              </div>
            </div>
            <div className="card rounded-xl p-6">
              <MessageForm onMessageSent={handleMessageSent} />
            </div>
          </div>

          {/* Scheduler */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Clock className="w-6 h-6 mr-3 text-purple-400" />
              Message Scheduler
            </h2>
            <div className="card rounded-xl p-6">
              <ScheduledMessages refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        {/* Webhook Integration */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <Webhook className="w-6 h-6 mr-3 text-green-400" />
            Webhook Integration
          </h2>
          <div className="card rounded-xl p-6">
            <WebhookSection onMessageSent={handleMessageSent} />
          </div>
        </div>

        {/* How It Works */}
        <div className="card rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-400">1</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Compose Message</h4>
              <p className="text-slate-400">Create and target your message to specific Slack channels</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-400">2</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Schedule or Send</h4>
              <p className="text-slate-400">Send immediately or schedule for future delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-400">3</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Track & Manage</h4>
              <p className="text-slate-400">Monitor delivery status and manage your messages</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
