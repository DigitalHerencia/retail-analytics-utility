"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SettingsTab from "@/components/settings-tab"
import { defaultBusinessData, sampleInventory, sampleCustomers } from "@/lib/data"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData)
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory)
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)

  const handleDataLoad = (
    loadedBusinessData: BusinessData,
    loadedInventory: InventoryItem[],
    loadedCustomers: Customer[],
  ) => {
    setBusinessData(loadedBusinessData || defaultBusinessData)
    setInventory(loadedInventory || sampleInventory)
    setCustomers(loadedCustomers || sampleCustomers)
  }

  return (
    <div className="container py-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general" className="gangster-font">
            GENERAL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <SettingsTab
            businessData={businessData}
            inventory={inventory}
            customers={customers}
            onDataLoaded={handleDataLoad}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
