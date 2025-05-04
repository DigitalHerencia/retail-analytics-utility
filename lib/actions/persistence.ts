"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { getInventory, getCustomers, getBusinessData, getTransactions } from "../fetchers"
import sql from "../db"

// Save the register state (price per gram, transactions, etc.) for the current user/tenant
export async function saveRegisterState(data: any) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const now = new Date().toISOString()
  await sql`
    INSERT INTO saved_data (user_id, key, value, created_at, updated_at)
    VALUES (${userId}, 'register', ${JSON.stringify(data)}, ${now}, ${now})
    ON CONFLICT (user_id, key)
    DO UPDATE SET value = ${JSON.stringify(data)}, updated_at = ${now}
  `
  return { success: true }
}

// Load the register state for the current user/tenant
export async function loadRegisterState() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const result = await sql`
    SELECT value FROM saved_data WHERE user_id = ${userId} AND key = 'register' LIMIT 1
  `
  return result[0]?.value ? JSON.parse(result[0].value) : null
}

export async function loadAllData() {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const [
    { inventory = [] } = {},
    { customers = [] } = {},
    { businessData = {} } = {},
    { transactions = [] } = {},
  ] = await Promise.all([
    getInventory(userId),
    getCustomers(userId),
    getBusinessData(userId),
    getTransactions(userId),
  ])

  return {
    success: true,
    businessData,
    inventory,
    customers,
    transactions,
  }
}

export async function revalidateData() {
  revalidatePath("/")
  revalidatePath("/inventory")
  revalidatePath("/customers")
  revalidatePath("/forecast")
  revalidatePath("/settings")
}