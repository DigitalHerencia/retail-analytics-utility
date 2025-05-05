"use client"

import CashRegister from "@/features/cash-register"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { processTransaction } from "@/lib/actions/transactions"
import type { Transaction } from "@/types"

export default function Home() {
  const {
    businessData,
    inventory,
    customers,
    setInventory,
    setCustomers,
    setTransactions,
    transactions,
    saveChanges,
    refresh,
    isLoading
  } = usePersistentState()

  // Calculate retail price per gram from business data
  const retailPricePerGram = businessData?.wholesalePricePerOz
    ? (businessData.wholesalePricePerOz / 28.35) * 2 // Example: 2x markup
    : 0

  // Handle adding a transaction
  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      const result = await processTransaction(transaction)
      if (result.success) {
        await refresh()
      } else {
        // eslint-disable-next-line no-console
        console.error("Failed to add transaction:");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding transaction:", error)
    }
  }

  // Handle inventory updates
  const handleUpdateInventory = async (updatedInventory: typeof inventory) => {
    setInventory(updatedInventory)
    await saveChanges()
  }

  // Handle customer updates
  const handleUpdateCustomers = async (updatedCustomers: typeof customers) => {
    setCustomers(updatedCustomers)
    await saveChanges()
  }

  if (isLoading) {
    return <div className="container text-center py-10">Loading register data...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container">
        <CashRegister
          inventory={inventory}
          customers={customers}
          onUpdateInventory={handleUpdateInventory}
          onUpdateCustomers={handleUpdateCustomers}
          onAddTransaction={handleAddTransaction}
          retailPricePerGram={retailPricePerGram}
        />
      </div>
    </main>
  )
}
