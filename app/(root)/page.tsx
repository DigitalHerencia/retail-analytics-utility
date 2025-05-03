import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { RetailAnalyticsCharts } from "@/features/retail-analytics-charts"
import { RetailAnalyticsTable } from "@/features/retail-analytics-table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTransactions, getCustomers, getInventory } from "@/lib/fetchers"

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Fetch data in parallel
  const [transactions, customers, inventory] = await Promise.all([
    getTransactions(userId),
    getCustomers(userId),
    getInventory(userId)
  ])

  return (
    <div className="space-y-8 py-8">
      <Suspense fallback={
        <Card className="w-full h-[400px] animate-pulse">
          <Skeleton className="w-full h-full" />
        </Card>
      }>
        <RetailAnalyticsCharts
          transactions={transactions.transactions}
          customers={customers.customers}
          inventory={inventory.inventory}
        />
      </Suspense>

      <Suspense fallback={
        <Card className="w-full h-[500px] animate-pulse">
          <Skeleton className="w-full h-full" />
        </Card>
      }>
        <RetailAnalyticsTable
          transactions={transactions.transactions}
          customers={customers.customers}
          inventory={inventory.inventory}
        />
      </Suspense>
    </div>
  )
}
