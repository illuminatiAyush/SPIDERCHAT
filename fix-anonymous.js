const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('Fixing anonymous names...');
  const logs = await prisma.moderationLog.findMany({
    where: {
      senderName: 'Anonymous',
      senderId: { not: null }
    }
  });

  for (const log of logs) {
    const user = await prisma.user.findUnique({ where: { id: log.senderId } });
    if (user) {
      await prisma.moderationLog.update({
        where: { logId: log.logId },
        data: { senderName: user.username }
      });
      console.log(`Updated log ${log.logId} senderName to ${user.username}`);
    }
  }
  console.log('Done!');
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
