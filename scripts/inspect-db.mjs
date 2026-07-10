import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function run() {
  console.log("TABLES:");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  for (const t of tables) {
    console.log(`- ${t.table_name}`);
    const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${t.table_name} AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    for (const c of columns) {
      console.log(`  * ${c.column_name} (${c.data_type}) - nullable: ${c.is_nullable}, default: ${c.column_default}`);
    }
  }
}

run().catch(console.error);
