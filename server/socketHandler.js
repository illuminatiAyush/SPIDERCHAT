const roomManager = require('./roomManager');
const { updateUserPresence } = require('./db');
const crypto = require('crypto');

// Track userId -> Set of socketIds for DM routing
const userSockets = new Map();

// Track slow mode per room (roomCode -> Map(socketId -> timestamp))
const roomSlowModeTimers = new Map();

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

// Periodic garbage collection for rate limits
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of socketRateLimit.entries()) {
    if (now - data.lastReset > 60000) {
      socketRateLimit.delete(userId);
    }
  }
}, 60000);

const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = (io) => {
  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || '');
      const token = cookies.token || cookies.auth_token || cookies.adminToken || socket.handshake.auth?.token;

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
      if (decoded && decoded.role === 'admin' && !decoded.username) {
        decoded.username = 'admin';
      }
      socket.user = decoded; // Attach verified user to socket
      next();
    } catch (err) {
      // Invalid token, fallback to anonymous
      const providedUsername = socket.handshake.auth?.username || 'Anonymous';
      const providedGuestId = socket.handshake.auth?.guestId;
      socket.user = { id: providedGuestId || `anon_${Math.random().toString(36).substring(7)}`, username: providedUsername };
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

    // ============= ROOM CHAT (existing) =============

    socket.on('join_room', ({ roomCode, username }) => {
      console.log(`[Socket] Join attempt: ${username} -> Room ${roomCode}`);
      // Pass userId to RoomManager for deduplication and auth tracking
      const result = roomManager.joinRoom(roomCode, socket.id, username, userId);

      if (result.error) {
        console.warn(`[Socket] Join REJECTED for ${username}: ${result.error}`);
        socket.emit('error_message', result.error);
        return;
      }

      socket.join(roomCode);
      
      const users = roomManager.getUsersInRoom(roomCode);
      const room = roomManager.getRoom(roomCode);
      
      // Send the full list to the joining user
      socket.emit('room_participants', users);
      
      // Broadcast granular event to others
      const joinedUser = users.find(u => u.username === username);
      if (joinedUser) {
        // We use participant_updated if they already existed (reconnecting/multi-tab), but participant_joined works if client merges by ID.
        // Let's just broadcast participant_updated to be safe, the client will upsert.
        socket.to(roomCode).emit('participant_updated', joinedUser);
      }
      
      // Legacy support for existing components
      io.to(roomCode).emit('user_list', users);
      

      
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
      // Allow only verified admin tokens
      if (socket.user && (socket.user.role === 'admin' || socket.user.username === 'admin')) {
        socket.join('admin_dashboard');
        socket.emit('admin_live_users', Array.from(userSockets.keys()));
        console.log(`[Socket] Admin dashboard joined securely by ${socket.user.username}`);
      } else {
        console.warn(`[Socket] Unauthorized admin join attempt by ${username} (${userId})`);
        socket.emit('error_message', 'Unauthorized: Admin privileges required.');
      }
    });

    socket.on('send_message', async ({ roomCode, text, replyTo }) => {
      if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 5000) {
        return socket.emit('error_message', 'Invalid message content.');
      }
      
      if (checkRateLimit(userId)) {
        return socket.emit('error_message', 'Rate limit exceeded. Slow down!');
      }

      const room = roomManager.getRoom(roomCode);
      if (!room) {
        console.warn(`[Socket] Message failed: Room ${roomCode} not found`);
        return;
      }

      if (room.mutedSockets.has(socket.id)) {
        return socket.emit('error_message', 'You are muted in this dimension.');
      }

      if (room.slowMode > 0) {
         if (!roomSlowModeTimers.has(roomCode)) roomSlowModeTimers.set(roomCode, new Map());
         const timers = roomSlowModeTimers.get(roomCode);
         const lastMsgTime = timers.get(socket.id) || 0;
         const now = Date.now();
         if (now - lastMsgTime < room.slowMode * 1000) {
            return socket.emit('error_message', `Slow mode active. Please wait before transmitting.`);
         }
         timers.set(socket.id, now);
      }

      const messageId = crypto.randomUUID();

      const message = {
        id: messageId,
        username,
        senderId: userId, // Stable identifier for ownership
        text,
        timestamp: new Date().toLocaleTimeString(),
        serverTime: Date.now(),
        type: 'user'
      };

      // Validate and attach reply reference
      if (replyTo && replyTo.id) {
        // Check in memory first
        let originalMsg = room.messages.find(m => m.id === replyTo.id);
        


        if (originalMsg) {
          message.replyTo = {
            id: replyTo.id,
            username: originalMsg.username || replyTo.senderName || 'Unknown',
            text: originalMsg.text || replyTo.preview || ''
          };
          message.replyToId = replyTo.id; // used for DB
        }
      }
      
      room.messages.push(message);
      // Limit message history to 500 to prevent message loss on refresh
      if (room.messages.length > 500) room.messages.shift();
      
      io.to(roomCode).emit('receive_message', message);
      roomManager.saveToPersistence(); // Save history

      // Persist to Postgres for moderation/admin (fire-and-forget)
      try {
        const isGuest = userId === 'Unknown' || userId.startsWith('anon_');
        const dbSenderId = !isGuest ? userId : null;
        
        const isDM = roomCode.includes('_');
        
        prisma.moderationLog.create({
          data: {
            messageId: messageId,
            source: isDM ? 'DIRECT' : 'ROOM',
            roomId: roomCode,
            senderId: dbSenderId,
            senderName: username || 'Anonymous',
            messageType: 'user',
            isGuest: isGuest,
            isAuthenticated: !isGuest
          }
        }).then((modLog) => {
          io.to('admin_dashboard').emit('moderation:new', modLog);
        }).catch(err => console.error('[Socket] Failed to persist mod log:', err));
      } catch (err) {
        console.error('[Socket] Error triggering moderation persistence:', err);
      }
    });

    socket.on('typing', ({ roomCode, username, isTyping }) => {
      socket.to(roomCode).emit('display_typing', { username, isTyping });
    });

    // ============= ROOM ADMIN EVENTS =============
    const requireOwner = (roomCode, socketId) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return null;
      if (room.ownerSocketId !== socketId) {
         socket.emit('error_message', 'You do not have permission to perform this action.');
         return null;
      }
      return room;
    };

    socket.on('room_user_kick', ({ roomCode, targetSocketId }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       if (targetSocketId === socket.id) return socket.emit('error_message', "You cannot remove yourself.");
       
       room.bannedSockets.add(targetSocketId);
       const targetUser = room.users.get(targetSocketId);
       if (targetUser) {
           io.to(targetSocketId).emit('kicked', 'You were removed by the Room Owner.');
           const targetSocket = io.sockets.sockets.get(targetSocketId);
           if (targetSocket) {
             targetSocket.leave(roomCode);
             roomManager.leaveRoom(targetSocketId);
           }
           io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `Variant ${targetUser.username} has been removed by the Room Owner.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
           });
           io.to(roomCode).emit('user_list', roomManager.getUsersInRoom(roomCode));
       }
    });

    socket.on('room_user_mute', ({ roomCode, targetSocketId }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       if (targetSocketId === socket.id) return socket.emit('error_message', "You cannot mute yourself.");
       room.mutedSockets.add(targetSocketId);
       roomManager.saveToPersistence();
       io.to(roomCode).emit('user_list', roomManager.getUsersInRoom(roomCode));
    });

    socket.on('room_user_unmute', ({ roomCode, targetSocketId }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       room.mutedSockets.delete(targetSocketId);
       roomManager.saveToPersistence();
       io.to(roomCode).emit('user_list', roomManager.getUsersInRoom(roomCode));
    });

    socket.on('room_lock', ({ roomCode }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       room.locked = true;
       roomManager.saveToPersistence();
       io.to(roomCode).emit('room_updated', { locked: true });
       io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `This Dimension has been Locked.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
       });
    });

    socket.on('room_unlock', ({ roomCode }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       room.locked = false;
       roomManager.saveToPersistence();
       io.to(roomCode).emit('room_updated', { locked: false });
       io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `This Dimension has been Unlocked.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
       });
    });

    socket.on('room_update', ({ roomCode, title, description, slowMode }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       if (title !== undefined) room.roomTitle = title;
       if (description !== undefined) room.description = description;
       if (slowMode !== undefined) room.slowMode = slowMode;
       roomManager.saveToPersistence();
       io.to(roomCode).emit('room_updated', { title: room.roomTitle, description: room.description, slowMode: room.slowMode });
    });

    socket.on('room_clear', ({ roomCode }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       room.messages = [];
       roomManager.saveToPersistence();
       io.to(roomCode).emit('room_cleared');
       io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `The Spider-Web has been cleared by the Room Owner.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
       });
    });

    socket.on('room_pin_message', ({ roomCode, message }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       room.pinnedMessage = message;
       roomManager.saveToPersistence();
       io.to(roomCode).emit('room_updated', { pinnedMessage: message });
       io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `A message was pinned to the Spider-Web.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
       });
    });

    socket.on('room_owner_transfer', ({ roomCode, targetSocketId }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       if (targetSocketId === socket.id) return;
       if (room.users.has(targetSocketId)) {
          room.ownerSocketId = targetSocketId;
          roomManager.saveToPersistence();
          const targetUser = room.users.get(targetSocketId);
          io.to(roomCode).emit('user_list', roomManager.getUsersInRoom(roomCode));
          io.to(roomCode).emit('receive_message', {
             username: 'SYSTEM',
             text: `Ownership Transferred to ${targetUser.username}.`,
             timestamp: new Date().toLocaleTimeString(),
             type: 'system'
          });
       }
    });

    socket.on('room_delete', ({ roomCode }) => {
       const room = requireOwner(roomCode, socket.id);
       if (!room) return;
       io.to(roomCode).emit('room_deleted', 'This universe has collapsed.');
       io.in(roomCode).fetchSockets().then(sockets => {
           for (const s of sockets) {
               s.leave(roomCode);
           }
       });
       roomManager.rooms.delete(roomCode);
       roomSlowModeTimers.delete(roomCode); // Clean up slow mode map
       roomManager.saveToPersistence();
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
        
        // Authorization check: User must be a participant in this conversation (IDOR prevention)
        if (!conversation.participants.some(p => p.id === userId)) {
          return socket.emit('error_message', 'You are not a participant in this conversation.');
        }
        
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

        // Save to Database: DirectMessage, update Conversation, and ModerationLog
        try {
          const [savedMessage, updatedConv, modLog] = await prisma.$transaction([
            prisma.directMessage.create({
              data: {
                id: message._id,
                conversationId: conversationId,
                senderId: userId,
                content: content,
                type: type || 'text',
                replyTo: replyTo ? JSON.stringify(replyTo) : null
              }
            }),
            prisma.conversation.update({
              where: { id: conversationId },
              data: {
                lastMessage: content,
                lastMessageAt: new Date(),
              }
            }),
            prisma.moderationLog.create({
              data: {
                messageId: message._id,
                source: 'DM',
                conversationId: conversationId, 
                senderId: userId,
                senderName: username,
                recipientId: receiverId,
                messageType: type || 'text',
                isGuest: false,
                isAuthenticated: true
              }
            })
          ]);
          
          io.to('admin_dashboard').emit('moderation:new', modLog);
        } catch (dbErr) {
          console.error('[Socket DM] Failed to persist DM or mod log:', dbErr);
        }
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
        if (!conversation.participants.some(p => p.id === userId)) return;
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
        if (!conversation.participants.some(p => p.id === userId)) return;
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
        if (!conversation.participants.some(p => p.id === userId)) return;
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
      if (checkRateLimit(userId)) return;
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
      if (checkRateLimit(userId)) return;
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
      if (checkRateLimit(userId)) return;
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
        const { roomCode, username, roomDeleted, isLastSocket } = leaveData;
        if (!roomDeleted) {
          // Immediately emit that the user is now 'reconnecting' or still 'connected' (if other tabs)
          const remainingUsers = roomManager.getUsersInRoom(roomCode);
          const updatedUser = remainingUsers.find(u => u.username === username);
          if (updatedUser) {
            io.to(roomCode).emit('participant_updated', updatedUser);
          }
          // Legacy support
          io.to(roomCode).emit('user_list', remainingUsers);

          // If it was their last socket, wait 5 seconds before fully removing them
          if (isLastSocket) {
            setTimeout(() => {
              const removeResult = roomManager.forceRemoveUser(roomCode, username);
              
              if (removeResult && removeResult.success !== false) {
                // They didn't reconnect, they are truly gone
                if (!removeResult.roomDeleted) {
                  const finalUsers = roomManager.getUsersInRoom(roomCode);
                  io.to(roomCode).emit('participant_left', { username });
                  
                  // Legacy support
                  io.to(roomCode).emit('user_list', finalUsers);
                  
                  io.to(roomCode).emit('receive_message', {
                    username: 'SYSTEM',
                    text: `${username} has left the multiverse.`,
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'system'
                  });
                }
                console.log(`[Socket] ${username} completely left room ${roomCode}`);
              }
            }, 5000);
          }
        }
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
