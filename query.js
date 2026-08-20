const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('BUSINESS:', await prisma.business.findMany());
  console.log('SESSIONS:', await prisma.customerSession.findMany());
}
main().catch(console.error).finally(() => prisma.$disconnect());
