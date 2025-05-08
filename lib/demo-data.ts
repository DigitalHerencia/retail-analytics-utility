import { v4 as uuidv4 } from "uuid"
import type { Customer, InventoryItem, Transaction } from "./types"

// Generate demo data for the application
export function generateDemoData(count = 10, baseCustomers: Customer[] = [], baseInventory: InventoryItem[] = []) {
  // Create transactions
  const transactions: Transaction[] = []
  const updatedCustomers = [...baseCustomers]
  const updatedInventory = [...baseInventory]

  // Generate random transactions
  for (let i = 0; i < count; i++) {
    if (updatedInventory.length === 0) break

    const randomInventoryIndex = Math.floor(Math.random() * updatedInventory.length)
    const randomInventory = updatedInventory[randomInventoryIndex]

    const randomQuantity = Math.min(
      Math.max(0.5, Math.random() * 5), // Random quantity between 0.5 and 5
      randomInventory.quantityG, // Don't exceed available inventory
    )

    const pricePerGram = 100 // Default retail price
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
      createdAt: new Date().toISOString(),
    }

    // Update inventory
    updatedInventory[randomInventoryIndex] = {
      ...randomInventory,
      quantityG: randomInventory.quantityG - randomQuantity,
      quantityOz: (randomInventory.quantityG - randomQuantity) / 28.35,
      quantityKg: (randomInventory.quantityG - randomQuantity) / 1000,
      totalCost: ((randomInventory.quantityG - randomQuantity) / 28.35) * randomInventory.costPerOz,
      purchaseDate: randomInventory.purchaseDate,
    }

    // Randomly assign to customer
    if (updatedCustomers.length > 0 && Math.random() > 0.5) {
      const randomCustomerIndex = Math.floor(Math.random() * updatedCustomers.length)
      const randomCustomer = updatedCustomers[randomCustomerIndex]

      transaction.customerId = randomCustomer.id
      transaction.customerName = randomCustomer.name

      // If credit sale, update customer balance
      if (transaction.paymentMethod === "credit") {
        updatedCustomers[randomCustomerIndex] = {
          ...randomCustomer,
          amountOwed: randomCustomer.amountOwed + totalPrice,
          dueDate: new Date().toISOString(),
          status: "unpaid",
          phone: randomCustomer.phone,
          email: randomCustomer.email,
          address: randomCustomer.address,
          notes: randomCustomer.notes,
          createdAt: randomCustomer.createdAt,
          updatedAt: new Date().toISOString(),
          paymentHistory: [],
        }
      }
    }

    transactions.push(transaction)
  }

  return {
    transactions,
    updatedCustomers,
    updatedInventory,
  }
}
