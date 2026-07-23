/**
 * Neon PostgreSQL Database Connection
 * Uses @neondatabase/serverless for edge-compatible, pooled connections.
 * Includes retry logic for Neon cold-start timeouts.
 */
import { neon, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Enable connection caching to reuse HTTP connections between queries
neonConfig.fetchConnectionCache = true;

const rawSql = neon(process.env.DATABASE_URL);

/**
 * Retry wrapper — Neon serverless can experience cold-start ETIMEDOUT errors.
 * Retries up to 3 times with exponential backoff before giving up.
 */
async function sql(strings, ...values) {
  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await rawSql(strings, ...values);
    } catch (err) {
      lastError = err;
      // Only retry on ETIMEDOUT / fetch failures, not SQL errors
      if (
        err.code === 'ETIMEDOUT' ||
        err.message?.includes('fetch failed') ||
        err.sourceError?.message?.includes('fetch failed')
      ) {
        const delay = Math.min(500 * Math.pow(2, attempt), 3000);
        console.warn(`[DB] Query attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export default sql;