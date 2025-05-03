"use client"

import MonthlyForecast from "@/features/monthly-forecast"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function ForecastPage() {
  // Replace individual state management with unified persistent state
  const {
    businessData,
    inventory,
    customers,
    transactions,
    isLoading
  } = usePersistentState();

  return (
    <div className="container py-4">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4">Loading forecast data...</p>
        </div>
      ) : (
        <MonthlyForecast
          businessData={businessData}
          inventory={inventory}
          customers={customers}
          transactions={transactions}
        />
      )}
    </div>
  )
}
