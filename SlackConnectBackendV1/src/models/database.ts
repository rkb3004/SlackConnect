import { Pool, PoolClient } from 'pg';
import { User, ScheduledMessage } from './types';

class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;
  private isInitialized = false;

  private constructor() {
    const connectionString = process.env.DATABASE_PATH;
    
    if (!connectionString) {
      throw new Error('DATABASE_PATH environment variable is required');
    }

    console.log('Connecting to PostgreSQL database...');
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 5000, // 5 seconds
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.initializeTables();
    this.isInitialized = true;
  }

  private async initializeTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          slack_user_id TEXT UNIQUE NOT NULL,
          team_id TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          webhook_url TEXT,
          token_expires_at BIGINT,
          created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
          updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
        )
      `);

      // Scheduled messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scheduled_messages (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          channel_id TEXT NOT NULL,
          channel_name TEXT NOT NULL,
          message TEXT NOT NULL,
          scheduled_for BIGINT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
          sent_at BIGINT,
          error_message TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_slack_user_id ON users (slack_user_id);
        CREATE INDEX IF NOT EXISTS idx_scheduled_messages_user_id ON scheduled_messages (user_id);
        CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages (status);
        CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_for ON scheduled_messages (scheduled_for);
      `);

      console.log('Database tables initialized successfully');

      // Create special webhook user if it doesn't exist
      await this.ensureWebhookUser();
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async ensureWebhookUser(): Promise<void> {
    try {
      const existingUser = await this.getUserById('webhook-user');
      if (!existingUser) {
        const now = Math.floor(Date.now() / 1000);
        await this.pool.query(`
          INSERT INTO users (id, slack_user_id, team_id, access_token, refresh_token, webhook_url, token_expires_at, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          'webhook-user',
          'webhook-user',
          'teamalpha-team',
          'webhook-token',
          null,
          'https://hooks.slack.com/services/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',
          null,
          now,
          now
        ]);
        console.log('Created special webhook user for TeamAlpha scheduling');
      }
    } catch (error) {
      console.log('Webhook user already exists or error creating it:', error);
    }
  }

  // User operations
  async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const now = Math.floor(Date.now() / 1000);
    
    await this.pool.query(`
      INSERT INTO users (id, slack_user_id, team_id, access_token, refresh_token, token_expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      user.id,
      user.slack_user_id,
      user.team_id,
      user.access_token,
      user.refresh_token || null,
      user.token_expires_at || null,
      now,
      now
    ]);

    return { ...user, created_at: now, updated_at: now };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] as User | undefined;
  }

  async getUserBySlackId(slackUserId: string): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE slack_user_id = $1', [slackUserId]);
    return result.rows[0] as User | undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');

    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof User]);

    await this.pool.query(`
      UPDATE users 
      SET ${setClause}, updated_at = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
    `, [...values, now, id]);
  }

  // Scheduled message operations
  async createScheduledMessage(message: Omit<ScheduledMessage, 'created_at'>): Promise<ScheduledMessage> {
    const now = Math.floor(Date.now() / 1000);
    
    await this.pool.query(`
      INSERT INTO scheduled_messages (id, user_id, channel_id, channel_name, message, scheduled_for, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      message.id,
      message.user_id,
      message.channel_id,
      message.channel_name,
      message.message,
      message.scheduled_for,
      message.status,
      now
    ]);

    return { ...message, created_at: now };
  }

  async getScheduledMessagesByUserId(userId: string): Promise<ScheduledMessage[]> {
    const result = await this.pool.query(`
      SELECT * FROM scheduled_messages 
      WHERE user_id = $1 
      ORDER BY scheduled_for ASC
    `, [userId]);
    
    return result.rows as ScheduledMessage[];
  }

  async getPendingMessages(): Promise<ScheduledMessage[]> {
    const now = Math.floor(Date.now() / 1000);
    const result = await this.pool.query(`
      SELECT * FROM scheduled_messages 
      WHERE status = 'pending' AND scheduled_for <= $1
      ORDER BY scheduled_for ASC
    `, [now]);
    
    return result.rows as ScheduledMessage[];
  }

  async updateScheduledMessage(id: string, updates: Partial<ScheduledMessage>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');

    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field as keyof ScheduledMessage]);

    await this.pool.query(`
      UPDATE scheduled_messages 
      SET ${setClause}
      WHERE id = $${fields.length + 1}
    `, [...values, id]);
  }

  async deleteScheduledMessage(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM scheduled_messages WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  // Cleanup operations
  async cleanupOldMessages(daysBefore: number = 30): Promise<number> {
    const cutoffTime = Math.floor(Date.now() / 1000) - (daysBefore * 24 * 60 * 60);
    const result = await this.pool.query(`
      DELETE FROM scheduled_messages 
      WHERE (status = 'sent' OR status = 'cancelled') 
      AND created_at < $1
    `, [cutoffTime]);
    
    return result.rowCount || 0;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Get database pool for transactions
  getPool(): Pool {
    return this.pool;
  }

  // Helper method for transactions
  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default DatabaseManager;
