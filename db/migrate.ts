import { query, closePool } from "@/lib/db"
import path from "path"
import fs from "fs"

async function migrate() {
  console.log("Starting database migration...")

  try {
    // Create a migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)

    // Get list of applied migrations
    const appliedResult = await query(`SELECT name FROM migrations ORDER BY id ASC`)
    const appliedMigrations = appliedResult.rows.map((row) => row.name)

    // Read the schema file
    const schemaPath = path.join(process.cwd(), "db", "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Execute the schema
    await query(schema)

    // Record the migration if not already applied
    const migrationName = `initial_schema_${new Date().toISOString().split("T")[0]}`

    if (!appliedMigrations.includes(migrationName)) {
      await query(`INSERT INTO migrations (name) VALUES ($1)`, [migrationName])
      console.log(`Applied migration: ${migrationName}`)
    } else {
      console.log(`Migration ${migrationName} already applied, skipping`)
    }

    // Check for additional migration files in the migrations directory
    const migrationsDir = path.join(process.cwd(), "db", "migrations")

    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort() // Ensure migrations are applied in order

      for (const file of migrationFiles) {
        const migrationName = path.basename(file, ".sql")

        if (!appliedMigrations.includes(migrationName)) {
          const migrationPath = path.join(migrationsDir, file)
          const migrationSql = fs.readFileSync(migrationPath, "utf8")

          // Apply the migration
          await query(migrationSql)

          // Record the migration
          await query(`INSERT INTO migrations (name) VALUES ($1)`, [migrationName])
          console.log(`Applied migration: ${migrationName}`)
        } else {
          console.log(`Migration ${migrationName} already applied, skipping`)
        }
      }
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    // Close the pool
    await closePool()
  }
}

// Run the migration if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default migrate
