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

  joinRoom(rawRoomCode, socketId, username) {
    const roomCode = rawRoomCode?.toString().trim().toUpperCase();
    let room = this.rooms.get(roomCode);
    
    // AUTO-CREATE LOGIC: If room doesn't exist, create it on the fly
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
        lastActive: Date.now()
      };
      this.rooms.set(roomCode, newRoomData);
      room = newRoomData;
    }

    // CHECK BAN
    if (room.bannedSockets.has(socketId)) {
      return { error: "You have been banned from this dimension by the Room Owner." };
    }

    // CHECK LOCK (allow existing users to reconnect if they are already in the map, but technically they are removed on disconnect)
    if (room.locked) {
      return { error: "This dimension has been locked." };
    }

    if (room.users.size >= this.maxUsers) return { error: "Dimension full! Try another universe." };

    // Check for duplicate username in this room
    const existingUsers = Array.from(room.users.entries());
    const duplicateEntry = existingUsers.find(([, data]) => data.username === username);
    
    if (duplicateEntry) {
      const [oldSocketId] = duplicateEntry;
      if (oldSocketId !== socketId) {
        room.users.delete(oldSocketId);
        console.log(`[RoomManager] Replacing stale socket for ${username} (old: ${oldSocketId}, new: ${socketId})`);
        
        // Transfer owner identity if they were the owner
        if (room.ownerSocketId === oldSocketId) {
          room.ownerSocketId = socketId;
        }
      } else {
        return { success: true, room };
      }
    }

    // Add user
    room.users.set(socketId, { username });
    
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
        room.users.delete(socketId);
        
        // Immediately destroy room if empty
        if (room.users.size === 0) {
          console.log(`[RoomManager] Dimension ${roomCode} collapsed (0 participants).`);
          this.rooms.delete(roomCode);
          this.saveToPersistence();
          return { roomCode, username, roomDeleted: true };
        }

        // Reassign owner if the owner left
        if (room.ownerSocketId === socketId) {
          const nextOwnerSocketId = Array.from(room.users.keys())[0]; // Oldest active participant
          room.ownerSocketId = nextOwnerSocketId;
          const nextOwner = room.users.get(nextOwnerSocketId);
          console.log(`[RoomManager] Ownership of ${roomCode} transferred to ${nextOwner.username}`);
        }

        room.lastActive = Date.now();
        this.saveToPersistence();
        return { roomCode, username, roomDeleted: false };
      }
    }
    return null;
  }

  getUsersInRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return [];
    
    // Return array of user objects with permissions for client UI
    return Array.from(room.users.entries()).map(([socketId, data]) => ({
      socketId,
      username: data.username,
      isOwner: room.ownerSocketId === socketId,
      isMuted: room.mutedSockets.has(socketId)
    }));
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
