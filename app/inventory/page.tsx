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
    <div className="container py-4">
      <InventoryTable
        inventory={inventory || []}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  )
}
