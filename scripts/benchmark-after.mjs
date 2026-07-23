/**
 * Benchmark: Compare OLD (8 queries) vs NEW (1 single CTE query)
 * Run with: node scripts/benchmark-after.mjs
 */
import { neon, neonConfig } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
neonConfig.fetchConnectionCache = true;
const rawSql = neon(DATABASE_URL);

async function sql(strings, ...values) {
  const MAX_RETRIES = 3;
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try { return await rawSql(strings, ...values); }
    catch (err) {
      lastError = err;
      if (err.code === 'ETIMEDOUT' || err.message?.includes('fetch failed') || err.sourceError?.message?.includes('fetch failed')) {
        const delay = Math.min(500 * Math.pow(2, attempt), 3000);
        console.warn(`  [RETRY] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function main() {
  // Warmup
  console.log('🔥 Warming up Neon connection...');
  const wStart = performance.now();
  await sql`SELECT 1`;
  console.log(`   Warmup: ${(performance.now() - wStart).toFixed(1)}ms\n`);

  // Get a slug
  const [{ slug }] = await sql`SELECT slug FROM restaurants WHERE deleted_at IS NULL LIMIT 1`;
  console.log(`Testing with restaurant: ${slug}\n`);

  // ─── NEW: Single CTE query ───
  console.log('═══ NEW: Single CTE Query ═══');
  const newStart = performance.now();
  const [row] = await sql`
    WITH r AS (
      SELECT r.*, rt.name AS type_name, rt.code AS type_code
      FROM restaurants r
      JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
      WHERE r.slug = ${slug} AND r.deleted_at IS NULL
      LIMIT 1
    ),
    b AS (
      SELECT json_agg(
        json_build_object(
          'id', b.id, 'name', b.name, 'slug', b.slug,
          'area', b.area, 'address', b.address,
          'phone', b.phone, 'whatsapp_number', b.whatsapp_number,
          'whatsapp_url', b.whatsapp_url, 'google_maps_url', b.google_maps_url,
          'email', b.email, 'description', b.description,
          'latitude', b.latitude, 'longitude', b.longitude,
          'emirate_name', e.name, 'emirate_code', e.code,
          'accepts_dine_in', b.accepts_dine_in, 'accepts_delivery', b.accepts_delivery,
          'status', b.status, 'is_featured', b.is_featured
        ) ORDER BY b.is_featured DESC, b.name
      ) AS data
      FROM branches b
      JOIN emirates e ON b.emirate_id = e.id
      WHERE b.restaurant_id = (SELECT id FROM r) AND b.deleted_at IS NULL
    ),
    bh AS (
      SELECT json_agg(
        json_build_object(
          'branch_id', bh.branch_id, 'day_of_week', bh.day_of_week,
          'open_time', bh.open_time, 'close_time', bh.close_time, 'is_closed', bh.is_closed
        ) ORDER BY bh.day_of_week
      ) AS data
      FROM branch_hours bh
      JOIN branches br ON bh.branch_id = br.id
      WHERE br.restaurant_id = (SELECT id FROM r)
    ),
    c AS (
      SELECT json_agg(json_build_object('name', cu.name, 'code', cu.code)) AS data
      FROM restaurant_cuisines rc
      JOIN cuisines cu ON rc.cuisine_id = cu.id
      WHERE rc.restaurant_id = (SELECT id FROM r)
    ),
    sl AS (
      SELECT json_agg(
        json_build_object('platform', sp.name, 'platform_code', sp.code, 'url', rsl.url)
      ) AS data
      FROM restaurant_social_links rsl
      JOIN social_platforms sp ON rsl.social_platform_id = sp.id
      WHERE rsl.restaurant_id = (SELECT id FROM r)
    ),
    mc AS (
      SELECT json_agg(
        json_build_object('id', cat.id, 'name', cat.name, 'display_order', cat.display_order)
        ORDER BY cat.display_order, cat.name
      ) AS data
      FROM menu_categories cat
      WHERE cat.restaurant_id = (SELECT id FROM r) AND cat.is_active = true
    ),
    mi AS (
      SELECT json_agg(
        json_build_object(
          'id', item.id, 'category_id', item.category_id, 'name', item.name,
          'description', item.description, 'price', item.price,
          'image_url', item.image_url, 'tags', item.tags,
          'is_available', item.is_available, 'display_order', item.display_order
        ) ORDER BY item.display_order, item.name
      ) AS data
      FROM menu_items item
      JOIN menu_categories mcat ON item.category_id = mcat.id
      WHERE mcat.restaurant_id = (SELECT id FROM r)
    ),
    dp AS (
      SELECT json_agg(
        json_build_object(
          'branch_id', bdp.branch_id, 'name', dpart.name,
          'code', dpart.code, 'website_url', dpart.website_url, 'partner_url', bdp.partner_url
        )
      ) AS data
      FROM branch_delivery_partners bdp
      JOIN delivery_partners dpart ON bdp.delivery_partner_id = dpart.id
      JOIN branches br ON bdp.branch_id = br.id
      WHERE br.restaurant_id = (SELECT id FROM r)
    )
    SELECT
      r.*,
      COALESCE(b.data, '[]'::json) AS branches_json,
      COALESCE(bh.data, '[]'::json) AS branch_hours_json,
      COALESCE(c.data, '[]'::json) AS cuisines_json,
      COALESCE(sl.data, '[]'::json) AS social_links_json,
      COALESCE(mc.data, '[]'::json) AS menu_categories_json,
      COALESCE(mi.data, '[]'::json) AS menu_items_json,
      COALESCE(dp.data, '[]'::json) AS delivery_partners_json
    FROM r, b, bh, c, sl, mc, mi, dp
  `;
  const newElapsed = performance.now() - newStart;
  console.log(`  ⏱️  Single query: ${newElapsed.toFixed(1)}ms`);
  const miJson = row.menu_items_json || [];
  const bJson = row.branches_json || [];
  console.log(`  → ${row.name}: ${(Array.isArray(miJson) ? miJson : []).length} menu items, ${(Array.isArray(bJson) ? bJson : []).length} branches\n`);

  // ─── OLD: 8 separate queries ───
  console.log('═══ OLD: 8 Separate Queries (for comparison) ═══');
  const oldStart = performance.now();
  
  const q1Start = performance.now();
  const [restaurant] = await sql`
    SELECT r.*, rt.name as type_name, rt.code as type_code
    FROM restaurants r JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
    WHERE r.slug = ${slug} AND r.deleted_at IS NULL LIMIT 1
  `;
  const q1Time = performance.now() - q1Start;
  console.log(`  ⏱️  Q1 Restaurant: ${q1Time.toFixed(1)}ms`);

  const q2Start = performance.now();
  await Promise.all([
    sql`SELECT b.*, e.name as emirate_name, e.code as emirate_code FROM branches b JOIN emirates e ON b.emirate_id = e.id WHERE b.restaurant_id = ${restaurant.id} AND b.deleted_at IS NULL ORDER BY b.is_featured DESC, b.name`,
    sql`SELECT bh.* FROM branch_hours bh JOIN branches b ON bh.branch_id = b.id WHERE b.restaurant_id = ${restaurant.id} ORDER BY bh.day_of_week`,
    sql`SELECT c.name, c.code FROM restaurant_cuisines rc JOIN cuisines c ON rc.cuisine_id = c.id WHERE rc.restaurant_id = ${restaurant.id}`,
    sql`SELECT sp.name as platform, sp.code as platform_code, rsl.url FROM restaurant_social_links rsl JOIN social_platforms sp ON rsl.social_platform_id = sp.id WHERE rsl.restaurant_id = ${restaurant.id}`,
    sql`SELECT * FROM menu_categories WHERE restaurant_id = ${restaurant.id} AND is_active = true ORDER BY display_order, name`,
    sql`SELECT mi.* FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = ${restaurant.id} ORDER BY mi.display_order, mi.name`,
    sql`SELECT bdp.branch_id, dp.name, dp.code, dp.website_url, bdp.partner_url FROM branch_delivery_partners bdp JOIN delivery_partners dp ON bdp.delivery_partner_id = dp.id JOIN branches b ON bdp.branch_id = b.id WHERE b.restaurant_id = ${restaurant.id}`,
  ]);
  const q2Time = performance.now() - q2Start;
  const oldElapsed = performance.now() - oldStart;
  console.log(`  ⏱️  Q2-Q8 Parallel: ${q2Time.toFixed(1)}ms`);
  console.log(`  ⏱️  Total (old): ${oldElapsed.toFixed(1)}ms\n`);

  // ─── Summary ───
  console.log('════════════════════════════════════════');
  console.log('📊 COMPARISON');
  console.log('════════════════════════════════════════');
  console.log(`  NEW (1 CTE query):   ${newElapsed.toFixed(1)}ms`);
  console.log(`  OLD (8 queries):     ${oldElapsed.toFixed(1)}ms`);
  console.log(`  Improvement:         ${((1 - newElapsed / oldElapsed) * 100).toFixed(0)}% faster`);
  console.log(`  Saved:               ${(oldElapsed - newElapsed).toFixed(0)}ms`);
  console.log('════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Failed:', err.message || err);
  process.exit(1);
});
