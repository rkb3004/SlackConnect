'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get('token');

      if (!token) {
        addNotification('error', 'No authentication token received');
        router.push('/');
        return;
      }

      try {
        // Add a small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 500));
        await login(token);
        addNotification('success', 'Successfully connected to Slack!');
        
        // Delay navigation to allow state updates
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error: any) {
        console.error('Login error:', error);
        // Only show error if it's not a network error
        if (!error.message?.includes('Network Error')) {
          addNotification('error', error.message || 'Failed to complete authentication');
        }
        router.push('/');
      }
    };

    handleAuthSuccess();
  }, [searchParams, login, router, addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Successful!
          </h1>

          <p className="text-gray-600 mb-8">
            Completing your connection to Slack...
          </p>

          <Loading message="Setting up your account..." />
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={<Loading message="Loading..." fullScreen />}>
      <AuthSuccessContent />
    </Suspense>
  );
}
