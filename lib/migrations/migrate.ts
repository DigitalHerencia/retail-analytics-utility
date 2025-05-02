import sql from '../db';
import { schemas } from './schema';
import { executeQuery } from '../db';
import fs from 'fs';
import path from 'path';

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  return executeQuery(async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return true;
  });
}

// Get list of applied migrations
async function getAppliedMigrations() {
  return executeQuery(async () => {
    const result = await sql`SELECT name FROM migrations ORDER BY applied_at ASC;`;
    return result.map((row: any) => row.name);
  });
}

// Record a migration as applied
async function recordMigration(name: string) {
  return executeQuery(async () => {
    await sql`INSERT INTO migrations (name) VALUES (${name})`;
    return true;
  });
}

// Run a specific migration file
async function runMigration(migrationPath: string, name: string) {
  console.log(`Running migration: ${name}`);
  
  try {
    // Import the migration file
    const migration = require(migrationPath);
    
    // Run the up function
    if (typeof migration.up === 'function') {
      await migration.up();
      await recordMigration(name);
      console.log(`Migration ${name} completed successfully`);
      return true;
    } else {
      console.error(`Migration ${name} has no 'up' function`);
      return false;
    }
  } catch (error) {
    console.error(`Error running migration ${name}:`, error);
    return false;
  }
}

// Main migration function
export async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Create migrations table
  const createResult = await createMigrationsTable();
  if (!createResult.success) {
    console.error('Failed to create migrations table:', createResult.error);
    return false;
  }
  
  // Get applied migrations
  const appliedResult = await getAppliedMigrations();
  if (!appliedResult.success) {
    console.error('Failed to get applied migrations:', appliedResult.error);
    return false;
  }
  
  const appliedMigrations = appliedResult.data || [];
  
  // Get migration files
  const scriptsDir = path.join(__dirname, 'scripts');
  let migrationFiles: string[] = [];
  
  try {
    migrationFiles = fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return false;
  }
  
  // Run pending migrations
  let success = true;
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, path.extname(file));
    
    if (!appliedMigrations.includes(migrationName)) {
      const migrationPath = path.join(scriptsDir, file);
      const migrationSuccess = await runMigration(migrationPath, migrationName);
      
      if (!migrationSuccess) {
        success = false;
        console.error(`Migration ${migrationName} failed`);
        break;
      }
    }
  }
  
  if (success) {
    console.log('All migrations completed successfully');
  } else {
    console.error('Migration process encountered errors');
  }
  
  return success;
}

// Function to apply basic schema (for first install)
export async function applyBaseSchema() {
  console.log('Applying base schema...');
  
  try {
    // Create the user_secrets table
    await sql.unsafe(schemas.userSecrets);
    console.log('Base schema applied successfully');
    return true;
  } catch (error) {
    console.error('Error applying base schema:', error);
    return false;
  }
}

// If this file is run directly, run the migrations
if (require.main === module) {
  runMigrations().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}