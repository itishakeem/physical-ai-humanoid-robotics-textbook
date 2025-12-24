# PostgreSQL Database Setup Guide

This guide explains how to set up PostgreSQL for chat history storage.

## Prerequisites

1. PostgreSQL installed and running
2. Python dependencies installed (`pip install -r requirements.txt`)

## Database Configuration

Add the following to your `.env` file:

```env
# Option 1: Full DATABASE_URL
DATABASE_URL=postgresql://user:password@localhost:5432/humanoid_robotics

# Option 2: Individual components (will be auto-constructed)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=humanoid_robotics

# JWT Secret Key for authentication (REQUIRED)
JWT_SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long-random-string
```

## Setup Steps

1. **Create the database** (if it doesn't exist):
   ```sql
   CREATE DATABASE humanoid_robotics;
   ```

2. **Run the setup script**:
   ```bash
   python backend/setup_db.py
   ```

   This will create the necessary tables (`chats` and `messages`).

3. **Start the backend server**:
   ```bash
   uvicorn backend.main:app --reload
   ```

   The database will be automatically initialized on startup if tables don't exist.

## Database Schema

### `users` table
- `id` (Integer, Primary Key, Auto-increment): User ID
- `first_name` (String): User's first name
- `last_name` (String): User's last name
- `email` (String, Unique): User's email address
- `password_hash` (String): Bcrypt hashed password
- `developer_level` (String): 'Beginner', 'Intermediate', or 'Advanced'
- `created_at` (DateTime): When the account was created
- `updated_at` (DateTime): Last update timestamp

### `chats` table
- `id` (String, Primary Key): Unique chat identifier (UUID)
- `user_id` (Integer, Foreign Key): References `users.id` (REQUIRED - chats are user-specific)
- `title` (String): Chat title
- `created_at` (DateTime): When the chat was created
- `updated_at` (DateTime): Last update timestamp

### `messages` table
- `id` (Integer, Primary Key, Auto-increment): Message ID
- `chat_id` (String, Foreign Key): References `chats.id`
- `role` (String): 'user' or 'bot'
- `text` (Text): Message content
- `created_at` (DateTime): When the message was created

## API Endpoints

### Authentication Endpoints (`/api/auth`)
- `POST /signup` - Create a new user account (returns JWT token)
- `POST /login` - Login user (returns JWT token)
- `GET /me` - Get current user information (requires authentication)
- `POST /logout` - Logout endpoint (client should discard token)

### Chat History Endpoints (`/api/chat-history`)
**All endpoints require authentication (Bearer token in Authorization header)**

- `POST /chats` - Create a new chat (user-specific)
- `GET /chats` - Get all chats for current user
- `GET /chats/{chat_id}` - Get a specific chat with messages
- `POST /chats/{chat_id}/messages` - Add a message to a chat
- `DELETE /chats/{chat_id}` - Delete a chat
- `DELETE /chats` - Delete all chats for current user
- `PUT /chats/{chat_id}/clear` - Clear all messages from a chat

## Troubleshooting

### Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Ensure database exists
- Verify user has proper permissions

### Table Creation Errors
- Check PostgreSQL logs
- Verify user has CREATE TABLE permissions
- Try running `setup_db.py` manually

## Authentication

**Important**: Users must create an account and log in before their chat history is saved. Unauthenticated users can still use the chatbot, but their conversations will not be persisted.

### User Levels
- **Beginner**: Receives simplified, beginner-friendly explanations
- **Intermediate**: Standard technical explanations
- **Advanced**: Full technical depth and advanced concepts

The chatbot automatically adjusts its responses based on the user's developer level.

### Security
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- All chat history endpoints require authentication
- Users can only access their own chat history

