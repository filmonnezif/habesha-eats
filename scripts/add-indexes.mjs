/**
 * Add missing database indexes for query performance.
 * Run with: node scripts/add-indexes.mjs
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function addIndexes() {
  console.log('🔧 Adding missing database indexes...\n');

  const indexes = [
    {
      name: 'idx_restaurants_deleted_at',
      query: 'CREATE INDEX IF NOT EXISTS idx_restaurants_deleted_at ON restaurants(deleted_at)',
      reason: 'Speeds up WHERE deleted_at IS NULL filter on every restaurant query',
    },
    {
      name: 'idx_branches_deleted_at',
      query: 'CREATE INDEX IF NOT EXISTS idx_branches_deleted_at ON branches(deleted_at)',
      reason: 'Speeds up WHERE deleted_at IS NULL filter on every branch query',
    },
    {
      name: 'idx_menu_items_category_id',
      query: 'CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id)',
      reason: 'Speeds up JOIN menu_categories ON category_id for menu item queries',
    },
  ];

  for (const idx of indexes) {
    try {
      await sql.query(idx.query);
      console.log(`  ✅ ${idx.name} — ${idx.reason}`);
    } catch (err) {
      console.error(`  ❌ ${idx.name} failed: ${err.message}`);
    }
  }

  console.log('\n🎉 Index migration complete!');
}

addIndexes().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
