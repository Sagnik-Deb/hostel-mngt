const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hostels = await prisma.hostel.findMany({
    select: { id: true, name: true, code: true }
  });
  console.log("=== Hostels ===");
  console.log(hostels);
}
main().catch(console.error).finally(() => prisma.$disconnect());
