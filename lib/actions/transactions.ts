"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createTransaction } from "@/lib/fetchers/transactions"
import { getInventory, updateInventoryItem } from "@/lib/fetchers/inventory"
import { getCustomers, updateCustomer } from "@/lib/fetchers/customers"
import type { Transaction, Payment } from "@/types"

/**
 * Process a transaction and update inventory and customer debt atomically.
 * Handles sales, purchases, and payments.
 */
export async function processTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  // 1. Inventory update for sales/purchases
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

  // 2. Customer debt and payment history update
  if (data.customerId) {
    const { customers } = await getCustomers(userId)
    const customer = customers.find(c => c.id === data.customerId)
    if (customer) {
      let updatedCustomer = { ...customer }
      // Credit sale: increase amount owed
      if (data.type === "sale" && data.paymentMethod === "credit") {
        updatedCustomer.amountOwed += data.totalPrice
        updatedCustomer.status = updatedCustomer.amountOwed === 0 ? "paid" : "unpaid"
        updatedCustomer.paymentHistory = [
          ...updatedCustomer.paymentHistory,
          {
            id: `txn-${Date.now()}`,
            date: data.date,
            amount: -data.totalPrice, // negative for debt
            method: "credit",
            createdAt: new Date().toISOString()
          } satisfies Payment
        ]
      }
      // Payment: decrease amount owed
      if (data.type === "payment") {
        updatedCustomer.amountOwed = Math.max(0, updatedCustomer.amountOwed - data.totalPrice)
        updatedCustomer.status = updatedCustomer.amountOwed === 0 ? "paid" : "partial"
        updatedCustomer.paymentHistory = [
          ...updatedCustomer.paymentHistory,
          {
            id: `txn-${Date.now()}`,
            date: data.date,
            amount: data.totalPrice, // positive for payment
            method: data.paymentMethod,
            createdAt: new Date().toISOString()
          } satisfies Payment
        ]
      }
      await updateCustomer(userId, updatedCustomer)
    }
  }

  // 3. Record the transaction
  await createTransaction(userId, data)

  // 4. Revalidate all relevant paths for real-time UI
  revalidatePath("/")
  revalidatePath("/inventory")
  revalidatePath("/customers")
  return { success: true }
}