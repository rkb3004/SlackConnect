'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

const errorMessages: Record<string, string> = {
  access_denied: 'You denied access to your Slack workspace. Please try again and grant the required permissions.',
  no_code: 'No authorization code received from Slack. Please try the connection process again.',
  callback_failed: 'There was an error processing your Slack connection. Please try again.',
  invalid_state: 'Security validation failed. Please restart the connection process.',
};

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown';

  const errorMessage = errorMessages[error] || 'An unexpected error occurred during authentication. Please try again.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Failed
          </h1>

          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Troubleshooting Tips */}
          <div className="mt-8 text-left bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Troubleshooting Tips:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Make sure you have admin rights in your Slack workspace</li>
              <li>• Check that cookies and JavaScript are enabled</li>
              <li>• Try using an incognito/private browser window</li>
              <li>• Contact your Slack admin if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<Loading message="Loading..." fullScreen />}>
      <AuthErrorContent />
    </Suspense>
  );
}
