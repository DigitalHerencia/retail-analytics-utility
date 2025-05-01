"use client"

import InventoryTable from "@/components/inventory-table"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import { sampleInventory } from "@/lib/data"
import type { InventoryItem } from "@/lib/data"

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory)

  // Generate demo data on first load
  useEffect(() => {
    try {
      const demoData = generateDemoData()
      setInventory(demoData?.inventory || sampleInventory)
    } catch (error) {
      console.error("Error generating demo data:", error)
      setInventory(sampleInventory)
    }
  }, [])

  const handleAddItem = (item: InventoryItem) => {
    setInventory((prev) => [...(prev || []), item])
  }

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventory((prev) =>
      (prev || []).map((item) => (item.id === updatedItem.id ? updatedItem : item))
    )
  }

  const handleDeleteItem = (id: string) => {
    setInventory((prev) => (prev || []).filter((item) => item.id !== id))
  }

  return (
    <div className="container py-4 space-y-6">
      {/* Restored Header Section */}
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">INVENTORY</h1>
          <p className="text-white/80 mt-1">Track your commodity inventory levels and costs</p>
        </div>
        {/* Optional: Add HustleTip here if needed */}
      </div>

      <InventoryTable
        inventory={inventory || []}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  )
}
