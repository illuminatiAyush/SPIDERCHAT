const { readJson, writeJson, initDb } = require('./lib/jsonDb');

const connectDB = async () => {
  try {
    initDb();
    console.log('✅ JSON Database initialized successfully');
  } catch (error) {
    console.error('❌ JSON Database initialization error:', error);
  }
};

const updateUserPresence = async (userId, isOnline) => {
  if (!userId || userId === 'Unknown') return;
  
  try {
    const users = readJson('users.json');
    const userIndex = users.findIndex(u => u._id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].isOnline = isOnline;
      users[userIndex].lastSeen = new Date().toISOString();
      users[userIndex].updatedAt = new Date().toISOString();
      writeJson('users.json', users);
      console.log(`[Presence] Updated user ${users[userIndex].username} presence: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    }
  } catch (error) {
    console.error('Failed to update user presence in JSON DB:', error);
  }
};

module.exports = {
  connectDB,
  updateUserPresence
};
