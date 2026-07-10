import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function run() {
  console.log('🔄 Running auth migration...');
  
  // Check if columns exist
  const usernameCol = await sql`
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='restaurants' AND column_name='admin_username'
  `;
  const passwordCol = await sql`
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='restaurants' AND column_name='admin_password'
  `;

  if (usernameCol.length === 0) {
    await sql.query("ALTER TABLE restaurants ADD COLUMN admin_username VARCHAR(100) DEFAULT 'Habesha'");
    console.log("  + Added admin_username column with default 'Habesha'");
  } else {
    console.log("  - admin_username column already exists");
  }

  if (passwordCol.length === 0) {
    await sql.query("ALTER TABLE restaurants ADD COLUMN admin_password VARCHAR(100) DEFAULT '1234'");
    console.log("  + Added admin_password column with default '1234'");
  } else {
    console.log("  - admin_password column already exists");
  }

  // Update any existing restaurants that might have NULL for these columns (just in case)
  await sql`
    UPDATE restaurants 
    SET admin_username = 'Habesha' 
    WHERE admin_username IS NULL
  `;
  await sql`
    UPDATE restaurants 
    SET admin_password = '1234' 
    WHERE admin_password IS NULL
  `;
  console.log("  ✅ Existing restaurants updated with credentials");

  console.log('🎉 Auth migration complete!');
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
