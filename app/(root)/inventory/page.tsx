"use client"

import InventoryTable from "@/components/inventory-table"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import { sampleInventory } from "@/lib/data"
import type { InventoryItem } from "@/lib/data"
import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import { Boxes, Scale, Weight, Package } from "lucide-react"

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
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">INVENTORY</h1>
          <p className="text-white/80 mt-1">Track your commodity inventory levels and costs</p>
        </div>
        <HustleTip title="INVENTORY MANAGEMENT">
          <p>
            Manage your inventory effectively. Add new items, update existing stock levels, and remove items as needed.
            Keep your inventory accurate for better tracking and reporting.
          </p>
        </HustleTip>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <HustleStat
          title="TOTAL STASH VALUE"
          value={(() => {
            const total = inventory.reduce((sum, item) => sum + item.totalCost, 0)
            return `$${total.toFixed(2)}`
          })()}
          icon={<Boxes className="h-5 w-5 text-white" />} />
        <HustleStat
          title="TOTAL WEIGHT (g)"
          value={(() => {
            const total = inventory.reduce((sum, item) => sum + item.quantityG, 0)
            return `${total.toFixed(2)}`
          })()}
          icon={<Scale className="h-5 w-5 text-white" />} />
        <HustleStat
          title="TOTAL WEIGHT (oz)"
          value={(() => {
            const total = inventory.reduce((sum, item) => sum + item.quantityOz, 0)
            return `${total.toFixed(2)}`
          })()}
          icon={<Weight className="h-5 w-5 text-white" />} />
        <HustleStat
          title="TOTAL WEIGHT (kg)"
          value={(() => {
            const total = inventory.reduce((sum, item) => sum + item.quantityKg, 0)
            return `${total.toFixed(2)}`
          })()}
          icon={<Package className="h-5 w-5 text-white" />} />
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
