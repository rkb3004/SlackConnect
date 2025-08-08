'use client';

import React, { useState } from 'react';
import { 
  LogOut, 
  User, 
  Slack, 
  RefreshCw, 
  Menu,
  X,
  Shield,
  Zap,
  Activity,
  Settings
} from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      addNotification('success', 'Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      addNotification('error', 'Error during logout');
    }
  };

  const handleCheckToken = async () => {
    try {
      setIsCheckingToken(true);
      await checkTokenValidity();
      addNotification('info', 'Token status verified');
    } catch (error) {
      addNotification('error', 'Failed to verify token');
    } finally {
      setIsCheckingToken(false);
    }
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Slack className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Slack Connect</h1>
                <p className="text-xs text-slate-400">Message Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Status Indicators */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 card rounded-lg px-3 py-1">
                  <div className="status-dot status-online"></div>
                  <span className="text-xs text-slate-300">Connected</span>
                </div>
                
                <div className="flex items-center space-x-2 card rounded-lg px-3 py-1">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-300">Active</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="card rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">User</p>
                      <p className="text-xs text-slate-400">ID: {user.slack_user_id?.slice(-8)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleCheckToken}
                    loading={isCheckingToken}
                    disabled={isCheckingToken}
                    variant="ghost"
                    className="p-2 hover-lift"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingToken ? 'animate-spin' : ''}`} />
                  </Button>

                  <Button
                    onClick={() => setIsMobileMenuOpen(true)}
                    variant="ghost"
                    className="p-2 hover-lift"
                    size="sm"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handleLogout}
                    variant="danger"
                    className="p-2 hover-lift"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(true)}
                className="glass-dark border border-white/10 text-gray-300 hover:text-white p-2 rounded-lg"
                size="sm"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 glass-dark border-l border-white/20 p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                variant="ghost"
                className="p-2"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile User Info */}
            <div className="space-y-6">
                            <div className="card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Activity Monitor</p>
                      <p className="text-xs text-slate-400">Real-time updates</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Status Cards */}
              <div className="space-y-3">
                <div className="card rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Security Status</p>
                      <p className="text-xs text-slate-400">Connection secured</p>
                    </div>
                  </div>
                </div>

                <div className="card rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Network Status</p>
                      <p className="text-xs text-slate-400">Connected to Slack</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckToken}
                  loading={isCheckingToken}
                  disabled={isCheckingToken}
                  className="w-full glass border border-white/10 text-white hover:bg-white/10 py-3 rounded-xl magnetic"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingToken ? 'animate-spin' : ''}`} />
                  Verify Quantum Link
                </Button>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl magnetic"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Network
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 card border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Slack Connect v2.0</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>Powered by Cobalt.ai</span>
              <span>•</span>
              <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
