'use client';

import React, { useState } from 'react';
import { LogOut, User, Slack, AlertTriangle, CheckCircle, RefreshCw, Webhook } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { formatDate } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, checkTokenValidity } = useAuth();
  const { addNotification } = useNotifications();
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      addNotification('success', 'Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      addNotification('error', 'Error during logout');
    }
  };

  const handleCheckToken = async () => {
    try {
      setIsCheckingToken(true);
      await checkTokenValidity();
      addNotification('info', 'Token status updated');
    } catch (error) {
      addNotification('error', 'Failed to check token status');
    } finally {
      setIsCheckingToken(false);
    }
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Slack className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-black">Slack Connect</h1>
                <p className="text-sm text-black">Message Scheduler</p>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex ml-8 space-x-4">
                <a
                  href="/"
                  className="text-sm text-black hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/webhooks"
                  className="text-sm text-black hover:text-black px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Webhook className="w-4 h-4 mr-1" />
                  Webhooks
                </a>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Token Status */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center">
                  {user.token_valid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-700">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-700">Connection Issue</span>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCheckToken}
                    loading={isCheckingToken}
                    className="ml-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Slack User
                  </p>
                  <p className="text-xs text-gray-500">
                    Connected {formatDate(user.created_at)}
                  </p>
                </div>

                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>

                <Button variant="ghost" onClick={handleLogout} className="hidden sm:inline-flex">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>

                {/* Mobile logout button */}
                <Button variant="ghost" onClick={handleLogout} className="sm:hidden">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile token status */}
        <div className="sm:hidden px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user.token_valid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">Connected to Slack</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                  <span className="text-sm text-amber-700">Connection Issue</span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCheckToken}
              loading={isCheckingToken}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user.token_valid && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  Connection Issue Detected
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your Slack connection may have expired. Some features may not work properly.
                  Try refreshing the connection or reconnecting to Slack.
                </p>
              </div>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Slack Connect. Built for seamless Slack messaging.</p>
            <p className="mt-1">
              Secure • Reliable • Easy to use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
