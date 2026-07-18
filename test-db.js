const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(users.map(u => ({ id: u.id, username: u.username, visitCount: u.visitCount })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
