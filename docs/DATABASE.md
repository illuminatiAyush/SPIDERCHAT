# Database Documentation

## Overview
SpiderChat uses PostgreSQL as its primary database, managed via the Prisma ORM.

## Prisma Models

### `User`
- Represents an account in the system.
- Fields: `id`, `username`, `email`, `passwordHash`, `displayName`, `avatar`, `status`, `lastSeen`, `createdAt`, `updatedAt`
- Relations: Friends, Friend Requests (Sent/Received), Conversations, Messages, Notifications.

### `FriendRequest`
- Represents a pending request between two users.
- Fields: `id`, `senderId`, `receiverId`, `status`, `createdAt`
- Status enum: `PENDING`, `ACCEPTED`, `DECLINED`

### `Conversation`
- Represents a direct message chat room between users.
- Fields: `id`, `createdAt`, `updatedAt`
- Relations: `participants` (Users), `messages` (Messages)

### `Message`
- Represents a chat message within a conversation.
- Fields: `id`, `conversationId`, `senderId`, `content`, `type`, `createdAt`, `updatedAt`
- Relations: Belongs to `Conversation` and `User` (sender).
- Includes support for replies and status (`SENT`, `DELIVERED`, `READ`).

### `MessageReaction`
- Connects an emoji reaction to a specific message.
- Fields: `id`, `messageId`, `userId`, `emoji`, `createdAt`

### `Notification`
- Represents an alert for a user (e.g., friend request received).
- Fields: `id`, `userId`, `type`, `message`, `isRead`, `createdAt`

## Entity-Relationship
- Users have many-to-many relationships with other Users via self-relations (`friends` and `friendOf`).
- Users belong to many Conversations.
- Messages belong to one Conversation and one User (the sender).
