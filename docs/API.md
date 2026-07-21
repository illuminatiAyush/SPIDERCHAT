# API Documentation

## Authentication Endpoints

### POST `/api/auth/login`
- **Authentication**: None required
- **Request**: `{ "username": "spider", "password": "password123" }`
- **Response**: `{ "user": { "id": "...", "username": "spider" }, "token": "..." }` (Sets HttpOnly cookie)
- **Errors**: `401 Unauthorized`

### POST `/api/auth/register`
- **Authentication**: None required
- **Request**: `{ "username": "spider", "password": "password123" }`
- **Response**: `{ "user": { "id": "...", "username": "spider" } }`
- **Errors**: `400 Bad Request`

### POST `/api/auth/logout`
- **Authentication**: Optional
- **Request**: `{}`
- **Response**: `{ "message": "Logged out" }` (Clears cookie)

## User Endpoints

### GET `/api/users/me`
- **Authentication**: Required (JWT)
- **Response**: `{ "user": { ... } }`
- **Errors**: `401 Unauthorized`

### GET `/api/users/search?q={query}`
- **Authentication**: Required (JWT)
- **Response**: `{ "users": [ ... ] }`

## Friends Endpoints

### GET `/api/friends/list`
- **Authentication**: Required (JWT)
- **Response**: `{ "friends": [ ... ] }`

### GET `/api/friends/requests`
- **Authentication**: Required (JWT)
- **Response**: `{ "requests": [ ... ] }`

### POST `/api/friends/request`
- **Authentication**: Required (JWT)
- **Request**: `{ "receiverId": "..." }`
- **Response**: `{ "message": "Request sent" }`

### POST `/api/friends/accept`
- **Authentication**: Required (JWT)
- **Request**: `{ "requestId": "..." }`
- **Response**: `{ "message": "Accepted" }`

### POST `/api/friends/decline`
- **Authentication**: Required (JWT)
- **Request**: `{ "requestId": "..." }`
- **Response**: `{ "message": "Declined" }`

## Conversation Endpoints

### GET `/api/conversations`
- **Authentication**: Required (JWT)
- **Response**: `{ "conversations": [ ... ] }`

### POST `/api/conversations`
- **Authentication**: Required (JWT)
- **Request**: `{ "participantId": "..." }`
- **Response**: `{ "conversation": { ... } }`

## Messages Endpoints

### GET `/api/messages/:conversationId`
- **Authentication**: Required (JWT)
- **Response**: `{ "messages": [ ... ] }`

### POST `/api/messages/read`
- **Authentication**: Required (JWT)
- **Request**: `{ "conversationId": "..." }`
- **Response**: `{ "message": "Marked read" }`
