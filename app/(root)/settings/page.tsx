import { loadAllData } from "@/lib/actions/persistence"
import SettingsTab from "@/features/settings-tab"
import type { BusinessData, InventoryItem, Customer } from "@/types"
import { sql } from "drizzle-orm"



export default async function SettingsPage() {

  // Check DB connection status (simple query)
  let dbConnected = false
  try {
    sql`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return (
    <div className="container py-4">
      <SettingsTab dbConnected={dbConnected} />
    </div>
  )
}
