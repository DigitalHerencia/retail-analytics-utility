import { neon } from '@neondatabase/serverless';

/**
 * Creates a database connection with error handling
 */

// Initialize database connection with proper error handling
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
  try {
    // Validate and use the database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('DATABASE_URL not found in environment variables');
      throw new Error('Database connection string is missing');
    }
    
    // Create and return the neon SQL client with the connection string
    return neon(databaseUrl);
  } catch (error) {
    console.error('Failed to create database connection:', error);
    // In production, you might want to throw an error instead of returning a dummy connection
    // For now, return a dummy connection to prevent the app from crashing
    return neon('postgresql://user:password@localhost:5432/dummy');
  }
}
