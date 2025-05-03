"use client"

import MonthlyForecast from "@/features/monthly-forecast"
import { usePersistentState } from "@/hooks/use-persistent-state"
import type { BusinessData } from "@/types"
import { PricingProvider } from "@/hooks/use-pricing"

export default function ForecastPage() {
  const {
    businessData,
    inventory,
    customers,
    transactions,
  } = usePersistentState()

  // Always render the page, even if data is missing
  return (
    <div className="container py-4">
      <PricingProvider>
        <MonthlyForecast
          businessData={businessData || { wholesalePricePerOz: 0, targetProfitPerMonth: 0, operatingExpenses: 0, targetProfit: 0 } as BusinessData}
          inventory={inventory || []}
          customers={customers || []}
          transactions={transactions || []}
        />
      </PricingProvider>
    </div>
  )
}
