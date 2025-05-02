"use client"

import CustomersTab from "@/components/customers-tab"
import { HustleTip } from "@/components/hustle-tip"
import { HustleStat } from "@/components/hustle-stat"
import { Users, UserPlus, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { generateDemoData } from "@/lib/demo-data"
import { sampleCustomers, Customer } from "@/lib/data"

export default function CustomersPage() {
  const [customers, setCustomers] = useState(sampleCustomers)
  const [showTips, setShowTips] = useState(true)

  // Generate demo data on first load
  useEffect(() => {
    const demoData = generateDemoData()
    setCustomers(demoData.customers)
  }, [])

  const handleUpdateCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers)
  }

  const handleHideTips = () => {
    setShowTips(false)
  }

  // Example stats (replace with real data as needed)
  const totalCustomers = customers.length
  const newCustomers = customers.filter(c => {
    const created = new Date(c.createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) < 14 * 24 * 60 * 60 * 1000 // last 14 days
  }).length
  const totalOwed = customers.reduce((sum, c) => sum + (c.amountOwed || 0), 0)

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-4">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">CUSTOMERS</h1>
          <p className="text-white/80 mt-1">KNOW YOUR CLIENTS. TRACK EVERY DOLLAR. GROW YOUR BASE.</p>
        </div>
        {showTips && (
          <HustleTip title="CLIENT MANAGEMENT">
            <p>
              Keep your customer list up to date. Track outstanding balances, payment history, and client notes. Loyal clients are your best asset—treat them right and watch your business grow.
            </p>
          </HustleTip>
        )}
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
        onUpdateCustomers={handleUpdateCustomers}
        showTips={showTips}
        onHideTips={handleHideTips}
      />
    </div>
  )
}
