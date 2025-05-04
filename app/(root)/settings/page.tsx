import { loadAllData } from "@/lib/actions/persistence"
import SettingsTab from "@/features/settings-tab"
import { sql } from "drizzle-orm"

export default async function SettingsPage() {
  // Check DB connection status (simple query)
  let dbConnected = false
  try {
    sql`SELECT 1`
    dbConnected = true
  } catch {
    dbConnected = false
  }

  // Fetch all production data for the current user
  const data = await loadAllData()
  const transactions = data.transactions || []
  const inventory = data.inventory || []

  // Calculate metrics
  const totalTransactions = transactions.filter((t: any) => t.type === "sale").length
  const lifetimeProfit = transactions.filter((t: any) => t.type === "sale").reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
  const totalGramsAdded = inventory.reduce((sum: number, item: any) => sum + (item.quantityG || 0), 0)

  return (
    <div className="container py-4">
      <SettingsTab
        dbConnected={dbConnected}
        totalTransactions={totalTransactions}
        lifetimeProfit={lifetimeProfit}
        totalGramsAdded={totalGramsAdded}
      />
    </div>
  )
}
