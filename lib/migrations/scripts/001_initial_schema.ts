import sql from '../../db';
import { executeQuery } from '../../db';
import { schemas } from '../schema';

/**
 * Initial schema migration
 * Creates all required tables for multi-tenant SaaS
 */
export async function up() {
  // Create all required tables for multi-tenant SaaS
  const result = await executeQuery(async () => {
    sql.unsafe(schemas.userSecrets);
    sql.unsafe(schemas.tenants);
    sql.unsafe(schemas.users);
    sql.unsafe(schemas.customers);
    sql.unsafe(schemas.inventory);
    sql.unsafe(schemas.transactions);
    sql.unsafe(schemas.scenarios);
    console.log('Created all required tables');
    return true;
  });
  if (!result.success) {
    throw new Error(`Failed to create tables: ${result.error}`);
  }
}

/**
 * Downgrade migration (if needed)
 * This would drop all required tables
 */
export async function down() {
  const result = await executeQuery(async () => {
    await sql`DROP TABLE IF EXISTS scenarios;`;
    await sql`DROP TABLE IF EXISTS transactions;`;
    await sql`DROP TABLE IF EXISTS inventory;`;
    await sql`DROP TABLE IF EXISTS customers;`;
    await sql`DROP TABLE IF EXISTS users;`;
    await sql`DROP TABLE IF EXISTS tenants;`;
    await sql`DROP TABLE IF EXISTS user_secrets;`;
    console.log('Dropped all tables');
    return true;
  });
  if (!result.success) {
    throw new Error(`Failed to drop tables: ${result.error}`);
  }
}