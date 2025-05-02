import { neon } from '@neondatabase/serverless';
import { env, validateEnv } from './env';

/**
 * Creates a database connection with error handling
 */
function createDatabaseConnection() {
  const validation = validateEnv();
  
  if (!validation.success) {
    console.error(validation.message);
    throw new Error(`Database connection failed: ${validation.message}`);
  }
  
  try {
    return neon(env.DATABASE_URL);
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw new Error('Database connection failed. See server logs for details.');
  }
}

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
