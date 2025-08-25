# Traycerai Backend

A simple Express.js backend with clean architecture featuring services, repositories, and database integration.

## Features

- ✅ Express.js server with middleware setup
- ✅ Clean architecture with services and repositories
- ✅ SQLite database with Drizzle ORM
- ✅ Health check endpoints
- ✅ User, Session, and Conversation CRUD operations
- ✅ Chat API with Claude integration
- ✅ Conversation storage and management
- ✅ Error handling and validation
- ✅ Mock data fallback when database is not connected

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # SQLite database configuration
│   │   ├── schema.js         # Drizzle ORM schema definitions
│   │   └── migrate.js        # Database migration script
│   ├── repositories/
│   │   ├── userRepository.js        # User data access layer
│   │   ├── sessionRepository.js     # Session data access layer
│   │   └── conversationRepository.js # Conversation data access layer
│   ├── services/
│   │   ├── healthService.js         # Business logic for health checks
│   │   ├── userService.js           # Business logic for users
│   │   ├── sessionService.js        # Business logic for sessions
│   │   ├── conversationService.js   # Business logic for conversations
│   │   └── chatService.js           # Claude API integration
│   ├── routes/
│   │   ├── api.js                   # Main API router
│   │   ├── health.js                # Health check routes
│   │   ├── users.js                 # User routes
│   │   ├── sessions.js              # Session routes
│   │   ├── conversations.js         # Conversation routes
│   │   └── chat.js                  # Chat routes
│   └── server.js                    # Express server setup
├── drizzle.config.js                # Drizzle configuration
├── .env.example                     # Environment variables template
├── .gitignore                      # Git ignore file
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Add your `ANTHROPIC_API_KEY` for Claude integration
   - Configure MongoDB connection if needed

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Base Endpoints
- `GET /` - Hello World message
- `GET /api` - API information
- `GET /api/health` - Health check

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Session Endpoints
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `GET /api/sessions/user/:userId` - Get sessions by user ID
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Conversation Endpoints
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `GET /api/conversations/session/:sessionId` - Get conversations by session ID
- `GET /api/conversations/user/:userId` - Get conversations by user ID
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Chat Endpoints
- `GET /api/chat` - Chat API information
- `POST /api/chat/message` - Send message to Claude
- `GET /api/chat/health` - Chat service health check

### Example User Object
```json
{
  "name": "John Doe"
}
```

### Example Session Object
```json
{
  "userId": 1
}
```

### Example Conversation Object
```json
{
  "sessionId": 1,
  "userId": 1,
  "userType": "user",
  "message": "Hello, how are you?"
}
```

### Example Chat Request
```json
{
  "message": "What should I search for to find the latest developments in renewable energy?",
  "sessionId": 1,
  "userId": 1
}
```

## Database

The application uses SQLite with Drizzle ORM. The database file (`database.sqlite`) will be automatically created in the backend directory when the server starts.

### Database Setup
1. The database and tables are automatically created when the server starts
2. You can manually run migrations using: `npm run migrate`
3. The database includes three tables:
   - `users` - Store user information
   - `sessions` - Store chat sessions
   - `conversations` - Store individual messages in sessions

## Development Notes

- The application includes fallback mock data when the database is not available
- All routes include proper error handling
- Input validation is implemented at both service and model levels
- The architecture follows separation of concerns with clear layers
