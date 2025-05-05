"use server";
import sql from "../db";
import { RISK_MODE_DEFAULTS } from "@/features/setup-tab";
import { executeQuery } from "../db";

interface OnboardingInput {
  clerkUserId: string;
  username: string;
  secretCode: string;
  mode: keyof typeof RISK_MODE_DEFAULTS;
  inventoryQty: number;
  wholesalePricePerOz: number;
}

export async function saveOnboarding({ clerkUserId, username, secretCode, mode, inventoryQty, wholesalePricePerOz }: OnboardingInput) {
  try {
    // Use Clerk user ID as tenantId
    const tenantId = clerkUserId;
    
    // Execute each database operation with proper error handling
    
    // 1. Save user
    const userResult = await executeQuery(() => 
      sql`INSERT INTO users (clerk_id, tenant_id, username) 
          VALUES (${tenantId}, ${tenantId}, ${username}) 
          ON CONFLICT (clerk_id) DO NOTHING`
    );
    
    if (!userResult.success) {
      console.error("Failed to save user:", userResult.error);
      // Continue to try other operations
    }
    
    // 2. Save Hustler's Code (password reset secret)
    const secretResult = await executeQuery(() => 
      sql`INSERT INTO password_reset_secrets (user_id, secret_code) 
          VALUES (${tenantId}, ${secretCode}) 
          ON CONFLICT (user_id) DO UPDATE SET secret_code = ${secretCode}`
    );
    
    if (!secretResult.success) {
      console.error("Failed to save Hustler's Code:", secretResult.error);
      // Continue to try other operations
    }
    
    // 3. Save business_data
    const defaults = RISK_MODE_DEFAULTS[mode];
    const businessResult = await executeQuery(() => 
      sql`INSERT INTO business_data (tenant_id, risk_mode, wholesale_price_per_oz, target_profit_per_month, operating_expenses, target_profit)
          VALUES (${tenantId}, ${mode}, ${wholesalePricePerOz}, ${defaults.targetProfitPerMonth}, ${defaults.operatingExpenses}, ${defaults.targetProfit})
          ON CONFLICT (tenant_id) DO UPDATE SET 
            risk_mode = ${mode}, 
            wholesale_price_per_oz = ${wholesalePricePerOz}, 
            target_profit_per_month = ${defaults.targetProfitPerMonth}, 
            operating_expenses = ${defaults.operatingExpenses}, 
            target_profit = ${defaults.targetProfit}`
    );
    
    if (!businessResult.success) {
      console.error("Failed to save business data:", businessResult.error);
      // Continue to try other operations
    }
    
    // 4. Save inventory
    const inventoryResult = await executeQuery(() => 
      sql`INSERT INTO inventory (tenant_id, name, quantity_g, cost_per_oz, total_cost)
          VALUES (${tenantId}, 'Default Inventory', ${inventoryQty}, ${wholesalePricePerOz}, ${(inventoryQty / 28.35) * wholesalePricePerOz})
          ON CONFLICT (tenant_id, name) DO UPDATE SET 
            quantity_g = ${inventoryQty}, 
            cost_per_oz = ${wholesalePricePerOz},
            total_cost = ${(inventoryQty / 28.35) * wholesalePricePerOz}`
    );
    
    if (!inventoryResult.success) {
      console.error("Failed to save inventory:", inventoryResult.error);
      // Continue anyway
    }
    
    // Check if any critical operations failed
    if (!userResult.success && !secretResult.success) {
      return { 
        success: false, 
        error: "Failed to save user data and Hustler's Code", 
        fallback: true 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown onboarding error', 
      fallback: true 
    };
  }
}
