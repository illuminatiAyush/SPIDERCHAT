const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDMs() {
  console.log('Fixing DM source types...');
  const logs = await prisma.moderationLog.findMany({
    where: {
      source: 'ROOM',
      roomId: { contains: '_' }
    }
  });

  for (const log of logs) {
    await prisma.moderationLog.update({
      where: { logId: log.logId },
      data: { source: 'DIRECT' }
    });
    console.log(`Updated log ${log.logId} to DIRECT`);
  }
  console.log(`Done! Fixed ${logs.length} logs.`);
}

fixDMs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
