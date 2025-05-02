"use client"

import CashRegister from "@/components/cash-register"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function Home() {
  // Replace individual state management with unified persistent state
  const {
    inventory,
    setInventory,
    customers,
    setCustomers,
    transactions,
    addTransaction,
    isLoading
  } = usePersistentState();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-5xl mx-auto p-4">
        <CashRegister
          inventory={inventory}
          customers={customers}
          onUpdateInventory={setInventory}
          onUpdateCustomers={setCustomers}
          onAddTransaction={addTransaction}
          isLoading={isLoading}
        />
      </div>
    </main>
  )
}
