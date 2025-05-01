import { v4 as uuidv4 } from "uuid"
import type { Customer, Payment, InventoryItem, Transaction } from "./data"

// Generate a random date within the last month
const getRandomRecentDate = () => {
  const now = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(now.getMonth() - 1)

  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime())
  return new Date(randomTime).toISOString().split("T")[0]
}

// Generate a random amount between min and max
const getRandomAmount = (min: number, max: number) => {
  return +(min + Math.random() * (max - min)).toFixed(2)
}

// Generate demo customers with realistic data
export const generateDemoCustomers = (): Customer[] => {
  const customerNames = [
    "Mike Johnson",
    "Sarah Williams",
    "Dave Smith",
    "Lisa Brown",
    "Chris Davis",
    "Jessica Wilson",
    "Tony Martinez",
    "Rachel Taylor",
    "Kevin Anderson",
    "Amanda Thomas",
    "Eric Garcia",
    "Nicole Lewis",
  ]

  return customerNames.map((name) => {
    const paymentHistory: Payment[] = []
    let amountOwed = 0
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    let updatedAt = createdAt

    const numPurchases = Math.floor(Math.random() * 10) + 1
    let lastPurchaseDate = new Date(Date.parse(createdAt))

    for (let i = 0; i < numPurchases; i++) {
      const purchaseAmount = getRandomAmount(50, 1000)
      const purchaseDate = new Date(lastPurchaseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      lastPurchaseDate = purchaseDate
      updatedAt = purchaseDate.toISOString()

      const paid = Math.random() > 0.3
      if (paid) {
        paymentHistory.push({
          id: uuidv4(),
          date: purchaseDate.toISOString().split("T")[0],
          amount: purchaseAmount,
          method: Math.random() > 0.5 ? "cash" : "bank_transfer",
          notes: "Payment for purchase",
          createdAt: purchaseDate.toISOString(),
        })
      } else {
        amountOwed += purchaseAmount
      }
    }

    let status: "paid" | "unpaid" | "partial" = "paid"
    let dueDate = ""
    if (amountOwed > 0) {
      status = Math.random() > 0.5 ? "unpaid" : "partial"
      dueDate = new Date(Date.now() + (Math.random() * 30 - 15) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      if (status === "partial") {
        const partialPaymentAmount = getRandomAmount(amountOwed * 0.2, amountOwed * 0.8)
        paymentHistory.push({
          id: uuidv4(),
          date: new Date(lastPurchaseDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          amount: partialPaymentAmount,
          method: Math.random() > 0.5 ? "cash" : "bank_transfer",
          notes: "Partial payment",
          createdAt: new Date().toISOString(),
        })
        amountOwed -= partialPaymentAmount
        updatedAt = new Date().toISOString()
      }
    }

    return {
      id: uuidv4(),
      name,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      address: `${Math.floor(Math.random() * 9000) + 1000} Main St, Anytown`,
      amountOwed: +amountOwed.toFixed(2),
      dueDate,
      status,
      paymentHistory,
      notes: Math.random() > 0.7 ? "Notes about customer preferences or history." : "",
      createdAt,
      updatedAt,
    }
  })
}

const gramsToOunces = (grams: number) => grams / 28.3495
const gramsToKg = (grams: number) => grams / 1000

// Generate demo inventory items
export const generateDemoInventory = (): InventoryItem[] => {
  const items = [
    { name: "Premium Haze", baseCostOz: 120, initialGrams: 250, threshold: 50, desc: "High-potency Sativa dominant." },
    { name: "Standard Kush", baseCostOz: 90, initialGrams: 500, threshold: 100, desc: "Reliable Indica strain." },
    { name: "Economy Blend", baseCostOz: 70, initialGrams: 750, threshold: 150, desc: "Cost-effective hybrid mix." },
  ]

  return items.map((item) => {
    const quantityG = item.initialGrams * (0.5 + Math.random() * 0.5)
    const quantityOz = gramsToOunces(quantityG)
    const quantityKg = gramsToKg(quantityG)
    const purchaseDate = new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const costPerOz = item.baseCostOz * (0.9 + Math.random() * 0.2)
    const totalCost = quantityOz * costPerOz

    return {
      id: uuidv4(),
      name: item.name,
      description: item.desc,
      quantityG: +quantityG.toFixed(2),
      quantityOz: +quantityOz.toFixed(2),
      quantityKg: +quantityKg.toFixed(3),
      purchaseDate: purchaseDate,
      costPerOz: +costPerOz.toFixed(2),
      totalCost: +totalCost.toFixed(2),
      reorderThresholdG: item.threshold,
    }
  })
}

// Generate demo transactions
export const generateDemoTransactions = (customers: Customer[], inventory: InventoryItem[]): Transaction[] => {
  const transactions: Transaction[] = []
  const retailPricePerGram = 10

  customers.forEach((customer) => {
    const numSales = Math.floor(Math.random() * 5)
    let lastSaleDate = new Date(Date.parse(customer.createdAt))

    for (let i = 0; i < numSales; i++) {
      const saleDate = new Date(lastSaleDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000)
      lastSaleDate = saleDate
      const inventoryItem = inventory[Math.floor(Math.random() * inventory.length)]
      const quantityGrams = getRandomAmount(1, 15)
      const costPerGram = inventoryItem.costPerOz / 28.3495
      const cost = quantityGrams * costPerGram
      const totalPrice = quantityGrams * retailPricePerGram
      const profit = totalPrice - cost

      transactions.push({
        id: uuidv4(),
        date: saleDate.toISOString().split("T")[0],
        type: "sale",
        inventoryId: inventoryItem.id,
        inventoryName: inventoryItem.name,
        quantityGrams: +quantityGrams.toFixed(2),
        pricePerGram: retailPricePerGram,
        totalPrice: +totalPrice.toFixed(2),
        cost: +cost.toFixed(2),
        profit: +profit.toFixed(2),
        paymentMethod: Math.random() > 0.5 ? "cash" : "bank_transfer",
        customerId: customer.id,
        customerName: customer.name,
        notes: `Sale of ${quantityGrams.toFixed(1)}g ${inventoryItem.name}`,
        createdAt: saleDate.toISOString(),
      })
    }
  })

  customers.forEach((customer) => {
    customer.paymentHistory.forEach((payment) => {
      transactions.push({
        id: uuidv4(),
        date: payment.date,
        type: "payment",
        inventoryId: null,
        inventoryName: null,
        quantityGrams: 0,
        pricePerGram: 0,
        totalPrice: payment.amount,
        cost: 0,
        profit: 0,
        paymentMethod: payment.method,
        customerId: customer.id,
        customerName: customer.name,
        notes: payment.notes || `Payment from ${customer.name}`,
        createdAt: payment.createdAt,
      })
    })
  })

  inventory.forEach((item) => {
    const purchaseDate = new Date(Date.parse(item.purchaseDate))
    const quantityGrams = item.quantityG
    const cost = item.totalCost

    transactions.push({
      id: uuidv4(),
      date: item.purchaseDate,
      type: "purchase",
      inventoryId: item.id,
      inventoryName: item.name,
      quantityGrams: +quantityGrams.toFixed(2),
      pricePerGram: 0,
      totalPrice: cost,
      cost: cost,
      profit: 0,
      paymentMethod: "bank_transfer",
      customerId: null,
      customerName: null,
      notes: `Initial stock purchase of ${item.name}`,
      createdAt: purchaseDate.toISOString(),
    })
  })

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate all demo data
export const generateDemoData = () => {
  const inventory = generateDemoInventory()
  const customers = generateDemoCustomers()
  const transactions = generateDemoTransactions(customers, inventory)

  return {
    customers,
    inventory,
    transactions,
  }
}
