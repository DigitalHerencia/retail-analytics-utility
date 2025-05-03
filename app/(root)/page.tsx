"use client"

import CashRegister from "@/features/cash-register"
import { useState } from "react"
import type { Customer, InventoryItem, Transaction,  } from "@/types"

export default function Home() {
  // Use state to allow updates from CashRegister
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  // Demo: just log transactions
  const handleAddTransaction = (transaction: Transaction) => {
    // eslint-disable-next-line no-console
    console.log("Transaction added:", transaction)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="container p-6">
        <CashRegister
          inventory={ inventory }
          customers={ customers }
          onUpdateInventory={ setInventory }
          onUpdateCustomers={ setCustomers }
          onAddTransaction={ handleAddTransaction } retailPricePerGram={ 0 }        />
      </div>
    </main>
  )
}
