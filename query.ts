import { db } from './src/lib/db';
async function main() {
  console.log('BUSINESS:', await db.business.findMany());
  console.log('SESSIONS:', await db.customerSession.findMany());
}
main().catch(console.error).finally(() => process.exit());
