const fs = require('fs');
const path = require('path');

/**
 * Room Manager to handle room states, limits, and Owner permissions.
 */
class RoomManager {
  constructor() {
    this.persistencePath = path.join(__dirname, 'data', 'rooms.json');
    this.rooms = new Map();
    this.maxUsers = 100;
    
    this.loadFromPersistence();

    // Cleanup stale rooms every 2 minutes (just in case)
    setInterval(() => this.cleanupRooms(), 2 * 60 * 1000);
  }

  saveToPersistence() {
    try {
      const dir = path.dirname(this.persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {};
      for (const [code, room] of this.rooms.entries()) {
        data[code] = {
          ...room,
          users: Array.from(room.users.entries()), // Convert Map to Array for JSON
          mutedSockets: Array.from(room.mutedSockets),
          bannedSockets: Array.from(room.bannedSockets)
        };
      }
      fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to save rooms to persistence:', err);
    }
  }

  loadFromPersistence() {
    try {
      if (fs.existsSync(this.persistencePath)) {
        const raw = fs.readFileSync(this.persistencePath, 'utf8');
        const data = JSON.parse(raw);
        for (const code in data) {
          const room = data[code];
          // Clear users on load — old socket IDs are invalid after restart
          room.users = new Map();
          room.mutedSockets = new Set(room.mutedSockets || []);
          room.bannedSockets = new Set(room.bannedSockets || []);
          room.ownerSocketId = null; // No one is owner if everyone disconnected
          this.rooms.set(code, room);
        }
        console.log(`Restored ${Object.keys(data).length} rooms from persistence.`);
        
        // Immediately cleanup any rooms that are now empty due to restart
        this.cleanupRooms(true); 
      }
    } catch (err) {
      console.error('Failed to load rooms from persistence:', err);
      this.rooms = new Map();
    }
  }

  generateRoomCode() {
    const prefixes = ['SPDR', 'VENOM', 'MILES', 'WEB', 'GWEN', 'NOIR', 'PETER', 'STARK', 'CARNG', 'MORBS'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(100 + Math.random() * 899); 
    return `${prefix}${number}`;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    const normalizedCode = roomCode.toString().trim().toUpperCase();
    return this.rooms.get(normalizedCode);
  }

  createRoom() {
    let roomCode;
    let attempts = 0;
    do {
      roomCode = this.generateRoomCode();
      attempts++;
    } while (this.rooms.has(roomCode) && attempts < 100);

    const roomData = {
      users: new Map(),
      ownerSocketId: null,
      mutedSockets: new Set(),
      bannedSockets: new Set(),
      locked: false,
      slowMode: 0,
      pinnedMessage: null,
      roomTitle: roomCode,
      roomDescription: 'A transient dimension in the Spider-Verse.',
      messages: [],
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.rooms.set(roomCode, roomData);
    console.log(`Room created: ${roomCode}`);
    this.saveToPersistence();
    return roomCode;
  }

  joinRoom(rawRoomCode, socketId, username, userId = null) {
    const roomCode = rawRoomCode?.toString().trim().toUpperCase();
    let room = this.rooms.get(roomCode);
    
    // AUTO-CREATE LOGIC
    if (!room) {
      console.log(`[RoomManager] Auto-creating dimension: ${roomCode} for user ${username}`);
      const newRoomData = {
        users: new Map(),
        ownerSocketId: null,
        mutedSockets: new Set(),
        bannedSockets: new Set(),
        locked: false,
        slowMode: 0,
        pinnedMessage: null,
        roomTitle: roomCode,
        roomDescription: 'A transient dimension in the Spider-Verse.',
        messages: [],
        createdAt: Date.now(),
        lastActive: Date.now(),
        disconnectTimers: new Map() // track disconnect timeouts
      };
      this.rooms.set(roomCode, newRoomData);
      room = newRoomData;
    }

    if (room.bannedSockets.has(socketId)) {
      return { error: "You have been banned from this dimension by the Room Owner." };
    }

    if (room.locked) {
      return { error: "This dimension has been locked." };
    }

    if (room.users.size >= this.maxUsers) return { error: "Dimension full! Try another universe." };

    const isAuthenticated = userId && userId !== 'Unknown' && !userId.startsWith('anon_');

    // Cancel any pending disconnect timers for this user
    const existingTimer = room.disconnectTimers?.get(username);
    if (existingTimer) {
      clearTimeout(existingTimer);
      room.disconnectTimers.delete(username);
    }

    // Find if user already exists to preserve joinedAt
    let earliestJoin = Date.now();
    for (const [id, data] of room.users.entries()) {
      if (data.username === username && data.joinedAt < earliestJoin) {
        earliestJoin = data.joinedAt;
      }
    }

    // Add or update user socket
    room.users.set(socketId, { 
      username, 
      userId: userId || username,
      isAuthenticated,
      joinedAt: earliestJoin,
      presence: 'connected'
    });
    
    // Assign owner if none exists
    if (!room.ownerSocketId) {
      room.ownerSocketId = socketId;
      console.log(`[RoomManager] ${username} (${socketId}) is now the owner of ${roomCode}`);
    }

    room.lastActive = Date.now();
    this.saveToPersistence();
    return { success: true, room };
  }

  leaveRoom(socketId) {
    for (const [roomCode, room] of this.rooms.entries()) {
      if (room.users.has(socketId)) {
        const userData = room.users.get(socketId);
        const username = userData.username;
        
        // Mark as reconnecting instead of deleting immediately
        userData.presence = 'reconnecting';
        
        // Check if user has other active sockets in this room
        const hasOtherSockets = Array.from(room.users.entries())
          .some(([id, data]) => data.username === username && id !== socketId && data.presence === 'connected');

        room.lastActive = Date.now();
        this.saveToPersistence();
        
        return { roomCode, username, roomDeleted: false, presence: 'reconnecting', isLastSocket: !hasOtherSockets };
      }
    }
    return null;
  }

  // Called by socketHandler after grace period
  forceRemoveUser(roomCode, username) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    // Check if they reconnected
    const hasConnected = Array.from(room.users.values()).some(d => d.username === username && d.presence === 'connected');
    if (hasConnected) return { success: false, reason: 'reconnected' }; // They came back!

    let removedOwner = false;

    for (const [id, data] of room.users.entries()) {
      if (data.username === username) {
        if (room.ownerSocketId === id) removedOwner = true;
        room.users.delete(id);
      }
    }

    if (room.users.size === 0) {
      console.log(`[RoomManager] Dimension ${roomCode} collapsed (0 participants).`);
      this.rooms.delete(roomCode);
      this.saveToPersistence();
      return { roomCode, username, roomDeleted: true };
    }

    // Reassign owner if the owner left
    if (removedOwner || !room.users.has(room.ownerSocketId)) {
      const nextOwnerSocketId = Array.from(room.users.keys())[0];
      if (nextOwnerSocketId) {
        room.ownerSocketId = nextOwnerSocketId;
        const nextOwner = room.users.get(nextOwnerSocketId);
        console.log(`[RoomManager] Ownership of ${roomCode} transferred to ${nextOwner.username}`);
      }
    }

    this.saveToPersistence();
    return { roomCode, username, roomDeleted: false };
  }

  getUsersInRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return [];
    
    const userMap = new Map();
    
    for (const [socketId, data] of room.users.entries()) {
      if (!userMap.has(data.username)) {
         userMap.set(data.username, {
           id: data.userId || data.username,
           socketId: socketId, // Keep for backward compatibility with UserList admin actions
           username: data.username,
           isAuthenticated: data.isAuthenticated || false,
           isOwner: false,
           isMuted: false,
           presence: 'reconnecting', // default to reconnecting, upgraded to connected if any socket is connected
           joinTime: data.joinTime
         });
      }
      
      const u = userMap.get(data.username);
      if (room.ownerSocketId === socketId) u.isOwner = true;
      if (room.mutedSockets.has(socketId)) u.isMuted = true;
      if (data.presence === 'connected') u.presence = 'connected';
      // keep earliest joinTime
      if (data.joinTime < u.joinTime) u.joinTime = data.joinTime;
    }
    
    // Sort: 1. Creator, 2. Logged-in (alphabetical), 3. Guests (alphabetical)
    const sortedUsers = Array.from(userMap.values()).sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      
      if (a.isAuthenticated && !b.isAuthenticated) return -1;
      if (!a.isAuthenticated && b.isAuthenticated) return 1;
      
      return a.username.localeCompare(b.username);
    });
    
    return sortedUsers;
  }

  cleanupRooms(forceEmptyDelete = false) {
    const NOW = Date.now();
    const GRACE_PERIOD = 10 * 60 * 1000; // 10 mins grace for empty
    const STALE_PERIOD = 60 * 60 * 1000; // 60 mins max
    let changed = false;

    for (const [roomCode, room] of this.rooms.entries()) {
      const isStale = (NOW - room.createdAt) > STALE_PERIOD;
      const isEmpty = room.users.size === 0 && (forceEmptyDelete || (NOW - room.lastActive) > GRACE_PERIOD);

      if (isStale || isEmpty) {
        this.rooms.delete(roomCode);
        console.log(`Room cleaned up: ${roomCode} (Stale: ${isStale}, Empty: ${isEmpty})`);
        changed = true;
      }
    }
    if (changed) this.saveToPersistence();
  }
}

module.exports = new RoomManager();
