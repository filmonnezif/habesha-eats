/**
 * Benchmark: Single Restaurant API Query Performance
 * Measures each individual query and the total time for /api/restaurants/[slug]
 * Run with: node scripts/benchmark-restaurant.mjs
 */
import { neon, neonConfig } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
neonConfig.fetchConnectionCache = true;
const rawSql = neon(DATABASE_URL);

// Retry wrapper (same as lib/db.js)
async function sql(strings, ...values) {
  const MAX_RETRIES = 3;
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await rawSql(strings, ...values);
    } catch (err) {
      lastError = err;
      if (
        err.code === 'ETIMEDOUT' ||
        err.message?.includes('fetch failed') ||
        err.sourceError?.message?.includes('fetch failed')
      ) {
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

async function timeQuery(label, queryFn) {
  const start = performance.now();
  const result = await queryFn();
  const elapsed = performance.now() - start;
  console.log(`  ⏱️  ${label}: ${elapsed.toFixed(1)}ms (${result.length} rows)`);
  return { result, elapsed };
}

async function benchmarkRestaurant(slug) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔍 Benchmarking: /api/restaurants/${slug}`);
  console.log(`${'═'.repeat(60)}\n`);

  const totalStart = performance.now();

  // Step 1: Fetch restaurant (sequential — must happen first)
  console.log('--- Step 1: Fetch Restaurant ---');
  const { result: restaurants, elapsed: t1 } = await timeQuery('Restaurant lookup', () => sql`
    SELECT r.*, rt.name as type_name, rt.code as type_code
    FROM restaurants r
    JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
    WHERE r.slug = ${slug} AND r.deleted_at IS NULL
    LIMIT 1
  `);

  if (restaurants.length === 0) {
    console.log(`\n❌ Restaurant "${slug}" not found!`);
    const allSlugs = await sql`SELECT slug, name FROM restaurants WHERE deleted_at IS NULL`;
    console.log('\nAvailable restaurants:');
    allSlugs.forEach(r => console.log(`  - ${r.slug} (${r.name})`));
    return;
  }

  const restaurant = restaurants[0];
  console.log(`  → Found: ${restaurant.name} (id: ${restaurant.id})\n`);

  // Step 2: All parallel queries
  console.log('--- Step 2: Parallel Queries (Promise.all) ---');
  const parallelStart = performance.now();

  const [
    { result: branches, elapsed: tBranches },
    { result: branchHours, elapsed: tHours },
    { result: cuisines, elapsed: tCuisines },
    { result: socialLinks, elapsed: tSocial },
    { result: menuCategories, elapsed: tCats },
    { result: menuItems, elapsed: tItems },
    { result: deliveryPartners, elapsed: tPartners },
  ] = await Promise.all([
    timeQuery('Branches', () => sql`
      SELECT b.*, e.name as emirate_name, e.code as emirate_code
      FROM branches b
      JOIN emirates e ON b.emirate_id = e.id
      WHERE b.restaurant_id = ${restaurant.id} AND b.deleted_at IS NULL
      ORDER BY b.is_featured DESC, b.name
    `),
    timeQuery('Branch Hours', () => sql`
      SELECT bh.* FROM branch_hours bh
      JOIN branches b ON bh.branch_id = b.id
      WHERE b.restaurant_id = ${restaurant.id}
      ORDER BY bh.day_of_week
    `),
    timeQuery('Cuisines', () => sql`
      SELECT c.name, c.code FROM restaurant_cuisines rc
      JOIN cuisines c ON rc.cuisine_id = c.id
      WHERE rc.restaurant_id = ${restaurant.id}
    `),
    timeQuery('Social Links', () => sql`
      SELECT sp.name as platform, sp.code as platform_code, rsl.url
      FROM restaurant_social_links rsl
      JOIN social_platforms sp ON rsl.social_platform_id = sp.id
      WHERE rsl.restaurant_id = ${restaurant.id}
    `),
    timeQuery('Menu Categories', () => sql`
      SELECT * FROM menu_categories
      WHERE restaurant_id = ${restaurant.id} AND is_active = true
      ORDER BY display_order, name
    `),
    timeQuery('Menu Items', () => sql`
      SELECT mi.* FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mc.restaurant_id = ${restaurant.id}
      ORDER BY mi.display_order, mi.name
    `),
    timeQuery('Delivery Partners', () => sql`
      SELECT bdp.branch_id, dp.name, dp.code, dp.website_url, bdp.partner_url
      FROM branch_delivery_partners bdp
      JOIN delivery_partners dp ON bdp.delivery_partner_id = dp.id
      JOIN branches b ON bdp.branch_id = b.id
      WHERE b.restaurant_id = ${restaurant.id}
    `),
  ]);

  const parallelElapsed = performance.now() - parallelStart;
  const totalElapsed = performance.now() - totalStart;

  // Summary
  console.log(`\n${'─'.repeat(60)}`);
  console.log('📊 RESULTS SUMMARY');
  console.log(`${'─'.repeat(60)}`);
  console.log(`  Restaurant lookup:      ${t1.toFixed(1)}ms`);
  console.log(`  Parallel batch total:   ${parallelElapsed.toFixed(1)}ms`);
  console.log(`    ├─ Branches:          ${tBranches.toFixed(1)}ms (${branches.length} rows)`);
  console.log(`    ├─ Branch Hours:      ${tHours.toFixed(1)}ms (${branchHours.length} rows)`);
  console.log(`    ├─ Cuisines:          ${tCuisines.toFixed(1)}ms (${cuisines.length} rows)`);
  console.log(`    ├─ Social Links:      ${tSocial.toFixed(1)}ms (${socialLinks.length} rows)`);
  console.log(`    ├─ Menu Categories:   ${tCats.toFixed(1)}ms (${menuCategories.length} rows)`);
  console.log(`    ├─ Menu Items:        ${tItems.toFixed(1)}ms (${menuItems.length} rows)`);
  console.log(`    └─ Delivery Partners: ${tPartners.toFixed(1)}ms (${deliveryPartners.length} rows)`);
  console.log(`  ──────────────────────────────────`);
  console.log(`  ⏱️  TOTAL DB TIME:       ${totalElapsed.toFixed(1)}ms`);
  console.log(`  💡 Sequential sum:      ${(t1 + tBranches + tHours + tCuisines + tSocial + tCats + tItems + tPartners).toFixed(1)}ms (if not parallelized)`);
  console.log();
}

// Run benchmark
async function main() {
  // Warmup connection (first query to Neon is always slow due to cold start)
  console.log('🔥 Warming up Neon connection...');
  const warmStart = performance.now();
  await sql`SELECT 1`;
  const warmElapsed = performance.now() - warmStart;
  console.log(`   Warmup (cold start): ${warmElapsed.toFixed(1)}ms\n`);

  // Get all restaurant slugs
  const allSlugs = await sql`SELECT slug FROM restaurants WHERE deleted_at IS NULL LIMIT 3`;

  if (allSlugs.length === 0) {
    console.log('No restaurants found in the database!');
    return;
  }

  // Run benchmark for first restaurant
  await benchmarkRestaurant(allSlugs[0].slug);

  // Run a second time to show warmed-up performance
  console.log('\n\n🔁 RE-RUN (warmed up — no cold start):');
  await benchmarkRestaurant(allSlugs[0].slug);

  // Step 3: Check indexes
  console.log('\n\n--- Index Audit ---');
  const indexes = await sql`
    SELECT
      t.relname AS table_name,
      i.relname AS index_name,
      a.attname AS column_name
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relkind = 'r'
      AND t.relname IN ('restaurants', 'branches', 'branch_hours', 'menu_categories', 'menu_items',
                         'restaurant_cuisines', 'restaurant_social_links', 'branch_delivery_partners',
                         'cuisines', 'social_platforms', 'delivery_partners', 'emirates')
    ORDER BY t.relname, i.relname
  `;

  const indexMap = {};
  for (const idx of indexes) {
    const key = `${idx.table_name}.${idx.index_name}`;
    if (!indexMap[key]) indexMap[key] = { table: idx.table_name, index: idx.index_name, columns: [] };
    indexMap[key].columns.push(idx.column_name);
  }

  console.log('\n  Existing indexes:');
  for (const entry of Object.values(indexMap)) {
    console.log(`    ${entry.table}: ${entry.index} (${entry.columns.join(', ')})`);
  }

  // Check for missing indexes
  console.log('\n  ⚠️  Critical index check:');
  const criticalIndexes = [
    { table: 'restaurants', column: 'slug', reason: 'WHERE r.slug = ? (primary lookup)' },
    { table: 'restaurants', column: 'deleted_at', reason: 'WHERE r.deleted_at IS NULL filter' },
    { table: 'branches', column: 'restaurant_id', reason: 'WHERE b.restaurant_id = ?' },
    { table: 'branches', column: 'deleted_at', reason: 'WHERE b.deleted_at IS NULL filter' },
    { table: 'branch_hours', column: 'branch_id', reason: 'JOIN branches ON bh.branch_id' },
    { table: 'menu_categories', column: 'restaurant_id', reason: 'WHERE restaurant_id = ?' },
    { table: 'menu_items', column: 'category_id', reason: 'JOIN menu_categories ON category_id' },
    { table: 'restaurant_cuisines', column: 'restaurant_id', reason: 'WHERE restaurant_id = ?' },
    { table: 'restaurant_social_links', column: 'restaurant_id', reason: 'WHERE restaurant_id = ?' },
    { table: 'branch_delivery_partners', column: 'branch_id', reason: 'JOIN branches ON branch_id' },
  ];

  for (const check of criticalIndexes) {
    const hasIndex = Object.values(indexMap).some(
      entry => entry.table === check.table && entry.columns.includes(check.column)
    );
    const status = hasIndex ? '✅' : '❌ MISSING';
    console.log(`    ${status} ${check.table}(${check.column}) — ${check.reason}`);
  }
}

main().catch(err => {
  console.error('❌ Benchmark failed:', err.message || err);
  process.exit(1);
});
