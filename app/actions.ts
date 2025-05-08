"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import type { BusinessData, ScenarioData, InventoryItem, Customer, Payment, Transaction, Account } from "@/lib/types"

// Business Data Actions
export async function getBusinessData(): Promise<BusinessData | null> {
  try {
    const data = await prisma.businessData.findFirst({
      orderBy: { createdAt: "desc" },
    })
    return data
  } catch (error) {
    console.error("Error fetching business data:", error)
    return null
  }
}

export async function saveBusinessData(
  data: Omit<BusinessData, "id" | "createdAt" | "updatedAt">,
): Promise<BusinessData | null> {
  try {
    const savedData = await prisma.businessData.create({
      data,
    })
    revalidatePath("/")
    return savedData
  } catch (error) {
    console.error("Error saving business data:", error)
    return null
  }
}

export async function updateBusinessData(id: string, data: Partial<BusinessData>): Promise<BusinessData | null> {
  try {
    const updatedData = await prisma.businessData.update({
      where: { id },
      data,
    })
    revalidatePath("/")
    return updatedData
  } catch (error) {
    console.error("Error updating business data:", error)
    return null
  }
}

// Scenario Actions
export async function getScenarios(): Promise<ScenarioData[]> {
  try {
    const scenarios = await prisma.scenario.findMany({
      include: { salespeople: true },
      orderBy: { createdAt: "desc" },
    })
    return scenarios
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return []
  }
}

export async function getScenario(id: string): Promise<ScenarioData | null> {
  try {
    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: { salespeople: true },
    })
    return scenario
  } catch (error) {
    console.error("Error fetching scenario:", error)
    return null
  }
}

export async function createScenario(
  data: Omit<ScenarioData, "id" | "createdAt" | "updatedAt">,
): Promise<ScenarioData | null> {
  try {
    const { salespeople, ...scenarioData } = data

    const scenario = await prisma.scenario.create({
      data: {
        ...scenarioData,
        salespeople: {
          create: salespeople || [],
        },
      },
      include: { salespeople: true },
    })

    revalidatePath("/")
    return scenario
  } catch (error) {
    console.error("Error creating scenario:", error)
    return null
  }
}

export async function updateScenario(id: string, data: Partial<ScenarioData>): Promise<ScenarioData | null> {
  try {
    const { salespeople, ...scenarioData } = data

    // Update scenario
    const scenario = await prisma.scenario.update({
      where: { id },
      data: scenarioData,
      include: { salespeople: true },
    })

    // If salespeople are provided, update them
    if (salespeople) {
      // Delete existing salespeople
      await prisma.salesperson.deleteMany({
        where: { scenarioId: id },
      })

      // Create new salespeople
      await Promise.all(
        salespeople.map((person) =>
          prisma.salesperson.create({
            data: {
              ...person,
              scenarioId: id,
            },
          }),
        ),
      )
    }

    // Get updated scenario with salespeople
    const updatedScenario = await prisma.scenario.findUnique({
      where: { id },
      include: { salespeople: true },
    })

    revalidatePath("/")
    return updatedScenario
  } catch (error) {
    console.error("Error updating scenario:", error)
    return null
  }
}

export async function deleteScenario(id: string): Promise<boolean> {
  try {
    await prisma.scenario.delete({
      where: { id },
    })
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting scenario:", error)
    return false
  }
}

// Inventory Actions
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    })
    return inventory
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): Promise<InventoryItem | null> {
  try {
    const item = await prisma.inventoryItem.create({
      data,
    })
    revalidatePath("/")
    return item
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data,
    })
    revalidatePath("/")
    return item
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return null
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    await prisma.inventoryItem.delete({
      where: { id },
    })
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return false
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  try {
    const customers = await prisma.customer.findMany({
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    })
    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { payments: true },
    })
    return customer
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "updatedAt" | "payments">,
): Promise<Customer | null> {
  try {
    const customer = await prisma.customer.create({
      data,
      include: { payments: true },
    })
    revalidatePath("/")
    return customer
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  try {
    const { payments, ...customerData } = data

    const customer = await prisma.customer.update({
      where: { id },
      data: customerData,
      include: { payments: true },
    })

    revalidatePath("/")
    return customer
  } catch (error) {
    console.error("Error updating customer:", error)
    return null
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await prisma.customer.delete({
      where: { id },
    })
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting customer:", error)
    return false
  }
}

// Payment Actions
export async function addPayment(
  customerId: string,
  data: Omit<Payment, "id" | "createdAt" | "customerId">,
): Promise<Payment | null> {
  try {
    const payment = await prisma.payment.create({
      data: {
        ...data,
        customerId,
      },
    })

    // Get the customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (customer) {
      // Calculate new amount owed
      const newAmountOwed = Math.max(0, customer.amountOwed - data.amount)

      // Determine new status
      let newStatus = "unpaid"
      if (newAmountOwed === 0) {
        newStatus = "paid"
      } else if (data.amount > 0) {
        newStatus = "partial"
      }

      // Update customer
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          amountOwed: newAmountOwed,
          status: newStatus,
        },
      })
    }

    revalidatePath("/")
    return payment
  } catch (error) {
    console.error("Error adding payment:", error)
    return null
  }
}

// Transaction Actions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    })
    return transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.create({
      data,
    })

    // If it's a sale, update inventory
    if (data.type === "sale" && data.inventoryId) {
      const inventory = await prisma.inventoryItem.findUnique({
        where: { id: data.inventoryId },
      })

      if (inventory) {
        // Calculate new quantity
        const newQuantityG = Math.max(0, inventory.quantityG - data.quantityGrams)
        const newQuantityOz = newQuantityG / 28.3495
        const newQuantityKg = newQuantityG / 1000
        const newTotalCost = newQuantityOz * inventory.costPerOz

        // Update inventory
        await prisma.inventoryItem.update({
          where: { id: data.inventoryId },
          data: {
            quantityG: newQuantityG,
            quantityOz: newQuantityOz,
            quantityKg: newQuantityKg,
            totalCost: newTotalCost,
          },
        })
      }
    }

    // If it's a credit sale, update customer
    if (data.type === "sale" && data.customerId && data.paymentMethod === "credit") {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      })

      if (customer) {
        await prisma.customer.update({
          where: { id: data.customerId },
          data: {
            amountOwed: customer.amountOwed + data.totalPrice,
            status: "unpaid",
          },
        })
      }
    }

    revalidatePath("/")
    return transaction
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

// Account Actions
export async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
    })
    return accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: Omit<Account, "id" | "createdAt" | "updatedAt">): Promise<Account | null> {
  try {
    const account = await prisma.account.create({
      data,
    })
    revalidatePath("/")
    return account
  } catch (error) {
    console.error("Error creating account:", error)
    return null
  }
}

export async function updateAccount(id: string, data: Partial<Account>): Promise<Account | null> {
  try {
    const account = await prisma.account.update({
      where: { id },
      data,
    })
    revalidatePath("/")
    return account
  } catch (error) {
    console.error("Error updating account:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await prisma.account.delete({
      where: { id },
    })
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    return false
  }
}

// Initialize default business data if none exists
export async function initializeDefaultBusinessData(): Promise<BusinessData | null> {
  try {
    const existingData = await prisma.businessData.findFirst()

    if (!existingData) {
      const defaultData = await prisma.businessData.create({
        data: {
          wholesalePricePerOz: 100,
          targetProfitPerMonth: 2000,
          operatingExpenses: 500,
        },
      })
      return defaultData
    }

    return existingData
  } catch (error) {
    console.error("Error initializing default business data:", error)
    return null
  }
}
