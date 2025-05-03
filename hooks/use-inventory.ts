"use client"

import { useState, useTransition } from "react"
import type { InventoryItem } from "@/types"
import { useRouter } from "next/navigation"
import { createInventoryItem, updateInventoryItem as updateItem, deleteInventoryItem as deleteItem } from "@/lib/fetchers"
import { toast } from "sonner"

export function useInventory(initialInventory: InventoryItem[] = []) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      // Create optimistic ID for local state
      const optimisticItem = {
        ...item,
        id: crypto.randomUUID(),
      }
      
      // Optimistic update
      setInventory(prev => [...prev, optimisticItem])
      
      startTransition(async () => {
        // Save via server action
        await createInventoryItem("your_tenant_id", optimisticItem)
        router.refresh()
        toast.success("Item added successfully")
      })
    } catch (error) {
      console.error("Error adding inventory item:", error)
      // Revert optimistic update
      setInventory(inventory)
      toast.error("Failed to add item")
      throw error
    }
  }

  const updateInventoryItem = async (updatedItem: InventoryItem) => {
    try {
      // Optimistic update
      const newInventory = inventory.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
      setInventory(newInventory)
      
      startTransition(async () => {
        // Save via server action
        await updateItem("your_tenant_id", updatedItem)
        router.refresh()
        toast.success("Item updated successfully")
      })
    } catch (error) {
      console.error("Error updating inventory item:", error)
      // Revert optimistic update
      setInventory(inventory)
      toast.error("Failed to update item")
      throw error
    }
  }

  const deleteInventoryItem = async (itemId: string) => {
    try {
      // Optimistic update
      const newInventory = inventory.filter(item => item.id !== itemId)
      setInventory(newInventory)
      
      startTransition(async () => {
        // Delete via server action
        await deleteItem("your_tenant_id", itemId)
        router.refresh()
        toast.success("Item deleted successfully")
      })
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      // Revert optimistic update
      setInventory(inventory)
      toast.error("Failed to delete item")
      throw error
    }
  }

  return {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setInventory,
    isPending
  }
}
