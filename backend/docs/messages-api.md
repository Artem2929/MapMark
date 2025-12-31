# Messages API Documentation

## Overview
Production-ready messaging system with real-time capabilities, built for scale.

## Architecture
- **Models**: Conversation-based messaging with proper indexing
- **Security**: IDOR protection, input validation, auth middleware
- **Performance**: Cursor-based pagination, lean queries, minimal selects
- **Scalability**: Ready for WebSocket/Pusher integration

## API Endpoints

### Conversations

#### GET /api/v1/messages/conversations
Get user's conversations list.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "conversation_id",
      "participant": {
        "_id": "user_id",
        "name": "User Name",
        "username": "username",
        "avatar": "avatar_url",
        "isOnline": true,
        "lastSeen": "2024-01-01T00:00:00.000Z"
      },
      "lastMessage": {
        "text": "Last message text",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "senderId": "sender_id"
      },
      "unreadCount": 5,
      "lastActivity": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/v1/messages/conversations
Create new conversation.

**Request:**
```json
{
  "userId": "target_user_id"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "conversation_id",
    "participants": ["user1_id", "user2_id"]
  }
}
```

#### DELETE /api/v1/messages/conversations/:conversationId
Delete (deactivate) conversation.

### Messages

#### GET /api/v1/messages/messages
Get messages with cursor pagination.

**Query Parameters:**
- `conversationId` (required): Conversation ID
- `cursor` (optional): ISO date string for pagination
- `limit` (optional): Number of messages (1-100, default: 50)

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "conversationId": "conversation_id",
        "sender": {
          "_id": "user_id",
          "name": "User Name",
          "username": "username",
          "avatar": "avatar_url"
        },
        "text": "Message text",
        "readBy": ["user1_id", "user2_id"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "hasMore": true,
    "nextCursor": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/messages/messages
Send new message.

**Request:**
```json
{
  "conversationId": "conversation_id",
  "text": "Message text (1-4000 chars)"
}
```

#### POST /api/v1/messages/messages/read
Mark messages as read.

**Request:**
```json
{
  "conversationId": "conversation_id"
}
```

#### DELETE /api/v1/messages/messages/:messageId
Delete message (sender only).

## Security Features

### Authentication
- All endpoints require valid JWT token
- User must be conversation participant

### Validation
- Input sanitization and validation
- MongoDB ObjectId validation
- Text length limits (4000 chars)

### IDOR Protection
- Users can only access their conversations
- Sender-only message deletion
- Participant verification on all operations

## Performance Optimizations

### Database
- Compound indexes on `conversationId + createdAt`
- Lean queries for read operations
- Minimal field selection

### Pagination
- Cursor-based pagination (not offset)
- Configurable limits (max 100)
- Efficient date-based sorting

### Caching Ready
- Stateless design
- Cacheable conversation lists
- Redis-ready architecture

## Error Handling

### Standard Response Format
```json
{
  "status": "error|fail|success",
  "message": "Error description",
  "data": null,
  "errors": []
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (IDOR)
- `404` - Not found
- `500` - Server error

## Real-time Integration

### WebSocket Events
```javascript
// Incoming events
socket.on('message:new', (message) => {})
socket.on('message:read', ({ conversationId, userId }) => {})
socket.on('user:typing', ({ conversationId, userId, isTyping }) => {})

// Outgoing events
socket.emit('conversation:join', conversationId)
socket.emit('conversation:leave', conversationId)
socket.emit('typing:start', conversationId)
socket.emit('typing:stop', conversationId)
```

## Monitoring & Logging

### Metrics to Track
- Message send rate
- Conversation creation rate
- API response times
- Error rates by endpoint

### Log Events
- Message sent/received
- Conversation created/deleted
- Authentication failures
- Validation errors

## Scaling Considerations

### Database
- Shard by conversation ID
- Archive old messages
- Read replicas for queries

### Application
- Horizontal scaling ready
- Stateless design
- Queue-based message processing

### Real-time
- Socket.io clustering
- Redis adapter for multi-instance
- Message broker integration