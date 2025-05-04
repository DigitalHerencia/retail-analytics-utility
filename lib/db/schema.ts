"use server";

import sql from "../db";

/**
 * Ensures all required database tables are created
 */
export async function ensureDatabaseSetup() {
  try {
    // Create inventory table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quantity_g DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantity_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantity_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
        cost_per_oz DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
        purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
        reorder_threshold_g DECIMAL(10, 2) NOT NULL DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add index on tenant_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS inventory_tenant_id_idx ON inventory (tenant_id)
    `;
    
    console.log("✅ Database schema setup completed");
    return { success: true };
  } catch (error) {
    console.error("❌ Database schema setup failed:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown schema setup error' };
  }
}