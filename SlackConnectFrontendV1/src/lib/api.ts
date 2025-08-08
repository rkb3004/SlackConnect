import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://slackconnectbackend-i5vj.onrender.com/api',
      timeout: 30000, // Increased timeout for Render cold starts
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokenFromStorage();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        // Handle 401 errors (token expired)
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login if we're in the browser
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }

        // Transform error for consistent handling
        const apiError = {
          message: error.response?.data?.error || error.message || 'An error occurred',
          status: error.response?.status || 500,
          data: error.response?.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('slack_connect_token');
      if (stored) {
        this.token = stored;
      }
    }
  }

  public setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('slack_connect_token', token);
    }
  }

  public clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slack_connect_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client(config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Auth methods
  public async getAuthUrl(): Promise<ApiResponse<{ auth_url: string; state: string }>> {
    return this.request({
      method: 'GET',
      url: '/auth/slack',
    });
  }

  public async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }

  public async refreshTokenStatus(): Promise<ApiResponse<{ token_valid: boolean }>> {
    return this.request({
      method: 'POST',
      url: '/auth/refresh',
    });
  }

  public async logout(): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/logout',
    });
  }

  // Message methods
  public async getChannels(): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/messages/channels',
    });
  }

  public async sendMessage(data: {
    channel_id: string;
    message: string;
  }): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/messages/send',
      data,
    });
  }

  public async scheduleMessage(data: {
    channel_id: string;
    channel_name: string;
    message: string;
    scheduled_for: number;
  }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/messages/schedule',
      data,
    });
  }

  public async getScheduledMessages(): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/messages/scheduled',
    });
  }

  public async cancelScheduledMessage(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/messages/scheduled/${id}`,
    });
  }

  public async updateScheduledMessage(
    id: string,
    data: {
      message?: string;
      scheduled_for?: number;
    }
  ): Promise<ApiResponse> {
    return this.request({
      method: 'PUT',
      url: `/messages/scheduled/${id}`,
      data,
    });
  }

  // Webhook methods (no authentication required)
  public async sendWebhookMessage(data: { message: string }): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/messages/webhook/send',
      data,
    });
  }

  public async scheduleWebhookMessage(data: { message: string; scheduled_for: number }): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/messages/webhook/schedule',
      data,
    });
  }

  public async getWebhookScheduledMessages(): Promise<ApiResponse> {
    return this.request({
      method: 'GET',
      url: '/messages/webhook/scheduled',
    });
  }

  public async cancelWebhookScheduledMessage(messageId: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/messages/webhook/scheduled/${messageId}`,
    });
  }

  public async updateWebhookScheduledMessage(messageId: string, data: { message?: string; scheduled_for?: number }): Promise<ApiResponse> {
    return this.request({
      method: 'PUT',
      url: `/messages/webhook/scheduled/${messageId}`,
      data,
    });
  }

  public async testWebhook(data: { webhook_url: string; message: string }): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/test/webhook',
      data,
    });
  }

  // Health check
  public async healthCheck(): Promise<ApiResponse> {
    return this.request({
      method: 'GET',
      url: '/health',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
