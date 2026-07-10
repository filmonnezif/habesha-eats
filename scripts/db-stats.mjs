import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function run() {
  const rests = await sql`SELECT COUNT(*) FROM restaurants`;
  const branches = await sql`SELECT COUNT(*) FROM branches`;
  const cuisines = await sql`SELECT COUNT(*) FROM cuisines`;
  const items = await sql`SELECT COUNT(*) FROM menu_items`;
  console.log(`Restaurants: ${rests[0].count}`);
  console.log(`Branches: ${branches[0].count}`);
  console.log(`Cuisines: ${cuisines[0].count}`);
  console.log(`Menu Items: ${items[0].count}`);
}

run().catch(console.error);
