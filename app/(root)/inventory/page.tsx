"use client"

import InventoryTable from "@/components/inventory-table"
import { HustleStat } from "@/components/hustle-stat"
import { HustleTip } from "@/components/hustle-tip"
import { Boxes, Scale, Weight, Package } from "lucide-react"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function InventoryPage() {
  // Replace useState and manual loading with usePersistentState
  const { inventory, setInventory, addTransaction, isLoading } = usePersistentState();

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
        inventory={inventory}
        onAdd={(item) => setInventory(prev => [...prev, item])}
        onUpdate={(updatedItem) => 
          setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
        }
        onDelete={(id) => setInventory(prev => prev.filter(item => item.id !== id))}
        isLoading={isLoading}
      />
    </div>
  )
}
