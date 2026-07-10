/**
 * Database Migration Script
 * Adds new tables and columns needed for the admin dashboard and menu management.
 * Run with: node scripts/migrate.mjs
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🔄 Starting database migration...\n');

  // 1. Add columns to restaurants table (safe — skip if already exists)
  console.log('📦 Adding columns to restaurants...');
  const colsToAdd = [
    { name: 'hero_image_url', def: 'TEXT' },
    { name: 'rating', def: 'NUMERIC(2,1) DEFAULT 0' },
    { name: 'review_count', def: 'INTEGER DEFAULT 0' },
    { name: 'price_range', def: "VARCHAR(5) DEFAULT '$$'" },
    { name: 'tagline', def: 'TEXT' },
  ];
  for (const col of colsToAdd) {
    const exists = await sql`SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name=${col.name}`;
    if (exists.length === 0) {
      await sql.query(`ALTER TABLE restaurants ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  + Added ${col.name}`);
    } else {
      console.log(`  - ${col.name} already exists`);
    }
  }
  console.log('  ✅ restaurants columns added\n');

  // 2. Create branch_hours table
  console.log('📦 Creating branch_hours table...');
  await sql`
    CREATE TABLE IF NOT EXISTS branch_hours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      open_time TIME,
      close_time TIME,
      is_closed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(branch_id, day_of_week)
    )
  `;
  console.log('  ✅ branch_hours created\n');

  // 3. Create branch_amenities junction table
  console.log('📦 Creating branch_amenities table...');
  await sql`
    CREATE TABLE IF NOT EXISTS branch_amenities (
      branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
      PRIMARY KEY (branch_id, amenity_id)
    )
  `;
  console.log('  ✅ branch_amenities created\n');

  // 4. Create menu_categories table
  console.log('📦 Creating menu_categories table...');
  await sql`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('  ✅ menu_categories created\n');

  // 5. Create menu_items table
  console.log('📦 Creating menu_items table...');
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      image_url TEXT,
      tags TEXT[] DEFAULT '{}',
      is_available BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('  ✅ menu_items created\n');

  // 6. Create branch_delivery_partners junction table
  console.log('📦 Creating branch_delivery_partners table...');
  await sql`
    CREATE TABLE IF NOT EXISTS branch_delivery_partners (
      branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id) ON DELETE CASCADE,
      partner_url TEXT,
      PRIMARY KEY (branch_id, delivery_partner_id)
    )
  `;
  console.log('  ✅ branch_delivery_partners created\n');

  console.log('🎉 Migration complete! All tables and columns are up to date.');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
