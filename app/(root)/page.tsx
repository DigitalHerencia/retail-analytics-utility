"use client"

import CashRegister from "@/components/cash-register"
import { useState } from "react"
import { sampleInventory, sampleCustomers } from "@/lib/data"
import type { Transaction } from "@/lib/data"

export default function Home() {
  // Use state to allow updates from CashRegister
  const [inventory, setInventory] = useState(sampleInventory)
  const [customers, setCustomers] = useState(sampleCustomers)
  // Demo: just log transactions
  const handleAddTransaction = (transaction: Transaction) => {
    // eslint-disable-next-line no-console
    console.log("Transaction added:", transaction)
  }

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
