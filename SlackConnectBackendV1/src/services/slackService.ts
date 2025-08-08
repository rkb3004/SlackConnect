import axios, { AxiosResponse } from 'axios';
import { SlackOAuthResponse, SlackChannel, SlackUser } from '../models/types';

class SlackService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.SLACK_CLIENT_ID!;
    this.clientSecret = process.env.SLACK_CLIENT_SECRET!;
    this.redirectUri = process.env.SLACK_REDIRECT_URI!;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Missing required Slack environment variables');
    }
  }

  getAuthUrl(state?: string): string {
    const scopes = [
      'channels:read',
      'chat:write',
      'users:read',
      'team:read',
      'chat:write.public',
      'groups:read',
      'mpim:read',
      'im:read'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
    });

    if (state) {
      params.append('state', state);
    }

    console.log('Generated Slack OAuth URL');
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    try {
      console.log('Exchanging OAuth code for tokens');

      const response: AxiosResponse<SlackOAuthResponse> = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('OAuth token exchange response status:', response.status);

      if (!response.data.ok) {
        console.error('OAuth token exchange failed:', response.data);
        throw new Error((response.data as any).error || 'Failed to exchange code for token');
      }

      console.log('OAuth token exchange successful');
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  async sendMessage(accessToken: string, channel: string, text: string): Promise<any> {
    try {
      console.log('Sending message to Slack channel:', channel);

      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: channel,
          text: text,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Message send response status:', response.status);

      if (!response.data.ok) {
        console.error('Failed to send message:', response.data);
        throw new Error(response.data.error);
      }

      console.log('Message sent successfully');
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  }

  async testToken(accessToken: string): Promise<boolean> {
    try {
      console.log('Testing token validity...');

      const authResponse = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return authResponse.data.ok;
    } catch (error) {
      console.error('Error testing token:', error);
      return false;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      console.log('Getting user info...');

      const authResponse = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.data.ok) {
        throw new Error(authResponse.data.error);
      }

      const userId = authResponse.data.user_id;
      const response = await axios.get('https://slack.com/api/users.info', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          user: userId,
        },
      });

      if (!response.data.ok) {
        console.error('Failed to get user info:', response.data);
        throw new Error(response.data.error);
      }

      console.log('User info retrieved successfully');
      return response.data.user;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  async getChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      console.log('Getting channels...');

      const response = await axios.get('https://slack.com/api/conversations.list', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          exclude_archived: true,
          limit: 1000,
        },
      });

      if (!response.data.ok) {
        console.error('Failed to get channels:', response.data);
        return this.getFallbackChannels();
      }

      const channels = response.data.channels || [];
      const filteredChannels = channels.filter((channel: SlackChannel) => 
        channel.is_channel && !channel.is_archived
      );

      return filteredChannels.length > 0 ? filteredChannels : this.getFallbackChannels();
    } catch (error) {
      console.error('Error getting channels:', error);
      return this.getFallbackChannels();
    }
  }

  async getChannelsWithBotToken(botToken: string): Promise<SlackChannel[]> {
    try {
      console.log('Getting channels with bot token...');

      const response = await axios.get('https://slack.com/api/conversations.list', {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
        params: {
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 1000,
        },
      });

      if (!response.data.ok) {
        console.error('Failed to get channels with bot token:', response.data);
        return this.getFallbackChannels();
      }

      const channels = response.data.channels || [];
      const filteredChannels = channels.filter((channel: SlackChannel) => 
        channel.is_channel && !channel.is_archived
      );

      return filteredChannels.length > 0 ? filteredChannels : this.getFallbackChannels();
    } catch (error) {
      console.error('Error getting channels with bot token:', error);
      return this.getFallbackChannels();
    }
  }

  private getFallbackChannels(): SlackChannel[] {
    return [
      {
        id: 'general',
        name: 'general',
        is_channel: true,
        is_archived: false,
        is_general: true,
        is_member: true,
        is_private: false,
        is_mpim: false,
        is_group: false,
        is_im: false,
        is_shared: false
      }
    ];
  }

  async sendWebhookMessage(webhookUrl: string, message: any): Promise<void> {
    try {
      await axios.post(webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Webhook message sent successfully');
    } catch (error) {
      console.error('Error sending webhook message:', error);
      throw error;
    }
  }
}

export default SlackService;
