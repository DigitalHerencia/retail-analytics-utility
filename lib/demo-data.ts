import { v4 as uuidv4 } from "uuid"
import type { Customer, InventoryItem, Transaction } from "@/lib/types"
import { sampleInventory, sampleCustomers } from "@/lib/data"

// Generate demo data for the application
export function generateDemoData(count = 10, baseCustomers: Customer[] = [], baseInventory: InventoryItem[] = []) {
  // Use provided data or sample data
  const customers = baseCustomers.length > 0 ? baseCustomers : sampleCustomers
  const inventory = baseInventory.length > 0 ? baseInventory : sampleInventory

  // Create transactions
  const transactions: Transaction[] = []

  // Generate random transactions
  for (let i = 0; i < count; i++) {
    if (inventory.length === 0) break

    const randomInventoryIndex = Math.floor(Math.random() * inventory.length)
    const randomInventory = inventory[randomInventoryIndex]

    const randomQuantity = Math.min(
      Math.max(0.5, Math.random() * 5), // Random quantity between 0.5 and 5
      randomInventory.quantityG, // Don't exceed available inventory
    )

    const pricePerGram = (randomInventory.costPerOz / 28.35) * 2 // Simple markup
    const totalPrice = pricePerGram * randomQuantity
    const cost = (randomInventory.costPerOz / 28.35) * randomQuantity
    const profit = totalPrice - cost

    // Create transaction
    const transaction: Transaction = {
      id: uuidv4(),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
      type: "sale",
      inventoryId: randomInventory.id,
      inventoryName: randomInventory.name,
      quantityGrams: randomQuantity,
      pricePerGram,
      totalPrice,
      cost,
      profit,
      paymentMethod: Math.random() > 0.3 ? "cash" : "credit",
      customerId: null,
      customerName: null,
      notes: "Demo transaction",
    }

    // Randomly assign to customer
    if (customers.length > 0 && Math.random() > 0.5) {
      const randomCustomerIndex = Math.floor(Math.random() * customers.length)
      const randomCustomer = customers[randomCustomerIndex]

      transaction.customerId = randomCustomer.id
      transaction.customerName = randomCustomer.name
    }

    transactions.push(transaction)
  }

  // Update customer amounts owed
  const updatedCustomers = customers.map((customer) => {
    let totalPayments = 0
    transactions
      .filter((t) => t.customerId === customer.id)
      .forEach((t) => {
        totalPayments += t.totalPrice
      })
    return {
      ...customer,
      amountOwed: Math.max(0, customer.amountOwed - totalPayments),
      status: customer.amountOwed - totalPayments > 0 ? "unpaid" : "paid",
    }
  })

  // Update inventory quantities
  const updatedInventory = inventory.map((item) => {
    let totalSold = 0
    transactions
      .filter((t) => t.inventoryId === item.id)
      .forEach((t) => {
        totalSold += t.quantityGrams
      })
    return {
      ...item,
      quantityG: Math.max(0, item.quantityG - totalSold),
      quantityOz: Math.max(0, item.quantityOz - totalSold / 28.35),
    }
  })

  return {
    transactions,
    updatedCustomers,
    updatedInventory,
  }
}
