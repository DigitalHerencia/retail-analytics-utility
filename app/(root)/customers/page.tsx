import { getCustomers } from "@/lib/fetchers/customers"
import { auth } from "@clerk/nextjs/server"
import CustomersTab from "@/features/customers-tab"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import { Users, UserPlus, DollarSign } from "lucide-react"

export default async function CustomersPage() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const { customers } = await getCustomers(userId)
  const totalCustomers = customers.length
  const newCustomers = customers.filter(c => {
    const created = new Date(c.createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) < 14 * 24 * 60 * 60 * 1000 // last 14 days
  }).length
  const totalOwed = customers.reduce((sum, c) => sum + (c.amountOwed || 0), 0)

  return (
    <div className="container p-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">CUSTOMERS</h1>
          <p className="text-white/80 mt-1">KNOW YOUR CLIENTS. TRACK EVERY DOLLAR. GROW YOUR BASE.</p>
        </div>
        <HustleTip title="CLIENT MANAGEMENT">
          <p>
            Keep your customer list up to date. Track outstanding balances, payment history, and client notes. Loyal clients are your best asset—treat them right and watch your business grow.
          </p>
        </HustleTip>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HustleStat
          title="TOTAL CLIENTS"
          value={totalCustomers.toString()}
          icon={<Users className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="NEW THIS MONTH"
          value={newCustomers.toString()}
          icon={<UserPlus className="h-5 w-5 text-white" />}
          className="border-white"
        />
        <HustleStat
          title="TOTAL OWED"
          value={`$${totalOwed.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>
      <CustomersTab
        customers={customers}
        tenantId={userId}
        showTips={false}
      />
    </div>
  )
}
