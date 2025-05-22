"use client"

import CashRegister from "@/components/cash-register"
import { useState, useEffect } from "react"
import { getInventory, getCustomers, getTransactions } from "@/app/actions"
<<<<<<< HEAD
import type { Customer, InventoryItem, Transaction } from "@/db/data"
=======
import type { Customer, InventoryItem, Transaction } from "@/lib/data"
>>>>>>> 6de2fd9eac2b05bd38ac61c9d2fe09041f0df49a

export default function RegisterPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTips, setShowTips] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load real data on first load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load each data type separately to better identify errors
        let inventoryData: InventoryItem[] = []
        let customersData: Customer[] = []
        let transactionsData: Transaction[] = []

        try {
          inventoryData = await getInventory()
          console.log("Inventory loaded:", inventoryData)
        } catch (err) {
          console.error("Error loading inventory:", err)
          setError("Failed to load inventory data. Please check database connection.")
        }

        try {
          customersData = await getCustomers()
          console.log("Customers loaded:", customersData)
        } catch (err) {
          console.error("Error loading customers:", err)
          setError("Failed to load customer data. Please check database connection.")
        }

        try {
          transactionsData = await getTransactions()
          console.log("Transactions loaded:", transactionsData)
        } catch (err) {
          console.error("Error loading transactions:", err)
          setError("Failed to load transaction data. Please check database connection.")
        }

        setInventory(inventoryData)
        setCustomers(customersData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please try refreshing the page.")
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

  if (error) {
    return (
      <div className="container py-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Retry
            </button>
          </div>
        </div>
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
