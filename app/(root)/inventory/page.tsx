import InventoryTable from "@/features/inventory-table"
import { HustleStat } from "@/components/hustle-stat"
import { Boxes, Scale, Weight, Package } from "lucide-react"
import { getInventory } from "@/lib/fetchers"
import { auth } from "@clerk/nextjs/server"
import { formatCurrency, formatGrams, formatKilograms } from "@/lib/utils"

export default async function InventoryPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const { inventory } = await getInventory(userId);

  const totalValue = inventory.reduce((sum, item) => sum + item.totalCost, 0);
  const totalQuantityG = inventory.reduce((sum, item) => sum + item.quantityG, 0);
  const totalQuantityKg = inventory.reduce((sum, item) => sum + item.quantityKg, 0);
  const lowStockCount = inventory.filter(item => item.quantityG <= item.reorderThresholdG).length;

  return (
    <div className="container py-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HustleStat
          title="TOTAL VALUE"
          value={formatCurrency(totalValue)}
          icon={<Boxes className="h-5 w-5 text-white" />} />
        <HustleStat
          title="LOW STOCK ITEMS"
          value={lowStockCount.toString()}
          icon={<Scale className="h-5 w-5 text-white" />} />
        <HustleStat
          title="TOTAL WEIGHT (g)"
          value={formatGrams(totalQuantityG)}
          icon={<Weight className="h-5 w-5 text-white" />} />
        <HustleStat
          title="TOTAL WEIGHT (kg)"
          value={formatKilograms(totalQuantityKg)}
          icon={<Package className="h-5 w-5 text-white" />} />
      </div>

      <InventoryTable inventory={ inventory } tenantId={ "" } />
    </div>
  )
}
