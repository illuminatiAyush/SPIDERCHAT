const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration to ModerationLog...');
  
  // 1. Migrate Room Messages
  const roomMessages = await prisma.message.findMany();
  console.log(`Found ${roomMessages.length} room messages`);
  
  for (const m of roomMessages) {
    // check if it already exists
    const existing = await prisma.moderationLog.findFirst({ where: { messageId: m.id } });
    if (!existing) {
      await prisma.moderationLog.create({
        data: {
          messageId: m.id,
          source: 'ROOM',
          roomId: m.roomId,
          senderId: m.senderId,
          senderName: m.senderName || 'Unknown',
          messageContent: m.content,
          messageType: m.type || 'text',
          createdAt: m.createdAt,
          status: m.deleted ? 'DELETED' : (m.editedAt ? 'EDITED' : 'ACTIVE'),
          isGuest: m.senderId === null,
          isAuthenticated: m.senderId !== null
        }
      });
    }
  }

  // 2. Migrate DMs
  const dmMessages = await prisma.directMessage.findMany({
    include: { sender: true }
  });
  console.log(`Found ${dmMessages.length} direct messages`);
  
  for (const dm of dmMessages) {
    const existing = await prisma.moderationLog.findFirst({ where: { messageId: dm.id } });
    if (!existing) {
      await prisma.moderationLog.create({
        data: {
          messageId: dm.id,
          source: 'DM',
          conversationId: dm.conversationId,
          senderId: dm.senderId,
          senderName: dm.sender?.username || 'Unknown',
          recipientId: dm.conversationId, // rough approximation for old data
          messageContent: dm.content,
          messageType: dm.type || 'text',
          createdAt: dm.createdAt,
          status: dm.deleted ? 'DELETED' : (dm.editedAt ? 'EDITED' : 'ACTIVE'),
          isGuest: false,
          isAuthenticated: true
        }
      });
    }
  }

  console.log('Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
