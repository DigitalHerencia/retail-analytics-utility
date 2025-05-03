import { auth } from "@clerk/nextjs/server"
import { getInventory, getCustomers, getTransactions } from "@/lib/fetchers"
import { CashRegister } from "@/features/cash-register"
import { HustleStat } from "@/components/hustle-stat"
import { DollarSign, TrendingUp, ShoppingBag } from "lucide-react"
import type { InventoryItem, Customer, Transaction } from "@/types"
import type { SetStateAction } from "react"
import { formatCurrency, formatGrams } from "@/lib/utils"

export default async function TransactionsPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const [
    { inventory },
    { customers },
    { transactions }
  ] = await Promise.all([
    getInventory(userId),
    getCustomers(userId),
    getTransactions(userId)
  ]);

  // Calculate statistics
  const totalSales = transactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.totalPrice, 0);

  const totalProfit = transactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.profit, 0);

  const totalItems = transactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.quantityGrams, 0);

  return (
    <div className="container py-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HustleStat
          title="TOTAL SALES"
          value={formatCurrency(totalSales)}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="TOTAL PROFIT"
          value={formatCurrency(totalProfit)}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="ITEMS SOLD (g)"
          value={formatGrams(totalItems)}
          icon={<ShoppingBag className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>

      <CashRegister
        inventory={inventory}
        customers={customers}
        initialTransactions={transactions}
      />
    </div>
  )
}