const roomManager = require('./roomManager');
const { updateUserPresence } = require('./db');

// Track userId -> Set of socketIds for DM routing
const userSockets = new Map();

// Rate Limiter for Socket Events
const socketRateLimit = new Map();
const MAX_EVENTS_PER_MIN = 60;
const checkRateLimit = (userId) => {
  const now = Date.now();
  if (!socketRateLimit.has(userId)) {
    socketRateLimit.set(userId, { count: 1, lastReset: now });
    return false;
  }
  const data = socketRateLimit.get(userId);
  if (now - data.lastReset > 60000) {
    data.count = 1;
    data.lastReset = now;
    return false;
  }
  data.count += 1;
  return data.count > MAX_EVENTS_PER_MIN;
};

const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token || cookies.auth_token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.warn("⚠️ JWT_SECRET missing in server env! Using fallback.");
      }

      const decoded = jwt.verify(token, secret || "default_secret_for_development");
      socket.user = decoded; // Attach verified user to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Extract userId from verified token
    const userId = socket.user.userId || 'Unknown';
    const username = socket.user.username || 'Anonymous';
    console.log(`[Socket] User connected securely: ${socket.id} (Auth: ${username}, ID: ${userId})`);

    // Track this user's socket for DM routing
    if (userId !== 'Unknown') {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
        // First connection for this user, mark them online
        updateUserPresence(userId, true);
      }
      userSockets.get(userId).add(socket.id);
      console.log(`[Socket] Tracked user ${userId}, total sockets: ${userSockets.get(userId).size}`);
    }

    // ============= ROOM CHAT (existing) =============

    socket.on('join_room', ({ roomCode, username }) => {
      console.log(`[Socket] Join attempt: ${username} -> Room ${roomCode}`);
      const result = roomManager.joinRoom(roomCode, socket.id, username);

      if (result.error) {
        console.warn(`[Socket] Join REJECTED for ${username}: ${result.error}`);
        socket.emit('error_message', result.error);
        return;
      }

      socket.join(roomCode);
      
      const users = roomManager.getUsersInRoom(roomCode);
      const room = roomManager.getRoom(roomCode);
      
      // Update everyone in the room with the new user list
      io.to(roomCode).emit('user_list', users);
      
      // Send message history to the joining user
      if (room && room.messages) {
        console.log(`[Socket] Sending ${room.messages.length} messages to ${username}`);
        socket.emit('message_history', room.messages);
      }
      
      // Broadcast join message
      socket.to(roomCode).emit('receive_message', {
        username: 'SYSTEM',
        text: `${username} has entered the multiverse.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
      });

      console.log(`[Socket] ${username} successfully joined room ${roomCode}`);
    });

    socket.on('create_room', () => {
      console.log('[Socket] Room creation requested');
      const roomCode = roomManager.createRoom();
      console.log('[Socket] Room created:', roomCode);
      socket.emit('room_created', roomCode);
    });

    socket.on('send_message', ({ roomCode, text, username, replyTo }) => {
      if (checkRateLimit(userId)) {
        return socket.emit('error_message', 'Rate limit exceeded. Slow down!');
      }

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        console.warn(`[Socket] Message failed: Room ${roomCode} not found`);
        return;
      }

      const message = {
        username,
        text,
        timestamp: new Date().toLocaleTimeString(),
        serverTime: Date.now(),
        type: 'user'
      };

      // Attach reply reference if replying to a message
      if (replyTo) {
        message.replyTo = {
          username: replyTo.username,
          text: replyTo.text
        };
      }
      
      room.messages.push(message);
      // Limit message history to 50 for performance
      if (room.messages.length > 50) room.messages.shift();
      
      io.to(roomCode).emit('receive_message', message);
      roomManager.saveToPersistence(); // Save history
    });

    socket.on('typing', ({ roomCode, username, isTyping }) => {
      socket.to(roomCode).emit('display_typing', { username, isTyping });
    });

    // ============= DIRECT MESSAGES (Phase 3) =============

    socket.on('join_dm', ({ conversationId }) => {
      socket.join(`dm:${conversationId}`);
      console.log(`[Socket] ${username} joined DM room: dm:${conversationId}`);
    });

    socket.on('leave_dm', ({ conversationId }) => {
      socket.leave(`dm:${conversationId}`);
      console.log(`[Socket] ${username} left DM room: dm:${conversationId}`);
    });

    socket.on('dm_send', ({ conversationId, content, type, replyTo }) => {
      if (checkRateLimit(userId)) {
        return socket.emit('error_message', 'Rate limit exceeded. Slow down!');
      }

      // The message is persisted via the Next.js API route.
      // Here we just broadcast to the conversation room for real-time delivery.
      const message = {
        _id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: {
          _id: userId,
          username: username,
          displayName: username,
          avatar: null
        },
        content,
        type: type || 'text',
        status: 'sent',
        replyTo: replyTo || null,
        reactions: [],
        createdAt: new Date().toISOString(),
      };

      // Broadcast to all sockets in the DM room EXCEPT the sender
      socket.to(`dm:${conversationId}`).emit('dm_receive', message);
      console.log(`[Socket] DM sent in conversation ${conversationId} by ${username}`);
    });

    socket.on('dm_typing', ({ conversationId, userId: typingUserId, isTyping }) => {
      socket.to(`dm:${conversationId}`).emit('dm_typing', {
        userId: typingUserId,
        isTyping
      });
    });

    socket.on('dm_seen', ({ conversationId }) => {
      socket.to(`dm:${conversationId}`).emit('dm_seen', {
        conversationId,
        userId
      });
    });

    socket.on('dm_reaction', ({ conversationId, messageId, emoji }) => {
      socket.to(`dm:${conversationId}`).emit('dm_reaction', {
        messageId,
        emoji,
        userId
      });
    });

    socket.on('dm_edit', ({ conversationId, messageId, content }) => {
      socket.to(`dm:${conversationId}`).emit('dm_edit', {
        messageId,
        content,
        editedAt: new Date().toISOString()
      });
    });

    socket.on('dm_delete', ({ conversationId, messageId }) => {
      socket.to(`dm:${conversationId}`).emit('dm_delete', {
        messageId
      });
    });

    // ============= DISCONNECT =============

    socket.on('disconnect', () => {
      // Room chat cleanup
      const leaveData = roomManager.leaveRoom(socket.id);
      if (leaveData) {
        const { roomCode, username } = leaveData;
        const remainingUsers = roomManager.getUsersInRoom(roomCode);
        
        io.to(roomCode).emit('user_list', remainingUsers);
        io.to(roomCode).emit('receive_message', {
          username: 'SYSTEM',
          text: `${username} has left the multiverse.`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'system'
        });
        
        console.log(`[Socket] ${username} left room ${roomCode}`);
      }

      // DM user tracking cleanup
      if (userId !== 'Unknown' && userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          // Last connection for this user closed, mark them offline
          updateUserPresence(userId, false);
        }
      }

      console.log('[Socket] User disconnected:', socket.id);
    });
  });
};
