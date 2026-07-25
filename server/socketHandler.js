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
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = (io) => {
  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token || cookies.auth_token || socket.handshake.auth?.token;

      if (!token) {
        // Fallback to anonymous connection for room chats
        const providedUsername = socket.handshake.auth?.username || 'Anonymous';
        socket.user = { id: `anon_${Math.random().toString(36).substring(7)}`, username: providedUsername };
        return next();
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.warn("⚠️ JWT_SECRET missing in server env! Cannot authenticate socket.");
        throw new Error("Missing secret");
      }

      const decoded = jwt.verify(token, secret);
      socket.user = decoded; // Attach verified user to socket
      next();
    } catch (err) {
      // Invalid token, fallback to anonymous
      const providedUsername = socket.handshake.auth?.username || 'Anonymous';
      socket.user = { id: `anon_${Math.random().toString(36).substring(7)}`, username: providedUsername };
      next();
    }
  });

  io.on('connection', (socket) => {
    // Extract userId from verified token
    const userId = socket.user.id || socket.user.userId || 'Unknown';
    const username = socket.user.username || 'Anonymous';
    console.log(`[Socket] User connected securely: ${socket.id} (Auth: ${username}, ID: ${userId})`);

    // Track this user's socket for DM routing (only if authenticated user)
    if (userId !== 'Unknown' && !userId.startsWith('anon_')) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
        io.emit('live_users_update', Array.from(userSockets.keys()));
      }
      userSockets.get(userId).add(socket.id);
      console.log(`[Socket] Tracked user ${userId}, total sockets: ${userSockets.get(userId).size}`);
    }

    // ============= ADMIN DASHBOARD =============
    socket.on('join_admin_dashboard', () => {
      socket.join('admin_dashboard');
      socket.emit('admin_live_users', Array.from(userSockets.keys()));
    });

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

    socket.on('join_admin_dashboard', () => {
      // Allow if user is admin (hardcoded 'admin' username check since no role column exists yet, or check a role if present)
      if (socket.user && socket.user.username === 'admin') {
        socket.join('admin_dashboard');
      } else {
        console.warn(`[Socket] Unauthorized admin join attempt by ${username}`);
      }
    });

    socket.on('send_message', ({ roomCode, text, replyTo }) => {
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

      // Persist to Postgres for moderation/admin (fire-and-forget)
      try {
        const isGuest = userId === 'Unknown' || userId.startsWith('anon_');
        const dbSenderId = !isGuest ? userId : null;
        
        prisma.message.create({
          data: {
            content: text,
            senderId: dbSenderId,
            senderName: username || 'Anonymous',
            roomId: roomCode,
            type: 'user'
          }
        }).then((persistedMessage) => {
          // Determine if it's a DM (roomCode contains '_')
          const isDM = roomCode.includes('_');
          
          return prisma.moderationLog.create({
            data: {
              messageId: persistedMessage.id,
              source: isDM ? 'DIRECT' : 'ROOM',
              roomId: roomCode,
              senderId: dbSenderId,
              senderName: username || 'Anonymous',
              messageContent: text,
              messageType: 'user',
              isGuest: isGuest,
              isAuthenticated: !isGuest
            }
          });
        }).then((modLog) => {
          io.to('admin_dashboard').emit('moderation:new', modLog);
        }).catch(err => console.error('[Socket] Failed to persist room message or mod log:', err));
      } catch (err) {
        console.error('[Socket] Error triggering message persistence:', err);
      }
    });

    socket.on('typing', ({ roomCode, username, isTyping }) => {
      socket.to(roomCode).emit('display_typing', { username, isTyping });
    });

    // ============= DIRECT MESSAGES (Phase 3) =============

    // We no longer need join_dm / leave_dm as we route directly via userSockets
    socket.on('join_dm', () => {});
    socket.on('leave_dm', () => {});

    socket.on('dm_send', async ({ conversationId, content, type, replyTo, messageId }) => {
      if (checkRateLimit(userId)) {
        return socket.emit('error_message', 'Rate limit exceeded. Slow down!');
      }

      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: true }
        });
        
        if (!conversation) return;
        
        const receiver = conversation.participants.find(p => p.id !== userId);
        const receiverId = receiver ? receiver.id : userId; // fallback to self if self-DM

        const message = {
          _id: messageId || `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          conversationId: conversationId
        };

        // Broadcast to receiver
        if (receiverId !== userId) {
          const receiverSockets = userSockets.get(receiverId);
          if (receiverSockets) {
            for (const socketId of receiverSockets) {
              io.to(socketId).emit('dm_receive', message);
            }
          }
        }

        // Broadcast to sender's other tabs
        const mySockets = userSockets.get(userId);
        if (mySockets) {
          for (const socketId of mySockets) {
            if (socketId !== socket.id) {
              io.to(socketId).emit('dm_receive', message);
            }
          }
        }

        // Create Moderation Log (fire-and-forget)
        prisma.moderationLog.create({
          data: {
            messageId: message._id,
            source: 'DM',
            conversationId: conversationId, 
            senderId: userId,
            senderName: username,
            recipientId: receiverId,
            messageContent: content,
            messageType: type || 'text',
            isGuest: false,
            isAuthenticated: true
          }
        }).then((modLog) => {
          io.to('admin_dashboard').emit('moderation:new', modLog);
        }).catch(err => console.error('[Socket] Failed to persist DM mod log:', err));
      } catch (err) {
        console.error('[Socket] Error in dm_send:', err);
      }
    });

    socket.on('dm_typing', async ({ conversationId, isTyping }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: true }
        });
        if (!conversation) return;
        const receiver = conversation.participants.find(p => p.id !== userId);
        if (!receiver) return;
        
        const receiverSockets = userSockets.get(receiver.id);
        if (receiverSockets) {
          for (const socketId of receiverSockets) {
            io.to(socketId).emit('dm_typing', {
              userId,
              isTyping,
              conversationId
            });
          }
        }
      } catch (err) {
        console.error('[Socket] Error in dm_typing:', err);
      }
    });

    socket.on('dm_seen', async ({ conversationId }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: true }
        });
        if (!conversation) return;
        const receiver = conversation.participants.find(p => p.id !== userId);
        if (!receiver) return;

        const receiverSockets = userSockets.get(receiver.id);
        if (receiverSockets) {
          for (const socketId of receiverSockets) {
            io.to(socketId).emit('dm_seen', {
              conversationId,
              userId
            });
          }
        }
      } catch (err) {
        console.error('[Socket] Error in dm_seen:', err);
      }
    });

    socket.on('dm_reaction', async ({ conversationId, messageId, emoji }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { participants: true }
        });
        if (!conversation) return;
        const receiver = conversation.participants.find(p => p.id !== userId);
        if (!receiver) return;

        const receiverSockets = userSockets.get(receiver.id);
        if (receiverSockets) {
          for (const socketId of receiverSockets) {
            io.to(socketId).emit('dm_reaction', {
              messageId,
              emoji,
              userId,
              conversationId
            });
          }
        }
      } catch (err) {
        console.error('[Socket] Error in dm_reaction:', err);
      }
    });

    socket.on('dm_edit', ({ conversationId, messageId, content }) => {
      const receiverId = conversationId;
      const receiverSockets = userSockets.get(receiverId);
      if (receiverSockets) {
        for (const socketId of receiverSockets) {
          io.to(socketId).emit('dm_edit', {
            messageId,
            content,
            editedAt: new Date().toISOString(),
            conversationId: userId
          });
        }
      }
    });

    socket.on('dm_delete', ({ conversationId, messageId }) => {
      const receiverId = conversationId;
      const receiverSockets = userSockets.get(receiverId);
      if (receiverSockets) {
        for (const socketId of receiverSockets) {
          io.to(socketId).emit('dm_delete', {
            messageId,
            conversationId: userId
          });
        }
      }
    });

    // ============= NOTIFICATIONS =============
    socket.on('send_notification', ({ receiverId, type, message }) => {
      console.log(`[Socket] Sending notification to ${receiverId}`);
      const receiverSockets = userSockets.get(receiverId);
      if (receiverSockets) {
        for (const socketId of receiverSockets) {
          io.to(socketId).emit('notification', { type, message });
        }
      }
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

      // DM user tracking cleanup (only for authenticated users)
      if (userId !== 'Unknown' && !userId.startsWith('anon_') && userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          io.emit('live_users_update', Array.from(userSockets.keys()));
          io.to('admin_dashboard').emit('admin_live_users', Array.from(userSockets.keys()));
        }
      }

      console.log('[Socket] User disconnected:', socket.id);
    });
  });
};
