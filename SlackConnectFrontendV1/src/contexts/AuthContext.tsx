'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import apiClient from '@/lib/api';

// Import debug logger (only in client)
let addDebugLog: any = null;
if (typeof window !== 'undefined') {
  import('@/components/DebugConsole').then(module => {
    addDebugLog = module.addDebugLog;
  });
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_TOKEN_VALIDITY'; payload: boolean };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };

    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_TOKEN_VALIDITY':
      if (state.user) {
        return {
          ...state,
          user: { ...state.user, token_valid: action.payload },
        };
      }
      return state;

    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Context
interface AuthContextType extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkTokenValidity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (addDebugLog) {
        addDebugLog('auth', 'Initializing authentication', { hasToken: !!token });
      }
      
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            if (addDebugLog) {
              addDebugLog('auth', 'Successfully restored user session', { user: response.data });
            }
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: response.data, token },
            });
          } else {
            if (addDebugLog) {
              addDebugLog('auth', 'Failed to restore session - clearing token');
            }
            apiClient.clearToken();
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          if (addDebugLog) {
            addDebugLog('error', 'Failed to restore user session', error);
          }
          // Don't show error notification on initialization
          apiClient.clearToken();
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (token: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      apiClient.setToken(token);

      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data, token },
        });
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error) {
      apiClient.clearToken();
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (state.token) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!state.token) return;

    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to re-authenticate
      if ((error as any).status === 401) {
        dispatch({ type: 'LOGOUT' });
      }
    }
  };

  const checkTokenValidity = async (): Promise<void> => {
    if (!state.token) return;

    try {
      const response = await apiClient.refreshTokenStatus();
      if (response.success && response.data) {
        dispatch({ type: 'SET_TOKEN_VALIDITY', payload: response.data.token_valid });
      }
    } catch (error) {
      console.error('Failed to check token validity:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    checkTokenValidity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
