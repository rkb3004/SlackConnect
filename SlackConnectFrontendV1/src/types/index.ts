// User types
export interface User {
  id: string;
  slack_user_id: string;
  team_id: string;
  token_valid: boolean;
  created_at: number;
  updated_at: number;
}

// Slack Channel types
export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_general: boolean;
  is_archived: boolean;
  is_member: boolean;
}

// Message types
export interface ScheduledMessage {
  id: string;
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_for: number;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  created_at: number;
  sent_at?: number;
  error_message?: string;
}

// API Request types
export interface SendMessageRequest {
  channel_id: string;
  message: string;
}

export interface ScheduleMessageRequest {
  channel_id: string;
  channel_name: string;
  message: string;
  scheduled_for: number;
}

// Webhook Request types
export interface WebhookSendRequest {
  message: string;
}

export interface WebhookScheduleRequest {
  message: string;
  scheduled_for: number;
}

export interface TestWebhookRequest {
  webhook_url: string;
  message: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Form types
export interface MessageFormData {
  channel_id: string;
  message: string;
  scheduled_for?: string; // ISO string for date picker
  is_scheduled?: boolean;
}

export interface WebhookFormData {
  message: string;
  is_scheduled?: boolean;
  scheduled_for?: string; // ISO string for date picker
}

export interface TestWebhookFormData {
  webhook_url: string;
  message: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// UI types
export interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: string;
}
