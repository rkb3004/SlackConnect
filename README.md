# 📋 Slack Connect Platform - Complete Documentation

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation Guide](#installation-guide)
5. [Configuration](#configuration)
6. [Deployment](#deployment)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Database Schema](#database-schema)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## 🎯 Project Overview

**Slack Connect Platform** is a comprehensive web application that enables seamless integration with Slack workspaces, providing advanced messaging capabilities, scheduled messaging, webhook management, and real-time communication features.

### Key Features

- 🔐 **Secure OAuth Authentication** with Slack
- 💬 **Real-time Messaging** to Slack channels
- ⏰ **Scheduled Message Management**
- 🔗 **Webhook Integration** for external systems
- 📊 **Channel Analytics** and monitoring
- 🎨 **Professional UI/UX** with dark theme
- 🔒 **Enterprise-grade Security**

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Deployment**: Netlify

#### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT with secure tokens
- **Slack Integration**: Official Slack Web API
- **Deployment**: Render

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│   Slack API     │
│   (Netlify)     │    │    (Render)     │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   User Browser  │    │  PostgreSQL DB  │    │ Slack Workspace │
│                 │    │    (Neon)       │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Authentication Flow**:
   ```
   User → Frontend → Backend → Slack OAuth → Backend → Database → Frontend
   ```

2. **Message Sending Flow**:
   ```
   User → Frontend → Backend → Slack API → Slack Channel
   ```

3. **Webhook Flow**:
   ```
   External System → Backend Webhook → Slack API → Slack Channel
   ```

---

## 📋 Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **PostgreSQL**: 14.x or higher (or Neon account)

### External Services

1. **Slack Developer Account**: [api.slack.com](https://api.slack.com)
2. **Render Account**: [render.com](https://render.com) (for backend)
3. **Netlify Account**: [netlify.com](https://netlify.com) (for frontend)
4. **Neon Database**: [neon.tech](https://neon.tech) (PostgreSQL hosting)

---

## 🚀 Installation Guide

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd CobaltV1/SlackConnect
```

### Step 2: Backend Setup

```bash
cd SlackConnectBackendV1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Build the project
npm run build
```

### Step 3: Frontend Setup

```bash
cd ../SlackConnectFrontendV1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Build the project
npm run build
```

### Step 4: Database Setup

The application uses PostgreSQL with the following schema:

```sql
-- Users table for storing Slack user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(255) UNIQUE NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled messages table
CREATE TABLE scheduled_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    channel_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `.env` file in `SlackConnectBackendV1/`:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback

# Slack Webhook Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Frontend Configuration
FRONTEND_URL=https://your-frontend.netlify.app

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_32_characters_minimum
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_PATH=postgresql://user:password@host:port/database

# Logging
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=https://your-frontend.netlify.app

# Security
TRUST_PROXY=true
```

### Frontend Environment Variables

Create `.env.local` file in `SlackConnectFrontendV1/`:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com/api

# Frontend URL Configuration
NEXT_PUBLIC_PRODUCTION_URL=https://your-frontend.netlify.app
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.netlify.app

# Build Configuration
NODE_ENV=production
NETLIFY=true

# OAuth Configuration
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id
NEXT_PUBLIC_SLACK_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback

# Security Configuration
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=false
```

### Slack App Configuration

1. **Create Slack App**: Go to [api.slack.com/apps](https://api.slack.com/apps)

2. **OAuth & Permissions**:
   ```
   Redirect URLs: https://your-backend.onrender.com/api/auth/callback
   
   Bot Token Scopes:
   - channels:read
   - chat:write
   - users:read
   - team:read
   - chat:write.public
   - groups:read
   - mpim:read
   - im:read
   ```

3. **Incoming Webhooks**:
   - Activate Incoming Webhooks: ON
   - Add New Webhook to Workspace
   - Copy the webhook URL

---

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create Web Service**:
   ```
   Name: your-backend-name
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: SlackConnectBackendV1
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

2. **Environment Variables**: Add all variables from your `.env` file

3. **Deploy**: Service will auto-deploy on git push

### Frontend Deployment (Netlify)

1. **Site Configuration**:
   ```
   Base directory: SlackConnectFrontendV1
   Build command: npm run build
   Publish directory: out
   ```

2. **Environment Variables**: Add all variables from your `.env.local` file

3. **Deploy**: Site will auto-deploy on git push

### Post-Deployment

1. **Update Slack App**: Set redirect URI to actual backend URL
2. **Test OAuth Flow**: Verify authentication works
3. **Test Messaging**: Send test messages to confirm functionality

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /api/auth/slack`
Initiates Slack OAuth flow.

**Response:**
```json
{
  "success": true,
  "data": {
    "auth_url": "https://slack.com/oauth/v2/authorize?...",
    "state": "random_state_string"
  }
}
```

#### `GET /api/auth/callback`
Handles Slack OAuth callback.

**Query Parameters:**
- `code`: Authorization code from Slack
- `state`: State parameter for security

**Response:** Redirects to frontend with token

#### `POST /api/auth/verify`
Verifies JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "slack_user_id": "U1234567890",
      "team_id": "T1234567890"
    }
  }
}
```

### Message Endpoints

#### `GET /api/messages/channels`
Retrieves available Slack channels.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "C1234567890",
      "name": "general",
      "is_private": false,
      "num_members": 15
    }
  ]
}
```

#### `POST /api/messages/send`
Sends immediate message to Slack channel.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "channel_id": "C1234567890",
  "message": "Hello from Slack Connect!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ts": "1609459200.000400",
    "channel": "C1234567890"
  }
}
```

#### `POST /api/messages/schedule`
Schedules a message for future delivery.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "channel_id": "C1234567890",
  "message": "Scheduled message content",
  "scheduled_time": "2024-12-25T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "scheduled_time": "2024-12-25T10:00:00Z",
    "status": "pending"
  }
}
```

#### `GET /api/messages/scheduled`
Retrieves user's scheduled messages.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "channel_id": "C1234567890",
      "message": "Scheduled message",
      "scheduled_time": "2024-12-25T10:00:00Z",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `DELETE /api/messages/scheduled/:id`
Cancels a scheduled message.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduled message cancelled"
}
```

### Webhook Endpoints

#### `POST /api/messages/webhook/send`
Sends message via webhook (no authentication required).

**Body:**
```json
{
  "message": "Webhook message content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ts": "1609459200.000400"
  }
}
```

#### `POST /api/messages/webhook/schedule`
Schedules message via webhook (no authentication required).

**Body:**
```json
{
  "message": "Scheduled webhook message",
  "scheduled_time": "2024-12-25T10:00:00Z"
}
```

---

## 🎨 Frontend Components

### Main Components

#### `Layout.tsx`
Main application layout with navigation and user management.

**Features:**
- Professional header with user info
- Mobile-responsive navigation
- Token validation and refresh
- Logout functionality

#### `ConnectSlack.tsx`
Slack connection and onboarding component.

**Features:**
- OAuth flow initiation
- Professional feature showcase
- Step-by-step connection guide
- Error handling and feedback

#### `MessageForm.tsx`
Message composition and sending interface.

**Features:**
- Instant and scheduled delivery modes
- Channel selection with search
- Character counting and validation
- Real-time form validation

#### `ScheduledMessages.tsx`
Scheduled message management interface.

**Features:**
- Message list with status indicators
- Cancellation capabilities
- Professional card layout
- Empty state handling

#### `WebhookSection.tsx`
Webhook API documentation and testing interface.

**Features:**
- Tabbed interface for different operations
- Built-in API documentation
- Code examples and testing tools
- Professional styling

### UI Components

#### `Button.tsx`
Reusable button component with multiple variants.

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```

### Styling System

The application uses a professional dark theme with:
- **Primary Colors**: Blue gradients (#3B82F6 to #1D4ED8)
- **Secondary Colors**: Gray scales for text and backgrounds
- **Accent Colors**: Green for success, Red for errors
- **Typography**: Inter font family for modern appearance
- **Shadows**: Subtle box shadows for depth
- **Animations**: Smooth transitions and hover effects

---

## 🔧 Backend Services

### Core Services

#### `AuthService.ts`
Handles JWT token management and user authentication.

**Methods:**
- `generateToken(user)`: Creates JWT token
- `verifyToken(token)`: Validates JWT token
- `generateState()`: Creates OAuth state parameter
- `extractTokenFromHeader(header)`: Parses Authorization header

#### `SlackService.ts`
Manages all Slack API interactions.

**Methods:**
- `getAuthUrl(state)`: Generates OAuth authorization URL
- `exchangeCodeForToken(code)`: Exchanges OAuth code for access token
- `getUserInfo(token)`: Retrieves user information from Slack
- `getChannels(token)`: Fetches available channels
- `sendMessage(token, channel, message)`: Sends message to channel
- `sendWebhookMessage(message)`: Sends message via webhook

#### `SchedulerService.ts`
Manages scheduled message functionality.

**Methods:**
- `scheduleMessage(userId, channelId, message, time)`: Creates scheduled message
- `getScheduledMessages(userId)`: Retrieves user's scheduled messages
- `cancelScheduledMessage(messageId, userId)`: Cancels scheduled message
- `processScheduledMessages()`: Processes pending messages (cron job)

### Database Management

#### `DatabaseManager.ts`
Handles all database operations with PostgreSQL.

**Methods:**
- `createUser(userData)`: Creates new user record
- `getUserById(id)`: Retrieves user by ID
- `getUserBySlackId(slackId)`: Retrieves user by Slack ID
- `updateUser(id, data)`: Updates user information
- `createScheduledMessage(data)`: Creates scheduled message record
- `getScheduledMessages(userId)`: Retrieves scheduled messages
- `updateScheduledMessage(id, data)`: Updates scheduled message
- `deleteScheduledMessage(id)`: Deletes scheduled message

### Middleware

#### `auth.ts`
Authentication middleware for protected routes.

**Functions:**
- `authenticateToken`: Validates JWT token and loads user
- `optionalAuth`: Optional authentication for flexible routes

#### `validation.ts`
Request validation middleware using Joi schemas.

**Schemas:**
- `sendMessage`: Validates message sending requests
- `scheduleMessage`: Validates scheduled message requests

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(255) UNIQUE NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scheduled Messages Table

```sql
CREATE TABLE scheduled_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255),
    message TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
-- Improve query performance
CREATE INDEX idx_users_slack_user_id ON users(slack_user_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_scheduled_messages_user_id ON scheduled_messages(user_id);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_time ON scheduled_messages(scheduled_time);
```

---

## 🔍 Troubleshooting

### Common Issues

#### CORS Errors
**Symptoms**: 
- "Access-Control-Allow-Origin" header errors
- Failed requests from frontend to backend

**Solutions:**
1. Verify `CORS_ORIGIN` environment variable matches frontend URL exactly
2. Ensure no trailing slashes in URLs
3. Check backend CORS configuration in `server.ts`

#### OAuth Redirect Issues
**Symptoms**:
- "redirect_uri_mismatch" errors
- Failed OAuth callbacks

**Solutions:**
1. Verify `SLACK_REDIRECT_URI` matches Slack app configuration
2. Update Slack app redirect URLs after deployment
3. Check for URL encoding issues

#### Database Connection Errors
**Symptoms**:
- "Connection refused" errors
- Database timeout errors

**Solutions:**
1. Verify `DATABASE_PATH` environment variable
2. Check database server status
3. Validate connection string format
4. Ensure SSL settings match requirements

#### Build/Deployment Failures
**Symptoms**:
- Build command failures
- Missing dependencies
- Environment variable errors

**Solutions:**
1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Verify all environment variables are set
3. Check build logs for specific errors
4. Ensure correct Node.js version

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

### Health Checks

#### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{"status": "ok", "timestamp": "2024-01-01T00:00:00.000Z"}
```

#### Database Health Check
```bash
curl https://your-backend.onrender.com/api/health/db
```

#### Slack API Health Check
```bash
curl -H "Authorization: Bearer <token>" \
     https://your-backend.onrender.com/api/health/slack
```

---

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Install dependencies**: `npm install` in both frontend and backend
4. **Start development servers**:
   ```bash
   # Backend (port 10000)
   cd SlackConnectBackendV1
   npm run dev
   
   # Frontend (port 3000)
   cd SlackConnectFrontendV1
   npm run dev
   ```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting
- **Commits**: Use conventional commit format

### Testing

```bash
# Backend tests
cd SlackConnectBackendV1
npm test

# Frontend tests
cd SlackConnectFrontendV1
npm test
```

### Pull Request Process

1. Update documentation for any API changes
2. Add tests for new functionality
3. Ensure all tests pass
4. Update version numbers
5. Submit pull request with detailed description

---

## 📞 Support

### Documentation
- **API Reference**: `/api/docs` endpoint
- **Component Library**: Storybook documentation
- **Database Schema**: ERD diagrams in `/docs`

### Community
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Detailed guides and tutorials

### Commercial Support
For enterprise support and custom implementations, contact the development team.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🏆 Acknowledgments

- **Slack API**: For comprehensive integration capabilities
- **Render & Netlify**: For reliable hosting infrastructure
- **Open Source Community**: For the amazing tools and libraries

---

**Built with ❤️ for seamless Slack integration**

*Last updated: January 2024*
