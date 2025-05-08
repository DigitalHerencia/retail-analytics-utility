import { v4 as uuidv4 } from "uuid"
import type { Customer, Payment } from "./data"

// Add this interface after the imports
interface Purchase {
  id: string
  date: string
  product: string
  quantity: number
  price: number
  total: number
  paid: boolean
}

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  costPerUnit: number
  totalCost: number
  reorderPoint: number
  supplier: string
  lastRestockDate: string
}

interface Transaction {
  id: string
  date: string
  type: string
  amount: number
  description: string
  category: string
  customer?: string
}

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
    const totalPurchases = Math.floor(Math.random() * 10) + 1
    const purchaseHistory: Purchase[] = []
    const paymentHistory: Payment[] = []
    let totalSpent = 0
    let accountBalance = 0

    // Generate purchase history
    for (let i = 0; i < totalPurchases; i++) {
      const quantity = getRandomAmount(1, 10)
      const price = 100 // $100 per gram as requested
      const total = quantity * price
      const paid = Math.random() > 0.3 // 70% chance of being paid

      if (!paid) {
        accountBalance += total
      }

      totalSpent += total

      purchaseHistory.push({
        id: uuidv4(),
        date: getRandomRecentDate(),
        product: "Premium",
        quantity,
        price,
        total,
        paid,
      })
    }

    // Generate payment history
    const paymentCount = Math.floor(totalPurchases * 0.7) // Roughly 70% of purchases are paid
    for (let i = 0; i < paymentCount; i++) {
      const amount = purchaseHistory[i]?.total || getRandomAmount(50, 500)

      paymentHistory.push({
        id: uuidv4(),
        date: getRandomRecentDate(),
        amount,
        method: Math.random() > 0.5 ? "Cash" : "Other",
        notes: "",
      })
    }

    return {
      id: uuidv4(),
      name,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
      notes: "",
      totalPurchases,
      totalSpent,
      lastPurchaseDate:
        purchaseHistory.length > 0 ? purchaseHistory[purchaseHistory.length - 1].date : getRandomRecentDate(),
      accountBalance,
      preferredProduct: "Premium",
      purchaseHistory,
      paymentHistory,
    }
  })
}

// Generate demo inventory items
export const generateDemoInventory = (): InventoryItem[] => {
  return [
    {
      id: uuidv4(),
      name: "Premium",
      quantity: 250,
      unit: "g",
      costPerUnit: 70, // Cost per gram
      totalCost: 250 * 70,
      reorderPoint: 50,
      supplier: "Main Supplier",
      lastRestockDate: getRandomRecentDate(),
    },
    {
      id: uuidv4(),
      name: "Standard",
      quantity: 500,
      unit: "g",
      costPerUnit: 50, // Cost per gram
      totalCost: 500 * 50,
      reorderPoint: 100,
      supplier: "Secondary Supplier",
      lastRestockDate: getRandomRecentDate(),
    },
    {
      id: uuidv4(),
      name: "Economy",
      quantity: 750,
      unit: "g",
      costPerUnit: 30, // Cost per gram
      totalCost: 750 * 30,
      reorderPoint: 150,
      supplier: "Budget Supplier",
      lastRestockDate: getRandomRecentDate(),
    },
  ]
}

// Generate demo transactions
export const generateDemoTransactions = (customers: Customer[]): Transaction[] => {
  const transactions: Transaction[] = []

  // Add sales transactions from customer purchase history
  customers.forEach((customer) => {
    customer.purchaseHistory.forEach((purchase) => {
      transactions.push({
        id: uuidv4(),
        date: purchase.date,
        type: "sale",
        amount: purchase.total,
        description: `${purchase.quantity}g of ${purchase.product} to ${customer.name}`,
        category: "Sales",
        customer: customer.id,
      })
    })

    // Add payment transactions from customer payment history
    customer.paymentHistory.forEach((payment) => {
      transactions.push({
        id: uuidv4(),
        date: payment.date,
        type: "payment",
        amount: payment.amount,
        description: `Payment from ${customer.name} via ${payment.method}`,
        category: "Payments",
        customer: customer.id,
      })
    })
  })

  // Add inventory purchase transactions
  for (let i = 0; i < 5; i++) {
    const amount = getRandomAmount(1000, 5000)
    transactions.push({
      id: uuidv4(),
      date: getRandomRecentDate(),
      type: "purchase",
      amount,
      description: `Inventory restock`,
      category: "Inventory",
    })
  }

  // Add expense transactions
  const expenseCategories = ["Rent", "Transportation", "Communication", "Equipment", "Miscellaneous"]
  for (let i = 0; i < 10; i++) {
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    const amount = getRandomAmount(50, 500)
    transactions.push({
      id: uuidv4(),
      date: getRandomRecentDate(),
      type: "expense",
      amount,
      description: `${category} expense`,
      category,
    })
  }

  // Sort transactions by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate all demo data
export const generateDemoData = () => {
  const customers = generateDemoCustomers()
  const inventory = generateDemoInventory()
  const transactions = generateDemoTransactions(customers)

  return {
    customers,
    inventory,
    transactions,
  }
}
