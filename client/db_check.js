const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const convos = await prisma.conversation.findMany({ include: { participants: true } });
  console.log("Conversations:", JSON.stringify(convos, null, 2));
  const users = await prisma.user.findMany();
  console.log("Users:", JSON.stringify(users, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
