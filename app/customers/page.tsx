"use client"

import CustomersTab from "@/components/customers-tab"
import { useState, useEffect } from "react"
<<<<<<< HEAD
import { generateDemoData } from "@/db/demo-data"
import { sampleInventory, sampleCustomers } from "@/db/data"
=======
import { generateDemoData } from "@/lib/demo-data"
import { sampleInventory, sampleCustomers } from "@/lib/data"
>>>>>>> 6de2fd9eac2b05bd38ac61c9d2fe09041f0df49a

export default function CustomersPage() {
  const [customers, setCustomers] = useState(sampleCustomers)
  const [showTips, setShowTips] = useState(true)

  // Generate demo data on first load
  useEffect(() => {
    const demoData = generateDemoData(100, customers, sampleInventory)
    setCustomers(demoData.updatedCustomers)
  }, [])

  const handleUpdateCustomers = (updatedCustomers) => {
    setCustomers(updatedCustomers)
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  return (
    <div className="container py-4">
      <CustomersTab
        customers={customers}
        onUpdateCustomers={handleUpdateCustomers}
        showTips={showTips}
        onHideTips={handleHideTips}
      />
    </div>
  )
}
