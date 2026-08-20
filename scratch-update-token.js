const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  const result = await prisma.business.updateMany({
    data: { 
      metaAccessToken: 'EAAZBn8cRZBVJEBSS50LODh4sNI4wZBl0yZB95gwTJGSIASkE91PQWMj1xKDQFmEZBZCNMrILP7U0Rw9MGY4xCFFRZBNpKJTThYvhiEo9pI3IuvOii5iWWlQXkZCAgstPP5EEaZBn7law3PJzRLgCyTFdg71oDKRfSlegnZArtO88QZA3oEZAE5cdAE2fq3v8ikYaSztVpQZDZD',
      metaPhoneNumberId: '1234450196425392'
    }
  });
  console.log("Businesses updated:", result.count);
}

main().finally(() => prisma.$disconnect());
