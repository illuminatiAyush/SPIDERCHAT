const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const persistedMessage = await prisma.message.create({
      data: {
        content: 'test',
        senderId: null,
        senderName: 'ritik',
        roomId: 'SPDR123',
        type: 'user'
      }
    });
    console.log('Success:', persistedMessage);
  } catch (err) {
    console.error('Error:', err);
  }
}

test().finally(() => prisma.$disconnect());
