const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const conv = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { id: 'cmrqrcqep00009kg4vamnvf41' } } },
        { participants: { some: { id: 'cmrqkuzqw00009k84lsfnyr6b' } } }
      ]
    }
  });
  console.log('Found:', conv?.id);
}
main().finally(() => prisma.$disconnect());
