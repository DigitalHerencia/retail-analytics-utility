"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadAllData } from "@/lib/actions/persistence"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/types"

interface PersistentState {
  isLoading: boolean
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  transactions: Transaction[]
}

export function usePersistentState() {
  const [state, setState] = useState<PersistentState>({
    isLoading: true,
    businessData: {
      wholesalePricePerOz: 0, targetProfitPerMonth: 0, operatingExpenses: 0,
      targetProfit: undefined
    },
    inventory: [],
    customers: [],
    transactions: []
  })
  const router = useRouter()

  async function refresh() {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const result = await loadAllData()
      
      if (result.success) {
        setState({
          isLoading: false,
          businessData: result.businessData as BusinessData,
          inventory: result.inventory || [],
          customers: result.customers || [],
          transactions: result.transactions
        })
    }
    } catch (error) {
      console.error("Error loading data:", error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Helper setters that preserve the rest of the state
  const setBusinessData = (data: BusinessData) => {
    setState(prev => ({ ...prev, businessData: data }))
  }

  const setInventory = (items: InventoryItem[]) => {
    setState(prev => ({ ...prev, inventory: items }))
  }

  const setCustomers = (customers: Customer[]) => {
    setState(prev => ({ ...prev, customers }))
  }

  const setTransactions = (transactions: Transaction[]) => {
    setState(prev => ({ ...prev, transactions }))
  }

  return {
    ...state,
    refresh,
    setBusinessData,
    setInventory,
    setCustomers,
    setTransactions
  }
}
