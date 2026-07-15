import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Parse .env.local
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const dbUrl = process.env.DATABASE_URL;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
let liveDomain = process.argv[2] || process.env.LIVE_WEBSITE_URL || 'https://habesha-eats.vercel.app';

if (!dbUrl) {
  console.error('Error: DATABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!blobToken) {
  console.error('Error: BLOB_READ_WRITE_TOKEN is not set in .env.local');
  console.error('Please configure Vercel Blob on your dashboard and pull/copy the token.');
  process.exit(1);
}

// Clean up liveDomain
if (!liveDomain.startsWith('http://') && !liveDomain.startsWith('https://')) {
  liveDomain = 'https://' + liveDomain;
}
if (liveDomain.endsWith('/')) {
  liveDomain = liveDomain.slice(0, -1);
}

const sql = neon(dbUrl);

const mimeToExt = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

async function migrate() {
  console.log(`Starting optimized image migration...`);
  console.log(`Live Domain (for local paths): ${liveDomain}`);

  let successCount = 0;
  let failureCount = 0;

  try {
    // 1. Process Menu Items in batches of 5 (filtering out already migrated ones in SQL)
    const limit = 5;
    let hasMoreItems = true;
    let batchNum = 1;
    const failedIds = [];

    console.log('\n--- Migrating Menu Items ---');
    while (hasMoreItems) {
      console.log(`[Batch ${batchNum}] Fetching next ${limit} unmigrated menu items...`);
      
      const menuItems = failedIds.length > 0
        ? await sql`
            SELECT id, name, image_url 
            FROM menu_items 
            WHERE image_url IS NOT NULL 
              AND image_url != '' 
              AND image_url NOT LIKE 'https://%.public.blob.vercel-storage.com/%'
              AND NOT (id = ANY(${failedIds}))
            ORDER BY id
            LIMIT ${limit}
          `
        : await sql`
            SELECT id, name, image_url 
            FROM menu_items 
            WHERE image_url IS NOT NULL 
              AND image_url != '' 
              AND image_url NOT LIKE 'https://%.public.blob.vercel-storage.com/%'
            ORDER BY id
            LIMIT ${limit}
          `;

      if (menuItems.length === 0) {
        console.log('No more unmigrated menu items found.');
        hasMoreItems = false;
        break;
      }

      console.log(`Found ${menuItems.length} items to process in this batch.`);
      
      for (const item of menuItems) {
        const url = item.image_url;
        console.log(`  - Processing "${item.name}" (ID: ${item.id})...`);

        try {
          let buffer;
          let filename;
          let mimeType = 'image/jpeg';

          if (url.startsWith('data:')) {
            // Handle Base64 Data URI
            const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
            if (!matches) {
              throw new Error('Invalid base64 data URI format');
            }
            mimeType = matches[1];
            const base64Data = matches[2];
            buffer = Buffer.from(base64Data, 'base64');
            const ext = mimeToExt[mimeType] || 'jpg';
            filename = `menu-${item.id.substring(0, 8)}-${Date.now()}.${ext}`;
          } else {
            // Handle HTTP URL or Relative path
            let downloadUrl = url;
            if (url.startsWith('/')) {
              downloadUrl = `${liveDomain}${url}`;
            }
            console.log(`    Downloading: ${downloadUrl}`);
            const response = await fetch(downloadUrl);
            if (!response.ok) {
              throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            filename = url.split('/').pop().split('?')[0] || `menu-${item.id.substring(0, 8)}-${Date.now()}.jpg`;
            mimeType = response.headers.get('content-type') || 'image/jpeg';
          }

          console.log(`    Uploading to Vercel Blob (${buffer.length} bytes)...`);
          const blob = await put(`uploads/${filename}`, buffer, {
            access: 'public',
            token: blobToken,
            contentType: mimeType,
            addRandomSuffix: true,
          });

          console.log(`    Success! New Blob URL: ${blob.url}`);
          console.log(`    Updating database record...`);
          await sql`
            UPDATE menu_items 
            SET image_url = ${blob.url}, updated_at = now() 
            WHERE id = ${item.id}
          `;
          successCount++;
        } catch (err) {
          console.error(`    Failed to migrate: ${err.message}`);
          failedIds.push(item.id);
          failureCount++;
        }
      }

      batchNum++;
      // Wait a tiny bit (100ms) between batches to yield loop to event loop
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 2. Process Restaurants in batches of 5
    let hasMoreRestaurants = true;
    let restBatchNum = 1;

    console.log('\n--- Migrating Restaurants ---');
    while (hasMoreRestaurants) {
      console.log(`[Batch ${restBatchNum}] Fetching next ${limit} unmigrated restaurants...`);
      
      const restaurants = await sql`
        SELECT id, name, logo_url, hero_image_url 
        FROM restaurants
        WHERE (logo_url IS NOT NULL AND logo_url != '' AND logo_url NOT LIKE 'https://%.public.blob.vercel-storage.com/%')
           OR (hero_image_url IS NOT NULL AND hero_image_url != '' AND hero_image_url NOT LIKE 'https://%.public.blob.vercel-storage.com/%')
        ORDER BY id
        LIMIT ${limit}
      `;

      if (restaurants.length === 0) {
        console.log('No more unmigrated restaurants found.');
        hasMoreRestaurants = false;
        break;
      }

      console.log(`Found ${restaurants.length} restaurants to process in this batch.`);
      
      for (const r of restaurants) {
        // Migrate Logo
        if (r.logo_url && !r.logo_url.includes('.public.blob.vercel-storage.com')) {
          console.log(`  - Processing logo for "${r.name}" (ID: ${r.id})...`);
          try {
            let buffer;
            let filename;
            let mimeType = 'image/jpeg';
            const url = r.logo_url;

            if (url.startsWith('data:')) {
              const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
              if (!matches) throw new Error('Invalid base64 format');
              mimeType = matches[1];
              buffer = Buffer.from(matches[2], 'base64');
              const ext = mimeToExt[mimeType] || 'jpg';
              filename = `logo-${r.id.substring(0, 8)}-${Date.now()}.${ext}`;
            } else {
              let downloadUrl = url;
              if (url.startsWith('/')) {
                downloadUrl = `${liveDomain}${url}`;
              }
              console.log(`    Downloading logo: ${downloadUrl}`);
              const response = await fetch(downloadUrl);
              if (!response.ok) throw new Error(`Download failed`);
              const arrayBuffer = await response.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
              filename = url.split('/').pop().split('?')[0] || `logo-${r.id.substring(0, 8)}.jpg`;
              mimeType = response.headers.get('content-type') || 'image/jpeg';
            }

            console.log(`    Uploading logo to Vercel Blob...`);
            const blob = await put(`uploads/${filename}`, buffer, {
              access: 'public',
              token: blobToken,
              contentType: mimeType,
              addRandomSuffix: true,
            });

            console.log(`    Success! New Logo URL: ${blob.url}`);
            await sql`
              UPDATE restaurants 
              SET logo_url = ${blob.url}, updated_at = now() 
              WHERE id = ${r.id}
            `;
            successCount++;
          } catch (err) {
            console.error(`    Failed to migrate logo: ${err.message}`);
            failureCount++;
          }
        }

        // Migrate Hero
        if (r.hero_image_url && !r.hero_image_url.includes('.public.blob.vercel-storage.com')) {
          console.log(`  - Processing hero for "${r.name}" (ID: ${r.id})...`);
          try {
            let buffer;
            let filename;
            let mimeType = 'image/jpeg';
            const url = r.hero_image_url;

            if (url.startsWith('data:')) {
              const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
              if (!matches) throw new Error('Invalid base64 format');
              mimeType = matches[1];
              buffer = Buffer.from(matches[2], 'base64');
              const ext = mimeToExt[mimeType] || 'jpg';
              filename = `hero-${r.id.substring(0, 8)}-${Date.now()}.${ext}`;
            } else {
              let downloadUrl = url;
              if (url.startsWith('/')) {
                downloadUrl = `${liveDomain}${url}`;
              }
              console.log(`    Downloading hero: ${downloadUrl}`);
              const response = await fetch(downloadUrl);
              if (!response.ok) throw new Error(`Download failed`);
              const arrayBuffer = await response.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
              filename = url.split('/').pop().split('?')[0] || `hero-${r.id.substring(0, 8)}.jpg`;
              mimeType = response.headers.get('content-type') || 'image/jpeg';
            }

            console.log(`    Uploading hero to Vercel Blob...`);
            const blob = await put(`uploads/${filename}`, buffer, {
              access: 'public',
              token: blobToken,
              contentType: mimeType,
              addRandomSuffix: true,
            });

            console.log(`    Success! New Hero URL: ${blob.url}`);
            await sql`
              UPDATE restaurants 
              SET hero_image_url = ${blob.url}, updated_at = now() 
              WHERE id = ${r.id}
            `;
            successCount++;
          } catch (err) {
            console.error(`    Failed to migrate hero image: ${err.message}`);
            failureCount++;
          }
        }
      }

      restBatchNum++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\nMigration Completed:`);
    console.log(`- Successfully migrated: ${successCount} files`);
    console.log(`- Failed to migrate: ${failureCount} files`);

  } catch (dbErr) {
    console.error('Database connection or query error:', dbErr);
    throw dbErr;
  }
}

async function runWithRetry() {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await migrate();
      break; // Successfully completed!
    } catch (err) {
      console.error(`\n[Retry Warning] Migration attempt ${attempt} failed with network error.`);
      if (attempt < maxRetries) {
        console.log(`Waiting 5 seconds before retrying next batch...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error(`Max retries reached. Migration failed permanently.`);
      }
    }
  }
}

runWithRetry();
