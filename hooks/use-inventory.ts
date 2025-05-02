"use client"

import { useState, useEffect } from "react"
import { type InventoryItem } from "@/lib/data"

// This hook provides access to the inventory data
// In a real application, this would likely fetch from a database or API
export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  // Fetch inventory for the current tenant
  useEffect(() => {
    const fetchInventory = async () => {
      const tenant_id = localStorage.getItem("tenant_id")
      if (!tenant_id) return setInventory([])
      const res = await fetch(`/api/inventory?tenant_id=${tenant_id}`)
      if (res.ok) {
        const data = await res.json()
        setInventory(data.inventory || [])
      } else {
        setInventory([])
      }
    }
    fetchInventory()
  }, [])

  // Add, update, delete use API endpoints and always include tenant_id
  const addInventoryItem = async (item: InventoryItem) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, tenant_id })
    })
    // Re-fetch inventory
    const res = await fetch(`/api/inventory?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setInventory(data.inventory || [])
    }
  }

  const updateInventoryItem = async (updatedItem: InventoryItem) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch("/api/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updatedItem, tenant_id })
    })
    // Re-fetch inventory
    const res = await fetch(`/api/inventory?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setInventory(data.inventory || [])
    }
  }

  const deleteInventoryItem = async (itemId: string) => {
    const tenant_id = localStorage.getItem("tenant_id")
    if (!tenant_id) return
    await fetch(`/api/inventory?tenant_id=${tenant_id}&id=${itemId}`, {
      method: "DELETE"
    })
    // Re-fetch inventory
    const res = await fetch(`/api/inventory?tenant_id=${tenant_id}`)
    if (res.ok) {
      const data = await res.json()
      setInventory(data.inventory || [])
    }
  }

  return {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setInventory // for manual updates if needed
  }
}
