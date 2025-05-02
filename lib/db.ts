import { neon } from '@neondatabase/serverless';

/**
 * Creates a database connection with error handling
 */

// Initialize database connection
const sql = createDatabaseConnection();

export default sql;

/**
 * Execute a database query with error handling
 * @param queryFn Function that executes the database query
 * @returns Result of the query
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await queryFn();
    return { success: true, data: result };
  } catch (error) {
    console.error('Database query error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

/**
 * Creates and returns a database connection
 * @returns Neon SQL client
 */
function createDatabaseConnection() {
  // Direct use of process.env without validation
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('DATABASE_URL not found in environment variables');
    // Return a dummy connection or handle this case as needed
    return neon('postgresql://user:password@localhost:5432/dummy');
  }
  
  return neon(databaseUrl);
}
