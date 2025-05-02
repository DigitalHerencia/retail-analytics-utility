"use client"

import SettingsTab from "@/components/settings-tab"
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function SettingsPage() {
  // Use the persistent state hook instead of manual state management
  const { 
    businessData, 
    setBusinessData,
    inventory, 
    setInventory,
    customers, 
    setCustomers,
    isLoading,
    saveAllChanges
  } = usePersistentState();

  const handleDataLoad = (
    loadedBusinessData: any,
    loadedInventory: any,
    loadedCustomers: any,
  ) => {
    setBusinessData(loadedBusinessData || setBusinessData);
    setInventory(loadedInventory || []);
    setCustomers(loadedCustomers || []);
  };

  return (
    <div className="container py-4 flex flex-col gap-4">
      <SettingsTab
        businessData={businessData}
        inventory={inventory}
        customers={customers}
        onDataLoaded={handleDataLoad}
        isLoading={isLoading}
        saveAllChanges={saveAllChanges}
      />
    </div>
  )
}
