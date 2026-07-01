import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("ALL USERS:", JSON.stringify(users, null, 2));

  const zoker = await prisma.user.findMany({
    where: {
      username: {
        contains: 'zoker',
        mode: 'insensitive',
      }
    }
  });
  console.log("ZOKER SEARCH RESULTS:", JSON.stringify(zoker, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
