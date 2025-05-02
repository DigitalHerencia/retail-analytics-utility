"use client"

import { useState, useEffect } from "react"
import { Package, Users, Settings, TrendingUp, DollarSign } from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { calculatePricePoints } from "@/lib/utils"
import { defaultBusinessData, defaultMarkupPercentages } from "@/lib/data"
import type { BusinessData, PricePoint, InventoryItem, Customer, Transaction } from "@/lib/data"
import SettingsTab from "@/components/settings-tab"
import CustomersTab from "@/components/customers-tab"
import CashRegister from "@/components/cash-register"
import MonthlyForecast from "@/components/monthly-forecast"
import SetupTab from "@/components/setup-tab"
import InventoryManagement from "@/components/inventory-management"
import { loadData } from "@/app/(root)/actions"

export default function BusinessCalculator() {
  const [activeTab, setActiveTab] = useState("home")
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData)
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
  const [selectedMarkup, setSelectedMarkup] = useState(100) // Default 100% markup
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [retailPricePerGram, setRetailPricePerGram] = useState(20)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTips, setShowTips] = useState(true) // Add state for showing/hiding tips
  const [isLoading, setIsLoading] = useState(true)

  // Load real data on first load
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Load business data
        const businessResult = await loadData("business")
        if (businessResult.success && businessResult.data) {
          setBusinessData(businessResult.data)
        }
        
        // Load inventory
        const inventoryResult = await loadData("inventory")
        if (inventoryResult.success && inventoryResult.data) {
          setInventory(inventoryResult.data)
        }
        
        // Load customers
        const customersResult = await loadData("customers")
        if (customersResult.success && customersResult.data) {
          setCustomers(customersResult.data)
        }
        
        // Load transactions
        const transactionsResult = await loadData("transactions")
        if (transactionsResult.success && transactionsResult.data) {
          setTransactions(transactionsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate price points when business data changes
  useEffect(() => {
    const newPricePoints = calculatePricePoints(defaultMarkupPercentages, businessData.targetProfitPerMonth, businessData)
    setPricePoints(newPricePoints)
  }, [businessData])

  // Get the selected price point
  const selectedPricePoint = pricePoints.find((p) => p.markupPercentage === selectedMarkup) || pricePoints[2]

  // Handle input changes
  const handleInputChange = (field: keyof BusinessData, value: number) => {
    setBusinessData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle data loaded from Blob storage
  const handleDataLoaded = (
    loadedBusinessData: BusinessData,
    loadedInventory: InventoryItem[],
    loadedCustomers: Customer[],
  ) => {
    setBusinessData(loadedBusinessData)
    setInventory(loadedInventory)
    setCustomers(loadedCustomers)
    setActiveTab("home")
  }

  // Add this function to handle adding a transaction
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions])
  }

  // Handler to hide tips
  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home" className="m-0 p-4 space-y-4">
            <CashRegister
              inventory={inventory}
              customers={customers}
              onUpdateInventory={setInventory}
              onUpdateCustomers={setCustomers}
              onAddTransaction={handleAddTransaction}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="inventory" className="m-0 p-4 space-y-4">
            <InventoryManagement
              inventory={inventory}
              onUpdateInventory={setInventory}
              onAddTransaction={handleAddTransaction}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="customers" className="m-0 p-4 space-y-4">
            <CustomersTab
              customers={customers}
              onUpdateCustomers={setCustomers}
              showTips={showTips}
              onHideTips={handleHideTips}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="forecast" className="m-0 p-4 space-y-4">
            <MonthlyForecast
              businessData={businessData}
              inventory={inventory}
              customers={customers}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="setup" className="m-0 p-4 space-y-4">
            <SetupTab
              businessData={businessData}
              onUpdateBusinessData={setBusinessData}
              retailPricePerGram={retailPricePerGram}
              onUpdateRetailPrice={setRetailPricePerGram}
            />
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsTab
              businessData={businessData}
              inventory={inventory}
              customers={customers}
              onDataLoaded={handleDataLoaded}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Helper component for the plus icon
function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
