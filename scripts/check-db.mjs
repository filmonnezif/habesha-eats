import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function sampleData() {
  try {
    // Sample restaurants with their type
    console.log('=== SAMPLE RESTAURANTS (first 5) ===');
    const rests = await sql`
      SELECT r.id, r.name, r.slug, r.description, r.logo_url, r.website_url, r.email, r.status, r.source,
             rt.name as type_name, rt.code as type_code
      FROM restaurants r
      JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.name
      LIMIT 5
    `;
    rests.forEach(r => console.log(JSON.stringify(r, null, 2)));

    // Sample branches with emirate
    console.log('\n=== SAMPLE BRANCHES (first 5) ===');
    const branches = await sql`
      SELECT b.id, b.name, b.slug, b.area, b.address, b.phone, b.whatsapp_number,
             b.accepts_dine_in, b.accepts_delivery, b.status, b.is_featured,
             b.latitude, b.longitude, b.google_maps_url,
             r.name as restaurant_name,
             e.name as emirate_name
      FROM branches b
      JOIN restaurants r ON b.restaurant_id = r.id
      JOIN emirates e ON b.emirate_id = e.id
      WHERE b.deleted_at IS NULL
      ORDER BY r.name, b.name
      LIMIT 5
    `;
    branches.forEach(b => console.log(JSON.stringify(b, null, 2)));

    // Cuisines
    console.log('\n=== CUISINES ===');
    const cuisines = await sql`SELECT * FROM cuisines ORDER BY display_order`;
    cuisines.forEach(c => console.log(`  ${c.code}: ${c.name}`));

    // Emirates
    console.log('\n=== EMIRATES ===');
    const emirates = await sql`SELECT * FROM emirates ORDER BY display_order`;
    emirates.forEach(e => console.log(`  ${e.code}: ${e.name}`));

    // Restaurant types
    console.log('\n=== RESTAURANT TYPES ===');
    const types = await sql`SELECT * FROM restaurant_types ORDER BY display_order`;
    types.forEach(t => console.log(`  ${t.code}: ${t.name}`));

    // Amenities
    console.log('\n=== AMENITIES ===');
    const amenities = await sql`SELECT * FROM amenities ORDER BY display_order`;
    amenities.forEach(a => console.log(`  ${a.code}: ${a.name}`));

    // Roles
    console.log('\n=== ROLES ===');
    const roles = await sql`SELECT * FROM roles ORDER BY name`;
    roles.forEach(r => console.log(`  ${r.code}: ${r.name}`));

    // Social platforms
    console.log('\n=== SOCIAL PLATFORMS ===');
    const platforms = await sql`SELECT * FROM social_platforms ORDER BY display_order`;
    platforms.forEach(p => console.log(`  ${p.code}: ${p.name}`));

    // Delivery partners
    console.log('\n=== DELIVERY PARTNERS ===');
    const dp = await sql`SELECT * FROM delivery_partners ORDER BY display_order`;
    dp.forEach(d => console.log(`  ${d.code}: ${d.name} (${d.website_url || 'no url'})`));

    // Sample restaurant with cuisines
    console.log('\n=== SAMPLE RESTAURANT CUISINES (first restaurant) ===');
    const rc = await sql`
      SELECT r.name as restaurant, c.name as cuisine
      FROM restaurant_cuisines rc
      JOIN restaurants r ON rc.restaurant_id = r.id
      JOIN cuisines c ON rc.cuisine_id = c.id
      ORDER BY r.name
      LIMIT 10
    `;
    rc.forEach(x => console.log(`  ${x.restaurant} → ${x.cuisine}`));

    // Sample social links
    console.log('\n=== SAMPLE SOCIAL LINKS (first 5) ===');
    const sl = await sql`
      SELECT r.name as restaurant, sp.name as platform, rsl.url
      FROM restaurant_social_links rsl
      JOIN restaurants r ON rsl.restaurant_id = r.id
      JOIN social_platforms sp ON rsl.social_platform_id = sp.id
      ORDER BY r.name
      LIMIT 5
    `;
    sl.forEach(x => console.log(`  ${x.restaurant} [${x.platform}]: ${x.url}`));

  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

sampleData();
