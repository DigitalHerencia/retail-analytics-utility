"use client"

import CashRegister from "@/components/cash-register"
import { useState, useEffect } from "react"
import { getInventory, getCustomers, getTransactions } from "@/app/actions"
import type { Customer, InventoryItem, Transaction } from "@/lib/types"

export default function RegisterPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTips, setShowTips] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Load real data on first load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [inventoryData, customersData, transactionsData] = await Promise.all([
          getInventory(),
          getCustomers(),
          getTransactions(),
        ])

        setInventory(inventoryData)
        setCustomers(customersData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleUpdateInventory = (items: InventoryItem[]) => {
    setInventory(items)
  }

  const handleUpdateCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers)
  }

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <CashRegister
        inventory={inventory || []}
        customers={customers || []}
        retailPricePerGram={100} // Default value
        onUpdateInventory={handleUpdateInventory}
        onUpdateCustomers={handleUpdateCustomers}
        onAddTransaction={handleAddTransaction}
        showTips={showTips}
        onHideTips={handleHideTips}
      />
    </div>
  )
}
