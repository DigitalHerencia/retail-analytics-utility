"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { InventoryItem, Customer, Transaction } from "@/lib/data" // Import necessary types

// Dynamically import components that need client-side features
const CashRegister = dynamic(() => import("@/components/cash-register"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  )
})
// Main component
export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [inventory, setInventory] = useState<InventoryItem[]>([]) // Add state for inventory
  const [customers, setCustomers] = useState<Customer[]>([]) // Add state for customers
  const [transactions, setTransactions] = useState<Transaction[]>([]) // Add state for transactions (optional, but needed for onAddTransaction)

  // Handler to add a transaction
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction])
    // Here you might also want to update inventory based on the transaction
  }

  // This effect runs only on the client side after the component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render a loading state or null until the component has mounted on the client
  if (!isClient) {
    // Optionally, return a skeleton or loading indicator matching the dynamic import's loading state
    return (
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full max-w-5xl mx-auto p-4">
          <div className="w-full h-[600px] flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </main>
    );
  }

  // Only render the full content on the client side
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-5xl mx-auto p-4">
        <CashRegister
          inventory={inventory}
          customers={customers}
          onUpdateInventory={setInventory}
          onUpdateCustomers={setCustomers}
          onAddTransaction={handleAddTransaction}
        />
      </div>
    </main>
  )
}
