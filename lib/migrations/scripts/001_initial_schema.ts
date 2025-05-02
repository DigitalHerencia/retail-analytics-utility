import sql from '../../db';
import { executeQuery } from '../../db';
import { schemas } from '../schema';

/**
 * Initial schema migration
 * Creates the user_secrets table
 */
export async function up() {
  // Create user_secrets table if it doesn't exist
  const result = await executeQuery(async () => {
    sql.unsafe( schemas.userSecrets );
    console.log('Created user_secrets table');
    return true;
  });
  
  if (!result.success) {
    throw new Error(`Failed to create user_secrets table: ${result.error}`);
  }
}

/**
 * Downgrade migration (if needed)
 * This would drop the user_secrets table
 */
export async function down() {
  const result = await executeQuery(async () => {
    await sql`DROP TABLE IF EXISTS user_secrets;`;
    console.log('Dropped user_secrets table');
    return true;
  });
  
  if (!result.success) {
    throw new Error(`Failed to drop user_secrets table: ${result.error}`);
  }
}