"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import SettingsTab from "@/components/settings-tab"
import { defaultBusinessData, sampleInventory, sampleCustomers } from "@/lib/data"
import type { BusinessData, InventoryItem, Customer } from "@/lib/data"

export default function SettingsPage() {
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
    <div className="container py-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <UserButton afterSignOutUrl="/login" appearance={{ elements: { userButtonPopoverCard: 'bg-black border-white text-white' } }} />
      </div>
      <SettingsTab
        businessData={businessData}
        inventory={inventory}
        customers={customers}
        onDataLoaded={handleDataLoad}
      />
    </div>
  )
}
