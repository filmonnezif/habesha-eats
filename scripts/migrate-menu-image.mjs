import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function run() {
  console.log('🔄 Running menu item image migration...');
  
  // Check if columns exist
  const imageUrlCol = await sql`
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='menu_items' AND column_name='image_url'
  `;

  if (imageUrlCol.length === 0) {
    await sql.query("ALTER TABLE menu_items ADD COLUMN image_url TEXT");
    console.log("  + Added image_url column to menu_items table");
  } else {
    console.log("  - image_url column already exists");
  }

  console.log('🎉 Menu item image migration complete!');
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
