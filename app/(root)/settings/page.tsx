import { loadAllData } from "@/lib/actions/persistence"
import SettingsTab from "@/features/settings-tab"
import { sql } from "drizzle-orm"
import { saveBusinessData } from "@/lib/actions/saveBusinessData"
import { RISK_MODE_DEFAULTS } from "@/features/setup-tab"
import type { BusinessData } from "@/types"

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

  // Ensure businessData is always a valid BusinessData object
  const rawBusinessData = data.businessData as Partial<BusinessData> | undefined
  let businessData: BusinessData
  let mode: keyof typeof RISK_MODE_DEFAULTS
  if (rawBusinessData && typeof rawBusinessData === "object" && Object.keys(rawBusinessData).length > 0) {
    // Use the provided businessData, but ensure risk_mode is valid
    const riskMode = (rawBusinessData.risk_mode ?? "moderate") as keyof typeof RISK_MODE_DEFAULTS
    businessData = {
      ...RISK_MODE_DEFAULTS[riskMode],
      markupPercentage: rawBusinessData.markupPercentage ?? 100,
      retailPricePerGram: rawBusinessData.retailPricePerGram ?? (RISK_MODE_DEFAULTS[riskMode].wholesalePricePerOz / 28.35),
      inventoryQty: rawBusinessData.inventoryQty ?? 0,
      risk_mode: riskMode,
      // Required fields
      targetProfit: rawBusinessData.targetProfit ?? RISK_MODE_DEFAULTS[riskMode].targetProfit,
      targetProfitPerMonth: rawBusinessData.targetProfitPerMonth ?? RISK_MODE_DEFAULTS[riskMode].targetProfitPerMonth,
      operatingExpenses: rawBusinessData.operatingExpenses ?? RISK_MODE_DEFAULTS[riskMode].operatingExpenses,
      wholesalePricePerOz: rawBusinessData.wholesalePricePerOz ?? RISK_MODE_DEFAULTS[riskMode].wholesalePricePerOz,
    }
    mode = riskMode
  } else {
    businessData = {
      ...RISK_MODE_DEFAULTS.moderate,
      markupPercentage: 100,
      retailPricePerGram: RISK_MODE_DEFAULTS.moderate.wholesalePricePerOz / 28.35,
      inventoryQty: 0,
      risk_mode: "moderate",
    }
    mode = "moderate"
  }

  // Calculate metrics
  const totalTransactions = transactions.filter((t: any) => t.type === "sale").length
  const lifetimeProfit = transactions.filter((t: any) => t.type === "sale").reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
  const totalGramsAdded = inventory.reduce((sum: number, item: any) => sum + (item.quantityG || 0), 0)

  async function handleUpdateBusinessData(data: BusinessData, mode: keyof typeof RISK_MODE_DEFAULTS) {
    // Save with risk_mode
    await saveBusinessData("", { ...data, risk_mode: mode })
  }

  return (
    <div className="container py-4">
      <SettingsTab
        dbConnected={dbConnected}
        totalTransactions={totalTransactions}
        lifetimeProfit={lifetimeProfit}
        totalGramsAdded={totalGramsAdded}
        businessData={businessData}
        mode={mode}
        onUpdateBusinessData={handleUpdateBusinessData}
      />
    </div>
  )
}
