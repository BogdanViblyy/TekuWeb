const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.item_images.count();
  console.log('item_images count:', count);
}

main().finally(() => prisma.$disconnect());
