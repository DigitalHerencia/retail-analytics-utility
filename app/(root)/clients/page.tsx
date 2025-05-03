"use client"

import { useState } from "react"
import CustomersTab from "@/features/customers-tab"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function ClientsPage() {
  // Use persistent state for customers
  const { customers, setCustomers, isLoading } = usePersistentState();
  const [showTips, setShowTips] = useState(true);

  const handleHideTips = () => {
    setShowTips(false);
  };

  return (
    <div className="container py-4">
      <CustomersTab
        customers={customers || []}
        onUpdateCustomers={setCustomers}
        showTips={showTips}
        onHideTips={handleHideTips}
        isLoading={isLoading}
      />
    </div>
  )
}
