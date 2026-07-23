import { neon } from '@neondatabase/serverless';
import xlsx from 'xlsx';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KDrw9boRLP4S@ep-autumn-recipe-attdhy96-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

async function run() {
  console.log('🔄 Loading Excel dataset...');
  const excelPath = "/home/fily/Downloads/habesha-eats/Dataset of Ethiopian Resturants in UAE.xlsx";
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelRows = xlsx.utils.sheet_to_json(worksheet);

  console.log('🔄 Fetching branches from the database...');
  const dbBranches = await sql`
    SELECT b.id as branch_id, b.name as branch_name, b.slug as branch_slug,
           b.latitude, b.longitude,
           r.id as restaurant_id, r.name as restaurant_name, r.slug as restaurant_slug,
           e.name as emirate_name, e.code as emirate_code
    FROM branches b
    JOIN restaurants r ON b.restaurant_id = r.id
    JOIN emirates e ON b.emirate_id = e.id
    WHERE b.deleted_at IS NULL
  `;

  console.log(`📊 Loaded ${excelRows.length} Excel rows and ${dbBranches.length} DB branches.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const processedBranchIds = new Set();

  for (const row of excelRows) {
    const brandName = row.BRAND_NAME?.trim();
    const state = row.STATE?.trim();
    const coordStr = row.coordinate?.trim();

    if (!brandName) {
      console.log('⚠️ Skipping row due to missing brand name:', row);
      skippedCount++;
      continue;
    }

    if (!coordStr) {
      console.log(`⚠️ Skipping "${brandName}" (${state}) because coordinates are missing.`);
      skippedCount++;
      continue;
    }

    // Parse coordinates
    const parts = coordStr.split(',').map(s => s.trim());
    if (parts.length !== 2) {
      console.log(`❌ Invalid coordinate format for "${brandName}" (${state}): "${coordStr}"`);
      errorCount++;
      continue;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      console.log(`❌ Non-numeric coordinate values for "${brandName}" (${state}): "${coordStr}"`);
      errorCount++;
      continue;
    }

    // Normalize state/emirate
    let normState = state.toLowerCase().trim();
    if (normState === 'fujarah' || normState.includes('fujar')) {
      normState = 'fujairah';
    }

    // Match with DB branch
    const matches = dbBranches.filter(b => {
      const nameMatch = b.restaurant_name.toLowerCase().replace(/[^a-z0-9]/g, '') === brandName.toLowerCase().replace(/[^a-z0-9]/g, '') ||
                        b.restaurant_name.toLowerCase().includes(brandName.toLowerCase()) ||
                        brandName.toLowerCase().includes(b.restaurant_name.toLowerCase());
      const emirateMatch = b.emirate_name.toLowerCase().trim() === normState;
      return nameMatch && emirateMatch;
    });

    if (matches.length === 0) {
      console.log(`❌ Could not find DB branch matching "${brandName}" in "${state}"`);
      errorCount++;
      continue;
    }

    const branch = matches[0];

    if (processedBranchIds.has(branch.branch_id)) {
      console.log(`ℹ️ Branch "${branch.restaurant_name}" in ${branch.emirate_name} already updated. Skipping duplicate Excel row (Coord: "${coordStr}").`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`➡️ Updating "${branch.restaurant_name}" in ${branch.emirate_name}: Lat=${lat}, Lng=${lng}`);
      
      await sql`
        UPDATE branches
        SET latitude = ${lat}, longitude = ${lng}, updated_at = NOW()
        WHERE id = ${branch.branch_id}
      `;

      processedBranchIds.add(branch.branch_id);
      updatedCount++;
    } catch (err) {
      console.error(`❌ Failed to update branch ID ${branch.branch_id} (${branch.restaurant_name}):`, err.message);
      errorCount++;
    }
  }

  console.log('\n=== UPDATE SUMMARY ===');
  console.log(`✅ Successfully updated: ${updatedCount} branches`);
  console.log(`ℹ️ Skipped / already updated: ${skippedCount} rows`);
  console.log(`❌ Errors / unmatched: ${errorCount}`);
  console.log('======================');
}

run().catch(console.error);
