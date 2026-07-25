const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
  const conversations = await prisma.conversation.findMany({
    include: { participants: true }
  });

  const seenPairs = new Set();
  const toDelete = [];

  for (const conv of conversations) {
    if (conv.participants.length === 2) {
      const p1 = conv.participants[0].id;
      const p2 = conv.participants[1].id;
      const pairKey = [p1, p2].sort().join('_');

      if (seenPairs.has(pairKey)) {
        console.log(`Duplicate found: ${conv.id}`);
        toDelete.push(conv.id);
      } else {
        seenPairs.add(pairKey);
      }
    }
  }

  if (toDelete.length > 0) {
    await prisma.conversation.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${toDelete.length} duplicate conversations.`);
  } else {
    console.log('No duplicates found.');
  }
}

cleanDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
