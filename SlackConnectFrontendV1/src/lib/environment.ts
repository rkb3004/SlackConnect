/**
 * Utility functions for handling different deployment environments
 */

export const getBaseUrl = (): string => {
    // For server-side rendering
    if (typeof window === 'undefined') {
        // Check if we're in production
        if (process.env.NODE_ENV === 'production') {
            return process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://slackconnectfrontendv1.netlify.app';
        }
        return process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    }

    // For client-side
    return window.location.origin;
};

export const getAuthRedirectUrl = (path: string): string => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${path}`;
};

export const isLocalDevelopment = (): boolean => {
    if (typeof window === 'undefined') {
        return process.env.NODE_ENV === 'development';
    }
    return window.location.hostname === 'localhost';
};

export const getCurrentUrl = (): string => {
    if (typeof window === 'undefined') {
        return getBaseUrl();
    }
    return window.location.href;
};

export const getEnvironmentInfo = () => {
    const baseUrl = getBaseUrl();
    const isLocal = isLocalDevelopment();

    return {
        baseUrl,
        isLocal,
        isProduction: !isLocal,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api',
    };
};
