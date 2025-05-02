"use client"

import { useState } from "react"
import CustomersTab from "@/components/customers-tab"
import { HustleStat } from "@/components/hustle-stat"
import { Users, UserPlus, DollarSign } from "lucide-react"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function CustomersPage() {
  // Use persistent state for customers
  const { customers, setCustomers, isLoading } = usePersistentState();
  const [showTips, setShowTips] = useState(true);

  const handleHideTips = () => {
    setShowTips(false);
  };

  // Calculate stats from real data
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => {
    if (!c.createdAt) return false;
    const created = new Date(c.createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 14 * 24 * 60 * 60 * 1000; // last 14 days
  }).length;
  const totalOwed = customers.reduce((sum, c) => sum + (c.amountOwed || 0), 0);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
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
          value={`$${totalOwed.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          className="border-white"
        />
      </div>
      <CustomersTab
        customers={customers}
        onUpdateCustomers={setCustomers}
        showTips={showTips}
        onHideTips={handleHideTips}
        isLoading={isLoading}
      />
    </div>
  )
}
