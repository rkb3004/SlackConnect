'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Slack, 
  Shield, 
  Zap, 
  Clock,
  CheckCircle,
  ArrowRight,
  Lock,
  Wifi
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationsContext';
import apiClient from '@/lib/api';

const ConnectSlack: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const { addNotification } = useNotifications();
  const router = useRouter();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStep(1);
      
      // Simulate connection steps
      setTimeout(() => setConnectionStep(2), 800);
      setTimeout(() => setConnectionStep(3), 1600);
      
      const response = await apiClient.getAuthUrl();

      if (response.success && response.data) {
        // Store state for verification after callback
        if (response.data.state) {
          sessionStorage.setItem('oauth_state', response.data.state);
        }

        setConnectionStep(4);
        setTimeout(() => {
          // Redirect to Slack OAuth
          if (response.data?.auth_url) {
            window.location.href = response.data.auth_url;
          }
        }, 1000);
      } else {
        throw new Error(response.error || 'Failed to get authorization URL');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      addNotification('error', error.message || 'Failed to connect to Slack');
      setIsConnecting(false);
      setConnectionStep(0);
    }
  };

  const connectionSteps = [
    { icon: Shield, text: "Initializing Security", color: "text-blue-400" },
    { icon: Wifi, text: "Connecting to Slack", color: "text-purple-400" },
    { icon: Lock, text: "Securing Connection", color: "text-green-400" },
    { icon: CheckCircle, text: "Redirecting to Slack", color: "text-emerald-400" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Slack className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Connect to Slack
            </h1>

            <p className="text-slate-300 mb-2">
              Professional messaging platform integration
            </p>
            <p className="text-slate-400 text-sm">
              Secure OAuth authentication with enterprise-grade security
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="bg-blue-500/20 rounded-lg p-2">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Instant Delivery</h3>
                <p className="text-sm text-slate-400">Real-time message processing</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="bg-purple-500/20 rounded-lg p-2">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Smart Scheduling</h3>
                <p className="text-sm text-slate-400">Flexible message timing options</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="bg-green-500/20 rounded-lg p-2">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Enterprise Security</h3>
                <p className="text-sm text-slate-400">OAuth 2.0 with secure token management</p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {isConnecting && (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Connection Status</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                {connectionSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = connectionStep >= index + 1;
                  const isComplete = connectionStep > index + 1;
                  
                  return (
                    <div key={index} className={`flex items-center space-x-3 transition-all duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        isComplete ? 'bg-green-500/20' : isActive ? 'bg-blue-500/20' : 'bg-slate-600/20'
                      }`}>
                        <StepIcon className={`w-4 h-4 ${
                          isComplete ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-slate-500'
                        }`} />
                      </div>
                      <span className={`text-sm ${step.color}`}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            loading={isConnecting}
            disabled={isConnecting}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-base shadow-lg group"
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Slack className="w-5 h-5 mr-2" />
                Connect to Slack
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">
              🔒 Secured with OAuth 2.0 authentication
            </p>
            <p className="text-xs text-slate-500">
              Your credentials are protected and never stored on our servers
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Powered by <span className="text-blue-400">Cobalt.ai</span> •{' '}
            <span className="text-slate-500">Enterprise Grade Security</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectSlack;
