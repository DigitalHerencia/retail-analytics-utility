"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loadAllData } from "@/lib/actions/persistence"
import { saveAllData } from "@/app/(root)/actions"
import type { BusinessData, InventoryItem, Customer, Transaction } from "@/types"
import { toast } from "@/components/ui/use-toast"

interface PersistentState {
  isLoading: boolean
  businessData: BusinessData
  inventory: InventoryItem[]
  customers: Customer[]
  transactions: Transaction[]
}

interface PersistentStateContextType extends PersistentState {
  refresh: () => Promise<void>
  setBusinessData: (data: BusinessData) => void
  setInventory: (items: InventoryItem[]) => void
  setCustomers: (customers: Customer[]) => void
  setTransactions: (transactions: Transaction[]) => void
  saveChanges: () => Promise<void>
}

const PersistentStateContext = createContext<PersistentStateContextType | null>(null)

export function PersistentStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistentState>({
    isLoading: true,
    businessData: {
      wholesalePricePerOz: 0,
      targetProfitPerMonth: 0,
      operatingExpenses: 0,
      targetProfit: undefined,
      markupPercentage: 0,
      retailPricePerGram: 0
    },
    inventory: [],
    customers: [],
    transactions: []
  })
  const router = useRouter()

  // Load data on initial mount
  useEffect(() => {
    refresh()
  }, [])

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
          transactions: result.transactions || []
        })
        return
      }
      
      setState(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error loading data",
        description: (result as any).error || "Failed to load data",
        variant: "destructive"
      })
    } catch (error) {
      console.error("Error loading data:", error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error loading data",
        description: "Something went wrong",
        variant: "destructive"
      })
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

  // Save all changes to the server
  const saveChanges = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const result = await saveAllData({
        businessData: state.businessData,
        inventory: state.inventory,
        customers: state.customers,
        transactions: state.transactions
      })
      
      setState(prev => ({ ...prev, isLoading: false }))
      if (result.success) {
        toast({
          title: "Changes saved",
          description: "Your changes have been saved successfully"
        })
        return
      }
      
      toast({
        title: "Error saving changes",
        description: result.error || "Failed to save changes",
        variant: "destructive"
      })
    } catch (error) {
      console.error("Error saving data:", error)
      setState(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error saving changes",
        description: "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const contextValue = {
    ...state,
    refresh,
    setBusinessData,
    setInventory,
    setCustomers,
    setTransactions,
    saveChanges
  }

  return (
    <PersistentStateContext.Provider value={contextValue}>
      {children}
    </PersistentStateContext.Provider>
  )
}

export function usePersistentState() {
  const context = useContext(PersistentStateContext)
  
  if (!context) {
    throw new Error("usePersistentState must be used within a PersistentStateProvider")
  }
  
  return context
}
