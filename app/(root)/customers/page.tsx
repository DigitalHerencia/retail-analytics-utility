import { auth } from "@clerk/nextjs/server"
import { getCustomers } from "@/lib/fetchers"
import { CustomerList } from "@/features/customer-list"
import { HustleStat } from "@/components/hustle-stat"
import { Users, UserPlus, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function CustomersPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const { customers } = await getCustomers(userId);
  
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => {
    const createdDate = new Date(c.createdAt);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return createdDate > oneMonthAgo;
  }).length;
  const totalOwed = customers.reduce((sum, c) => sum + c.amountOwed, 0);

  return (
    <div className="container py-4 space-y-4">
      <div className="bg-smoke p-6 rounded-md">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">CUSTOMERS</h1>
          <p className="text-white/80 mt-1">Manage your customer relationships</p>
        </div>
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
          value={formatCurrency(totalOwed)}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>

      <CustomerList initialCustomers={ customers } tenantId={ "" } />
    </div>
  )
}
