"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createTransaction, updateInventoryItem, getInventory } from "@/lib/fetchers"
import type { Transaction } from "@/types"

export async function processTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  // For sales or purchases, we need to update inventory
  if (data.type !== "payment" && data.inventoryId) {
    const { inventory } = await getInventory(userId)
    const item = inventory.find(i => i.id === data.inventoryId)
    
    if (item) {
      const quantityChange = data.type === "sale" ? -data.quantityGrams : data.quantityGrams
      const updatedItem = {
        ...item,
        quantityG: item.quantityG + quantityChange,
        quantityOz: (item.quantityG + quantityChange) / 28.3495,
        quantityKg: (item.quantityG + quantityChange) / 1000
      }
      
      await updateInventoryItem(userId, updatedItem)
    }
  }

  await createTransaction(userId, data)
  
  revalidatePath("/")
  revalidatePath("/inventory")
  revalidatePath("/customers")
  return { success: true }
}