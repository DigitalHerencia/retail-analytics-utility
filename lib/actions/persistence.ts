"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { getInventory, getCustomers, getBusinessData, getTransactions } from "../fetchers"

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