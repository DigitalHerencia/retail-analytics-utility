"use client"

import MonthlyForecast from "@/components/monthly-forecast"
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
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">MONTHLY FORECAST</h1>
          <p className="text-white/80 mt-1">Predict your sales and revenue with AI-powered analytics</p>
        </div>
      </div>
      
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
